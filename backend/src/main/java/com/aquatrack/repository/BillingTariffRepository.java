package com.aquatrack.repository;

import com.aquatrack.model.BillingTariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillingTariffRepository extends JpaRepository<BillingTariff, Long> {
    Optional<BillingTariff> findTopByOrderByEffectiveFromDesc();
}