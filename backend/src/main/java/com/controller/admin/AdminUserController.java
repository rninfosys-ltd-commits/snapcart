package com.controller.admin;

import com.entity.Role;
import com.entity.User;
import com.payload.request.UserUpdateRequest;
import com.payload.response.UserResponse;
import com.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Admin User Management.
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
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserService userService;

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users.
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(toResponse(user));
    }

    /**
     * Get users by role.
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable Role role) {
        List<UserResponse> users = userService.getUsersByRole(role).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * Update user details.
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {

        User user = userService.updateUser(userId, request.getName(), request.getMobile(), request.getGender());

        // If role is specified, update it separately
        if (request.getRole() != null) {
            user = userService.updateUserRole(userId, request.getRole());
        }

        return ResponseEntity.ok(toResponse(user));
    }

    /**
     * Update user role only.
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long userId,
            @RequestParam Role role) {
        User user = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(toResponse(user));
    }

    /**
     * Delete user.
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /**
     * Reset user password.
     */
    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {

        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password is required"));
        }

        userService.resetUserPassword(userId, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // ==================== STATISTICS ====================

    /**
     * Get user statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        long totalUsers = userService.getTotalUserCount();
        long adminCount = userService.countUsersByRole(Role.ADMIN);
        long moderatorCount = userService.countUsersByRole(Role.MODERATOR);
        long userCount = userService.countUsersByRole(Role.USER);

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "adminCount", adminCount,
                "moderatorCount", moderatorCount,
                "userCount", userCount));
    }

    // ==================== HELPER METHODS ====================

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .gender(user.getGender())
                .mobile(user.getMobile())
                .role(user.getRole())
                .build();
    }
}
