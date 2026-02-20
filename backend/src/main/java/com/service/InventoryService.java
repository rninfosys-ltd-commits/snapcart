package com.service;

import com.entity.Product;
import com.entity.ProductVariant;
import com.repository.ProductRepository;
import com.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    /**
     * Check if enough stock is available for a variant
     */
    public boolean checkStockAvailability(Long variantId, int requestedQuantity) {
        ProductVariant variant = productVariantRepository
                .findById(Objects.requireNonNull(variantId, "Variant ID is required"))
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        return variant.getQuantity() >= requestedQuantity;
    }

    // reduceStock and restoreStock are now handled directly in OrderService
    // keeping them here if needed for other flows, but updating to use variant

    @Transactional
    public void reduceStock(Long variantId, int quantity) {
        ProductVariant variant = productVariantRepository
                .findById(Objects.requireNonNull(variantId, "Variant ID is required"))
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        if (variant.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + variant.getProduct().getName());
        }

        variant.setQuantity(variant.getQuantity() - quantity);
        productVariantRepository.save(variant);
    }

    @Transactional
    public void restoreStock(Long variantId, int quantity) {
        ProductVariant variant = productVariantRepository
                .findById(Objects.requireNonNull(variantId, "Variant ID is required"))
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        variant.setQuantity(variant.getQuantity() + quantity);
        productVariantRepository.save(variant);
    }

    /**
     * Get all variants with low stock
     */
    public List<ProductVariant> getLowStockVariants() {
        // Threshold is currently on Product.
        // Logic: Variant is low if quantity <= Product.lowStockThreshold
        // We need to join? Or fetch all and filter?
        // Fetching all might be heavy.
        // Better: Custom query. For now, stream filter.
        return productVariantRepository.findAll().stream()
                .filter(v -> v.getQuantity() <= v.getProduct().getLowStockThreshold() && v.getQuantity() > 0)
                .collect(Collectors.toList());
    }

    /**
     * Get all out-of-stock variants
     */
    public List<ProductVariant> getOutOfStockVariants() {
        return productVariantRepository.findAll().stream()
                .filter(v -> v.getQuantity() == 0)
                .collect(Collectors.toList());
    }

    /**
     * Update stock quantity for a variant
     */
    @Transactional
    public ProductVariant updateStock(Long variantId, int newQuantity) {
        if (newQuantity < 0) {
            throw new RuntimeException("Stock quantity cannot be negative");
        }

        ProductVariant variant = productVariantRepository
                .findById(Objects.requireNonNull(variantId, "Variant ID is required"))
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        variant.setQuantity(newQuantity);
        return productVariantRepository.save(variant);
    }

    /**
     * Update low stock threshold for a product (threshold applies to all variants
     * of this product)
     */
    @Transactional
    public Product updateLowStockThreshold(Long productId, int threshold) {
        if (threshold < 0) {
            throw new RuntimeException("Threshold cannot be negative");
        }

        Product product = productRepository.findById(Objects.requireNonNull(productId, "Product ID is required"))
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setLowStockThreshold(threshold);
        return productRepository.save(product);
    }
}
