package com.mapper;

import com.dto.CartItemDTO;
import com.dto.ProductSummaryDTO;
import com.entity.Cart;
import com.entity.CartItem;
import com.entity.Product;
import com.entity.ProductVariant;
import com.payload.response.CartResponseDTO;

import java.util.List;

public class CartMapper {

        public static CartResponseDTO toDTO(Cart cart) {

                List<CartItemDTO> itemDTOs = cart.getItems().stream()
                                .map(CartMapper::toItemDTO)
                                .toList();

                return new CartResponseDTO(
                                cart.getId(),
                                itemDTOs,
                                cart.getTotalAmount());
        }

        private static CartItemDTO toItemDTO(CartItem item) {
                ProductVariant variant = item.getVariant();
                Product product = variant.getProduct();

                // Use first image of variant if available, else product image (which is now in
                // variants)
                String imageUrl = "/api/images/product/" + product.getModelNo() + "/1";
                // Logic for image url might need update if we store multiple images per variant
                // For now adhering to existing pattern but pointing to variant image
                if (variant.getImages() != null && !variant.getImages().isEmpty()) {
                        imageUrl = variant.getImages().get(0).getImageUrl();
                }

                if (imageUrl != null && imageUrl.startsWith("/")) {
                        // Keep relative to serve via proxy correctly
                }

                ProductSummaryDTO productDTO = new ProductSummaryDTO(
                                product.getModelNo(),
                                product.getName(),
                                imageUrl,
                                product.isReturnable(),
                                product.isReplaceable(),
                                product.isSingleBrand());

                return new CartItemDTO(
                                item.getId(),
                                productDTO,
                                variant.getId(),
                                item.getPrice(),
                                item.getQuantity(),
                                item.getPrice() * item.getQuantity(),
                                variant.getSize(),
                                variant.getColor(),
                                variant.getColorHex());
        }
}
