package com.controller.user;

import com.entity.User;
import com.mapper.ProductMapper;
import com.payload.response.ProductResponse;
import com.repository.UserRepository;
import com.service.RecentlyViewedService;
import com.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/recently-viewed")
public class RecentlyViewedController {

    @Autowired
    private RecentlyViewedService recentlyViewedService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductMapper productMapper;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getRecentlyViewed() {
        User user = getCurrentUser();
        return ResponseEntity.ok(recentlyViewedService.getRecentlyViewedProducts(user).stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @PostMapping("/{productModelNo}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> addRecentlyViewed(@PathVariable Long productModelNo) {
        User user = getCurrentUser();
        recentlyViewedService.addRecentlyViewed(user, productModelNo);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userRepository.findById(Objects.requireNonNull(userDetails.getId(), "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
