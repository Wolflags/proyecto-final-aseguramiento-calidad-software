package org.example.proyectofinal.controller;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.config.JwtTokenProvider;
import org.example.proyectofinal.dto.JwtResponse;
import org.example.proyectofinal.dto.LoginRequest;
import org.example.proyectofinal.dto.RegisterRequest;
import org.example.proyectofinal.entities.Usuario;
import org.example.proyectofinal.services.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        // Obtener roles del usuario
        Usuario usuario = usuarioService.buscarPorUsername(loginRequest.getUsername());

        return ResponseEntity.ok(new JwtResponse(jwt, loginRequest.getUsername(), usuario.getRoles()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            Usuario usuario = Usuario.builder()
                    .username(registerRequest.getUsername())
                    .password(registerRequest.getPassword())
                    .roles(registerRequest.getRoles())
                    .build();

            Usuario usuarioCreado = usuarioService.crearUsuario(usuario);

            return ResponseEntity.ok("Usuario registrado exitosamente: " + usuarioCreado.getUsername());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication != null) {
            Usuario usuario = usuarioService.buscarPorUsername(authentication.getName());
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.badRequest().body("Usuario no autenticado");
    }
}