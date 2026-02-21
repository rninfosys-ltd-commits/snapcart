package com.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_webhook_events")
@Data
public class PaymentWebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String eventId; // Gateway event ID

    private String eventType; // e.g., payment.success
    private Long orderId;
    private LocalDateTime processedAt;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @PrePersist
    protected void onCreate() {
        this.processedAt = LocalDateTime.now();
    }
}
