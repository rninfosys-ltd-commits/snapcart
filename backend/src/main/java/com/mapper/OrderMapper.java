package com.mapper;

import com.dto.AdminOrderDTO;
import com.dto.AdminOrderItemDTO;
import com.dto.OrderResponseDTO;
import com.dto.ProductSummaryDTO;
import com.dto.UserDTO;
import com.entity.Order;
import com.entity.OrderItem;
import com.entity.Product;
import com.entity.ProductVariant;

import java.util.List;

public class OrderMapper {

        public static AdminOrderDTO toAdminDTO(Order order) {

                List<AdminOrderItemDTO> itemDTOs = order.getItems().stream()
                                .map(OrderMapper::toItemDTO)
                                .toList();

                UserDTO userDTO = new UserDTO(
                                order.getUser().getId(),
                                order.getUser().getName(),
                                order.getUser().getEmail(),
                                order.getUser().getProfilePictureType());

                return new AdminOrderDTO(
                                order.getId(),
                                userDTO,
                                itemDTOs,
                                order.getTotalAmount(),
                                order.getDiscount(),
                                order.getStatus().name(),
                                order.getCurrentLocation(),
                                order.getOrderDate());
        }

        public static OrderResponseDTO toResponseDTO(Order order) {
                List<AdminOrderItemDTO> itemDTOs = order.getItems().stream()
                                .map(OrderMapper::toItemDTO)
                                .toList();

                UserDTO userDTO = new UserDTO(
                                order.getUser().getId(),
                                order.getUser().getName(),
                                order.getUser().getEmail(),
                                order.getUser().getProfilePictureType());

                List<com.dto.OrderTrackingDTO> trackingHistory = order.getTrackingHistory().stream()
                                .map(t -> new com.dto.OrderTrackingDTO(t.getStatus().name(), t.getCity(), t.getState(),
                                                t.getDescription(), t.getTimestamp()))
                                .toList();

                return new OrderResponseDTO(
                                order.getId(),
                                userDTO,
                                itemDTOs,
                                order.getTotalAmount(),
                                order.getDiscount(),
                                order.getStatus().name(),
                                order.getCurrentLocation(),
                                trackingHistory,
                                order.getOrderDate());
        }

        private static AdminOrderItemDTO toItemDTO(OrderItem item) {
                ProductVariant variant = item.getVariant();
                Product product = variant.getProduct();

                String imageUrl = "/api/images/product/" + product.getModelNo() + "/1";
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

                return new AdminOrderItemDTO(
                                productDTO,
                                item.getPrice(),
                                item.getQuantity(),
                                item.getPrice() * item.getQuantity(),
                                variant.getSize(),
                                variant.getColor(),
                                variant.getColorHex());
        }
}
