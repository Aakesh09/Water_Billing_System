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
@Table(name = "billing_cycles")
public class BillingCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cycle_name", nullable = false) // e.g. "August 2026"
    private String cycleName;

    @Column(name = "apartment_name", nullable = false)
    private String apartmentName;

    @Column(name = "status", nullable = false) // "OPEN", "FINALIZED", "ARCHIVED"
    private String status;

    @Column(name = "total_bulk_cost")
    private Double totalBulkCost;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "OPEN";
        }
    }
}