package com.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {

    @NotNull
    private String productModelNo;

    @Min(1)
    private int quantity;

    private String size;
    private String color;
}
