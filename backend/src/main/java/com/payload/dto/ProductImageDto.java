package com.payload.dto;

import lombok.Data;

@Data
public class ProductImageDto {
    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
    private String imageType;
    // Optional: variantId if needed for flat structure, but sticking to nested
}
