package com.service;

import com.entity.Product;
import com.entity.ProductVariant;
import com.entity.User;
import com.repository.ProductRepository;
import com.repository.ProductVariantRepository;
import com.repository.RecentlyViewedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

/**
 * SmartPopupService
 * =================
 * 
 * Service for determining which product to show in smart popup.
 * Logic: Recently viewed > Trending (high rating) > Low stock
 */
@Service
public class SmartPopupService {

    @Autowired
    private RecentlyViewedRepository recentlyViewedRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    private Random random = new Random();

    /**
     * Get product to display in popup
     * 
     * @param user User (can be null for anonymous)
     * @return Product to show
     */
    public Product getPopupProduct(User user) {
        // Try recently viewed first (if user is logged in)
        if (user != null) {
            List<Product> recentlyViewed = recentlyViewedRepository
                    .findByUserOrderByViewedAtDesc(user)
                    .stream()
                    .map(rv -> rv.getProduct())
                    .limit(5)
                    .toList();

            if (!recentlyViewed.isEmpty()) {
                return recentlyViewed.get(random.nextInt(recentlyViewed.size()));
            }
        }

        // Try trending products (high rating)
        List<Product> trending = productRepository.findTop10ByOrderByAverageRatingDesc();
        if (!trending.isEmpty()) {
            return trending.get(random.nextInt(Math.min(3, trending.size())));
        }

        // Try low stock products
        List<ProductVariant> lowStock = productVariantRepository
                .findByQuantityLessThanOrderByQuantityAsc(10, PageRequest.of(0, 10));

        if (!lowStock.isEmpty()) {
            ProductVariant variant = lowStock.get(random.nextInt(Math.min(3, lowStock.size())));
            return variant.getProduct();
        }

        // Fallback: random product
        List<Product> allProducts = productRepository.findAll();
        if (!allProducts.isEmpty()) {
            return allProducts.get(random.nextInt(allProducts.size()));
        }

        return null;
    }

    /**
     * Get trending products (high rating, high review count)
     * 
     * @return List of trending products
     */
    public List<Product> getTrendingProducts() {
        return productRepository.findTop10ByOrderByAverageRatingDesc();
    }

    /**
     * Get low stock products
     * 
     * @return List of low stock products
     */
    public List<Product> getLowStockProducts() {
        return productVariantRepository
                .findByQuantityLessThanOrderByQuantityAsc(10, PageRequest.of(0, 10))
                .stream()
                .map(ProductVariant::getProduct)
                .distinct()
                .limit(10)
                .toList();
    }
}
