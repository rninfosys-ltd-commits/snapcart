package com.repository;

import com.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findBySaleEndTimeAfter(java.time.LocalDateTime now);

    // Find variants by product
    List<ProductVariant> findByProductModelNo(Long modelNo);

    // Find low stock variants
    List<ProductVariant> findByQuantityLessThanOrderByQuantityAsc(int threshold,
            org.springframework.data.domain.Pageable pageable);
}
