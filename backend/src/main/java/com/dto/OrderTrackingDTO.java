package com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingDTO {
    private String status;
    private String city;
    private String state;
    private String description;
    private LocalDateTime timestamp;
}
