package com.controller.pub;

import com.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @PostMapping("/check")
    public ResponseEntity<?> checkDelivery(@RequestBody Map<String, Object> request) {
        Object productIdObj = request.get("productId");
        Object pincodeObj = request.get("destinationPincode");

        if (productIdObj == null || pincodeObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "productId and destinationPincode are required"));
        }

        try {
            Long productId = Long.valueOf(productIdObj.toString());
            String pincode = pincodeObj.toString();
            return ResponseEntity.ok(deliveryService.checkDelivery(productId, pincode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid productId or pincode format"));
        }
    }
}
