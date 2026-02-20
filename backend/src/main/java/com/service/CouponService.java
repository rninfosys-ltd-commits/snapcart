package com.service;

import com.entity.Coupon;
import com.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private com.repository.OrderRepository orderRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public List<Coupon> getActiveCoupons() {
        return couponRepository.findByIsActiveTrue();
    }

    public Coupon getCouponById(Long id) {
        return couponRepository.findById(Objects.requireNonNull(id, "Coupon ID is required"))
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    /**
     * Validate coupon and return discount amount
     */
    public CouponValidationResult validateCoupon(String code, double orderAmount, Long userId) {
        try {
            Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code.toUpperCase())
                    .orElse(null);

            if (coupon == null) {
                return new CouponValidationResult(false, "Invalid coupon code", 0, null);
            }

            if (!coupon.isValid()) {
                if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                    return new CouponValidationResult(false, "Coupon usage limit reached", 0, null);
                }
                return new CouponValidationResult(false, "Coupon is expired or inactive", 0, null);
            }

            if (orderAmount < coupon.getMinOrderAmount()) {
                return new CouponValidationResult(false,
                        String.format("Minimum order amount is ₹%.0f", coupon.getMinOrderAmount()),
                        0, null);
            }

            if (coupon.isFirstOrderOnly()) {
                if (userId == null) {
                    return new CouponValidationResult(false, "This coupon is only for registered users' first order", 0,
                            null);
                }
                long orderCount = orderRepository.countByUserIdAndStatusNot(userId, com.entity.OrderStatus.CANCELLED);
                if (orderCount > 0) {
                    return new CouponValidationResult(false, "This coupon is only valid for your first order", 0, null);
                }
            }

            double discount = coupon.calculateDiscount(orderAmount);
            return new CouponValidationResult(true, "Coupon applied successfully", discount, coupon);

        } catch (Exception e) {
            return new CouponValidationResult(false, "Error validating coupon", 0, null);
        }
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode().toUpperCase())) {
            throw new RuntimeException("Coupon code already exists");
        }
        coupon.setCode(coupon.getCode().toUpperCase());
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon updated) {
        Coupon existing = getCouponById(id);

        existing.setDescription(updated.getDescription());
        existing.setDiscountType(updated.getDiscountType());
        existing.setDiscountValue(updated.getDiscountValue());
        existing.setMinOrderAmount(updated.getMinOrderAmount());
        existing.setMaxDiscount(updated.getMaxDiscount());
        existing.setActive(updated.isActive());
        existing.setValidFrom(updated.getValidFrom());
        existing.setValidUntil(updated.getValidUntil());
        existing.setUsageLimit(updated.getUsageLimit());

        return couponRepository.save(existing);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = getCouponById(id);
        couponRepository.delete(Objects.requireNonNull(coupon, "Coupon not found"));
    }

    @Transactional
    public void incrementUsage(Long couponId) {
        Coupon coupon = getCouponById(couponId);
        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }
    }

    public static class CouponValidationResult {
        private final boolean valid;
        private final String message;
        private final double discount;
        private final Coupon coupon;

        public CouponValidationResult(boolean valid, String message, double discount, Coupon coupon) {
            this.valid = valid;
            this.message = message;
            this.discount = discount;
            this.coupon = coupon;
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }

        public double getDiscount() {
            return discount;
        }

        public Coupon getCoupon() {
            return coupon;
        }
    }
}
