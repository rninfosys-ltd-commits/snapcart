package com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderItemDTO {
    private ProductSummaryDTO product;
    private double price;
    private int quantity;
    private double total;
    private String size;
    private String color;
    private String colorHex;
}
