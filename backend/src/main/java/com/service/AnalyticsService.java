package com.service;

import com.entity.Order;
import com.entity.OrderStatus;
import com.payload.response.AnalyticsSummary;
import com.payload.response.ChartData;
import com.repository.OrderRepository;
import com.repository.ProductRepository;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public com.payload.response.DashboardResponse getDashboardStats() {
        com.payload.response.DashboardResponse response = new com.payload.response.DashboardResponse();

        // Real counts
        response.setTotalOrders(orderRepository.count());
        response.setTotalUsers(userRepository.count());
        response.setTotalProducts(productRepository.count());

        // Calculate Revenue (Sum of non-cancelled orders)
        List<Order> allOrders = orderRepository.findAll();
        double revenue = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();
        response.setTotalRevenue(revenue);

        // Role counts
        response.setAdminCount(userRepository.countByRole(com.entity.Role.ADMIN));
        response.setModeratorCount(userRepository.countByRole(com.entity.Role.MODERATOR));
        response.setUserCount(userRepository.countByRole(com.entity.Role.USER));

        return response;
    }

    public AnalyticsSummary getSummary(Long moderatorId, String range) {
        LocalDateTime startDate = getStartDate(range);
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate().isAfter(startDate))
                .collect(Collectors.toList());

        double revenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long newCustomers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startDate))
                .count();

        double avgOrderValue = orders.isEmpty() ? 0 : revenue / orders.size();

        return AnalyticsSummary.builder()
                .totalRevenue(revenue)
                .totalOrders(orders.size())
                .newCustomers((int) newCustomers)
                .avgOrderValue(Math.round(avgOrderValue * 100.0) / 100.0)
                .build();
    }

    public ChartData getOrdersTrend(Long moderatorId, String range) {
        LocalDateTime startDate = getStartDate(range);
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate().isAfter(startDate))
                .collect(Collectors.toList());

        Map<String, Long> groupedStats = groupOrdersByDate(orders, range);

        return ChartData.builder()
                .labels(new ArrayList<>(groupedStats.keySet()))
                .data(groupedStats.values().stream().map(Long::doubleValue).collect(Collectors.toList()))
                .label("Orders")
                .build();
    }

    public ChartData getRevenueTrend(Long moderatorId, String range) {
        LocalDateTime startDate = getStartDate(range);
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate().isAfter(startDate) && o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        Map<String, Double> groupedStats = groupRevenueByDate(orders, range);

        return ChartData.builder()
                .labels(new ArrayList<>(groupedStats.keySet()))
                .data(new ArrayList<>(groupedStats.values()))
                .label("Revenue")
                .build();
    }

    // Overload for simplified call
    public ChartData getRevenueTrend(String range) {
        return getRevenueTrend(null, range);
    }

    public ChartData getCategoryDistribution(Long moderatorId) {
        // Since we don't have easy category linkage in Order items without deep
        // fetching,
        // we will mock this PARTIALLY or fetch from products.
        // For a robust solution, we'd aggregate OrderItems.
        // Implementing a simple product-based distribution for now.

        long men = productRepository.countByCategory(com.entity.Category.MEN);
        long women = productRepository.countByCategory(com.entity.Category.WOMEN);
        long electronics = productRepository.countByCategory(com.entity.Category.ELECTRONICS);

        return ChartData.builder()
                .labels(List.of("Men", "Women", "Electronics"))
                .data(List.of((double) men, (double) women, (double) electronics))
                .label("Products by Category")
                .build();
    }

    // Helper methods

    private LocalDateTime getStartDate(String range) {
        LocalDateTime now = LocalDateTime.now();
        if ("weekly".equalsIgnoreCase(range))
            return now.minusWeeks(1);
        if ("monthly".equalsIgnoreCase(range))
            return now.minusMonths(1);
        if ("yearly".equalsIgnoreCase(range))
            return now.minusYears(1);
        return now.minusMonths(1); // Default
    }

    private Map<String, Long> groupOrdersByDate(List<Order> orders, String range) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        return orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().format(formatter),
                        Collectors.counting()));
    }

    private Map<String, Double> groupRevenueByDate(List<Order> orders, String range) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        return orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().format(formatter),
                        Collectors.summingDouble(Order::getTotalAmount)));
    }
}
