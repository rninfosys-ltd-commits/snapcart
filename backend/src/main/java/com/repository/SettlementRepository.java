package com.repository;

import com.entity.Settlement;
import com.entity.PayoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByOrderId(Long orderId);

    List<Settlement> findByTenantId(Long tenantId);

    List<Settlement> findByPayoutStatus(PayoutStatus status);

    List<Settlement> findByModeratorId(Long moderatorId);

    List<Settlement> findByPayoutStatusAndPayoutLockedFalse(PayoutStatus status);
}
