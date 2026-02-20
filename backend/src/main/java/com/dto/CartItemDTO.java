package com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDTO {
    private Long id;
    private ProductSummaryDTO product;
    private Long variantId;
    private double price;
    private int quantity;
    private double total;
    private String size;
    private String color;
    private String colorHex;
}
