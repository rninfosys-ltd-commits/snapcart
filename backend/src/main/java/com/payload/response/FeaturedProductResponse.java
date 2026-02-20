package com.payload.response;

import lombok.Data;

@Data
public class FeaturedProductResponse {
    private long modelNo;
    private String name;
    private double price;
    private String category;
    private String imageUrl;
}
