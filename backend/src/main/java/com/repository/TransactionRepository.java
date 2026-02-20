package com.repository;

import com.entity.Transaction;
import com.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletOrderByTimestampDesc(Wallet wallet);

    List<Transaction> findByWalletIdOrderByTimestampDesc(Long walletId);
}
