package com.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class RecentlyViewed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_model_no", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    public RecentlyViewed(User user, Product product) {
        this.user = user;
        this.product = product;
        this.viewedAt = LocalDateTime.now();
    }
}
