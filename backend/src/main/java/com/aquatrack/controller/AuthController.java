package com.aquatrack.controller;

import com.aquatrack.model.Invitation;
import com.aquatrack.model.User;
import com.aquatrack.repository.InvitationRepository;
import com.aquatrack.repository.UserRepository;
import com.aquatrack.security.jwt.JwtUtils;
import com.aquatrack.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    public static class LoginRequest {
        private String email;
        private String password;
        private String role;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Role mismatch! Select proper role.");
        }

        String jwt = jwtUtils.generateJwtTokenFromUsername(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        response.put("approvalStatus", user.getApprovalStatus());
        response.put("fullName", user.getFullName());
        response.put("apartmentName", user.getApartmentName());
        response.put("blockNo", user.getBlockNo());
        response.put("flatNo", user.getFlatNo());
        response.put("meterId", user.getMeterId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        User.Role userRole = User.Role.valueOf(request.getOrDefault("role", "BUILDING_OWNER"));

        User user = User.builder()
                .fullName(request.get("fullName"))
                .email(email)
                .phoneNumber(request.get("phoneNumber"))
                .password(passwordEncoder.encode(request.get("password")))
                .apartmentName(request.get("apartmentName"))
                .blockNo(request.get("blockNo"))
                .flatNo(request.get("flatNo"))
                .meterId(request.get("meterId"))
                .role(userRole)
                .approvalStatus(userRole == User.Role.BUILDING_OWNER ? "PENDING" : "APPROVED")
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/send-invitation")
    public ResponseEntity<?> createInvitation(@RequestBody Invitation invitation) {
        invitation.setIsUsed(false);
        Invitation saved = invitationRepository.save(invitation);

        // Dispatch Email directly to resident
        String inviteLink = "http://localhost:5173/register?code=" + saved.getCode();
        emailService.sendInvitationEmail(saved.getResidentEmail(), saved.getResidentName(), saved.getCode(), inviteLink);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/verify-invitation/{code}")
    public ResponseEntity<?> verifyInvitation(@PathVariable String code) {
        Optional<Invitation> optInv = invitationRepository.findByCode(code);

        if (optInv.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid invitation code.");
        }

        Invitation inv = optInv.get();
        if (Boolean.TRUE.equals(inv.getIsUsed())) {
            return ResponseEntity.badRequest().body("This invitation code has already been used.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("residentName", inv.getResidentName());
        response.put("residentEmail", inv.getResidentEmail());
        response.put("phoneNumber", inv.getPhoneNumber());
        response.put("apartmentName", inv.getApartmentName());
        response.put("blockNo", inv.getBlockNo());
        response.put("flatNo", inv.getFlatNo());
        response.put("meterId", inv.getMeterId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-resident")
    public ResponseEntity<?> registerResident(@RequestBody Map<String, String> request) {
        String code = request.get("invitationCode");
        String password = request.get("password");

        Optional<Invitation> optInv = invitationRepository.findByCode(code);
        if (optInv.isEmpty() || Boolean.TRUE.equals(optInv.get().getIsUsed())) {
            return ResponseEntity.badRequest().body("Invalid or used invitation code.");
        }

        Invitation inv = optInv.get();

        User newUser = User.builder()
                .email(inv.getResidentEmail())
                .fullName(inv.getResidentName())
                .phoneNumber(inv.getPhoneNumber())
                .password(passwordEncoder.encode(password))
                .apartmentName(inv.getApartmentName())
                .blockNo(inv.getBlockNo())
                .flatNo(inv.getFlatNo())
                .meterId(inv.getMeterId())
                .role(User.Role.RESIDENT)
                .approvalStatus("APPROVED")
                .build();

        userRepository.save(newUser);

        inv.setIsUsed(true);
        invitationRepository.save(inv);

        return ResponseEntity.ok("Resident registered successfully!");
    }
}