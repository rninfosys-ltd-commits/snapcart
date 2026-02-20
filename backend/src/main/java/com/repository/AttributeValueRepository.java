package com.repository;

import com.entity.AttributeValue;
import com.entity.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {
    List<AttributeValue> findByAttribute(ProductAttribute attribute);

    Optional<AttributeValue> findByAttributeAndValue(ProductAttribute attribute, String value);
}
