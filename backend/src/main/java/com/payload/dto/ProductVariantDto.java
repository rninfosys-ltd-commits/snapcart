package com.payload.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductVariantDto {
    private Long id;
    private double price;
    private int quantity;
    private Double salePrice;
    private String saleEndTime; // Use string for easy JSON transport
    private String color;
    private String colorHex;
    private String size;
    private String sku;
    private String styleCode;
    private List<ProductImageDto> images;
}
