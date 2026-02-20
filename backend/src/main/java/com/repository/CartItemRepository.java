package com.repository;

import com.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM cart_item WHERE variant_id NOT IN (SELECT id FROM product_variant)", nativeQuery = true)
    void deleteOrphanedItems();
}
