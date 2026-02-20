package com.controller.admin;

import com.entity.ProductVariant;
import com.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class InventoryController {

    @Autowired
    private com.mapper.ProductMapper productMapper;

    @Autowired
    private InventoryService inventoryService;

    /**
     * Get inventory dashboard summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        List<ProductVariant> lowStock = inventoryService.getLowStockVariants();
        List<ProductVariant> outOfStock = inventoryService.getOutOfStockVariants();

        Map<String, Object> summary = new HashMap<>();
        summary.put("lowStockCount", lowStock.size());
        summary.put("outOfStockCount", outOfStock.size());
        // summary.put("lowStockVariants", lowStock); // might be too large
        // summary.put("outOfStockVariants", outOfStock);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<com.payload.response.ProductVariantDTO>> getLowStockVariants() {
        return ResponseEntity
                .ok(inventoryService.getLowStockVariants().stream().map(productMapper::toVariantDTO).toList());
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<com.payload.response.ProductVariantDTO>> getOutOfStockVariants() {
        return ResponseEntity
                .ok(inventoryService.getOutOfStockVariants().stream().map(productMapper::toVariantDTO).toList());
    }

    /**
     * Update stock quantity (Variant ID)
     */
    @PutMapping("/{variantId}/stock")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<com.payload.response.ProductVariantDTO> updateStock(
            @PathVariable Long variantId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(productMapper.toVariantDTO(inventoryService.updateStock(variantId, quantity)));
    }

    /**
     * Update low stock threshold (Product ID)
     */
    @PutMapping("/product/{productId}/threshold")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<com.payload.response.ProductResponse> updateThreshold(
            @PathVariable Long productId,
            @RequestParam int threshold) {
        return ResponseEntity
                .ok(productMapper.toResponse(inventoryService.updateLowStockThreshold(productId, threshold)));
    }

    /**
     * Bulk update stock
     */
    @PutMapping("/bulk-update")
    public ResponseEntity<Map<String, String>> bulkUpdateStock(@RequestBody List<Map<String, Object>> updates) {
        int successCount = 0;
        int failCount = 0;

        for (Map<String, Object> update : updates) {
            try {
                // Expecting "variantId" now
                Long variantId = Long.valueOf(update.get("variantId").toString());
                int quantity = Integer.parseInt(update.get("quantity").toString());
                inventoryService.updateStock(variantId, quantity);
                successCount++;
            } catch (Exception e) {
                failCount++;
            }
        }

        Map<String, String> result = new HashMap<>();
        result.put("message", String.format("Updated %d variants, %d failed", successCount, failCount));
        return ResponseEntity.ok(result);
    }
}
