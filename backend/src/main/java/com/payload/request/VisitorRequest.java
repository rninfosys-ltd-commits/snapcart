package com.payload.request;

import lombok.Data;

@Data
public class VisitorRequest {
    private String visitorToken;
    private String email;
    private String ipAddress;
    private String deviceType;
    private String browser;
}
