package com.payload.response;

import lombok.Data;

@Data
public class ProductSearchResponse {
    private Long modelNo;
    private String name;
    private Double price;
    private String image1;
    private String category;
    private String color;
    private String brandName;
}
