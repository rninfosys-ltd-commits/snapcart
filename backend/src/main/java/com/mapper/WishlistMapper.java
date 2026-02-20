package com.mapper;

import com.entity.Product;
import com.entity.ProductVariant;
import com.entity.Wishlist;
import com.entity.WishlistItem;
import com.payload.response.WishlistItemDTO;
import com.payload.response.WishlistResponseDTO;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class WishlistMapper {

    public WishlistResponseDTO toResponse(Wishlist wishlist) {
        if (wishlist == null)
            return null;

        WishlistResponseDTO dto = new WishlistResponseDTO();
        dto.setId(wishlist.getId());
        dto.setUserId(wishlist.getUser().getId());
        dto.setItems(wishlist.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private WishlistItemDTO toItemDTO(WishlistItem item) {
        WishlistItemDTO dto = new WishlistItemDTO();
        dto.setId(item.getId());

        Product p = item.getProduct();
        dto.setProductModelNo(p.getModelNo());
        dto.setProductName(p.getName());
        dto.setBrandName(p.getBrandName());

        // Derive price/image from first variant
        if (!p.getVariants().isEmpty()) {
            ProductVariant v = p.getVariants().get(0);
            dto.setPrice(v.getPrice());
            String url = null;
            if (!v.getImages().isEmpty()) {
                url = v.getImages().get(0).getImageUrl();
            } else {
                url = "/api/images/product/" + p.getModelNo() + "/1"; // Fallback to legacy endpoint
            }

            if (url != null && url.startsWith("/")) {
                // Keep relative to serve via proxy correctly
            }
            dto.setImageUrl(url);

            // Populate ProductSummaryDTO for Frontend
            dto.setProduct(new com.dto.ProductSummaryDTO(
                    p.getModelNo(),
                    p.getName(),
                    url,
                    p.isReturnable(),
                    p.isReplaceable(),
                    p.isSingleBrand()));
        }

        return dto;
    }
}
