package com.controller.user;

import com.entity.User;
import com.entity.Wishlist;
import com.mapper.WishlistMapper;
import com.payload.response.WishlistResponseDTO;
import com.repository.UserRepository;
import com.service.UserDetailsImpl;
import com.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WishlistMapper wishlistMapper;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<WishlistResponseDTO> getWishlist() {
        User user = getCurrentUser();
        Wishlist wishlist = wishlistService.getWishlistByUser(user);
        return ResponseEntity.ok(wishlistMapper.toResponse(wishlist));
    }

    @PostMapping("/add/{productModelNo}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<WishlistResponseDTO> addToWishlist(@PathVariable Long productModelNo) {
        User user = getCurrentUser();
        Wishlist wishlist = wishlistService.addToWishlist(user, productModelNo);
        return ResponseEntity.ok(wishlistMapper.toResponse(wishlist));
    }

    @DeleteMapping("/remove/{productModelNo}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<WishlistResponseDTO> removeFromWishlist(@PathVariable Long productModelNo) {
        User user = getCurrentUser();
        Wishlist wishlist = wishlistService.removeFromWishlist(user, productModelNo);
        return ResponseEntity.ok(wishlistMapper.toResponse(wishlist));
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userRepository.findById(Objects.requireNonNull(userDetails.getId(), "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
