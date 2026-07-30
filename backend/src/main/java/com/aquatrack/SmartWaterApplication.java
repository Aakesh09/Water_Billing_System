package com.aquatrack;

import com.aquatrack.model.Role;
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
            userRepository.findByEmail("admin@aquatrack.com").ifPresent(userRepository::delete);

            User admin = User.builder()
                    .email("admin@aquatrack.com")
                    .fullName("System Super Admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.SUPER_ADMIN)
                    .phoneNumber("9999999999")
                    .build();

            userRepository.save(admin);
            System.out.println("==========================================================");
            System.out.println(">>> SUCCESS: Created Super Admin (admin@aquatrack.com) <<<");
            System.out.println("==========================================================");
        };
    }
}