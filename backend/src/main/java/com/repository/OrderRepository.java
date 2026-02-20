package com.repository;

import com.entity.Order;
import com.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    List<Order> findByUserId(Long userId);

    long countByUserIdAndStatusNot(Long userId, com.entity.OrderStatus status);

    Order findTopByUserOrderByOrderDateDesc(User user);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double getTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getStatusDistribution();

    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m-%d'), SUM(o.totalAmount) FROM Order o GROUP BY FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m-%d')")
    List<Object[]> getRevenueTrend();
}
