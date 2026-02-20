package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "saved_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String cardHolderName;

    @Column(nullable = false)
    private String brand; // e.g., "Visa", "MasterCard"

    @Column(nullable = false, length = 4)
    private String last4;

    @Column(nullable = false, length = 5)
    private String expiry; // MM/YY

    // In a real app, this would be a token from Stripe/Razorpay
    // We will just store a random UUID string for simulation
    @Column(nullable = false)
    private String token;
}
