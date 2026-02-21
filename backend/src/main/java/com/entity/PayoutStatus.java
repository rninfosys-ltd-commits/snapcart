package com.entity;

public enum PayoutStatus {
    CREATED, // Settlement entry created
    READY_FOR_PAYOUT, // Verified and ready for transfer
    IN_PROGRESS, // Payout API call initiated
    PAID, // Successfully transferred
    FAILED, // Transfer failed
    REVERSED, // Payout reversed/clawed back
    REFUNDED // Refund processed against this settlement
}
