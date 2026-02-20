package com.payload.response;

import lombok.Data;

@Data
public class WishlistItemDTO {
    private Long id;
    private Long productModelNo;
    private String productName;
    private String brandName;
    private double price;
    private String imageUrl;
    private com.dto.ProductSummaryDTO product;
}
