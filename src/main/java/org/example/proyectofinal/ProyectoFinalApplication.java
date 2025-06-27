package org.example.proyectofinal;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Role;
import org.example.proyectofinal.entities.Usuario;
import org.example.proyectofinal.services.UsuarioService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import jakarta.annotation.PostConstruct;
import java.util.Set;

@SpringBootApplication
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class ProyectoFinalApplication {

    private final UsuarioService usuarioService;

    public static void main(String[] args) {
        SpringApplication.run(ProyectoFinalApplication.class, args);
    }

    @PostConstruct
    public void crearUsuarioAdminPorDefecto() {
        try {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password("admin")
                    .roles(Set.of(Role.ADMIN))
                    .build();

            usuarioService.crearUsuario(admin);
            System.out.println("Usuario administrador creado: admin/admin");
        } catch (RuntimeException e) {
            System.out.println("El usuario admin ya existe");
        }
    }
}