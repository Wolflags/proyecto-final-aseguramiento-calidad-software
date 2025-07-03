package org.example.proyectofinal.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    @Value("${spring.security.oauth2.client.provider.keycloak.issuer-uri}")
    private String keycloakUrl;

    @Value("${spring.security.oauth2.client.registration.keycloak.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getAdminToken() {
        String tokenUrl = keycloakUrl.replace("/realms/inventario-app", "/realms/master/protocol/openid-connect/token");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        String body = "grant_type=client_credentials&client_id=admin-cli&username=admin&password=admin";
        
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            tokenUrl,
            HttpMethod.POST,
            entity,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        return (String) response.getBody().get("access_token");
    }

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAdminToken());
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String getKeycloakAdminUrl() {
        // Asume que la URL tiene el formato http://host:port/auth/realms/inventario-app
        // y la convierte a http://host:port/auth/admin/realms/inventario-app
        return keycloakUrl.replace("/realms/", "/admin/realms/");
    }

    public List<Map<String, Object>> getUsers() {
        String url = getKeycloakAdminUrl() + "/users";
        HttpEntity<?> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );
        
        return response.getBody();
    }

    public Map<String, Object> getUser(String userId) {
        String url = getKeycloakAdminUrl() + "/users/" + userId;
        HttpEntity<?> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        return response.getBody();
    }

    public Map<String, Object> createUser(Map<String, Object> userData) {
        String url = getKeycloakAdminUrl() + "/users";
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(userData, createAuthHeaders());
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        return response.getBody();
    }

    public void updateUser(String userId, Map<String, Object> userData) {
        String url = getKeycloakAdminUrl() + "/users/" + userId;
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(userData, createAuthHeaders());
        
        restTemplate.exchange(
            url,
            HttpMethod.PUT,
            entity,
            Void.class
        );
    }

    public void deleteUser(String userId) {
        String url = getKeycloakAdminUrl() + "/users/" + userId;
        HttpEntity<?> entity = new HttpEntity<>(createAuthHeaders());
        
        restTemplate.exchange(
            url,
            HttpMethod.DELETE,
            entity,
            Void.class
        );
    }

    public void resetPassword(String userId, String newPassword) {
        String url = getKeycloakAdminUrl() + "/users/" + userId + "/reset-password";
        
        Map<String, Object> passwordData = new HashMap<>();
        passwordData.put("type", "password");
        passwordData.put("value", newPassword);
        passwordData.put("temporary", false);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(passwordData, createAuthHeaders());
        
        restTemplate.exchange(
            url,
            HttpMethod.PUT,
            entity,
            Void.class
        );
    }

    public List<String> getRoles() {
        String url = getKeycloakAdminUrl() + "/roles";
        HttpEntity<?> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );
        
        List<String> roleNames = new ArrayList<>();
        if (response.getBody() != null) {
            for (Map<String, Object> role : response.getBody()) {
                roleNames.add((String) role.get("name"));
            }
        }
        
        return roleNames;
    }

    public void addRolesToUser(String userId, List<String> roles) {
        String url = getKeycloakAdminUrl() + "/users/" + userId + "/role-mappings/realm";
        
        List<Map<String, Object>> roleMappings = new ArrayList<>();
        for (String role : roles) {
            Map<String, Object> roleMapping = new HashMap<>();
            roleMapping.put("name", role);
            roleMappings.add(roleMapping);
        }
        
        HttpEntity<List<Map<String, Object>>> entity = new HttpEntity<>(roleMappings, createAuthHeaders());
        
        restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            Void.class
        );
    }
}
