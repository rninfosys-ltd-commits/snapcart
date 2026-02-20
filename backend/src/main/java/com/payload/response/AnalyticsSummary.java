package com.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummary {
    private double totalRevenue;
    private int totalOrders;
    private int newCustomers;
    private double avgOrderValue;
}
