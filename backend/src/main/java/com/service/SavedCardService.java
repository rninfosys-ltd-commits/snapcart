package com.service;

import com.entity.SavedCard;
import com.entity.User;
import com.repository.SavedCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class SavedCardService {

    @Autowired
    private SavedCardRepository savedCardRepository;

    public List<SavedCard> getUserCards(User user) {
        return savedCardRepository.findByUser(user);
    }

    @Transactional
    public SavedCard saveCard(User user, SavedCard cardRequest) {
        // Prevent duplicates (simple check by last4)
        if (savedCardRepository.existsByUserAndLast4(user, cardRequest.getLast4())) {
            throw new RuntimeException("Card ending in " + cardRequest.getLast4() + " already saved.");
        }

        cardRequest.setUser(user);
        // Simulate token generation if not provided or if we were integrating with a
        // gateway
        if (cardRequest.getToken() == null || cardRequest.getToken().isEmpty()) {
            cardRequest.setToken(UUID.randomUUID().toString());
        }

        // Infer brand if missing (simple logic)
        if (cardRequest.getBrand() == null || cardRequest.getBrand().isEmpty()) {
            cardRequest.setBrand(inferBrand(cardRequest.getLast4())); // Mock inference
        }

        return savedCardRepository.save(cardRequest);
    }

    @Transactional
    public void deleteCard(Long id, User user) {
        SavedCard card = savedCardRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        savedCardRepository.delete(Objects.requireNonNull(card));
    }

    private String inferBrand(String last4) {
        // Mock logic
        int firstDigit = Integer.parseInt(last4.substring(0, 1));
        if (firstDigit == 4)
            return "Visa";
        if (firstDigit == 5)
            return "MasterCard";
        if (firstDigit == 3)
            return "Amex";
        return "Unknown";
    }
}
