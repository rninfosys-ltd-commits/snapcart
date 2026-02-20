package com.repository;

import com.entity.User;
import com.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser(User user);

    Optional<Wallet> findByUserId(Long userId);

    boolean existsByUser(User user);
}
