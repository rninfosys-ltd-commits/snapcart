package com.controller;

import com.entity.Order;
import com.entity.OrderTracking;
import com.entity.TrackingStatus;
import com.entity.User;
import com.repository.OrderRepository;
import com.service.OrderTrackingService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderTrackingController {

    @Autowired
    private OrderTrackingService orderTrackingService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/{id}/tracking")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> addTracking(@PathVariable Long id, @RequestBody Map<String, String> request) {
        TrackingStatus status = TrackingStatus.valueOf(request.get("status"));
        String city = request.get("city");
        String state = request.get("state");
        String description = request.get("description");

        OrderTracking saved = orderTrackingService.addTrackingRecord(id, status, city, state, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<?> getTracking(@PathVariable Long id, Principal principal) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User currentUser = userService.getUserFromPrincipal(principal);

        // Security check: Only owner or admin/mod can view tracking
        boolean isAdmin = currentUser.getRole().name().contains("ADMIN")
                || currentUser.getRole().name().contains("MODERATOR");
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own order tracking.");
        }

        List<OrderTracking> timeline = orderTrackingService.getTrackingTimeline(id);
        return ResponseEntity.ok(timeline);
    }
}
