package com.payload.request;

import lombok.Data;

@Data
public class OrderRequest {
    private Object shippingAddress;
    private String paymentMethod;
    private Double discount;
    private Long couponId;
}
