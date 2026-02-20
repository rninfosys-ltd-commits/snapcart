package com.controller.superadmin;

import com.entity.AuditLog;
import com.entity.Role;
import com.entity.User;
import com.payload.response.UserResponse;
import com.service.AuditLogService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuditLogService auditLogService;

    // ==================== USER & ROLE MANAGEMENT ====================

    @GetMapping("/admins")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        List<UserResponse> admins = userService.getUsersByRole(Role.ADMIN).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(admins);
    }

    @PostMapping("/promote/{userId}")
    public ResponseEntity<UserResponse> promoteToAdmin(@PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "false") boolean isSuper) {
        Role newRole = isSuper ? Role.SUPER_ADMIN : Role.ADMIN;
        User user = userService.updateUserRole(userId, newRole);

        auditLogService.log("ROLE_PROMOTION", "SUPER_ADMIN", "User", userId.toString(), "Promoted to " + newRole);

        return ResponseEntity.ok(toResponse(user));
    }

    @PostMapping("/demote/{userId}")
    public ResponseEntity<UserResponse> demoteToUser(@PathVariable Long userId) {
        User user = userService.updateUserRole(userId, Role.USER);

        auditLogService.log("ROLE_DEMOTION", "SUPER_ADMIN", "User", userId.toString(), "Demoted to USER");

        return ResponseEntity.ok(toResponse(user));
    }

    // ==================== SYSTEM AUDIT ====================

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    // ==================== PLATFORM STATS ====================

    @GetMapping("/platform-stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        long totalUsers = userService.getTotalUserCount();
        long admins = userService.countUsersByRole(Role.ADMIN);
        long superAdmins = userService.countUsersByRole(Role.SUPER_ADMIN);
        long moderators = userService.countUsersByRole(Role.MODERATOR);

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "adminCount", admins,
                "superAdminCount", superAdmins,
                "moderatorCount", moderators,
                "activeSessions", "N/A (Stateless JWT)"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .mobile(user.getMobile())
                .gender(user.getGender())
                .build();
    }
}
