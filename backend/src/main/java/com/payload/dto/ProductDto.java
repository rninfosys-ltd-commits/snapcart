package com.payload.dto;

import com.entity.Category;
import com.entity.ProductGroup;
import com.entity.SubCategory;
import lombok.Data;
import java.util.List;

@Data
public class ProductDto {
    private Long modelNo;
    private String name;
    private double price;
    private int quantity;
    private int lowStockThreshold;
    private String description;
    private String brandName;
    private String genericName;
    private String importer;
    private String manufacturer;
    private String packer;
    private String itemDimensions;
    private String itemWeight;
    private String netQuantity;
    private Boolean isReplaceable;
    private Boolean isReturnable;
    private Boolean isSingleBrand;
    private Category category;
    private ProductGroup productGroup;
    private SubCategory subCategory;

    // Using ProductAboutDto as requested, though existing logic uses List<String>
    // I will map it properly in service
    private List<ProductAboutDto> aboutItems;

    private List<ProductVariantDto> variants;
}
