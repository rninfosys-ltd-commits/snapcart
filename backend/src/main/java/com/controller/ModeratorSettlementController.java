package com.controller;

import com.config.TenantContext;
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
@RequestMapping("/api/moderators/settlements")
@PreAuthorize("hasAnyRole('MODERATOR', 'EMPLOYEE')")
public class ModeratorSettlementController {

    @Autowired
    private SettlementService settlementService;

    @GetMapping
    public ResponseEntity<List<SettlementDTO>> getMySettlements() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(settlementService.getSettlementsByTenantId(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList()));
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
