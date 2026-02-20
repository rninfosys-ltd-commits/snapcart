package com.service;

import com.entity.*;
import com.mapper.CartMapper;
import com.payload.request.CartItemRequest;
import com.payload.response.CartResponseDTO;
import com.repository.CartRepository;
import com.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    // private com.repository.CartItemRepository cartItemRepository;

    @Transactional
    public CartResponseDTO getCartResponseByUser(User user) {
        Cart cart = getCartByUser(user);
        return CartMapper.toDTO(cart);
    }

    @Transactional
    public Cart getCartByUser(User user) {
        // Robust cleanup: Iterate and validate items

        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setTotalAmount(0.0);
            return cartRepository.save(newCart);
        });

        // Robust cleanup: Iterate and validate items
        if (cart.getItems() != null) {
            java.util.Iterator<CartItem> iterator = cart.getItems().iterator();
            while (iterator.hasNext()) {
                CartItem item = iterator.next();
                try {
                    // Force load variant
                    if (item.getVariant() != null) {
                        ProductVariant v = item.getVariant();
                        Double activePrice = (v.getSalePrice() != null && v.getSaleEndTime() != null
                                && v.getSaleEndTime().isAfter(java.time.LocalDateTime.now()))
                                        ? v.getSalePrice()
                                        : v.getPrice();
                        item.setPrice(activePrice);
                    } else {
                        iterator.remove(); // Remove null variant items
                    }
                } catch (Exception e) {
                    iterator.remove();
                }
            }
            // Save changes if items were removed or prices updated
            updateTotalAmount(cart);
            cart = cartRepository.save(cart);
        }
        return cart;
    }

    @Transactional
    public CartResponseDTO addItemToCart(User user, CartItemRequest request) {
        Cart cart = getCartByUser(user);

        // Find variant by Product ID + Color + Size
        Long modelNo = Long.parseLong(request.getProductModelNo());
        String color = request.getColor();
        String size = request.getSize();

        // If color/size defaults are needed, handle here. For now assume strict match.
        // If color is missing, try to find *any* variant? No, strict.

        java.util.List<ProductVariant> variants = productVariantRepository.findByProductModelNo(modelNo);
        Optional<ProductVariant> variantOpt = variants.stream()
                .filter(v -> java.util.Objects.equals(v.getColor(), color)
                        && java.util.Objects.equals(v.getSize(), size))
                .findFirst();

        if (variantOpt.isEmpty()) {
            // Fallback: if only one variant exists and requested attributes were null/blank
            if (variants.size() == 1 && (color == null || color.isBlank()) && (size == null || size.isBlank())) {
                variantOpt = Optional.of(variants.get(0));
            } else {
                throw new RuntimeException(
                        "Product Variant not found for model: " + modelNo + " color: " + color + " size: " + size);
            }
        }

        ProductVariant variant = variantOpt.get();

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId()))
                .findFirst();

        Double activePrice = (variant.getSalePrice() != null && variant.getSaleEndTime() != null
                && variant.getSaleEndTime().isAfter(java.time.LocalDateTime.now()))
                        ? variant.getSalePrice()
                        : variant.getPrice();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.setPrice(activePrice);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setVariant(variant);
            newItem.setQuantity(request.getQuantity());
            newItem.setPrice(activePrice);
            cart.getItems().add(newItem);
        }

        updateTotalAmount(cart);
        return CartMapper.toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartResponseDTO updateItemQuantityByItemId(User user, Long cartItemId, int quantity) {
        Cart cart = getCartByUser(user);

        cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .ifPresent(item -> {
                    if (quantity > 0) {
                        item.setQuantity(quantity);
                    } else {
                        cart.getItems().remove(item);
                    }
                });

        updateTotalAmount(cart);
        return CartMapper.toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartResponseDTO updateItemQuantity(User user, String productModelNo, int quantity) {
        Cart cart = getCartByUser(user);
        Long modelNo = Long.parseLong(productModelNo);

        // DEPRECATED LOGIC: Update ANY item with this product model no
        // Ideally should pass cartItemId or variantId
        cart.getItems().stream()
                .filter(item -> item.getVariant().getProduct().getModelNo().equals(modelNo))
                .findFirst()
                .ifPresent(item -> {
                    if (quantity > 0) {
                        item.setQuantity(quantity);
                    } else {
                        cart.getItems().remove(item);
                    }
                });

        updateTotalAmount(cart);
        return CartMapper.toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartResponseDTO removeItemFromCart(User user, String productModelNo) {
        Cart cart = getCartByUser(user);
        Long modelNo = Long.parseLong(productModelNo);
        // Remove ALL items matching this product
        cart.getItems().removeIf(item -> item.getVariant().getProduct().getModelNo().equals(modelNo));
        updateTotalAmount(cart);
        return CartMapper.toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartResponseDTO removeItemFromCartById(User user, Long cartItemId) {
        Cart cart = getCartByUser(user);
        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        updateTotalAmount(cart);
        return CartMapper.toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartResponseDTO clearCart(User user) {
        Cart cart = getCartByUser(user);
        cart.getItems().clear();
        updateTotalAmount(cart);
        return CartMapper.toDTO(cartRepository.save(cart));
    }

    private void updateTotalAmount(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();
        cart.setTotalAmount(total);
    }
}
