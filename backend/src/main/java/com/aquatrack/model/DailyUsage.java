package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "daily_usages")
public class DailyUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meter_id", nullable = false)
    private String meterId;

    @Column(name = "flat_no", nullable = false)
    private String flatNo;

    @Column(name = "apartment_name", nullable = false)
    private String apartmentName;

    @Column(name = "volume_liters", nullable = false)
    private Double volumeLiters;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;
}