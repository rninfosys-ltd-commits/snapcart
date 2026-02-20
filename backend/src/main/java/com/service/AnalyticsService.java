package com.service;

import com.payload.response.AnalyticsSummary;
import com.payload.response.ChartData;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    public com.payload.response.DashboardResponse getDashboardStats() {
        // Restore Admin Dashboard stats logic (Mock for now to fix build)
        com.payload.response.DashboardResponse response = new com.payload.response.DashboardResponse();
        response.setTotalRevenue(50000.0);
        response.setTotalOrders(120L);
        response.setTotalUsers(15L);
        response.setTotalProducts(50L);
        response.setAdminCount(2L);
        response.setModeratorCount(3L);
        response.setUserCount(10L);
        response.setMenProducts(20L);
        response.setWomenProducts(20L);
        response.setKidsProducts(10L);
        return response;
    }

    public AnalyticsSummary getSummary(Long moderatorId, String range) {
        // Mock data for initial implementation
        return AnalyticsSummary.builder()
                .totalRevenue(50000.0)
                .totalOrders(120)
                .newCustomers(15)
                .avgOrderValue(416.0)
                .build();
    }

    public ChartData getOrdersTrend(Long moderatorId, String range) {
        return ChartData.builder()
                .labels(List.of("Week 1", "Week 2", "Week 3", "Week 4"))
                .data(List.of(20.0, 35.0, 25.0, 40.0))
                .label("Orders")
                .build();
    }

    public ChartData getRevenueTrend(String range) {
        // Overloaded for Admin or general use if needed, or just redundant
        return getRevenueTrend(null, range);
    }

    public ChartData getRevenueTrend(Long moderatorId, String range) {
        return ChartData.builder()
                .labels(List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun"))
                .data(List.of(12000.0, 15000.0, 11000.0, 18000.0, 22000.0, 25000.0))
                .label("Revenue")
                .build();
    }

    public ChartData getCategoryDistribution(Long moderatorId) {
        return ChartData.builder()
                .labels(List.of("Men", "Women", "Electronics", "Home"))
                .data(List.of(300.0, 450.0, 200.0, 150.0))
                .label("Categories")
                .build();
    }

}
