package com.controller;

import com.entity.Settlement;
import com.payload.dto.SettlementDTO;
import com.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/settlements")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    @GetMapping
    public ResponseEntity<List<SettlementDTO>> getAllSettlements() {
        return ResponseEntity.ok(settlementService.getAllSettlements()
                .stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<SettlementDTO>> getSettlementsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(settlementService.getSettlementsByOrderId(orderId)
                .stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/payout")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> processManualPayout(@PathVariable Long id) {
        try {
            settlementService.processSinglePayout(id);
            return ResponseEntity.ok("Payout processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private SettlementDTO toDTO(Settlement s) {
        SettlementDTO dto = new SettlementDTO();
        dto.setId(s.getId());
        dto.setOrderId(s.getOrder().getId());
        dto.setTenantId(s.getTenantId());
        dto.setModeratorName(s.getModerator().getUser().getName());
        dto.setBrandName(s.getModerator().getBrandName());
        dto.setTotalAmount(s.getTotalAmount());
        dto.setCommissionAmount(s.getCommissionAmount());
        dto.setCommissionPercent(s.getCommissionPercent());
        dto.setNetPayoutAmount(s.getNetPayoutAmount());
        dto.setRefundableAmount(s.getRefundableAmount());
        dto.setRefundedAmount(s.getRefundedAmount());
        dto.setPayoutStatus(s.getPayoutStatus());
        dto.setPayoutReference(s.getPayoutReference());
        dto.setPayoutDate(s.getPayoutDate());
        dto.setSettlementType(s.getSettlementType());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}
