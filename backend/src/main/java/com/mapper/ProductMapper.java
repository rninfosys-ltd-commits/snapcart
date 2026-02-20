package com.mapper;

import com.entity.Product;

import com.entity.ProductVariant;
import com.payload.response.ProductResponse;
import com.payload.response.ProductVariantDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product p) {
        if (p == null)
            return null;

        ProductResponse res = new ProductResponse();
        res.setModelNo(p.getModelNo());
        res.setName(p.getName());

        // Map common fields
        res.setBrandName(p.getBrandName());
        res.setCategory(p.getCategory() != null ? p.getCategory().name() : null);
        res.setSubCategory(p.getSubCategory() != null ? p.getSubCategory().name() : null);
        res.setProductGroup(p.getProductGroup() != null ? p.getProductGroup().name() : null);
        res.setAboutItems(p.getAboutItems() != null ? new ArrayList<>(p.getAboutItems()) : new ArrayList<>());

        res.setManufacturer(p.getManufacturer());
        res.setPacker(p.getPacker());
        res.setImporter(p.getImporter());
        res.setItemWeight(p.getItemWeight());
        res.setItemDimensions(p.getItemDimensions());
        res.setNetQuantity(p.getNetQuantity());
        res.setGenericName(p.getGenericName());
        res.setDescription(p.getDescription());

        res.setAverageRating(p.getAverageRating());
        res.setReviewCount(p.getReviewCount());

        // Map Variants
        List<ProductVariantDTO> variantDTOs = p.getVariants().stream()
                .map(this::toVariantDTO)
                .collect(Collectors.toList());
        res.setVariants(variantDTOs);
        res.setSizes(p.getVariants().stream()
                .map(ProductVariant::getSize)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList()));

        // Populate backward compatible / summary fields from first variant if valid
        if (!variantDTOs.isEmpty()) {
            ProductVariantDTO v = variantDTOs.get(0);
            res.setColor(v.getColor());
            res.setColorHex(v.getColorHex());
            res.setPrice(v.getPrice());
            res.setQuantity(v.getQuantity()); // Total quantity? Or first variant quantity?
                                              // Ideally sum of all quantities but let's stick to simple logic
            res.setSalePrice(v.getSalePrice());
            res.setSaleEndTime(v.getSaleEndTime());
            res.setStyleCode(v.getStyleCode());

            // Flatten images for backward compat
            List<ProductVariantDTO.ProductImageDTO> images = v.getImages();
            if (images.size() >= 1)
                res.setImage1Type(true);
            if (images.size() >= 2)
                res.setImage2Type(true);
            if (images.size() >= 3)
                res.setImage3Type(true);
            if (images.size() >= 4)
                res.setImage4Type(true);
            if (images.size() >= 5)
                res.setImage5Type(true);
        }

        return res;
    }

    public ProductVariantDTO toVariantDTO(ProductVariant v) {
        ProductVariantDTO dto = new ProductVariantDTO();
        dto.setId(v.getId());
        dto.setColor(v.getColor());
        dto.setColorHex(v.getColorHex());
        dto.setSize(v.getSize());
        dto.setPrice(v.getPrice());
        dto.setQuantity(v.getQuantity());
        dto.setSku(v.getSku());
        dto.setStyleCode(v.getStyleCode());
        dto.setSalePrice(v.getSalePrice());
        dto.setSaleEndTime(v.getSaleEndTime());

        List<ProductVariantDTO.ProductImageDTO> images = v.getImages().stream()
                .map(img -> {
                    ProductVariantDTO.ProductImageDTO imgDto = new ProductVariantDTO.ProductImageDTO();
                    imgDto.setId(img.getId());
                    // Use relative path; the frontend will prepend the correct API base URL
                    imgDto.setImageUrl("/api/images/" + img.getId());
                    imgDto.setPrimary(img.isPrimary());
                    return imgDto;
                }).collect(Collectors.toList());
        dto.setImages(images);

        return dto;
    }
}
