package com.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class ProductVariantRequest {
    private String color;
    private String colorHex;
    private String size;
    private double price;
    private int quantity;
    private String sku;
    private String styleCode;
    private List<String> sizes;

    private Double salePrice;
    private java.time.LocalDateTime saleEndTime;

    private List<String> imageUrls;
}
