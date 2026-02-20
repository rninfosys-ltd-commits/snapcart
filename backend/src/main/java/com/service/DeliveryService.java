package com.service;

import com.entity.Pincode;
import com.entity.Product;
import com.entity.Moderator;
import com.repository.PincodeRepository;
import com.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DeliveryService {

    @Autowired
    private PincodeRepository pincodeRepository;

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> checkDelivery(Long productId, String destinationPincode) {
        Map<String, Object> response = new HashMap<>();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Pincode dest = pincodeRepository.findByPincode(destinationPincode).orElse(null);

        int deliveryDays = 7; // Default

        if (dest != null) {
            Moderator moderator = product.getModerator();
            String warehouseCity = (moderator != null && moderator.getWarehouseCity() != null)
                    ? moderator.getWarehouseCity()
                    : "Mumbai";
            String warehouseState = (moderator != null && moderator.getWarehouseState() != null)
                    ? moderator.getWarehouseState()
                    : "Maharashtra";

            if (warehouseCity.equalsIgnoreCase(dest.getCity())) {
                deliveryDays = 2;
            } else if (warehouseState.equalsIgnoreCase(dest.getState())) {
                deliveryDays = 4;
            }
        }

        LocalDate estimatedDate = LocalDate.now().plusDays(deliveryDays);

        response.put("serviceable", true);
        response.put("estimatedDays", deliveryDays);
        response.put("estimatedDeliveryDate", estimatedDate);
        return response;
    }
}
