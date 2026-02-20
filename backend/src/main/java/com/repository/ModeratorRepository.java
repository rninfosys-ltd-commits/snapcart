package com.repository;

import com.entity.Category;
import com.entity.Moderator;
import com.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Moderator entity operations.
 */
@Repository
public interface ModeratorRepository extends JpaRepository<Moderator, Long> {

    /**
     * Save a moderator entity.
     * Explicitly override to ensure null-safety annotation is properly propagated.
     */
    @Override
    @NonNull
    <S extends Moderator> S save(@NonNull S entity);

    /**
     * Find moderator by associated user.
     */
    Optional<Moderator> findByUser(User user);

    /**
     * Find moderator by user ID.
     */
    Optional<Moderator> findByUserId(Long userId);

    /**
     * Get all active moderators.
     */
    List<Moderator> findByIsActiveTrue();

    /**
     * Get all inactive moderators.
     */
    List<Moderator> findByIsActiveFalse();

    /**
     * Find moderators who can manage a specific category.
     */
    List<Moderator> findByCategoriesContaining(Category category);

    /**
     * Check if a user is already a moderator.
     */
    boolean existsByUserId(Long userId);
}
