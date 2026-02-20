package com.controller;

import com.dto.PaymentDTO;
import com.entity.Payment;
import com.service.PaymentService;
import com.service.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * PaymentController
 * =================
 * 
 * REST controller for payment operations
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private QRCodeService qrCodeService;

    /**
     * Initiate payment for an order
     * 
     * POST /api/payments/initiate
     * Body: { "orderId": 123 }
     */
    @PostMapping("/initiate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentDTO> initiatePayment(@RequestBody Map<String, Long> request) {
        try {
            Long orderId = request.get("orderId");
            Payment payment = paymentService.initiatePayment(orderId);

            PaymentDTO dto = new PaymentDTO();
            dto.setId(payment.getId());
            dto.setOrderId(payment.getOrder().getId());
            dto.setAmount(payment.getAmount());
            dto.setCurrency(payment.getCurrency());
            dto.setStatus(payment.getStatus());
            dto.setPaymentMethod(payment.getPaymentMethod());
            dto.setQrCodeData(payment.getStripePaymentIntentId()); // UPI string
            dto.setPaymentDate(payment.getPaymentDate());

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get QR code image for payment
     * 
     * GET /api/payments/{paymentId}/qr-code
     */
    @GetMapping("/{paymentId}/qr-code")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> getQRCode(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentService.getPaymentById(paymentId);
            String upiString = payment.getStripePaymentIntentId();

            if (upiString == null || upiString.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            byte[] qrCodeImage = qrCodeService.generateQRCodeImage(upiString, 300, 300);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);

            return new ResponseEntity<>(qrCodeImage, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Verify payment completion
     * 
     * POST /api/payments/verify
     * Body: { "paymentId": 123, "transactionId": "TXN123456" }
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> request) {
        try {
            Long paymentId = Long.parseLong(request.get("paymentId"));
            String transactionId = request.get("transactionId");

            Payment payment = paymentService.verifyPayment(paymentId, transactionId);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment verified successfully");
            response.put("paymentStatus", payment.getStatus().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get payment status for an order
     * 
     * GET /api/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentDTO> getPaymentByOrder(@PathVariable Long orderId) {
        try {
            Payment payment = paymentService.getPaymentByOrderId(orderId);

            PaymentDTO dto = new PaymentDTO();
            dto.setId(payment.getId());
            dto.setOrderId(payment.getOrder().getId());
            dto.setAmount(payment.getAmount());
            dto.setCurrency(payment.getCurrency());
            dto.setStatus(payment.getStatus());
            dto.setPaymentMethod(payment.getPaymentMethod());
            dto.setPaymentDate(payment.getPaymentDate());

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
