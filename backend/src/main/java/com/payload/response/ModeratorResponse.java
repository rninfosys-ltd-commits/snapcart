package com.payload.response;

import com.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Response DTO for Moderator data.
 * Avoids exposing sensitive user information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModeratorResponse {

    private Long id;

    // User info (safe to expose)
    private Long userId;
    private String userName;
    private String userEmail;

    // Assigned categories
    private Set<Category> categories;

    // Permissions
    private Boolean canDeleteReviews;
    private Boolean canBanUsers;
    private Boolean canEditProducts;
    private Boolean canManageOrders;

    // Metadata
    private Integer moderationLevel;
    private LocalDateTime assignedAt;
    private Long assignedBy;
    private Boolean isActive;
    private String notes;

    // Brand Details
    private String brandName;
    private String brandDescription;
    private String brandLogoUrl;

    // KYC Details
    private String bankAccountNumber;
    private String ifscCode;
    private String panNumber;
    private String kycStatus;
    private Boolean isBrandActive;
    private String warehouseCity;
    private String warehouseState;
    private String warehousePincode;

    private Boolean isContractSigned;
    private LocalDateTime contractSignedAt;
    private String signatureUrl;
}
