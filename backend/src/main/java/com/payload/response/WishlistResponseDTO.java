package com.payload.response;

import lombok.Data;
import java.util.List;

@Data
public class WishlistResponseDTO {
    private Long id;
    private Long userId;
    private List<WishlistItemDTO> items;
}
