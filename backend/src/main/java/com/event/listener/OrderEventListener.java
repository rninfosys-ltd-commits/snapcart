package com.event.listener;

import com.event.OrderStatusChangedEvent;
import com.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class OrderEventListener {

    @Autowired
    private EmailService emailService;

    @Async
    @EventListener
    public void handleOrderStatusChangedEvent(OrderStatusChangedEvent event) {
        log.info("Handling OrderStatusChangedEvent: Type={}, OrderId={}", event.getEventType(), event.getOrderId());

        try {
            switch (event.getEventType()) {
                case ORDER_CONFIRMED:
                    emailService.sendOrderConfirmation(event.getEmail(), event.getOrderId(), event.getInvoicePdf());
                    break;
                case STATUS_UPDATE:
                case CANCELLED:
                    emailService.sendOrderStatusUpdate(event.getEmail(), event.getOrderId(), event.getStatus(),
                            event.getCustomerName());
                    break;
                case TRACKING_UPDATE:
                    emailService.sendOrderTrackingUpdate(event.getEmail(), event.getOrderId(), event.getStatus(),
                            event.getLocation(), event.getCustomerName());
                    break;
                default:
                    log.warn("Unknown event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("Failed to send email for event: Type={}, OrderId={}. Error: {}", event.getEventType(),
                    event.getOrderId(), e.getMessage());
            // Intentionally not re-throwing to avoid transaction rollback context (though
            // @Async isolates it anyway)
        }
    }
}
