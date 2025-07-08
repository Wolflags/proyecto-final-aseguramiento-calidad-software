package org.example.proyectofinal.steps;

    import io.cucumber.java.en.Given;
    import io.cucumber.java.en.When;
    import io.cucumber.java.en.Then;
    import io.cucumber.java.en.And;
    import org.example.proyectofinal.components.HttpClientx;
    import org.example.proyectofinal.entities.Producto;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;

    import java.util.ArrayList;

    import static org.junit.jupiter.api.Assertions.*;

    public class ProductCreationSteps {


        private String username;
        private String password;
        private String accessToken;
        private ResponseEntity<String> response;
        private Exception thrownException;
        private final HttpClientx httpClientx;

        public ProductCreationSteps(HttpClientx HttpClientx) {
            this.httpClientx = HttpClientx;
        }

        @Given("I have valid user credentials {string} and {string}")
        public void iAmAnAuthenticatedAdminUserWithCredentialsAnd(String username, String password) {
            accessToken = httpClientx.getAccessToken(username, password);
            this.username = username;
            this.password = password;
            if (accessToken == null || accessToken.isEmpty()) {
                throw new RuntimeException("Failed to authenticate user: " + username);
            }
        }

        @Given("I have invalid user credentials {string} and {string}")
        public void i_have_invalid_user_credentials(String username, String password) {
            this.username = username;
            this.password = password;
        }

        @When("I create a product with name {string} and price {double}")
        public void i_create_a_product_with_name_and_price(String productName, Double price) {
            try {
                accessToken = httpClientx.getAccessToken(username, password);
                Producto producto = new Producto();
                producto.setNombre(productName);
                producto.setPrecio(price);

                response = httpClientx.createProduct(producto, accessToken);
                System.out.println(response.getBody());

            } catch (Exception e) {
                thrownException = e;
                System.out.println("Exception occurredx: " + e.getMessage());
                fail();
            }
        }

        @When("I attempt to create a product with name {string} and price {double}")
        public void i_attempt_to_create_a_product_with_name_and_price(String productName, Double price) {
            try {
                accessToken = httpClientx.getAccessToken(username, password);
                Producto producto = new Producto();
                producto.setNombre(productName);
                producto.setPrecio(price);

                response = httpClientx.createProduct(producto, accessToken);

            } catch (Exception e) {
                thrownException = e;
            }
        }

        @Then("the product should be created successfully")
        public void the_product_should_be_created_successfully() {
            assertNotNull(response);
            assertTrue(response.getStatusCode().is2xxSuccessful());
        }

        @And("the response status should be {int}")
        public void the_response_status_should_be(int expectedStatus) {
            assertNotNull(response);
            assertEquals(expectedStatus, response.getStatusCode().value());
        }

        @Then("the product creation should fail")
        public void the_product_creation_should_fail() {
            assertNotNull(thrownException);
        }

        @And("I should receive an authentication error")
        public void i_should_receive_an_authentication_error() {
            assertNotNull(thrownException);
            assertTrue(thrownException.getMessage().contains("Failed to authenticate user"));
        }
    }