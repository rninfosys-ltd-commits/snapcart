package com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryDTO {
    private long modelNo;
    private String name;
    private String img1;
    private boolean isReturnable;
    private boolean isReplaceable;
    private boolean isSingleBrand;
}
