package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "usage_readings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meter_id", nullable = false)
    private WaterMeter meter;

    @Column(name = "liters_consumed", nullable = false, precision = 10, scale = 2)
    private BigDecimal litersConsumed;

    @Column(name = "reading_timestamp", insertable = false, updatable = false)
    private ZonedDateTime readingTimestamp;
}