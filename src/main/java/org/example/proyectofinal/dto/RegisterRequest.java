package org.example.proyectofinal.dto;

import lombok.Data;
import org.example.proyectofinal.entities.Role;

import java.util.Set;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private Set<Role> roles;
}