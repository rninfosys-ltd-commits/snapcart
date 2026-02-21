package com.payload.dto;

import com.entity.PayoutStatus;
import com.entity.SettlementType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SettlementDTO {
    private Long id;
    private Long orderId;
    private Long tenantId;
    private String moderatorName;
    private String brandName;

    private Double totalAmount;
    private Double commissionAmount;
    private Double commissionPercent;
    private Double netPayoutAmount;

    private Double refundableAmount;
    private Double refundedAmount;

    private PayoutStatus payoutStatus;
    private String payoutReference;
    private LocalDateTime payoutDate;
    private SettlementType settlementType;
    private LocalDateTime createdAt;
}
