package com.aquatrack.repository;

import com.aquatrack.model.TariffConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TariffConfigRepository extends JpaRepository<TariffConfig, Long> {
    Optional<TariffConfig> findByApartmentName(String apartmentName);
}