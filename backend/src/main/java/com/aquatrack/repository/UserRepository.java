package com.aquatrack.repository;

import com.aquatrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByMeterId(String meterId);
    boolean existsByApartmentNameAndBlockNoAndFlatNo(String apartmentName, String blockNo, String flatNo);
}