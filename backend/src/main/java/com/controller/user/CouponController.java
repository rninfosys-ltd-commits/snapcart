package com.controller.user;

import com.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    /**
     * Validate a coupon and get discount amount
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(
            @RequestParam String code,
            @RequestParam double orderAmount) {

        Long userId = null;
        try {
            com.service.UserDetailsImpl userDetails = (com.service.UserDetailsImpl) org.springframework.security.core.context.SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();
            userId = userDetails.getId();
        } catch (Exception e) {
            // Not logged in
        }

        CouponService.CouponValidationResult result = couponService.validateCoupon(code, orderAmount, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("valid", result.isValid());
        response.put("message", result.getMessage());
        response.put("discount", result.getDiscount());

        if (result.isValid() && result.getCoupon() != null) {
            response.put("couponId", result.getCoupon().getId());
            response.put("discountType", result.getCoupon().getDiscountType().name());
            response.put("discountValue", result.getCoupon().getDiscountValue());
        }

        return ResponseEntity.ok(response);
    }
}
