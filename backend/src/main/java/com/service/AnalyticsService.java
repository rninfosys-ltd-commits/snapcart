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

    @Autowired
    private com.repository.ModeratorRepository moderatorRepository;

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

    private Long getTenantId(Long userId) {
        if (userId == null)
            return null;
        var mod = moderatorRepository.findByUserId(userId).orElse(null);
        if (mod == null) {
            // Check if employee
            var user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getRole() == com.entity.Role.EMPLOYEE && user.getParentId() != null) {
                mod = moderatorRepository.findByUserId(user.getParentId()).orElse(null);
            }
        }
        return mod != null ? mod.getId() : null;
    }

    public AnalyticsSummary getSummary(Long moderatorId, String range) {
        Long tenantId = getTenantId(moderatorId);
        LocalDateTime startDate = getStartDate(range);

        List<Order> allOrders = orderRepository.findAll();
        List<Order> filteredOrders = allOrders.stream()
                .filter(o -> o.getOrderDate().isAfter(startDate))
                .filter(o -> tenantId == null || o.getItems().stream().anyMatch(i -> tenantId.equals(i.getTenantId())))
                .collect(Collectors.toList());

        double revenue = filteredOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(o -> {
                    if (tenantId == null)
                        return o.getTotalAmount();
                    return o.getItems().stream()
                            .filter(i -> tenantId.equals(i.getTenantId()))
                            .mapToDouble(i -> i.getGrossAmount() != null ? i.getGrossAmount()
                                    : (i.getPrice() * i.getQuantity()))
                            .sum();
                })
                .sum();

        long newCustomers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startDate))
                .count();

        double avgOrderValue = filteredOrders.isEmpty() ? 0 : revenue / filteredOrders.size();

        return AnalyticsSummary.builder()
                .totalRevenue(revenue)
                .totalOrders(filteredOrders.size())
                .newCustomers((int) newCustomers)
                .avgOrderValue(Math.round(avgOrderValue * 100.0) / 100.0)
                .build();
    }

    public ChartData getOrdersTrend(Long moderatorId, String range) {
        Long tenantId = getTenantId(moderatorId);
        LocalDateTime startDate = getStartDate(range);
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate().isAfter(startDate))
                .filter(o -> tenantId == null || o.getItems().stream().anyMatch(i -> tenantId.equals(i.getTenantId())))
                .collect(Collectors.toList());

        Map<String, Long> groupedStats = groupOrdersByDate(orders, range);

        return ChartData.builder()
                .labels(new ArrayList<>(groupedStats.keySet()))
                .data(groupedStats.values().stream().map(Long::doubleValue).collect(Collectors.toList()))
                .label("Orders")
                .build();
    }

    public ChartData getRevenueTrend(Long moderatorId, String range) {
        Long tenantId = getTenantId(moderatorId);
        LocalDateTime startDate = getStartDate(range);
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate().isAfter(startDate) && o.getStatus() != OrderStatus.CANCELLED)
                .filter(o -> tenantId == null || o.getItems().stream().anyMatch(i -> tenantId.equals(i.getTenantId())))
                .collect(Collectors.toList());

        Map<String, Double> groupedStats = groupRevenueByDate(orders, range, tenantId);

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
        Long tenantId = getTenantId(moderatorId);

        List<com.entity.Product> products = tenantId == null ? productRepository.findAll()
                : productRepository.findByTenantId(tenantId);

        Map<com.entity.Category, Long> categoryCounts = products.stream()
                .collect(Collectors.groupingBy(com.entity.Product::getCategory, Collectors.counting()));

        return ChartData.builder()
                .labels(categoryCounts.keySet().stream().map(Enum::name).collect(Collectors.toList()))
                .data(categoryCounts.values().stream().map(Long::doubleValue).collect(Collectors.toList()))
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
                .sorted((a, b) -> a.getOrderDate().compareTo(b.getOrderDate()))
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().format(formatter),
                        java.util.LinkedHashMap::new,
                        Collectors.counting()));
    }

    private Map<String, Double> groupRevenueByDate(List<Order> orders, String range, Long tenantId) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        return orders.stream()
                .sorted((a, b) -> a.getOrderDate().compareTo(b.getOrderDate()))
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().format(formatter),
                        java.util.LinkedHashMap::new,
                        Collectors.summingDouble(o -> {
                            if (tenantId == null)
                                return o.getTotalAmount();
                            return o.getItems().stream()
                                    .filter(i -> tenantId.equals(i.getTenantId()))
                                    .mapToDouble(i -> i.getGrossAmount() != null ? i.getGrossAmount()
                                            : (i.getPrice() * i.getQuantity()))
                                    .sum();
                        })));
    }
}
