package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "billing_tariffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingTariff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rate_per_liter", nullable = false, precision = 8, scale = 4)
    private BigDecimal ratePerLiter;

    @Column(name = "effective_from", insertable = false, updatable = false)
    private ZonedDateTime effectiveFrom;
}