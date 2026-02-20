package com.controller.user;

import com.entity.User;
import com.payload.request.UserUpdateRequest;
import com.payload.response.UserResponse;
import com.repository.UserRepository;
import com.service.UserDetailsImpl;
import com.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

/**
 * REST Controller for User Profile operations.
 * 
 * <p>
 * <strong>Access Control:</strong>
 * </p>
 * <ul>
 * <li>All endpoints require authentication (any role)</li>
 * <li>Users can only access/modify their own profile</li>
 * </ul>
 */
// CORS handled globally in SecurityConfig
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== PROFILE ENDPOINTS ====================

    /**
     * Get current user's profile.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(toResponse(user));
    }

    /**
     * Update current user's profile (name, mobile, gender only).
     * Users cannot change their own role.
     */
    @PutMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody UserUpdateRequest request) {

        // Ignore role - users cannot change their own role
        User user = userService.updateUser(
                currentUser.getId(),
                request.getName(),
                request.getMobile(),
                request.getGender());

        return ResponseEntity.ok(toResponse(user));
    }

    /**
     * Change current user's password.
     * 
     * Password requirements:
     * - Minimum 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one digit
     * - At least one special character (@#$%^&+=!*)
     */
    @PostMapping("/me/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody Map<String, String> request) {

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Both currentPassword and newPassword are required"));
        }

        // Password complexity validation
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 8 characters long"));
        }
        if (!newPassword.matches(".*[A-Z].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must contain at least one uppercase letter"));
        }
        if (!newPassword.matches(".*[a-z].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must contain at least one lowercase letter"));
        }
        if (!newPassword.matches(".*\\d.*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must contain at least one digit"));
        }
        if (!newPassword.matches(".*[@#$%^&+=!*].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must contain at least one special character (@#$%^&+=!*)"));
        }

        User user = userRepository.findById(Objects.requireNonNull(currentUser.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Current password is incorrect"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
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
