package com.service;

import com.entity.Order;
import com.entity.OrderTracking;
import com.entity.TrackingStatus;
import com.repository.OrderRepository;
import com.repository.OrderTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderTrackingService {

    @Autowired
    private OrderTrackingRepository orderTrackingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public OrderTracking addTrackingRecord(Long orderId, TrackingStatus status, String city, String state,
            String description) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        System.out.println("DEBUG: Creating tracking record with location: " + city + ", " + state);
        OrderTracking tracking = new OrderTracking(order, status, city, state, description);
        return orderTrackingRepository.save(tracking);
    }

    public List<OrderTracking> getTrackingTimeline(Long orderId) {
        return orderTrackingRepository.findByOrderIdOrderByTimestampAsc(orderId);
    }
}
