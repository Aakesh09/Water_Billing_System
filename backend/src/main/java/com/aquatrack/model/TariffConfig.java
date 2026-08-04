package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tariff_configs")
public class TariffConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apartment_name", nullable = false, unique = true)
    private String apartmentName;

    @Column(name = "base_volume_kL", nullable = false) // e.g., 10 kL (10,000 Liters)
    private Double baseVolumeKl;

    @Column(name = "base_rate_per_kL", nullable = false) // e.g., ₹20 per kL
    private Double baseRatePerKl;

    @Column(name = "tier2_rate_per_kL", nullable = false) // e.g., ₹45 per kL beyond 10 kL
    private Double tier2RatePerKl;
}