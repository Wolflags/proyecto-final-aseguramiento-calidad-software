package org.example.proyectofinal.controller;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.config.JwtTokenProvider;
import org.example.proyectofinal.entities.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/jwt")
@RequiredArgsConstructor
public class JwtController {

    private final JwtTokenProvider tokenProvider;

    @PostMapping("/decode")
    public ResponseEntity<?> decodeToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");

            if (tokenProvider.validateToken(token)) {
                String username = tokenProvider.getUsernameFromToken(token);
                Set<Role> roles = tokenProvider.getRolesFromToken(token);

                Map<String, Object> tokenInfo = new HashMap<>();
                tokenInfo.put("username", username);
                tokenInfo.put("roles", roles);
                tokenInfo.put("valid", true);

                return ResponseEntity.ok(tokenInfo);
            } else {
                return ResponseEntity.badRequest().body("Token inválido");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al decodificar el token: " + e.getMessage());
        }
    }
}