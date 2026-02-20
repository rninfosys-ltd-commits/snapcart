package com.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 10)
    private String gender;

    @Column(length = 15)
    private String mobile;

    @Column(length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private Role role;

    @Column(name = "parent_id")
    private Long parentId;

    // Profile picture stored as binary
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "LONGBLOB")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] profilePicture;

    @Column(length = 50)
    private String profilePictureType;

    @Column(columnDefinition = "TEXT")
    private String paymentInfo;

    // Helper to check if user has profile picture
    public boolean hasProfilePicture() {
        return profilePicture != null && profilePicture.length > 0;
    }
}
