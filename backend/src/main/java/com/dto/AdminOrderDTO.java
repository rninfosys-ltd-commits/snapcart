package com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderDTO {

    private Long orderId;

    // User info
    private UserDTO user;

    // Order info
    private List<AdminOrderItemDTO> items;
    private double totalAmount;
    private double discount;
    private String status;
    private String currentLocation;
    private LocalDateTime orderDate;
}
