package com.service;

import com.entity.Moderator;
import com.entity.Order;
import com.entity.Payment;
import com.entity.PaymentStatus;
import com.repository.OrderRepository;
import com.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    // Hardcoded for demo/freelance project as per common requirement
    private static final String UPI_ID = "9834963244@upi";
    private static final String MERCHANT_NAME = "SnapCart";

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private SettlementService settlementService;

    public String generateUPIString(double amount, String orderId) {
        try {
            Order order = orderRepository.findById(Long.parseLong(orderId)).orElse(null);
            String finalUpiId = UPI_ID;
            String finalMerchantName = MERCHANT_NAME;

            if (order != null && order.getSettlementType() == com.entity.SettlementType.DIRECT_TO_MODERATOR) {
                // Route to moderator
                Moderator moderator = order.getItems().get(0).getVariant().getProduct().getModerator();
                if (moderator != null && moderator.getUser().getPaymentInfo() != null
                        && !moderator.getUser().getPaymentInfo().isEmpty()) {
                    finalUpiId = moderator.getUser().getPaymentInfo();
                    finalMerchantName = moderator.getUser().getName() != null ? moderator.getUser().getName()
                            : MERCHANT_NAME;
                }
            }

            String note = "Order " + orderId;
            String upiString = String.format("upi://pay?pa=%s&pn=%s&am=%.2f&cu=INR&tn=%s",
                    finalUpiId,
                    URLEncoder.encode(finalMerchantName, StandardCharsets.UTF_8.toString()).replace("+", "%20"),
                    amount,
                    URLEncoder.encode(note, StandardCharsets.UTF_8.toString()).replace("+", "%20"));
            return upiString;
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Error encoding UPI string", e);
        }
    }

    /**
     * Initiate payment for an order
     */
    @Transactional
    public Payment initiatePayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        Payment existingPayment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (existingPayment != null) {
            return existingPayment;
        }

        Payment payment = new Payment();
        payment.setUser(order.getUser());
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod("UPI");
        payment.setSettlementType(order.getSettlementType());

        if (order.getSettlementType() == com.entity.SettlementType.DIRECT_TO_MODERATOR) {
            Moderator mod = order.getItems().get(0).getVariant().getProduct().getModerator();
            if (mod != null) {
                payment.setDestinationAccountId(mod.getPaymentAccountId());
            }
        }

        String qrData = generateUPIString(order.getTotalAmount(), order.getId().toString());
        payment.setStripePaymentIntentId(qrData);

        return paymentRepository.save(payment);
    }

    /**
     * Verify and confirm payment
     */
    @Transactional
    public Payment verifyPayment(Long paymentId, String transactionId) {
        // Overloaded for backward compat or manual calls (null eventId)
        return verifyPayment(paymentId, transactionId, "MAN-" + System.currentTimeMillis());
    }

    @Transactional
    public Payment verifyPayment(Long paymentId, String transactionId, String webhookEventId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentDate(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.COMPLETED);
        order.setPaymentReference(transactionId);
        orderRepository.save(order);

        // Ledger-based settlement creation (idempotent)
        try {
            settlementService.createSettlements(order, webhookEventId);
        } catch (Exception e) {
            System.err.println("Failed to create settlements for order " + order.getId() + ": " + e.getMessage());
        }

        try {
            invoiceService.sendInvoiceEmail(order.getId());
        } catch (Exception e) {
            System.err.println("Failed to send invoice email: " + e.getMessage());
        }

        return savedPayment;
    }

    /**
     * Get payment by ID
     */
    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
    }

    /**
     * Get payment by order ID
     */
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
    }

    /**
     * Update payment status
     */
    @Transactional
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        payment.setStatus(status);
        if (status == PaymentStatus.COMPLETED) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        return paymentRepository.save(payment);
    }
}
