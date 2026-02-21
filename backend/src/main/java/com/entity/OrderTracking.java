package com.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
@Data
@NoArgsConstructor
public class OrderTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private TrackingStatus status;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    // Legacy field required by DB
    @Column(name = "location")
    private String location;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public OrderTracking(Order order, TrackingStatus status, String city, String state, String description) {
        this.order = order;
        this.status = status;
        this.city = city != null ? city : "Unknown";
        this.state = state != null ? state : "Unknown";
        this.description = description;

        // Defensive coding: Ensure location is never null or empty
        this.location = this.city + ", " + this.state;

        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onPersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        if (this.location == null) {
            this.location = (city != null ? city : "Unknown") + ", " + (state != null ? state : "Unknown");
        }
        if (this.city == null)
            this.city = "Unknown";
        if (this.state == null)
            this.state = "Unknown";
    }
}
