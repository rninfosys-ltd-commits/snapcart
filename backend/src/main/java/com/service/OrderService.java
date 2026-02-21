package com.service;

import com.dto.AdminOrderDTO;
import com.dto.OrderResponseDTO;
import com.entity.*;
import com.mapper.OrderMapper;
import com.repository.CartRepository;
import com.repository.OrderRepository;
// import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import com.event.OrderStatusChangedEvent;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class OrderService {

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private InvoiceService invoiceService;

    // @Autowired
    // private UserRepository userRepository;

    @Autowired
    private SettlementService settlementService;

    @Autowired
    private OrderTrackingService orderTrackingService;

    @Transactional
    public OrderResponseDTO placeOrder(User user, com.payload.request.OrderRequest request) {
        Cart cart = cartService.getCartByUser(user);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        Order order = new Order();
        order.setUser(user);

        double subtotal = cart.getTotalAmount();
        double discountAmount = request.getDiscount() != null ? request.getDiscount() : 0.0;

        order.setTotalAmount(Math.max(0, subtotal - discountAmount));
        order.setDiscount(discountAmount);

        // Track coupon usage
        if (request.getCouponId() != null) {
            try {
                couponService.incrementUsage(request.getCouponId());
            } catch (Exception e) {
                System.err.println("Warning: Could not increment coupon usage: " + e.getMessage());
            }
        }

        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        // Handle shipping address
        String shippingAddrStr = "";
        if (request.getShippingAddress() != null) {
            if (request.getShippingAddress() instanceof String) {
                shippingAddrStr = (String) request.getShippingAddress();
            } else {
                try {
                    shippingAddrStr = new com.fasterxml.jackson.databind.ObjectMapper()
                            .writeValueAsString(request.getShippingAddress());
                } catch (Exception e) {
                    shippingAddrStr = request.getShippingAddress().toString();
                }
            }
        }
        order.setShippingAddress(shippingAddrStr);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setOrderDate(java.time.LocalDateTime.now());

        // --- MULTI-TENANT DETECTION ---
        java.util.Set<Long> tenantIds = cart.getItems().stream()
                .map(item -> item.getVariant().getProduct().getModerator())
                .filter(Objects::nonNull)
                .map(Moderator::getId)
                .collect(Collectors.toSet());

        if (tenantIds.size() == 1) {
            order.setSettlementType(SettlementType.DIRECT_TO_MODERATOR);
            order.setPrimaryTenantId(tenantIds.iterator().next());
        } else {
            order.setSettlementType(SettlementType.PLATFORM_SETTLEMENT);
            // primaryTenantId remains null for multi-tenant
        }

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(cartItem.getVariant());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());

            // Reduce stock
            ProductVariant variant = cartItem.getVariant();
            if (variant.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + variant.getProduct().getName());
            }
            variant.setQuantity(variant.getQuantity() - cartItem.getQuantity());

            // --- FINANCIAL & DATA SNAPSHOTS (IMMUTABILITY) ---
            Product product = variant.getProduct();
            Moderator moderator = product.getModerator();

            orderItem.setProductName(product.getName());
            orderItem.setTenantId(moderator != null ? moderator.getId() : null);

            // Get primary image snapshot
            String imgUrl = product.getVariants().get(0).getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImageUrl)
                    .findFirst().orElse("");
            orderItem.setProductImage(imgUrl);

            // Financial Ledger Snapshots
            double commPercent = (moderator != null) ? moderator.getPlatformCommissionPercent() : 10.0;
            double gross = cartItem.getPrice() * cartItem.getQuantity();
            double commAmount = gross * (commPercent / 100.0);

            orderItem.setGrossAmount(gross);
            orderItem.setCommissionPercentSnapshot(commPercent);
            orderItem.setCommissionAmount(commAmount);
            orderItem.setNetAmount(gross - commAmount);

            return orderItem;
        }).collect(Collectors.toList());

        order.setItems(orderItems);

        // Save the order
        Order savedOrder = orderRepository.save(order);

        // Clear the cart
        try {
            cart.getItems().clear();
            cart.setTotalAmount(0.0);
            cartRepository.save(cart);
        } catch (Exception e) {
            System.err.println("Warning: Failed to clear cart: " + e.getMessage());
        }

        // Generate Invoice
        byte[] invoicePdf = null;
        try {
            invoicePdf = invoiceService.generateInvoice(savedOrder.getId());
        } catch (Exception e) {
            System.err.println("Failed to generate invoice: " + e.getMessage());
        }

        // Add initial tracking record
        try {
            Moderator moderator = orderItems.get(0).getVariant().getProduct().getModerator();
            String city = (moderator != null && moderator.getWarehouseCity() != null) ? moderator.getWarehouseCity()
                    : "Mumbai";
            String state = (moderator != null && moderator.getWarehouseState() != null) ? moderator.getWarehouseState()
                    : "Maharashtra";

            OrderTracking tracking = orderTrackingService.addTrackingRecord(savedOrder.getId(),
                    TrackingStatus.ORDER_CONFIRMED,
                    city, state, "Order has been confirmed and is being prepared.");

            // Add to the list on the object so it's included in the returned DTO
            if (savedOrder.getTrackingHistory() == null) {
                savedOrder.setTrackingHistory(new java.util.ArrayList<>());
            }
            savedOrder.getTrackingHistory().add(tracking);
        } catch (Exception e) {
            System.err.println("Non-fatal error: Failed to add initial tracking: " + e.getMessage());
        }

        eventPublisher.publishEvent(new OrderStatusChangedEvent(this,
                user.getEmail(), savedOrder.getId().toString(), user.getName(), invoicePdf));

        return OrderMapper.toResponseDTO(savedOrder);
    }

    /**
     * Distributes payments between Moderators and Super Admin using the Settlement
     * Ledger.
     */
    @Transactional
    public void distributePayments(Order order) {
        if (order.getPaymentStatus() != PaymentStatus.COMPLETED) {
            return;
        }

        // Delegate to SettlementService for immutable ledger entry generation
        // Passing null as eventId for manual/legacy triggers
        settlementService.createSettlements(order, null);
    }

    public List<Order> getOrdersByTenantId(Long tenantId) {
        // Optimization: check primaryTenantId first for single-tenant orders
        List<Order> directOrders = orderRepository.findByPrimaryTenantId(tenantId);
        List<Order> multiTenantOrders = orderRepository.findByItemsTenantId(tenantId);

        java.util.Set<Order> allOrders = new java.util.HashSet<>(directOrders);
        allOrders.addAll(multiTenantOrders);
        return allOrders.stream().toList();
    }

    @Transactional
    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUser(user);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(Objects.requireNonNull(orderId, "Order ID is required"))
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }

    @Transactional(readOnly = true)
    public long countUserOrders(User user) {
        return orderRepository.countByUserIdAndStatusNot(user.getId(), OrderStatus.CANCELLED);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);

        // Publish status update event (Async Email)
        if (oldStatus != status) {
            User user = order.getUser();
            eventPublisher.publishEvent(new OrderStatusChangedEvent(
                    this,
                    user.getEmail(),
                    orderId.toString(),
                    status.name(),
                    user.getName(),
                    OrderStatusChangedEvent.EventType.STATUS_UPDATE));
        }

        return OrderMapper.toResponseDTO(savedOrder);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);

        // Restore product stock
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null) {
                variant.setQuantity(variant.getQuantity() + item.getQuantity());
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        User user = order.getUser();
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                this,
                user.getEmail(),
                orderId.toString(),
                OrderStatus.CANCELLED.name(),
                user.getName(),
                OrderStatusChangedEvent.EventType.CANCELLED));

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<AdminOrderDTO> getAllOrdersDTO() {
        return orderRepository.findAll().stream().map(OrderMapper::toAdminDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrdersDTO(User user) {
        return orderRepository.findByUser(user).stream().map(OrderMapper::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderResponseDTO(Long orderId) {
        Order order = getOrderById(orderId);
        return OrderMapper.toResponseDTO(order);
    }

    public long getTotalOrderCount() {
        return orderRepository.count();
    }

    @Transactional
    public OrderResponseDTO updateOrderLocation(Long orderId, String location, String statusStr) {
        log.info("Updating order location. OrderId: {}, Location: {}, Status: {}", orderId, location, statusStr);
        try {
            Order order = getOrderById(orderId);

            // Update basic status if provided
            OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
            if (status != order.getStatus()) {
                order.setStatus(status);
            }

            // Update location
            order.setCurrentLocation(location);

            // Add to tracking history
            TrackingStatus trackingStatus;
            try {
                trackingStatus = TrackingStatus.valueOf(status.name());
            } catch (IllegalArgumentException e) {
                // Fallback for statuses that don't match exactly
                trackingStatus = switch (status) {
                    case PENDING -> TrackingStatus.ORDER_CONFIRMED;
                    default -> TrackingStatus.SHIPPED;
                };
            }
            OrderTracking tracking = new OrderTracking(order, trackingStatus, location, "", "Update via Admin Portal");

            if (order.getTrackingHistory() == null) {
                order.setTrackingHistory(new java.util.ArrayList<>());
            }
            order.getTrackingHistory().add(tracking);

            log.debug("Saving order with new tracking record. OrderId: {}, Current Status: {}", orderId,
                    order.getStatus());
            Order savedOrder = orderRepository.save(order);

            // Publish tracking update event (Async Email)
            User user = order.getUser();
            eventPublisher.publishEvent(new OrderStatusChangedEvent(
                    this,
                    user.getEmail(),
                    orderId.toString(),
                    status.name(),
                    user.getName(),
                    location));

            return OrderMapper.toResponseDTO(savedOrder);
        } catch (Exception e) {
            log.error("Error updating order location for OrderId: {}", orderId, e);
            throw e;
        }
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = getOrderById(orderId);

        // Restore product stock before deleting
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null) {
                variant.setQuantity(variant.getQuantity() + item.getQuantity());
            }
        }

        orderRepository.delete(order);
    }

    public byte[] generateInvoice(Long orderId) {
        return invoiceService.generateInvoice(orderId);
    }
}
