package com.aquatrack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String residentName;
    private String residentEmail;
    private String phoneNumber;
    private String apartmentName;
    private String blockNo;
    private String flatNo;
    private String meterId;

    @Builder.Default
    private Boolean isUsed = false;
}