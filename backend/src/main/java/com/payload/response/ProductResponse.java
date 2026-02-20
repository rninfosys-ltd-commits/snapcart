package com.payload.response;

import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private Long modelNo;
    private String name;
    private String color;
    private String brandName;
    private String styleCode;
    private String colorHex;
    private double price;
    private int quantity;
    private Double salePrice;
    private LocalDateTime saleEndTime;
    private String category;
    private String subCategory;
    private String productGroup;
    private List<String> sizes;
    private List<String> aboutItems;
    private String manufacturer;
    private String packer;
    private String importer;
    private String itemWeight;
    private String itemDimensions;
    private String netQuantity;
    private String genericName;
    private String description;

    // Metadata for thumbnails availability (Backward compat or remove?)
    // Keeping for now, but logic in mapper might set them false
    private boolean image1Type;
    private boolean image2Type;
    private boolean image3Type;
    private boolean image4Type;
    private boolean image5Type;

    private double averageRating;
    private int reviewCount;

    private List<ProductVariantDTO> variants;
}
