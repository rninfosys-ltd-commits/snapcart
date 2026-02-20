package com.dto;

import com.entity.PaymentStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for payment information
 */
@Data
public class PaymentDTO {
    private Long id;
    private Long orderId;
    private double amount;
    private String currency;
    private PaymentStatus status;
    private String paymentMethod;
    private String qrCodeData; // UPI payment string for QR code
    private String transactionId;
    private LocalDateTime paymentDate;
}
