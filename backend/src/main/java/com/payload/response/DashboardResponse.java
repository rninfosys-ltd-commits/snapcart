package com.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
    private Double totalRevenue;
    private Long totalOrders;
    private Long totalUsers;
    private Long totalProducts;

    // Segmented Counts
    private Long adminCount;
    private Long moderatorCount;
    private Long userCount; // Role USER
    private Long menProducts;
    private Long womenProducts;
    private Long kidsProducts;

    private List<ChartData> revenueTrend;
    private List<ChartData> orderStatusDistribution;
}
