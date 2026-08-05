package com.aquatrack.repository;

import com.aquatrack.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByApartmentName(String apartmentName);
    List<Alert> findByFlatNoAndApartmentName(String flatNo, String apartmentName);
}