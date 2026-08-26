package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long cycleId;
    private String invoiceNumber;
    private String apartmentName;
    private String blockNo;
    private String flatNo;
    private String meterId;
    private String residentName;
    private String residentEmail;

    private Double previousReading;
    private Double currentReading;
    private Double totalVolumeLiters;
    private Double meteredConsumptionLiters;
    
    private Double tieredBaseCharge;
    private Double sharedBulkAllocation;
    private Double sharedCostAmount;
    private Double sharedSurcharge;
    private Double bulkAdjustmentCost;
    private Double individualCostAmount;
    
    private Double totalAmountRupees;
    private Double totalAmount;
    
    private Double tier1Units;
    private Double tier1Amount;
    private Double tier2Units;
    private Double tier2Amount;
    
    private String status;
    private String paymentStatus; // PENDING, PAID
    
    private LocalDate billingDate;
    private LocalDate dueDate;
}