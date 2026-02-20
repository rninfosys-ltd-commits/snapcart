package com.controller.pub;

import com.dto.ReviewResponseDTO;
import com.entity.User;
import com.payload.request.ReviewRequest;
import com.repository.UserRepository;
import com.service.ReviewService;
import com.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * REST Controller for Review operations.
 * 
 * <p>
 * <strong>Access Control:</strong>
 * </p>
 * <ul>
 * <li>Public: GET reviews for products</li>
 * <li>USER/MODERATOR/ADMIN: Add reviews</li>
 * <li>MODERATOR/ADMIN: Delete reviews, view all reviews</li>
 * </ul>
 */
// CORS handled globally in SecurityConfig
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Get reviews for a specific product (public access).
     */
    @GetMapping("/product/{productModelNo}")
    public ResponseEntity<List<ReviewResponseDTO>> getProductReviews(@PathVariable Long productModelNo) {
        return ResponseEntity.ok(reviewService.getProductReviews(productModelNo));
    }

    // ==================== USER ENDPOINTS ====================

    /**
     * Add a review for a product (authenticated users).
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ReviewResponseDTO> addReview(@Valid @RequestBody ReviewRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(reviewService.addReview(user, request));
    }

    // ==================== MODERATOR/ADMIN ENDPOINTS ====================

    /**
     * Get all reviews (moderator/admin view).
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    /**
     * Get a single review by ID.
     */
    @GetMapping("/{reviewId}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ReviewResponseDTO> getReviewById(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    /**
     * Delete a review (moderator/admin action).
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }

    // ==================== HELPER METHODS ====================

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userRepository.findById(Objects.requireNonNull(userDetails.getId(), "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
