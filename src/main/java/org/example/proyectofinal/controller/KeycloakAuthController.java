package org.example.proyectofinal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class KeycloakAuthController {

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().body("Usuario no autenticado");
        }

        Map<String, Object> userInfo = new HashMap<>();

        if (authentication instanceof OAuth2AuthenticationToken oauth2Authentication) {
            OAuth2User oauth2User = oauth2Authentication.getPrincipal();
            OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                    oauth2Authentication.getAuthorizedClientRegistrationId(),
                    oauth2Authentication.getName());

            userInfo.put("username", oauth2User.getAttribute("preferred_username"));
            userInfo.put("email", oauth2User.getAttribute("email"));
            userInfo.put("name", oauth2User.getAttribute("name"));
            userInfo.put("roles", oauth2User.getAuthorities());
            
            if (client != null && client.getAccessToken() != null) {
                userInfo.put("token", client.getAccessToken().getTokenValue());
                userInfo.put("tokenExpiration", client.getAccessToken().getExpiresAt());
            }
        } else {
            userInfo.put("name", authentication.getName());
            userInfo.put("authorities", authentication.getAuthorities());
        }

        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Sesión cerrada correctamente");
    }
}
