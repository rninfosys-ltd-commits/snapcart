package com.controller.moderator;

import com.entity.Category;
import com.payload.request.ModeratorRequest;
import com.payload.request.SignupRequest;
import com.payload.response.ModeratorResponse;
import com.payload.response.EmployeeResponse;
import com.service.ModeratorService;
import com.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Moderator management.
 * 
 * <p>
 * <strong>Access Control:</strong>
 * </p>
 * <ul>
 * <li>Admin endpoints: /api/admin/moderators/** - ADMIN only</li>
 * <li>Moderator self-access: /api/moderators/me - MODERATOR only</li>
 * </ul>
 */
@RestController
@RequestMapping("/api")
// CORS handled globally in SecurityConfig
public class ModeratorController {

    @Autowired
    private ModeratorService moderatorService;

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Assign moderator role to a user.
     * 
     * @param request   ModeratorRequest with user ID and permissions
     * @param adminUser Current admin user
     * @return Created moderator data
     */
    @PostMapping("/admin/moderators")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModeratorResponse> assignModerator(
            @Valid @RequestBody ModeratorRequest request,
            @AuthenticationPrincipal UserDetailsImpl adminUser) {

        ModeratorResponse response = moderatorService.assignModerator(request, adminUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update moderator permissions.
     * 
     * @param id      Moderator ID
     * @param request Updated permissions
     * @return Updated moderator data
     */
    @PutMapping("/admin/moderators/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModeratorResponse> updateModerator(
            @PathVariable Long id,
            @Valid @RequestBody ModeratorRequest request) {

        ModeratorResponse response = moderatorService.updateModerator(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Revoke (deactivate) moderator status.
     * 
     * @param id Moderator ID
     * @return Success message
     */
    @DeleteMapping("/admin/moderators/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> revokeModerator(@PathVariable Long id) {
        moderatorService.revokeModerator(id);
        return ResponseEntity.ok(Map.of("message", "Moderator revoked successfully"));
    }

    /**
     * Reactivate a previously revoked moderator.
     * 
     * @param id Moderator ID
     * @return Reactivated moderator data
     */
    @PostMapping("/admin/moderators/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModeratorResponse> reactivateModerator(@PathVariable Long id) {
        ModeratorResponse response = moderatorService.reactivateModerator(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all moderators (including inactive).
     * 
     * @return List of all moderators
     */
    @GetMapping("/admin/moderators")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModeratorResponse>> getAllModerators() {
        List<ModeratorResponse> moderators = moderatorService.getAllModerators();
        return ResponseEntity.ok(moderators);
    }

    /**
     * Get only active moderators.
     * 
     * @return List of active moderators
     */
    @GetMapping("/admin/moderators/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModeratorResponse>> getActiveModerators() {
        List<ModeratorResponse> moderators = moderatorService.getAllActiveModerators();
        return ResponseEntity.ok(moderators);
    }

    /**
     * Get moderator by ID.
     * 
     * @param id Moderator ID
     * @return Moderator data
     */
    @GetMapping("/admin/moderators/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModeratorResponse> getModeratorById(@PathVariable Long id) {
        ModeratorResponse response = moderatorService.getModeratorById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get moderators by category.
     * 
     * @param category Category enum value
     * @return List of moderators for that category
     */
    @GetMapping("/admin/moderators/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModeratorResponse>> getModeratorsByCategory(
            @PathVariable Category category) {
        List<ModeratorResponse> moderators = moderatorService.getModeratorsByCategory(category);
        return ResponseEntity.ok(moderators);
    }

    // ==================== MODERATOR SELF-ACCESS ENDPOINTS ====================

    /**
     * Get current moderator's own profile.
     * 
     * @param currentUser Currently authenticated moderator
     * @return Moderator profile data
     */
    @GetMapping("/moderators/me")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ModeratorResponse> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        ModeratorResponse response = moderatorService.getModeratorByUserId(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Update current moderator's own profile.
     */
    @PutMapping("/moderators/me")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ModeratorResponse> updateMyProfile(
            @RequestBody ModeratorRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        ModeratorResponse response = moderatorService.updateModeratorProfile(currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Check if current moderator has a specific permission.
     * 
     * @param permission  Permission to check (DELETE_REVIEWS, BAN_USERS,
     *                    EDIT_PRODUCTS, MANAGE_ORDERS)
     * @param currentUser Currently authenticated moderator
     * @return Permission check result
     */
    @GetMapping("/moderators/me/permissions/{permission}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @PathVariable String permission,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        boolean hasPermission = moderatorService.hasPermission(currentUser.getId(), permission);
        return ResponseEntity.ok(Map.of("hasPermission", hasPermission));
    }

    /**
     * Check if current moderator can manage a specific category.
     * 
     * @param category    Category to check
     * @param currentUser Currently authenticated moderator
     * @return Category access result
     */
    @GetMapping("/moderators/me/categories/{category}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkCategoryAccess(
            @PathVariable Category category,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        boolean canManage = moderatorService.canManageCategory(currentUser.getId(), category);
        return ResponseEntity.ok(Map.of("canManage", canManage));
    }

    /**
     * Get all employees for the current moderator.
     */
    @GetMapping("/moderators/me/employees")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<List<EmployeeResponse>> getMyEmployees(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(moderatorService.getEmployeesByModerator(currentUser.getId()));
    }

    /**
     * Create a new employee for the current moderator.
     */
    @PostMapping("/moderators/me/employees")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody SignupRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(moderatorService.createEmployee(request, currentUser.getId()));
    }
}
