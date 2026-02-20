package com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private UserDTO user;
    private List<AdminOrderItemDTO> items; // Can reuse AdminOrderItemDTO as it has the same structure needed
    private double totalAmount;
    private double discount;
    private String status;
    private String currentLocation;
    private List<OrderTrackingDTO> trackingHistory;
    private LocalDateTime orderDate;
}
