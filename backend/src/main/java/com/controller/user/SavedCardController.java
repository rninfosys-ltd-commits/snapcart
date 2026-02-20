package com.controller.user;

import com.entity.SavedCard;
import com.entity.User;
import com.repository.UserRepository;
import com.service.SavedCardService;
import com.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/cards")
@PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
public class SavedCardController {

    @Autowired
    private SavedCardService savedCardService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<SavedCard>> getMyCards() {
        User user = getCurrentUser();
        return ResponseEntity.ok(savedCardService.getUserCards(user));
    }

    @PostMapping
    public ResponseEntity<SavedCard> saveCard(@RequestBody SavedCard card) {
        User user = getCurrentUser();
        return ResponseEntity.ok(savedCardService.saveCard(user, card));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        User user = getCurrentUser();
        savedCardService.deleteCard(id, user);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userRepository.findById(Objects.requireNonNull(userDetails.getId(), "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
