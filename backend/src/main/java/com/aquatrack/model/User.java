package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "apartment_name")
    private String apartmentName;

    @Column(name = "block_no")
    private String blockNo;

    @Column(name = "flat_no")
    private String flatNo;

    @Column(name = "meter_id", unique = true)
    private String meterId;

    @Column(name = "approval_status")
    private String approvalStatus; // "PENDING", "APPROVED", "REJECTED"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.approvalStatus == null) {
            this.approvalStatus = "APPROVED";
        }
    }

    public enum Role {
        SUPER_ADMIN,
        BUILDING_OWNER,
        RESIDENT
    }
}