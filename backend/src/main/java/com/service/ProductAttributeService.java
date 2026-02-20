package com.service;

import com.entity.AttributeValue;
import com.entity.ProductAttribute;
import com.entity.ProductVariant;
import com.entity.VariantAttributeValue;
import com.repository.AttributeValueRepository;
import com.repository.ProductAttributeRepository;
// import com.repository.VariantAttributeValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductAttributeService {

    @Autowired
    private ProductAttributeRepository attributeRepository;

    @Autowired
    private AttributeValueRepository valueRepository;

    @Transactional
    public void syncAttributes(ProductVariant variant, String color, String colorHex, String size) {
        if (color != null && !color.trim().isEmpty()) {
            updateAttribute(variant, "Color", color, colorHex);
        }
        if (size != null && !size.trim().isEmpty()) {
            updateAttribute(variant, "Size", size, null);
        }
    }

    private void updateAttribute(ProductVariant variant, String attrName, String value, String metadata) {
        ProductAttribute attr = attributeRepository.findByName(attrName)
                .orElseGet(() -> {
                    ProductAttribute newAttr = new ProductAttribute();
                    newAttr.setName(attrName);
                    return attributeRepository.save(newAttr);
                });

        AttributeValue finalAttrValue = valueRepository.findByAttributeAndValue(attr, value)
                .orElseGet(() -> {
                    AttributeValue newValue = new AttributeValue();
                    newValue.setAttribute(attr);
                    newValue.setValue(value);
                    newValue.setMetadata(metadata);
                    return valueRepository.save(newValue);
                });

        // Update metadata if it changed (mostly for color hex)
        if (metadata != null && !metadata.equals(finalAttrValue.getMetadata())) {
            finalAttrValue.setMetadata(metadata);
            valueRepository.save(finalAttrValue);
        }

        // Check if link already exists
        boolean exists = variant.getAttributeValues().stream()
                .anyMatch(vav -> vav.getAttributeValue().getId().equals(finalAttrValue.getId()));

        if (!exists) {
            // Remove old value for same attribute if any (since color/size are unique per
            // variant in legacy)
            variant.getAttributeValues()
                    .removeIf(vav -> vav.getAttributeValue().getAttribute().getName().equalsIgnoreCase(attrName));

            VariantAttributeValue link = new VariantAttributeValue();
            link.setVariant(variant);
            link.setAttributeValue(finalAttrValue);
            variant.getAttributeValues().add(link);
        }
    }
}
