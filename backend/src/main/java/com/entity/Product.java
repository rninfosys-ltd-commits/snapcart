package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Product implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long modelNo;

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "is_single_brand")
    private Boolean isSingleBrand = false;

    public boolean isSingleBrand() {
        return isSingleBrand != null && isSingleBrand;
    }

    public void setSingleBrand(Boolean singleBrand) {
        this.isSingleBrand = singleBrand;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id")
    private Moderator moderator;

    @Column(name = "brand_name", length = 255)
    private String brandName;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private SubCategory subCategory;

    @Enumerated(EnumType.STRING)
    private ProductGroup productGroup;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_about", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "about_item")
    private List<String> aboutItems = new ArrayList<>();

    // Additional Information Fields
    @Column(length = 2000)
    private String manufacturer;

    @Column(length = 2000)
    private String packer;

    @Column(length = 2000)
    private String importer;

    @Column(length = 255)
    private String itemWeight;

    @Column(length = 2000)
    private String itemDimensions;

    @Column(length = 255)
    private String netQuantity;

    @Column(columnDefinition = "boolean default true")
    private boolean isReturnable = true;

    @Column(columnDefinition = "boolean default true")
    private boolean isReplaceable = true;

    @Column(length = 255)
    private String genericName;

    @Column(length = 5000)
    private String description;

    private double price;
    private int quantity;

    /*
     * =======================
     * META
     * =======================
     */

    @Column(nullable = false)
    private double averageRating = 0.0;

    @Column(nullable = false)
    private int lowStockThreshold = 5;

    @Column(nullable = false)
    private int reviewCount = 0;

    /*
     * =======================
     * RELATIONSHIPS
     * =======================
     */

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<UserReview> reviews = new ArrayList<>();
}
