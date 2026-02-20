package com.controller.user;

import com.entity.User;
import com.payload.request.CartItemRequest;
import com.repository.UserRepository;
import com.service.CartService;
import com.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.payload.response.CartResponseDTO;

import java.util.Objects;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('USER')")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart() {
        CartResponseDTO cart = cartService.getCartResponseByUser(getCurrentUser());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponseDTO> addItem(
            @Valid @RequestBody CartItemRequest request) {

        CartResponseDTO cart = cartService.addItemToCart(getCurrentUser(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update/{productModelNo}")
    public ResponseEntity<CartResponseDTO> updateItem(
            @PathVariable String productModelNo,
            @RequestBody java.util.Map<String, Integer> body) {

        Integer quantity = body.get("quantity");
        CartResponseDTO cart = cartService.updateItemQuantity(getCurrentUser(), productModelNo, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update/item/{cartItemId}")
    public ResponseEntity<CartResponseDTO> updateItemById(
            @PathVariable Long cartItemId,
            @RequestBody java.util.Map<String, Integer> body) {

        Integer quantity = body.get("quantity");
        CartResponseDTO cart = cartService.updateItemQuantityByItemId(getCurrentUser(), cartItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{productModelNo}")
    public ResponseEntity<CartResponseDTO> removeItem(
            @PathVariable String productModelNo) {

        CartResponseDTO cart = cartService.removeItemFromCart(getCurrentUser(), productModelNo);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/item/{cartItemId}")
    public ResponseEntity<CartResponseDTO> removeItemById(
            @PathVariable Long cartItemId) {

        CartResponseDTO cart = cartService.removeItemFromCartById(getCurrentUser(), cartItemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<CartResponseDTO> clearCart() {
        CartResponseDTO cart = cartService.clearCart(getCurrentUser());
        return ResponseEntity.ok(cart);
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepository.findById(
                Objects.requireNonNull(userDetails.getId())).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
