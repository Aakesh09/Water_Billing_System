package com.aquatrack.controller;

import com.aquatrack.dto.WaterSystemDtos.*;
import com.aquatrack.model.*;
import com.aquatrack.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    private final UserRepository userRepository;
    private final BuildingRepository buildingRepository;
    private final BillingTariffRepository tariffRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/buildings")
    public ResponseEntity<?> createBuilding(@Valid @RequestBody BuildingRequest request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Building owner not found"));

        Building building = Building.builder()
                .name(request.getName())
                .address(request.getAddress())
                .owner(owner)
                .build();

        return ResponseEntity.ok(buildingRepository.save(building));
    }

    @PostMapping("/tariffs")
    public ResponseEntity<?> updateTariffRate(@Valid @RequestBody TariffRequest request) {
        BillingTariff tariff = BillingTariff.builder()
                .ratePerLiter(request.getRatePerLiter())
                .build();

        return ResponseEntity.ok(tariffRepository.save(tariff));
    }
}