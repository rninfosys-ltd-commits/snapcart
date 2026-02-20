package com.repository;

import com.entity.SavedCard;
import com.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedCardRepository extends JpaRepository<SavedCard, Long> {
    List<SavedCard> findByUser(User user);

    Optional<SavedCard> findByIdAndUser(Long id, User user);

    boolean existsByUserAndLast4(User user, String last4);
}
