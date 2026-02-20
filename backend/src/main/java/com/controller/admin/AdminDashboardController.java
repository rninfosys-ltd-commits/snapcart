package com.controller.admin;

import com.entity.Category;
import com.entity.Role;
import com.service.OrderService;
import com.service.ProductService;
import com.service.ReviewService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Admin Dashboard statistics.
 * 
 * <p>
 * <strong>Access Control:</strong>
 * </p>
 * <ul>
 * <li>All endpoints require ADMIN role</li>
 * </ul>
 */
// CORS handled globally in SecurityConfig
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ReviewService reviewService;

    /**
     * Get overall dashboard statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // User stats
        stats.put("totalUsers", userService.getTotalUserCount());
        stats.put("adminCount", userService.countUsersByRole(Role.ADMIN));
        stats.put("moderatorCount", userService.countUsersByRole(Role.MODERATOR));
        stats.put("userCount", userService.countUsersByRole(Role.USER));

        // Product stats
        stats.put("totalProducts", productService.getTotalProductCount());
        stats.put("menProducts", productService.countProductsByCategory(Category.MEN));
        stats.put("womenProducts", productService.countProductsByCategory(Category.WOMEN));
        stats.put("kidsProducts", productService.countProductsByCategory(Category.KIDS));

        // Order stats
        stats.put("totalOrders", orderService.getTotalOrderCount());

        // Review stats
        stats.put("totalReviews", reviewService.getTotalReviewCount());

        return ResponseEntity.ok(stats);
    }

    /**
     * Get user statistics only.
     */
    @GetMapping("/stats/users")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userService.getTotalUserCount());
        stats.put("adminCount", userService.countUsersByRole(Role.ADMIN));
        stats.put("moderatorCount", userService.countUsersByRole(Role.MODERATOR));
        stats.put("userCount", userService.countUsersByRole(Role.USER));
        return ResponseEntity.ok(stats);
    }

    /**
     * Get product statistics only.
     */
    @GetMapping("/stats/products")
    public ResponseEntity<Map<String, Object>> getProductStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productService.getTotalProductCount());
        stats.put("menProducts", productService.countProductsByCategory(Category.MEN));
        stats.put("womenProducts", productService.countProductsByCategory(Category.WOMEN));
        stats.put("kidsProducts", productService.countProductsByCategory(Category.KIDS));
        return ResponseEntity.ok(stats);
    }
}
