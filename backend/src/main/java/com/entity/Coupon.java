package com.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(length = 100)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(nullable = false)
    private double discountValue;

    @Column(nullable = false)
    private double minOrderAmount = 0;

    @Column
    private Double maxDiscount; // For percentage discounts

    @Column(nullable = false)
    private boolean isActive = true;

    @Column
    private LocalDateTime validFrom;

    @Column
    private LocalDateTime validUntil;

    @Column(nullable = false)
    private int usageLimit = 0; // 0 = unlimited

    @Column(nullable = false)
    private int usedCount = 0;

    @Column(nullable = false)
    private boolean isFirstOrderOnly = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DiscountType {
        PERCENTAGE,
        FIXED
    }

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();

        if (!isActive)
            return false;
        if (usageLimit > 0 && usedCount >= usageLimit)
            return false;
        if (validFrom != null && now.isBefore(validFrom))
            return false;
        if (validUntil != null && now.isAfter(validUntil))
            return false;

        return true;
    }

    public double calculateDiscount(double orderAmount) {
        if (orderAmount < minOrderAmount)
            return 0;

        double discount;
        if (discountType == DiscountType.PERCENTAGE) {
            discount = orderAmount * (discountValue / 100);
            if (maxDiscount != null && discount > maxDiscount) {
                discount = maxDiscount;
            }
        } else {
            discount = discountValue;
        }

        return Math.min(discount, orderAmount);
    }
}
