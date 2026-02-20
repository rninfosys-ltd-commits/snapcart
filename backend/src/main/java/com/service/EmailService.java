package com.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import java.util.Objects;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            log.info("Sending email to {} with subject: {}", to, subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(Objects.requireNonNull(to, "Email recipient is required"));
            helper.setSubject(Objects.requireNonNull(subject, "Email subject is required"));
            helper.setText(Objects.requireNonNull(body, "Email body is required"), true);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachmentData,
            String attachmentName) {
        try {
            log.info("Sending email with attachment to {} with subject: {}", to, subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(Objects.requireNonNull(to, "Email recipient is required"));
            helper.setSubject(Objects.requireNonNull(subject, "Email subject is required"));
            helper.setText(Objects.requireNonNull(body, "Email body is required"), true);

            if (attachmentData != null && attachmentData.length > 0) {
                ByteArrayDataSource dataSource = new ByteArrayDataSource(attachmentData, "application/pdf");
                helper.addAttachment(attachmentName, dataSource);
            }

            mailSender.send(message);
            log.info("Email with attachment sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email with attachment to {}", to, e);
            throw new RuntimeException("Failed to send email with attachment", e);
        }
    }

    private String getHeader() {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;'>"
                +
                "<div style='text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e63946;'>" +
                "<h1 style='color: #e63946; margin: 0;'>SnapCart</h1>" +
                "<p style='color: #555; font-size: 14px; margin: 5px 0 0;'>Premium Shopping for the Modern Soul</p>" +
                "</div>" +
                "<div style='padding: 30px 20px; background-color: #ffffff;'>";
    }

    private String getFooter() {
        return "</div>" +
                "<div style='text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; margin-top: 20px;'>"
                +
                "<p style='color: #888; font-size: 12px; margin: 0;'>&copy; 2024 SnapCart. All rights reserved.</p>" +
                "<p style='color: #888; font-size: 12px; margin: 5px 0 0;'>Need help? Contact us at support@snapcart.com</p>"
                +
                "</div>" +
                "</div>";
    }

    @Async
    public void sendOtpEmail(String to, String otp) {
        String subject = "Your Verification Code - SnapCart";
        String body = getHeader() +
                "<h2 style='color: #333; text-align: center;'>Verify Your Account</h2>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Hello,</p>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Use the following One-Time Password (OTP) to complete your verification/password reset. This code is valid for 5 minutes.</p>"
                +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<span style='display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #e63946; border-radius: 5px; letter-spacing: 5px;'>"
                + otp + "</span>" +
                "</div>" +
                "<p style='color: #555; font-size: 14px; text-align: center;'>If you didn't request this, please ignore this email.</p>"
                +
                getFooter();
        sendEmail(to, subject, body);
    }

    @Async
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to SnapCart!";
        String body = getHeader() +
                "<h2 style='color: #333; text-align: center;'>Welcome to the Family, " + name + "!</h2>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>We are thrilled to have you on board. At SnapCart, we believe in providing style and comfort with every purchase.</p>"
                +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Explore our latest collection and find the perfect pair that speaks to you.</p>"
                +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + frontendUrl
                + "/' style='display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #e63946; text-decoration: none; border-radius: 5px;'>Start Shopping</a>"
                +
                "</div>" +
                getFooter();
        sendEmail(to, subject, body);
    }

    @Async
    public void sendEmployeeWelcomeEmail(String to, String name, String password, String moderatorName) {
        String subject = "You've been added to the SnapCart Team!";
        String body = getHeader() +
                "<h2 style='color: #333; text-align: center;'>Welcome to the Team, " + name + "!</h2>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>You have been added as an employee by <b>"
                + moderatorName + "</b>.</p>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Here are your login credentials:</p>" +
                "<div style='background-color: #f1f1f1; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "<p style='margin: 5px 0;'><b>Email:</b> " + to + "</p>" +
                "<p style='margin: 5px 0;'><b>Password:</b> " + password + "</p>" +
                "</div>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Please login and change your password immediately.</p>"
                +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + frontendUrl
                + "/login' style='display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #e63946; text-decoration: none; border-radius: 5px;'>Login Now</a>"
                +
                "</div>" +
                getFooter();
        sendEmail(to, subject, body);
    }

    @Async
    public void sendOrderConfirmation(String to, String orderId, byte[] invoicePdf) {
        String subject = "Order Confirmed! #" + orderId;
        String body = getHeader() +
                "<h2 style='color: #333; text-align: center;'>Order Confirmed</h2>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Thank you for your purchase! We have received your order <b>#"
                + orderId + "</b> and are getting it ready for shipment.</p>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Please find your invoice attached.</p>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>You will receive another email once your order has been shipped.</p>"
                +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + frontendUrl
                + "/orders' style='display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #e63946; text-decoration: none; border-radius: 5px;'>View My Order</a>"
                +
                "</div>" +
                getFooter();

        if (invoicePdf != null) {
            sendEmailWithAttachment(to, subject, body, invoicePdf, "Invoice_" + orderId + ".pdf");
        } else {
            sendEmail(to, subject, body);
        }
    }

    // Legacy overload method signature for backward compatibility if needed,
    // or just remove usages and update callers.
    // I will update OrderService so this overload is not needed, but keeping for
    // safety if any other Caller exists.
    public void sendOrderConfirmation(String to, String orderId) {
        sendOrderConfirmation(to, orderId, null);
    }

    @Async
    public void sendOrderStatusUpdate(String to, String orderId, String status, String customerName) {
        String statusEmoji = getStatusEmoji(status);
        String statusColor = getStatusColor(status);
        String statusMessage = getStatusMessage(status, orderId);

        String subject = statusEmoji + " Order #" + orderId + " - " + formatStatus(status);
        String body = getHeader() +
                "<h2 style='color: #333; text-align: center;'>" + statusEmoji + " Order Status Update</h2>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Hi " + customerName + ",</p>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Your order <b>#" + orderId
                + "</b> has been updated.</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<div style='display: inline-block; padding: 20px 40px; background-color: " + statusColor
                + "; border-radius: 10px;'>" +
                "<p style='margin: 0; font-size: 14px; color: #ffffff; opacity: 0.9;'>Current Status</p>" +
                "<p style='margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #ffffff;'>"
                + formatStatus(status) + "</p>" +
                "</div>" +
                "</div>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5; text-align: center;'>" + statusMessage
                + "</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + frontendUrl
                + "/my-orders' style='display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #e63946; text-decoration: none; border-radius: 5px;'>Track Your Order</a>"
                +
                "</div>" +
                getFooter();
        sendEmail(to, subject, body);
    }

    private String getStatusEmoji(String status) {
        return switch (status.toUpperCase()) {
            case "SHIPPED" -> "📦";
            case "DELIVERED" -> "✅";
            case "CANCELLED" -> "❌";
            case "PROCESSING" -> "⚙️";
            default -> "📋";
        };
    }

    private String getStatusColor(String status) {
        return switch (status.toUpperCase()) {
            case "SHIPPED" -> "#8b5cf6";
            case "DELIVERED" -> "#10b981";
            case "CANCELLED" -> "#ef4444";
            case "PROCESSING" -> "#3b82f6";
            default -> "#f59e0b";
        };
    }

    private String getStatusMessage(String status, String orderId) {
        return switch (status.toUpperCase()) {
            case "SHIPPED" -> "Great news! Your order is on its way. You'll receive it soon!";
            case "DELIVERED" -> "Your order has been delivered. We hope you love your new shoes! 🎉";
            case "CANCELLED" -> "Your order has been cancelled. If you have any questions, please contact support.";
            case "PROCESSING" -> "We're preparing your order and it will be shipped soon.";
            default -> "Your order status has been updated. Check the details below.";
        };
    }

    private String formatStatus(String status) {
        if (status == null)
            return "";
        return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
    }

    @Async
    public void sendOrderTrackingUpdate(String to, String orderId, String status, String location,
            String customerName) {
        String statusEmoji = "📍";
        String statusColor = "#3b82f6"; // Blue for tracking updates

        String subject = statusEmoji + " Order #" + orderId + " Update: " + location;
        String body = getHeader() +
                "<h2 style='color: #333; text-align: center;'>" + statusEmoji + " Order Tracking Update</h2>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Hi " + customerName + ",</p>" +
                "<p style='color: #555; font-size: 16px; line-height: 1.5;'>Your order <b>#" + orderId
                + "</b> has reached <b>" + location + "</b>.</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<div style='display: inline-block; padding: 20px 40px; background-color: " + statusColor
                + "; border-radius: 10px;'>" +
                "<p style='margin: 0; font-size: 14px; color: #ffffff; opacity: 0.9;'>Current Location</p>" +
                "<p style='margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #ffffff;'>"
                + location + "</p>" +
                "<p style='margin: 5px 0 0; font-size: 14px; color: #ffffff; opacity: 0.9;'>Status: "
                + formatStatus(status) + "</p>" +
                "</div>" +
                "</div>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + frontendUrl
                + "/my-orders' style='display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #e63946; text-decoration: none; border-radius: 5px;'>Track Your Order</a>"
                +
                "</div>" +
                getFooter();
        sendEmail(to, subject, body);
    }
}
