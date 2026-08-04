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
@Table(name = "bulk_purchases")
public class BulkPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apartment_name", nullable = false)
    private String apartmentName;

    @Column(name = "supplier_type", nullable = false) // "TANKER" or "MUNICIPAL"
    private String supplierType;

    @Column(name = "volume_liters", nullable = false)
    private Double volumeLiters;

    @Column(name = "unit_cost_per_liter", nullable = false)
    private Double unitCostPerLiter;

    @Column(name = "total_cost", nullable = false)
    private Double totalCost;

    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;

    @PrePersist
    protected void onCreate() {
        if (this.purchaseDate == null) {
            this.purchaseDate = LocalDateTime.now();
        }
        if (this.totalCost == null && this.volumeLiters != null && this.unitCostPerLiter != null) {
            this.totalCost = this.volumeLiters * this.unitCostPerLiter;
        }
    }
}