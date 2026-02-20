package com.controller.pub;

import com.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class PublicCouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam String code, @RequestParam double cartValue) {
        Long userId = null;
        try {
            com.service.UserDetailsImpl userDetails = (com.service.UserDetailsImpl) org.springframework.security.core.context.SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();
            userId = userDetails.getId();
        } catch (Exception e) {
            // Guest or not logged in
        }

        var result = couponService.validateCoupon(code, cartValue, userId);

        if (result.isValid()) {
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "discountAmount", result.getDiscount(),
                    "message", result.getMessage(),
                    "code", result.getCoupon().getCode()));
        } else {
            return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "discountAmount", 0,
                    "message", result.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<java.util.List<com.entity.Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }
}
