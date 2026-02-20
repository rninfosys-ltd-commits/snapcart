package com.service;

import com.entity.Role;
import com.entity.User;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Service for User management operations.
 * 
 * Primarily used by Admin for user management.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID.
     */
    public User getUserById(Long userId) {
        return userRepository.findById(Objects.requireNonNull(userId, "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    /**
     * Get user by email.
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Update user role (Admin action).
     */
    @Transactional
    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    /**
     * Update user details.
     */
    @Transactional
    public User updateUser(Long userId, String name, String mobile, String gender) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (name != null && !name.isEmpty()) {
            user.setName(name);
        }
        if (mobile != null) {
            user.setMobile(mobile);
        }
        if (gender != null) {
            user.setGender(gender);
        }

        return userRepository.save(Objects.requireNonNull(user));
    }

    /**
     * Delete user (Admin action).
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        userRepository.delete(Objects.requireNonNull(user));
    }

    /**
     * Get users by role.
     */
    public List<User> getUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .toList();
    }

    /**
     * Count users by role.
     */
    public long countUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .count();
    }

    /**
     * Get total user count.
     */
    public long getTotalUserCount() {
        return userRepository.count();
    }

    /**
     * Reset user password (Admin action).
     */
    @Transactional
    public void resetUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(Objects.requireNonNull(user));
    }

    /**
     * Get user from security principal.
     */
    public User getUserFromPrincipal(java.security.Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Principal is null");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + principal.getName()));
    }
}
