package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "apartments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"building_id", "flat_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "flat_number", nullable = false, length = 20)
    private String flatNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id")
    private User resident;
}