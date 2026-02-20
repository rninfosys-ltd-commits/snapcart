package com.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * QRCodeService
 * =============
 * 
 * Service for generating QR codes for UPI payments.
 * Generates UPI payment strings and converts them to QR code images.
 */
@Service
public class QRCodeService {

    private static final String UPI_ID = "merchant@upi"; // Replace with actual merchant UPI ID
    private static final String MERCHANT_NAME = "SnapCart";

    /**
     * Generate UPI payment string for QR code
     * 
     * @param amount  Total amount to be paid
     * @param orderId Order ID for reference
     * @return UPI payment string
     */
    public String generateUPIPaymentString(double amount, String orderId) {
        // UPI payment string format
        // upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<TRANSACTION_NOTE>
        return String.format(
                "upi://pay?pa=%s&pn=%s&am=%.2f&cu=INR&tn=Order%%20%s",
                UPI_ID,
                MERCHANT_NAME,
                amount,
                orderId);
    }

    /**
     * Generate QR code image from UPI payment string
     * 
     * @param upiString UPI payment string
     * @param width     QR code width in pixels
     * @param height    QR code height in pixels
     * @return QR code image as byte array
     * @throws Exception if QR code generation fails
     */
    public byte[] generateQRCodeImage(String upiString, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = new MultiFormatWriter().encode(
                upiString,
                BarcodeFormat.QR_CODE,
                width,
                height,
                hints);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }

    /**
     * Generate QR code for payment with default size
     * 
     * @param amount  Total amount
     * @param orderId Order ID
     * @return QR code image as byte array
     * @throws Exception if generation fails
     */
    public byte[] generatePaymentQRCode(double amount, String orderId) throws Exception {
        String upiString = generateUPIPaymentString(amount, orderId);
        return generateQRCodeImage(upiString, 300, 300);
    }
}
