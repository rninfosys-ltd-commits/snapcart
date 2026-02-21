package com.controller.moderator;

import com.entity.Product;
// import com.entity.ProductVariant;
// import com.service.ProductService;
import com.service.InventoryService;
import com.service.UserDetailsImpl;
import com.payload.response.MessageResponse;
import com.payload.response.ProductResponse;
import com.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/moderator/procurement")
@PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
public class ProcurementController {

    @Autowired
    private com.repository.ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private InventoryService inventoryService;

    /**
     * Get list of master products available for procurement
     */
    @GetMapping("/master-catalog")
    public ResponseEntity<List<ProductResponse>> getMasterCatalog() {
        List<Product> masters = productRepository.findByIsMasterTrue();
        return ResponseEntity.ok(masters.stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList()));
    }

    /**
     * Place a procurement order (Simple implementation: direct stock update)
     * In a real system, this would involve a supplier payment and shipping flow.
     */
    @PostMapping("/order")
    public ResponseEntity<?> placeProcurementOrder(
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        try {
            for (Map<String, Object> item : items) {
                Long variantId = Long.valueOf(item.get("variantId").toString());
                int quantity = Integer.parseInt(item.get("quantity").toString());

                // For procurement, we simply increase the quantity of the moderator's variant
                // This assumes the moderator already has the product/variant linked.
                // If they don't, we'd need to "clone" the master product to their tenant.

                inventoryService.updateStock(variantId, quantity);
            }

            return ResponseEntity
                    .ok(new MessageResponse("Procurement order placed successfully and inventory updated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error processing procurement order: " + e.getMessage()));
        }
    }
}
