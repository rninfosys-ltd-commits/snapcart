package com.controller.moderator;

import com.dto.AdminOrderDTO;
import com.entity.Order;
import com.entity.OrderStatus;
import com.mapper.OrderMapper;
import com.repository.OrderRepository;
import com.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ModeratorOrderController
 * ========================
 * 
 * Controller for moderator order management
 */
@RestController
@RequestMapping("/api/moderators/orders")
@PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN', 'SUPER_ADMIN')")
public class ModeratorOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.service.OrderService orderService;

    /**
     * Get all customer orders for the authenticated tenant/moderator
     */
    @GetMapping
    public ResponseEntity<java.util.List<AdminOrderDTO>> getAllOrders() {
        Long tenantId = com.config.TenantContext.getTenantId();
        if (tenantId == null) {
            return ResponseEntity.status(401).build();
        }

        java.util.List<Order> orders = orderService.getOrdersByTenantId(tenantId);
        return ResponseEntity
                .ok(orders.stream().map(OrderMapper::toAdminDTO).collect(java.util.stream.Collectors.toList()));
    }

    /**
     * Get single order details (Tenant-Isolated)
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminOrderDTO> getOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Long tenantId = com.config.TenantContext.getTenantId();
        if (tenantId == null) {
            return ResponseEntity.status(401).build();
        }

        // Verify that at least one item in the order belongs to this tenant
        boolean isOwner = order.getItems().stream().anyMatch(item -> tenantId.equals(item.getTenantId()));
        if (!isOwner && !com.config.TenantContext.isAdminOrSuperAdmin()) {
            throw new RuntimeException("Unauthorized: You do not have access to this order.");
        }

        return ResponseEntity.ok(OrderMapper.toAdminDTO(order));
    }

    /**
     * Update order status (Tenant-Protected)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Long tenantId = com.config.TenantContext.getTenantId();
            if (tenantId == null) {
                return ResponseEntity.status(401).build();
            }

            // Verify owner
            boolean isOwner = order.getItems().stream().anyMatch(item -> tenantId.equals(item.getTenantId()));
            if (!isOwner && !com.config.TenantContext.isAdminOrSuperAdmin()) {
                throw new RuntimeException("Unauthorized: You cannot modify this order.");
            }

            String statusStr = request.get("status");
            OrderStatus newStatus = OrderStatus.valueOf(statusStr);

            order.setStatus(newStatus);
            orderRepository.save(order);

            // Send status update email
            try {
                emailService.sendOrderStatusUpdate(
                        order.getUser().getEmail(),
                        order.getId().toString(),
                        newStatus.toString(),
                        order.getUser().getName());
            } catch (Exception e) {
                System.err.println("Failed to send status update email: " + e.getMessage());
            }

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Order status updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get payment details (Tenant-Protected)
     */
    @GetMapping("/{id}/payment")
    public ResponseEntity<Map<String, Object>> getPaymentDetails(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Long tenantId = com.config.TenantContext.getTenantId();
        if (tenantId == null) {
            return ResponseEntity.status(401).build();
        }

        boolean isOwner = order.getItems().stream().anyMatch(item -> tenantId.equals(item.getTenantId()));
        if (!isOwner && !com.config.TenantContext.isAdminOrSuperAdmin()) {
            throw new RuntimeException("Unauthorized: Access denied.");
        }

        Map<String, Object> paymentDetails = new HashMap<>();
        paymentDetails.put("paymentMethod", order.getPaymentMethod());
        paymentDetails.put("paymentStatus", order.getPaymentStatus());
        paymentDetails.put("paymentReference", order.getPaymentReference());
        paymentDetails.put("totalAmount", order.getTotalAmount());

        return ResponseEntity.ok(paymentDetails);
    }

    /**
     * Update order tracking details (Tenant-Isolated)
     */
    @PutMapping("/{id}/tracking")
    public ResponseEntity<com.dto.OrderResponseDTO> updateOrderTracking(
            @PathVariable Long id,
            @RequestParam String location,
            @RequestParam String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Long tenantId = com.config.TenantContext.getTenantId();
        if (tenantId == null) {
            return ResponseEntity.status(401).build();
        }

        // Verify owner
        boolean isOwner = order.getItems().stream().anyMatch(item -> tenantId.equals(item.getTenantId()));
        if (!isOwner && !com.config.TenantContext.isAdminOrSuperAdmin()) {
            throw new RuntimeException("Unauthorized: You cannot update tracking for this order.");
        }

        return ResponseEntity.ok(orderService.updateOrderLocation(id, location, status));
    }
}
