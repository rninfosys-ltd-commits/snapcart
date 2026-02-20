package com.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.dto.CartItemDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDTO {

    private Long cartId;
    private List<CartItemDTO> items;
    private double totalAmount;
}
