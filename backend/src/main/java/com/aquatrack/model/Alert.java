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
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meter_id", nullable = false)
    private String meterId;

    @Column(name = "flat_no", nullable = false)
    private String flatNo;

    @Column(name = "apartment_name", nullable = false)
    private String apartmentName;

    @Column(name = "alert_type", nullable = false) // "LEAK_DETECTED", "THRESHOLD_EXCEEDED"
    private String alertType;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "consumption_liters")
    private Double consumptionLiters;

    @Column(name = "threshold_limit")
    private Double thresholdLimit;

    @Column(name = "is_resolved")
    private Boolean isResolved;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isResolved == null) {
            this.isResolved = false;
        }
    }
}