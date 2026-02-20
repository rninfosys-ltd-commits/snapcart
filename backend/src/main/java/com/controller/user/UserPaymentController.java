package com.controller.user;

import com.payload.request.PaymentRequest;
import com.payload.response.PaymentResponse;
import com.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.entity.Payment;
import com.entity.PaymentStatus;
import com.entity.Order;
import com.entity.User;
import com.repository.PaymentRepository;
import com.repository.OrderRepository;
import com.repository.UserRepository;
import com.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Objects;

// CORS handled globally in SecurityConfig
@RestController
@RequestMapping("/api/payment")
@Slf4j
public class UserPaymentController {

        @Autowired
        private StripeService stripeService;

        @Autowired
        private PaymentRepository paymentRepository;

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private UserRepository userRepository;

        @PostMapping("/create-payment-intent")
        @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
        public ResponseEntity<?> createPaymentIntent(@Valid @RequestBody PaymentRequest paymentRequest)
                        throws StripeException {
                log.info("Creating payment intent for amount: {} {}", paymentRequest.getAmount(),
                                paymentRequest.getCurrency());

                // 1. Create PaymentIntent in Stripe
                PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                                paymentRequest.getAmount(),
                                paymentRequest.getCurrency(),
                                paymentRequest.getDescription());

                // 2. Save Payment record in Database
                UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                User user = userRepository.findById(Objects.requireNonNull(userDetails.getId(), "User ID is required"))
                                .orElseThrow(() -> new RuntimeException("Error: User not found."));

                Order order = null;
                if (paymentRequest.getOrderId() != null) {
                        order = orderRepository
                                        .findById(Objects.requireNonNull(paymentRequest.getOrderId(),
                                                        "Order ID is required"))
                                        .orElseThrow(() -> new RuntimeException("Error: Order not found."));
                }

                Payment payment = new Payment();
                payment.setUser(user);
                payment.setOrder(order);
                payment.setAmount(paymentRequest.getAmount() / 100.0); // Convert cents to dollars/actual unit
                payment.setCurrency(paymentRequest.getCurrency());
                payment.setStatus(PaymentStatus.PENDING);
                payment.setStripePaymentIntentId(paymentIntent.getId());

                paymentRepository.save(payment);

                return ResponseEntity.ok(new PaymentResponse(paymentIntent.getClientSecret()));
        }
}
