package com.controller.moderator;

import com.dto.AdminOrderDTO;
import com.entity.Order;
import com.entity.OrderStatus;
import com.mapper.OrderMapper;
import com.repository.OrderRepository;
import com.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /**
     * Get all customer orders
     * 
     * GET /api/moderators/orders
     */
    @GetMapping
    public ResponseEntity<Page<AdminOrderDTO>> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return ResponseEntity.ok(orders.map(OrderMapper::toAdminDTO));
    }

    /**
     * Get single order details
     * 
     * GET /api/moderators/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminOrderDTO> getOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return ResponseEntity.ok(OrderMapper.toAdminDTO(order));
    }

    /**
     * Update order status
     * 
     * PUT /api/moderators/orders/{id}/status
     * Body: { "status": "SHIPPED" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

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
     * Get payment details for an order
     * 
     * GET /api/moderators/orders/{id}/payment
     */
    @GetMapping("/{id}/payment")
    public ResponseEntity<Map<String, Object>> getPaymentDetails(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Map<String, Object> paymentDetails = new HashMap<>();
        paymentDetails.put("paymentMethod", order.getPaymentMethod());
        paymentDetails.put("paymentStatus", order.getPaymentStatus());
        paymentDetails.put("paymentReference", order.getPaymentReference());
        paymentDetails.put("totalAmount", order.getTotalAmount());

        return ResponseEntity.ok(paymentDetails);
    }
}
