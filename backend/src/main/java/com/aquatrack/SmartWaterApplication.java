package com.aquatrack;

import com.aquatrack.model.User;
import com.aquatrack.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SmartWaterApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartWaterApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Super Admin if not already present
            if (userRepository.findByEmail("admin@aquatrack.com").isEmpty()) {
                User admin = User.builder()
                        .fullName("System Super Admin")
                        .email("admin@aquatrack.com")
                        .password(passwordEncoder.encode("admin123"))
                        .phoneNumber("9999999999")
                        .role(User.Role.SUPER_ADMIN)
                        .approvalStatus("APPROVED")
                        .build();

                userRepository.save(admin);
                System.out.println(">>> Super Admin account initialized: admin@aquatrack.com");
            }
        };
    }
}