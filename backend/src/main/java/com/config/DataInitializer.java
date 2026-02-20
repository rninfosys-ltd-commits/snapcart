package com.config;

import com.entity.Coupon;
import com.repository.CouponRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initCoupons(CouponRepository couponRepository) {
        return args -> {
            if (!couponRepository.existsByCode("WELCOME20")) {
                Coupon welcomeCoupon = new Coupon();
                welcomeCoupon.setCode("WELCOME20");
                welcomeCoupon.setDescription("20% Off Your First Order");
                welcomeCoupon.setDiscountType(Coupon.DiscountType.PERCENTAGE);
                welcomeCoupon.setDiscountValue(20.0);
                welcomeCoupon.setMinOrderAmount(0.0);
                welcomeCoupon.setMaxDiscount(500.0); // Caps at 500
                welcomeCoupon.setActive(true);
                welcomeCoupon.setFirstOrderOnly(true);
                welcomeCoupon.setValidFrom(LocalDateTime.now());
                welcomeCoupon.setValidUntil(LocalDateTime.now().plusYears(1));

                couponRepository.save(welcomeCoupon);
                System.out.println("Seed: Created WELCOME20 first-order coupon.");
            }
        };
    }
}
