package com.controller.pub;

import com.service.StripeService;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/health")
public class HealthCheckController {

    @Autowired
    private StripeService stripeService;

    @GetMapping("/stripe")
    public ResponseEntity<?> testStripe() {
        try {
            // Create a small test payment intent to verify key
            PaymentIntent intent = stripeService.createPaymentIntent(100L, "usd", "Integration Test");

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Stripe API is connected and working correctly.");
            response.put("paymentIntentId", intent.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
