package com.repository;

import com.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Optional<Visitor> findByVisitorToken(String visitorToken);

    Optional<Visitor> findByEmail(String email);

    void deleteByVisitedAtBefore(LocalDateTime dateTime);
}
