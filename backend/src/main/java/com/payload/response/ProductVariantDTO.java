package com.payload.response;

import lombok.Data;
import java.util.List;

@Data
public class ProductVariantDTO {
    private Long id;
    private String color;
    private String colorHex;
    private String size;
    private double price;
    private int quantity;
    private String sku;
    private String styleCode;

    private Double salePrice;
    private java.time.LocalDateTime saleEndTime;

    private List<ProductImageDTO> images;

    @Data
    public static class ProductImageDTO {
        private Long id;
        private String imageUrl;
        private boolean isPrimary;
    }
}
