package com.aquatrack.security;

import com.aquatrack.model.User;
import com.aquatrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createOrUpdateUser("admin@aquatrack.com", "Super Admin", "admin123", User.Role.SUPER_ADMIN, "Green Heights", "A", "101", "MTR-ADMIN");
        createOrUpdateUser("owner@aquatrack.com", "Rajesh Kumar", "owner123", User.Role.BUILDING_OWNER, "Green Heights", "A", "101", "MTR-101");
        createOrUpdateUser("resident@aquatrack.com", "John Doe", "resident123", User.Role.RESIDENT, "Green Heights", "A", "102", "MTR-102");
    }

    private void createOrUpdateUser(String email, String fullName, String rawPassword, User.Role role, String apt, String block, String flat, String meter) {
        Optional<User> existing = userRepository.findByEmail(email);
        User user = existing.orElse(new User());

        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhoneNumber("9999999999");
        user.setRole(role);
        user.setApprovalStatus("APPROVED");
        user.setApartmentName(apt);
        user.setBlockNo(block);
        user.setFlatNo(flat);
        user.setMeterId(meter);

        userRepository.save(user);
        System.out.println("✅ Seeded/Updated User: " + email + " [Password: " + rawPassword + " | Role: " + role + "]");
    }
}