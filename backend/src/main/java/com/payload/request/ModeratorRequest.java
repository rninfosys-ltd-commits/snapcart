package com.payload.request;

import com.entity.Category;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Request DTO for creating or updating a Moderator.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ModeratorRequest {

    /**
     * User ID to assign as moderator.
     * Required for creation, optional for updates.
     */
    /**
     * User ID to assign as moderator.
     * Required for creation, optional for updates.
     */
    private Long userId;

    /**
     * Categories the moderator can manage.
     */
    private Set<Category> categories;

    /**
     * Permission to delete user reviews.
     */
    private Boolean canDeleteReviews = false;

    /**
     * Permission to ban/suspend users.
     */
    private Boolean canBanUsers = false;

    /**
     * Permission to edit product listings.
     */
    private Boolean canEditProducts = false;

    /**
     * Permission to manage order disputes.
     */
    private Boolean canManageOrders = false;

    /**
     * Authority level (1-5).
     */
    @Min(value = 1, message = "Moderation level must be at least 1")
    @Max(value = 5, message = "Moderation level cannot exceed 5")
    private Integer moderationLevel = 1;

    /**
     * Admin notes about this moderator.
     */
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    // Brand Details
    private String brandName;
    private String brandDescription;
    private String brandLogoUrl;

    // KYC Details
    private String bankAccountNumber;
    private String ifscCode;
    private String panNumber;
    private String kycStatus; // For admin updates
    private Boolean isBrandActive; // For admin updates

    private String warehouseCity;
    private String warehouseState;
    private String warehousePincode;

    private String signatureUrl;
    private Boolean isContractSigned;
}
