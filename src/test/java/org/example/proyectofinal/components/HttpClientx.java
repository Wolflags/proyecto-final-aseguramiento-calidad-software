package org.example.proyectofinal.components;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.proyectofinal.entities.Producto;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Scope;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static io.cucumber.spring.CucumberTestContext.SCOPE_CUCUMBER_GLUE;

@Component
@Scope(SCOPE_CUCUMBER_GLUE)
public class HttpClientx {

    private String SERVER_URL = "http://localhost:";
    private String LOGIN_ENDPOINT = "http://localhost:9090/realms/InventarioRealm/protocol/openid-connect/token";
    private final static String CREATE_PRODUCT_ENDPOINT = "/api/productos";
    private final static String UPDATE_PRODUCT_ENDPOINT = "/api/productos";
    private final static String DELETE_PRODUCT_ENDPOINT = "/api/productos";
    private final static String GET_ALL_PRODUCTS_ENDPOINT = "/api/productos/listar";

    @LocalServerPort
    private String port;

    private final TestRestTemplate restTemplate;

    public HttpClientx(TestRestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private record KeycloakResponse(
            String access_token,
            int expires_in,
            int refresh_expires_in,
            String refresh_token,
            String token_type,
            @JsonProperty("not-before-policy") String not_before_policy,
            String session_state,
            String scope
    ) {}

    private record KeycloakLoginRequest(
            String client_id,
            String username,
            String password,
            String grant_type
    ) {}

    private String getCreateProductUrl() {
        return SERVER_URL + port + CREATE_PRODUCT_ENDPOINT;
    }

    private String getUpdateProductUrl() {
        return SERVER_URL + port + UPDATE_PRODUCT_ENDPOINT;
    }

    private String getDeleteProductUrl() {
        return SERVER_URL + port + DELETE_PRODUCT_ENDPOINT;
    }

    private String getGetAllProductsUrl() {
        return SERVER_URL + port + GET_ALL_PRODUCTS_ENDPOINT;
    }

    public String getAccessToken(String username, String password) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("username", username);
        body.add("password", password);
        body.add("client_id", "inventario-frontend");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                LOGIN_ENDPOINT,
                request,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                KeycloakResponse keycloakResponse = objectMapper.readValue(response.getBody(), KeycloakResponse.class);
                return keycloakResponse.access_token();
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse access token from response", e);
            }
        }

        throw new RuntimeException("Failed to authenticate user: " + username + ". Status code: " + response.getStatusCode());
    }

    public ResponseEntity<String> createProduct(Producto producto, String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        return restTemplate.postForEntity(
                getCreateProductUrl(),
                new HttpEntity<>(producto, headers),
                String.class
        );
    }

    public ResponseEntity<String> updateProduct(Producto producto, String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        return restTemplate.exchange(
                getUpdateProductUrl() + "/" + producto.getId(),
                HttpMethod.PUT,
                new HttpEntity<>(producto, headers),
                String.class
        );
    }

    public ResponseEntity<String> deleteProduct(int productId, String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        return restTemplate.exchange(
                getDeleteProductUrl() + "/" + productId,
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                String.class
        );
    }

    public ResponseEntity<String> getAllProducts() {
        String url = getGetAllProductsUrl();
        return restTemplate.getForEntity(
                url,
                String.class
        );
    }


}
