package com.service;

import com.entity.Transaction;
import com.entity.User;
import com.entity.Wallet;
import com.repository.TransactionRepository;
import com.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Get or create a wallet for a user.
     */
    @Transactional
    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet wallet = new Wallet();
                    wallet.setUser(user);
                    wallet.setBalance(0.0);
                    wallet.setLastUpdated(LocalDateTime.now());
                    return walletRepository.save(wallet);
                });
    }

    /**
     * Credit amount to user's wallet.
     */
    @Transactional
    public void creditWallet(User user, Double amount, Transaction.TransactionSource source, String referenceId,
            String description) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }

        Wallet wallet = getOrCreateWallet(user);
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType(Transaction.TransactionType.CREDIT);
        transaction.setSource(source);
        transaction.setReferenceId(referenceId);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }

    /**
     * Debit amount from user's wallet.
     */
    @Transactional
    public void debitWallet(User user, Double amount, Transaction.TransactionSource source, String referenceId,
            String description) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }

        Wallet wallet = getOrCreateWallet(user);
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType(Transaction.TransactionType.DEBIT);
        transaction.setSource(source);
        transaction.setReferenceId(referenceId);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }

    /**
     * Get wallet balance.
     */
    public Double getBalance(User user) {
        return getOrCreateWallet(user).getBalance();
    }

    /**
     * Get transaction history.
     */
    public List<Transaction> getTransactionHistory(User user) {
        Wallet wallet = getOrCreateWallet(user);
        return transactionRepository.findByWalletOrderByTimestampDesc(wallet);
    }
}
