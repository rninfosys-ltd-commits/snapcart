package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = { "model_no" }) // Removed color, size columns from constraint
})
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_no", nullable = false)
    @JsonIgnore
    private Product product;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariantAttributeValue> attributeValues = new ArrayList<>();

    @Column(length = 255)
    private String styleCode;

    @Column(length = 255)
    private String sku;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private int quantity;

    private Double salePrice;
    private java.time.LocalDateTime saleEndTime;

    // --- Legacy Fields (re-enabled for DB compatibility) ---
    @Column(name = "color")
    private String color;

    @Column(name = "size")
    private String size;

    @Column(name = "color_hex")
    private String colorHex;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProductImage> images = new ArrayList<>();

    // --- Backward Compatibility Helpers ---
    // Getters now use the field directly, but we can keep logic to fallback if
    // needed
    // For now, simplicity: use fields. Sync logic will be in Service.

    // private String getAttributeValue(String attributeName) {
    // if (attributeValues == null)
    // return null;
    // return attributeValues.stream()
    // .filter(av -> av != null && av.getAttributeValue() != null &&
    // av.getAttributeValue().getAttribute() != null &&
    // av.getAttributeValue().getAttribute().getName().equalsIgnoreCase(attributeName))
    // .map(av -> av.getAttributeValue().getValue())
    // .findFirst()
    // .orElse(null);
    // }

    // private String getAttributeMetadata(String attributeName) {
    // if (attributeValues == null)
    // return null;
    // return attributeValues.stream()
    // .filter(av -> av != null && av.getAttributeValue() != null &&
    // av.getAttributeValue().getAttribute() != null &&
    // av.getAttributeValue().getAttribute().getName().equalsIgnoreCase(attributeName))
    // .map(av -> av.getAttributeValue().getMetadata())
    // .findFirst()
    // .orElse(null);
    // }
}
