package com.service;

import com.entity.Product;
import com.entity.RecentlyViewed;
import com.entity.User;
import com.repository.ProductRepository;
import com.repository.RecentlyViewedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecentlyViewedService {

    @Autowired
    private RecentlyViewedRepository recentlyViewedRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public void addRecentlyViewed(User user, Long productModelNo) {
        Product product = productRepository.findById(productModelNo)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already viewed, update timestamp
        RecentlyViewed viewed = recentlyViewedRepository.findByUserAndProductModelNo(user, productModelNo)
                .orElse(new RecentlyViewed(user, product));

        viewed.setViewedAt(LocalDateTime.now());
        recentlyViewedRepository.save(viewed);

        // Limit to last 20 items per user? (Optional cleanup)
        // cleanUpOldViews(user);
    }

    @Transactional(readOnly = true)
    public List<Product> getRecentlyViewedProducts(User user) {
        return recentlyViewedRepository.findByUserOrderByViewedAtDesc(user).stream()
                .map(RecentlyViewed::getProduct)
                .limit(10) // Return top 10
                .collect(Collectors.toList());
    }
}
