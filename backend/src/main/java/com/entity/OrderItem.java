package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Back reference to order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    // Variant reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double price;

    // ==================== FINANCIAL & DATA SNAPSHOTS (FROZEN AT PURCHASE)
    // ====================

    @Column(length = 255)
    private String productName;

    @Column(length = 1000)
    private String productImage;

    @Column(name = "tenant_id")
    private Long tenantId;

    private Double grossAmount; // productPrice * quantity
    private Double commissionPercentSnapshot; // moderator's commission % at time of purchase
    private Double commissionAmount; // grossAmount * commissionPercent / 100
    private Double netAmount; // amount due to moderator (gross - commission)
}
