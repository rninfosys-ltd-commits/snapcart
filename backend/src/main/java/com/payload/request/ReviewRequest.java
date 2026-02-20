package com.payload.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull
    private Long productModelNo;

    @Min(1)
    @Max(5)
    private int rating;

    @NotBlank
    @Size(max = 1000)
    private String comment;

    private String image;
}
