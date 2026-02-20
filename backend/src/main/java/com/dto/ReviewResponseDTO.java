package com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private UserDTO user;
    private ProductSummaryDTO product;
    private int rating;
    private String comment;
    private String image;
    private LocalDateTime reviewDate;
}
