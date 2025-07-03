package org.example.proyectofinal.controller;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.service.KeycloakAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/keycloak")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class KeycloakAdminController {

    private final KeycloakAdminService keycloakAdminService;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(keycloakAdminService.getUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(keycloakAdminService.getUser(userId));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        return ResponseEntity.ok(keycloakAdminService.createUser(userData));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> userData) {
        keycloakAdminService.updateUser(userId, userData);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        keycloakAdminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String userId, @RequestBody Map<String, String> passwordData) {
        keycloakAdminService.resetPassword(userId, passwordData.get("password"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(keycloakAdminService.getRoles());
    }

    @PostMapping("/users/{userId}/roles")
    public ResponseEntity<?> addRolesToUser(@PathVariable String userId, @RequestBody List<String> roles) {
        keycloakAdminService.addRolesToUser(userId, roles);
        return ResponseEntity.ok().build();
    }
}
