package com.service;

import com.dto.AdminOrderDTO;
import com.dto.OrderResponseDTO;
import com.entity.*;
import com.mapper.OrderMapper;
import com.repository.CartRepository;
import com.repository.OrderRepository;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import com.event.OrderStatusChangedEvent;

@Service
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private OrderTrackingService orderTrackingService;

    private static final double PLATFORM_COMMISSION_PERCENT = 10.0;

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
        order.setPaymentStatus(PaymentStatus.PENDING); // Explicitly set to avoid constraint issues

        // Handle shipping address (could be String or Object from frontend)
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

            return orderItem;
        }).collect(Collectors.toList());

        order.setItems(orderItems);

        // Save the order
        Order savedOrder = orderRepository.save(order);

        // Clear the cart directly to avoid cross-transactional rollback issues
        try {
            cart.getItems().clear();
            cart.setTotalAmount(0.0);
            cartRepository.save(cart);
        } catch (Exception e) {
            System.err.println("Warning: Failed to clear cart after successful order: " + e.getMessage());
        }

        // Generate Invoice for record keeping (but send email only after payment)
        try {
            invoiceService.generateInvoice(savedOrder.getId());
        } catch (Exception e) {
            System.err.println("Failed to generate invoice: " + e.getMessage());
        }

        // Add initial tracking record
        try {
            // Get warehouse details from the first item's moderator (simplified)
            Moderator moderator = orderItems.get(0).getVariant().getProduct().getModerator();
            String city = (moderator != null && moderator.getWarehouseCity() != null) ? moderator.getWarehouseCity()
                    : "Mumbai";
            String state = (moderator != null && moderator.getWarehouseState() != null) ? moderator.getWarehouseState()
                    : "Maharashtra";

            orderTrackingService.addTrackingRecord(savedOrder.getId(), TrackingStatus.ORDER_CONFIRMED,
                    city, state, "Order has been confirmed and is being prepared.");
        } catch (Exception e) {
            // Defensive coding: Non-fatal error should not rollback order
            System.err.println("Non-fatal error: Failed to add initial tracking: " + e.getMessage());
        }

        // Publish Order Confirmed Event (Async Email)
        // Note: Usually confirmation email is sent after payment success, but if this
        // is COD or immediate, we can trigger here.
        // Assuming implicit confirmation for now or relying on payment flow.
        // If we want to send confirmation email here:
        // eventPublisher.publishEvent(new OrderStatusChangedEvent(this,
        // user.getEmail(), savedOrder.getId().toString(), user.getName(), null));

        return OrderMapper.toResponseDTO(savedOrder);
    }

    /**
     * Distributes payments between Moderators and Super Admin based on order
     * composition.
     */
    @Transactional
    public void distributePayments(Order order) {
        if (order.getPaymentStatus() != PaymentStatus.COMPLETED) {
            return;
        }

        User superAdmin = findSuperAdmin();
        List<OrderItem> items = order.getItems();

        // Identify unique brands
        java.util.Set<Long> brandModeratorIds = items.stream()
                .map(item -> item.getVariant().getProduct().getModerator()).filter(Objects::nonNull)
                .map(Moderator::getId).collect(Collectors.toSet());

        boolean isSingleBrand = brandModeratorIds.size() == 1;
        double totalDiscount = order.getDiscount();
        double subtotal = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();

        // Ratio of actual price paid vs subtotal (to handle flat discounts
        // proportionally)
        double priceRatio = subtotal > 0 ? (subtotal - totalDiscount) / subtotal : 1.0;

        if (isSingleBrand) {
            // Case 1: Single Brand - Automatic Split
            Moderator moderator = items.get(0).getVariant().getProduct().getModerator();
            double netOrderAmount = (subtotal - totalDiscount);
            double commission = netOrderAmount * (PLATFORM_COMMISSION_PERCENT / 100.0);
            double moderatorShare = netOrderAmount - commission;

            walletService.creditWallet(moderator.getUser(), moderatorShare, Transaction.TransactionSource.ORDER_PAYMENT,
                    order.getId().toString(), "Share for Single Brand Order #" + order.getId());

            walletService.creditWallet(superAdmin, commission, Transaction.TransactionSource.COMMISSION,
                    order.getId().toString(), "Commission for Single Brand Order #" + order.getId());
        } else {
            // Case 2: Multiple Brands - Admin receives full amount first, then distributes
            // Logic: Calculate each brand's share and credit them. Balance stays with
            // Admin.
            double totalModeratorPayouts = 0;

            for (OrderItem item : items) {
                Moderator mod = item.getVariant().getProduct().getModerator();
                if (mod == null) {
                    // Platform product - admin keeps full amount
                    continue;
                }

                double itemTotal = item.getPrice() * item.getQuantity() * priceRatio;
                double commission = itemTotal * (PLATFORM_COMMISSION_PERCENT / 100.0);
                double modShare = itemTotal - commission;

                totalModeratorPayouts += modShare;

                walletService.creditWallet(mod.getUser(), modShare, Transaction.TransactionSource.ORDER_PAYMENT,
                        order.getId().toString(), "Prorated share for Multi-Brand Order #" + order.getId());
            }

            double adminTotal = (subtotal - totalDiscount) - totalModeratorPayouts;
            walletService.creditWallet(superAdmin, adminTotal, Transaction.TransactionSource.COMMISSION,
                    order.getId().toString(),
                    "Platform share (Commission + Internal items) for Multi-Brand Order #" + order.getId());
        }
    }

    private User findSuperAdmin() {
        return userRepository.findByRole(Role.SUPER_ADMIN).stream().findFirst()
                .orElseGet(() -> userRepository.findByRole(Role.ADMIN).stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No Admin/SuperAdmin found for commission routing")));
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
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
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

        return savedOrder;
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
    public Order updateOrderLocation(Long orderId, String location, String statusStr) {
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
        order.getTrackingHistory().add(tracking); // Cascaded
                                                  // save

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

        return savedOrder;
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
