package com.service;

import com.dto.ReviewResponseDTO;
import com.entity.*;
import com.mapper.ReviewMapper;
import com.payload.request.ReviewRequest;
import com.repository.ProductRepository;
import com.repository.UserReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class ReviewService {

    @Autowired
    private UserReviewRepository userReviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public ReviewResponseDTO addReview(User user, ReviewRequest request) {
        Product product = productRepository
                .findById(Objects.requireNonNull(request.getProductModelNo(), "Product Model No is required"))
                .orElseThrow(() -> new RuntimeException("Product not found"));

        UserReview review = new UserReview();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImage(request.getImage());

        UserReview savedReview = userReviewRepository.save(review);

        // Update product rating stats
        updateProductRating(product);

        return ReviewMapper.toDTO(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getProductReviews(Long productModelNo) {
        Product product = productRepository
                .findById(Objects.requireNonNull(productModelNo, "Product Model No is required"))
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return userReviewRepository.findByProduct(product).stream()
                .map(ReviewMapper::toDTO)
                .toList();
    }

    /**
     * Get all reviews (for admin/moderator).
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getAllReviews() {
        return userReviewRepository.findAll().stream()
                .map(ReviewMapper::toDTO)
                .toList();
    }

    /**
     * Get a review by ID.
     */
    @Transactional(readOnly = true)
    public ReviewResponseDTO getReviewById(Long reviewId) {
        UserReview review = userReviewRepository.findById(Objects.requireNonNull(reviewId, "Review ID is required"))
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        return ReviewMapper.toDTO(review);
    }

    /**
     * Delete a review (moderator/admin action).
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        UserReview review = userReviewRepository.findById(Objects.requireNonNull(reviewId, "Review ID is required"))
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));

        Product product = review.getProduct();
        userReviewRepository.delete(review);

        // Update product rating after deletion
        updateProductRating(product);
    }

    private void updateProductRating(Product product) {
        List<UserReview> reviews = userReviewRepository.findByProduct(product);
        int count = reviews.size();
        double sum = reviews.stream().mapToInt(UserReview::getRating).sum();

        product.setReviewCount(count);
        if (count > 0) {
            product.setAverageRating(sum / count);
        } else {
            product.setAverageRating(0.0);
        }
        productRepository.save(product);
    }

    public long getTotalReviewCount() {
        return userReviewRepository.count();
    }
}
