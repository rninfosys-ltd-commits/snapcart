package com.controller.user;

import com.entity.User;
import com.repository.UserRepository;
import com.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get current user profile
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(Objects.requireNonNull(userDetails.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("mobile", user.getMobile());
        profile.put("gender", user.getGender());
        profile.put("role", user.getRole().name());
        profile.put("hasProfilePicture", user.hasProfilePicture());

        return ResponseEntity.ok(profile);
    }

    /**
     * Update profile information
     */
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> updates) {

        User user = userRepository.findById(Objects.requireNonNull(userDetails.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name")) {
            user.setName(updates.get("name"));
        }
        if (updates.containsKey("mobile")) {
            user.setMobile(updates.get("mobile"));
        }
        if (updates.containsKey("gender")) {
            user.setGender(updates.get("gender"));
        }

        userRepository.save(Objects.requireNonNull(user));

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("name", user.getName());
        response.put("mobile", user.getMobile());
        response.put("gender", user.getGender());

        return ResponseEntity.ok(response);
    }

    /**
     * Upload profile picture
     */
    @PostMapping(value = "/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
        }

        User user = userRepository.findById(Objects.requireNonNull(userDetails.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfilePicture(file.getBytes());
        user.setProfilePictureType(contentType);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile picture uploaded successfully"));
    }

    /**
     * Get profile picture
     */
    @GetMapping("/picture")
    public ResponseEntity<byte[]> getProfilePicture(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(Objects.requireNonNull(userDetails.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasProfilePicture()) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(Objects.requireNonNull(user.getProfilePictureType())));
        headers.setContentLength(user.getProfilePicture().length);

        return new ResponseEntity<>(user.getProfilePicture(), headers, HttpStatus.OK);
    }

    /**
     * Delete profile picture
     */
    @DeleteMapping("/picture")
    public ResponseEntity<Map<String, String>> deleteProfilePicture(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(Objects.requireNonNull(userDetails.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfilePicture(null);
        user.setProfilePictureType(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile picture deleted"));
    }

    /**
     * Change password
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> passwordData) {

        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        String confirmPassword = passwordData.get("confirmPassword");

        if (currentPassword == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All password fields are required"));
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "New passwords do not match"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        User user = userRepository.findById(Objects.requireNonNull(userDetails.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
