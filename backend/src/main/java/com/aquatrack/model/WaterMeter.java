package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "water_meters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterMeter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", nullable = false, unique = true, length = 50)
    private String serialNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", unique = true)
    private Apartment apartment;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MeterStatus status;

    @Column(name = "installed_at", insertable = false, updatable = false)
    private ZonedDateTime installedAt;
}