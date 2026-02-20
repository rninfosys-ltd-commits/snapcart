package com.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "visitors")
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String visitorToken;

    private String email;

    private String ipAddress;

    private String deviceType;

    private String browser;

    @Column(nullable = false)
    private LocalDateTime visitedAt;

    private boolean converted; // True if registered or associated with a user

    private Long userId; // Linked User ID if converted

    @PrePersist
    protected void onCreate() {
        if (visitedAt == null) {
            visitedAt = LocalDateTime.now();
        }
    }
}
