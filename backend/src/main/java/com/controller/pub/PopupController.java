package com.controller.pub;

import com.entity.Product;
import com.entity.User;
import com.repository.UserRepository;
import com.service.SmartPopupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * PopupController
 * ===============
 * 
 * Public endpoint for fetching smart popup product
 */
@RestController
@RequestMapping("/api/public/popup")
public class PopupController {

    @Autowired
    private SmartPopupService smartPopupService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.mapper.ProductMapper productMapper;

    /**
     * Get product for smart popup
     * 
     * GET /api/public/popup/product
     */
    @GetMapping("/product")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<com.payload.response.ProductResponse> getPopupProduct(Principal principal) {
        User user = null;

        // Get user if authenticated
        if (principal != null) {
            user = userRepository.findByEmail(principal.getName()).orElse(null);
        }

        Product product = smartPopupService.getPopupProduct(user);

        if (product == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(productMapper.toResponse(product));
    }
}
