package com.service;

import com.entity.Product;
import com.entity.User;
import com.entity.Wishlist;
import com.entity.WishlistItem;
import com.repository.ProductRepository;
import com.repository.WishlistRepository;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    public Wishlist getWishlistByUser(User user) {
        return wishlistRepository.findByUser(user)
                .orElseGet(() -> {
                    Wishlist wishlist = new Wishlist();
                    wishlist.setUser(user);
                    return wishlistRepository.save(wishlist);
                });
    }

    @Transactional
    public Wishlist addToWishlist(User user, Long productModelNo) {
        Wishlist wishlist = getWishlistByUser(user);
        Product product = productRepository
                .findById(Objects.requireNonNull(productModelNo, "Product ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already exists
        boolean exists = wishlist.getItems().stream()
                .anyMatch(item -> item.getProduct().getModelNo().equals(productModelNo));

        if (!exists) {
            WishlistItem item = new WishlistItem();
            item.setWishlist(wishlist);
            item.setProduct(product);
            wishlist.getItems().add(item);
            wishlistRepository.save(wishlist);
        }

        return wishlist;
    }

    @Transactional
    public Wishlist removeFromWishlist(User user, Long productModelNo) {
        Wishlist wishlist = getWishlistByUser(user);

        wishlist.getItems()
                .removeIf(item -> item.getProduct().getModelNo().equals(productModelNo));

        return wishlistRepository.save(wishlist);
    }
}
