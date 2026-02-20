package com.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class OrderStatusChangedEvent extends ApplicationEvent {

    public enum EventType {
        ORDER_CONFIRMED,
        STATUS_UPDATE,
        TRACKING_UPDATE,
        CANCELLED
    }

    private final String email;
    private final String orderId;
    private final String status;
    private final String customerName;
    private final EventType eventType;
    private final String location; // Optional, for tracking updates
    private final byte[] invoicePdf; // Optional, for order confirmation

    // Constructor for Status Updates and Cancellations
    public OrderStatusChangedEvent(Object source, String email, String orderId, String status, String customerName,
            EventType eventType) {
        super(source);
        this.email = email;
        this.orderId = orderId;
        this.status = status;
        this.customerName = customerName;
        this.eventType = eventType;
        this.location = null;
        this.invoicePdf = null;
    }

    // Constructor for Tracking Updates
    public OrderStatusChangedEvent(Object source, String email, String orderId, String status, String customerName,
            String location) {
        super(source);
        this.email = email;
        this.orderId = orderId;
        this.status = status;
        this.customerName = customerName;
        this.eventType = EventType.TRACKING_UPDATE;
        this.location = location;
        this.invoicePdf = null;
    }

    // Constructor for Order Confirmation
    public OrderStatusChangedEvent(Object source, String email, String orderId, String customerName,
            byte[] invoicePdf) {
        super(source);
        this.email = email;
        this.orderId = orderId;
        this.status = "CONFIRMED";
        this.customerName = customerName;
        this.eventType = EventType.ORDER_CONFIRMED;
        this.location = null;
        this.invoicePdf = invoicePdf;
    }
}
