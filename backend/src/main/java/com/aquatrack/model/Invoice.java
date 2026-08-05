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
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cycle_id", nullable = false)
    private Long cycleId;

    @Column(name = "apartment_name", nullable = false)
    private String apartmentName;

    @Column(name = "flat_no", nullable = false)
    private String flatNo;

    @Column(name = "block_no")
    private String blockNo;

    @Column(name = "meter_id")
    private String meterId;

    @Column(name = "metered_consumption_liters")
    private Double meteredConsumptionLiters;

    @Column(name = "tiered_base_charge")
    private Double tieredBaseCharge;

    @Column(name = "shared_bulk_allocation")
    private Double sharedBulkAllocation;

    @Column(name = "total_amount_rupees", nullable = false)
    private Double totalAmountRupees;

    @Column(name = "payment_status", nullable = false) // "PENDING", "PAID"
    private String paymentStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.paymentStatus == null) {
            this.paymentStatus = "PENDING";
        }
    }
}