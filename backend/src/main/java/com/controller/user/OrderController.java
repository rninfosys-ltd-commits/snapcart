package com.controller.user;

import com.dto.OrderResponseDTO;
import com.entity.Order;
import com.entity.OrderStatus;
import com.entity.User;
import com.repository.UserRepository;
import com.service.OrderService;
import com.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

// CORS handled globally in SecurityConfig
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/place")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponseDTO> placeOrder(@RequestBody com.payload.request.OrderRequest request) {
        User user = getCurrentUser();
        OrderResponseDTO orderResponse = orderService.placeOrder(user, request);
        return ResponseEntity.ok(orderResponse);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders() {
        User user = getCurrentUser();
        return ResponseEntity.ok(orderService.getUserOrdersDTO(user));
    }

    @GetMapping("/check-first-order")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> isFirstOrder() {
        User user = getCurrentUser();
        long count = orderService.countUserOrders(user);
        return ResponseEntity.ok(count == 0);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDTO> getOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        OrderResponseDTO order = orderService.getOrderResponseDTO(orderId);

        // Ensure user can only see their own order unless they are admin/moderator
        boolean isAdminOrMod = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MODERATOR"));

        if (!isAdminOrMod && !order.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        User user = getCurrentUser();
        Order order = orderService.getOrderById(orderId);

        // Check if order belongs to the user
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You can only cancel your own orders");
        }

        // Only allow cancellation of PENDING orders
        if (order.getStatus() != OrderStatus.PENDING) {
            return ResponseEntity.badRequest().body("Only pending orders can be cancelled");
        }

        return ResponseEntity.ok(orderService.getOrderResponseDTO(orderId));
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userRepository.findById(Objects.requireNonNull(userDetails.getId(), "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/{orderId}/invoice")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Order order = orderService.getOrderById(orderId);

        boolean isAdminOrMod = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_MODERATOR"));

        if (!isAdminOrMod && !order.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        byte[] invoicePdf = orderService.generateInvoice(orderId);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=Invoice_" + orderId + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(invoicePdf);
    }
}
