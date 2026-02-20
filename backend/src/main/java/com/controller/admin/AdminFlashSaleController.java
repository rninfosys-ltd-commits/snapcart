package com.controller.admin;

import com.entity.Product;
import com.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/flash-sales")
@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class AdminFlashSaleController {

    @Autowired
    private ProductService productService;

    @Autowired
    private com.mapper.ProductMapper productMapper;

    @GetMapping
    public ResponseEntity<List<com.payload.response.ProductResponse>> getActiveFlashSales() {
        return ResponseEntity
                .ok(productService.getFlashSaleProducts().stream().map(productMapper::toResponse).toList());
    }

    @PostMapping("/{modelNo}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<com.payload.response.ProductResponse> setFlashSale(
            @PathVariable Long modelNo,
            @RequestBody Map<String, Object> request) {

        Double salePrice = Double.valueOf(request.get("salePrice").toString());
        String endTimeStr = request.get("saleEndTime").toString();
        LocalDateTime endTime = LocalDateTime.parse(endTimeStr);

        Product product = productService.getProductByModelNo(modelNo);

        // Update all variants with flash sale info
        if (product.getVariants() != null) {
            for (com.entity.ProductVariant v : product.getVariants()) {
                v.setSalePrice(salePrice);
                v.setSaleEndTime(endTime);
            }
        }

        // We reuse the update logic or specifically save it
        return ResponseEntity.ok(productMapper.toResponse(productService.updateProductFields(product)));
    }

    @DeleteMapping("/{modelNo}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<com.payload.response.ProductResponse> removeFlashSale(@PathVariable Long modelNo) {
        Product product = productService.getProductByModelNo(modelNo);

        // Remove sale from all variants
        if (product.getVariants() != null) {
            for (com.entity.ProductVariant v : product.getVariants()) {
                v.setSalePrice(null);
                v.setSaleEndTime(null);
            }
        }
        return ResponseEntity.ok(productMapper.toResponse(productService.updateProductFields(product)));
    }
}
