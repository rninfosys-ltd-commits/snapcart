package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wishlist_id")
    @JsonIgnore
    private Wishlist wishlist;

    @ManyToOne
    @JoinColumn(name = "product_model_no")
    @JsonIgnore
    private Product product;

    private LocalDateTime addedDate;

    @PrePersist
    public void onCreate() {
        addedDate = LocalDateTime.now();
    }
}
