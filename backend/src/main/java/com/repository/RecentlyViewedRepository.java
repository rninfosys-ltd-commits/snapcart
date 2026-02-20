package com.repository;

import com.entity.RecentlyViewed;
import com.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecentlyViewedRepository extends JpaRepository<RecentlyViewed, Long> {
    List<RecentlyViewed> findByUserOrderByViewedAtDesc(User user);

    Optional<RecentlyViewed> findByUserAndProductModelNo(User user, Long productModelNo);

    void deleteByUser(User user);
}
