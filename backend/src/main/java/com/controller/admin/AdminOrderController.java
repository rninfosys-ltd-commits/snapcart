package com.controller.admin;

import com.dto.AdminOrderDTO;
import com.entity.Order;
import com.entity.OrderStatus;
import com.service.InvoiceService;
import com.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/{orderId}/resend-invoice")
    public ResponseEntity<?> resendInvoice(@PathVariable Long orderId) {
        invoiceService.sendInvoiceEmail(orderId);
        return ResponseEntity.ok("Invoice resent successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrdersDTO());
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @PutMapping("/{orderId}/tracking")
    public ResponseEntity<Order> updateTracking(
            @PathVariable Long orderId,
            @RequestParam String location,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderLocation(orderId, location, status));
    }

    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}
