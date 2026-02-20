package com.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentRequest {
    @Min(1)
    private Long amount; // Amount in cents (e.g., 1000 for $10.00)

    @NotBlank
    private String currency; // e.g., "usd" or "inr"

    private Long orderId;

    private String description;
}
