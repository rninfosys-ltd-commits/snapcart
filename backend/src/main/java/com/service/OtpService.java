package com.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, OtpData> otpMap = new ConcurrentHashMap<>();
    private static final int OTP_EXPIRY_MINUTES = 5;

    public String generateOtp(String key) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpMap.put(key, new OtpData(otp, System.currentTimeMillis() + (OTP_EXPIRY_MINUTES * 60 * 1000)));
        return otp;
    }

    public boolean validateOtp(String key, String otp) {
        OtpData data = otpMap.get(key);
        if (data != null && data.otp.equals(otp) && System.currentTimeMillis() < data.expiryTime) {
            otpMap.remove(key); // Clear OTP after successful validation
            return true;
        }
        return false;
    }

    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
