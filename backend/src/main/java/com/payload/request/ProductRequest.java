package com.payload.request;

import com.entity.Category;
import com.entity.SubCategory;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank
    private String name;
    private String brandName;
    private Category category;
    private SubCategory subCategory;
    private com.entity.ProductGroup productGroup;

    private List<String> aboutItems;
    private String manufacturer;
    private String packer;
    private String importer;
    private String itemWeight;
    private String itemDimensions;
    private String netQuantity;
    private String genericName;
    private String description;
    private Boolean isSingleBrand;
    private Boolean isReturnable;
    private Boolean isReplaceable;

    // Variants
    private List<ProductVariantRequest> variants;
}
