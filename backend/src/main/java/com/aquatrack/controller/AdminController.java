package com.aquatrack.controller;

import com.aquatrack.model.User;
import com.aquatrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    // Fetch ALL Building Owners from PostgreSQL for Super Admin Dashboard
    @GetMapping("/owners")
    public ResponseEntity<List<User>> getAllBuildingOwners() {
        List<User> owners = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.BUILDING_OWNER)
                .toList();
        return ResponseEntity.ok(owners);
    }

    // Dynamic Approve/Reject Owner
    @PostMapping("/approve-owner/{id}")
    public ResponseEntity<?> updateOwnerStatus(@PathVariable Long id, @RequestParam String status) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setApprovalStatus(status.toUpperCase());
        userRepository.save(user);
        return ResponseEntity.ok("Owner status updated to " + status);
    }

    // Delete User Record
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully.");
    }
}