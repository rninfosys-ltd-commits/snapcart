package com.service;

import com.entity.User;
import com.entity.Visitor;
import com.payload.request.VisitorRequest;
import com.repository.UserRepository;
import com.repository.VisitorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class VisitorService {

    @Autowired
    private VisitorRepository visitorRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Creates or updates a visitor record.
     */
    @Transactional
    public Visitor trackVisitor(VisitorRequest request) {
        if (request.getVisitorToken() == null) {
            throw new IllegalArgumentException("Visitor token is required");
        }

        Optional<Visitor> existing = visitorRepository.findByVisitorToken(request.getVisitorToken());

        if (existing.isPresent()) {
            Visitor visitor = existing.get();
            // Update metadata on subsequent visits
            if (request.getIpAddress() != null)
                visitor.setIpAddress(request.getIpAddress());
            if (request.getDeviceType() != null)
                visitor.setDeviceType(request.getDeviceType());
            if (request.getBrowser() != null)
                visitor.setBrowser(request.getBrowser());
            visitor.setVisitedAt(LocalDateTime.now());
            return visitorRepository.save(visitor);
        } else {
            // New anonymous visitor
            Visitor visitor = Visitor.builder()
                    .visitorToken(request.getVisitorToken())
                    .email(request.getEmail()) // Could be null initially
                    .ipAddress(request.getIpAddress())
                    .deviceType(request.getDeviceType())
                    .browser(request.getBrowser())
                    .visitedAt(LocalDateTime.now())
                    .converted(false)
                    .build();
            return visitorRepository.save(visitor);
        }
    }

    /**
     * Updates email for a visitor token (Lead Conversion).
     */
    @Transactional
    public void updateEmail(String visitorToken, String email) {
        Optional<Visitor> visitorOpt = visitorRepository.findByVisitorToken(visitorToken);
        if (visitorOpt.isPresent()) {
            Visitor visitor = visitorOpt.get();
            visitor.setEmail(email);

            // Check if this email is already a registered user
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                visitor.setUserId(userOpt.get().getId());
                visitor.setConverted(true);
            }

            visitorRepository.save(visitor);
            log.info("Updated email for visitor token: {}", visitorToken);
        } else {
            log.warn("Visitor token not found for email update: {}", visitorToken);
        }
    }

    /**
     * Links visitor to user upon registration (User Conversion).
     */
    @Transactional
    public void convertVisitor(String email, User user) {
        Optional<Visitor> visitorOpt = visitorRepository.findByEmail(email);
        if (visitorOpt.isPresent()) {
            Visitor visitor = visitorOpt.get();
            visitor.setUserId(user.getId());
            visitor.setConverted(true);
            visitorRepository.save(visitor);
            log.info("Converted visitor record for email: {}", email);
        }
    }

    /**
     * Cleanup old anonymous visitors > 30 days.
     * Runs every day at midnight.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupOldVisitors() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        visitorRepository.deleteByVisitedAtBefore(cutoff);
        log.info("Cleaned up anonymous visitors older than 30 days");
    }
}
