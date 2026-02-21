package com.service;

import com.entity.*;
import com.repository.PaymentWebhookEventRepository;
import com.repository.SettlementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SettlementService {

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private PaymentWebhookEventRepository webhookEventRepository;

    @Autowired
    private WalletService walletService;

    /**
     * Creates settlement entries for an order based on financial snapshots in
     * OrderItems.
     * This method is idempotent based on the webhookEventId.
     */
    @Transactional
    public void createSettlements(Order order, String webhookEventId) {
        // 1. Idempotency Check
        if (webhookEventId != null && webhookEventRepository.existsByEventId(webhookEventId)) {
            return;
        }

        // 2. Record Webhook Event
        if (webhookEventId != null) {
            PaymentWebhookEvent event = new PaymentWebhookEvent();
            event.setEventId(webhookEventId);
            event.setEventType("payment.success");
            event.setOrderId(order.getId());
            webhookEventRepository.save(event);
        }

        // 3. Group items by tenant for split settlement
        Map<Long, List<OrderItem>> itemsByTenant = order.getItems().stream()
                .collect(Collectors.groupingBy(OrderItem::getTenantId));

        for (Map.Entry<Long, List<OrderItem>> entry : itemsByTenant.entrySet()) {
            Long tenantId = entry.getKey();
            List<OrderItem> tenantItems = entry.getValue();

            // Calculate totals from snapshots (LEDGER-STYLE)
            double totalGross = tenantItems.stream().mapToDouble(OrderItem::getGrossAmount).sum();
            double totalCommission = tenantItems.stream().mapToDouble(OrderItem::getCommissionAmount).sum();
            double totalNet = tenantItems.stream().mapToDouble(OrderItem::getNetAmount).sum();
            // Use commission from first item as they should be consistent per tenant per
            // order
            double commPercent = tenantItems.get(0).getCommissionPercentSnapshot();

            Moderator moderator = tenantItems.get(0).getVariant().getProduct().getModerator();

            Settlement settlement = new Settlement();
            settlement.setOrder(order);
            settlement.setTenantId(tenantId);
            settlement.setModerator(moderator);
            settlement.setTotalAmount(totalGross);
            settlement.setCommissionAmount(totalCommission);
            settlement.setCommissionPercent(commPercent);
            settlement.setNetPayoutAmount(totalNet);
            settlement.setRefundableAmount(totalNet);
            settlement.setRefundedAmount(0.0);
            settlement.setSettlementType(order.getSettlementType());
            settlement.setPayoutStatus(PayoutStatus.CREATED);
            settlement.setPayoutLocked(false);

            // If direct to moderator, it's ready for payout processing immediately
            if (order.getSettlementType() == SettlementType.DIRECT_TO_MODERATOR) {
                settlement.setPayoutStatus(PayoutStatus.READY_FOR_PAYOUT);
            }

            settlementRepository.save(settlement);
        }
    }

    /**
     * Internal Payout Job (Cron or Scheduled)
     * Processes settlements that are ready for payout.
     */
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
    @Transactional
    public void processPayouts() {
        List<Settlement> eligible = settlementRepository
                .findByPayoutStatusAndPayoutLockedFalse(PayoutStatus.READY_FOR_PAYOUT);
        for (Settlement s : eligible) {
            try {
                processSinglePayout(s.getId());
            } catch (Exception e) {
                System.err.println("Scheduled payout failed for settlement " + s.getId() + ": " + e.getMessage());
            }
        }
    }

    public List<Settlement> getAllSettlements() {
        return settlementRepository.findAll();
    }

    public List<Settlement> getSettlementsByOrderId(Long orderId) {
        return settlementRepository.findByOrderId(orderId);
    }

    public List<Settlement> getSettlementsByTenantId(Long tenantId) {
        return settlementRepository.findByTenantId(tenantId);
    }

    @Transactional
    public void processSinglePayout(Long id) {
        Settlement s = settlementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        if (s.getPayoutStatus() == PayoutStatus.PAID) {
            throw new RuntimeException("Payout already paid");
        }

        // Lock for processing
        s.setPayoutLocked(true);
        settlementRepository.save(s);

        try {
            transferFunds(s);
            s.setPayoutStatus(PayoutStatus.PAID);
            s.setPayoutDate(java.time.LocalDateTime.now());
            s.setPayoutReference("MAN-TRF-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } catch (Exception e) {
            s.setPayoutStatus(PayoutStatus.FAILED);
            throw new RuntimeException("Payout failed: " + e.getMessage());
        } finally {
            s.setPayoutLocked(false);
            settlementRepository.save(s);
        }
    }

    private void transferFunds(Settlement s) {
        walletService.creditWallet(
                s.getModerator().getUser(),
                s.getNetPayoutAmount(),
                Transaction.TransactionSource.ORDER_PAYMENT,
                s.getOrder().getId().toString(),
                "Payout for Order #" + s.getOrder().getId());
    }
}
