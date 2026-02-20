package com.mapper;

import com.dto.ProductSummaryDTO;
import com.dto.ReviewResponseDTO;
import com.dto.UserDTO;
import com.entity.UserReview;

public class ReviewMapper {

    public static ReviewResponseDTO toDTO(UserReview review) {
        if (review == null) {
            return null;
        }

        UserDTO userDTO = new UserDTO(
                review.getUser().getId(),
                review.getUser().getName(),
                review.getUser().getEmail(),
                review.getUser().getProfilePictureType());

        ProductSummaryDTO productDTO = new ProductSummaryDTO(
                review.getProduct().getModelNo(),
                review.getProduct().getName(),
                "/api/images/product/" + review.getProduct().getModelNo() + "/1",
                review.getProduct().isReturnable(),
                review.getProduct().isReplaceable(),
                review.getProduct().isSingleBrand());

        return new ReviewResponseDTO(
                review.getId(),
                userDTO,
                productDTO,
                review.getRating(),
                review.getComment(),
                review.getImage(),
                review.getReviewDate());
    }
}
