package com.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id", nullable = false)
    private Moderator moderator;

    // Financial Ledger (Snapshot from OrderItem)
    private Double totalAmount; // Total gross amount for this tenant
    private Double commissionAmount; // Total commission for the platform
    private Double commissionPercent; // Commission percentage used
    private Double netPayoutAmount; // Total net amount for the moderator

    // Refund Safety
    private Double refundableAmount; // Initially netPayoutAmount, decreases on refunds
    private Double refundedAmount = 0.0; // Total amount refunded so far

    // Payout Tracking
    @Enumerated(EnumType.STRING)
    private PayoutStatus payoutStatus = PayoutStatus.CREATED;

    private String payoutReference; // Gateway transfer ID
    private LocalDateTime payoutDate;

    @Enumerated(EnumType.STRING)
    private SettlementType settlementType;

    // Idempotency & Concurrency
    private Boolean payoutLocked = false;

    @Version
    private Long version;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
