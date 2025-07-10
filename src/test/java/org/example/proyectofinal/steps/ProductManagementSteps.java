package org.example.proyectofinal.steps;

                    import io.cucumber.java.en.Given;
                    import io.cucumber.java.en.When;
                    import io.cucumber.java.en.Then;
                    import io.cucumber.java.en.And;
                    import org.example.proyectofinal.components.HttpClientx;
                    import org.example.proyectofinal.entities.Producto;
                    import org.springframework.http.ResponseEntity;
                    import org.springframework.stereotype.Component;
                    import com.fasterxml.jackson.databind.ObjectMapper;
                    import com.fasterxml.jackson.core.type.TypeReference;

                    import java.util.List;

                    import static org.junit.jupiter.api.Assertions.*;

                    public class ProductManagementSteps {

                        private final HttpClientx httpClientx;
                        private final ObjectMapper objectMapper = new ObjectMapper();

                        private String adminToken;
                        private String employeeToken;
                        private String currentToken;
                        private ResponseEntity<String> response;
                        private Exception thrownException;
                        private Long createdProductId;
                        private Producto createdProduct;

                        public ProductManagementSteps(HttpClientx httpClientx) {
                            this.httpClientx = httpClientx;
                        }

                        @Given("I have valid admin credentials {string} and {string}")
                        public void i_have_valid_admin_credentials(String username, String password) {
                            adminToken = httpClientx.getAccessToken(username, password);
                            currentToken = adminToken;
                            assertNotNull(adminToken, "Failed to authenticate admin user");
                        }

                        @Given("I have valid employee credentials {string} and {string}")
                        public void i_have_valid_employee_credentials(String username, String password) {
                            employeeToken = httpClientx.getAccessToken(username, password);
                            currentToken = employeeToken;
                            assertNotNull(employeeToken, "Failed to authenticate employee user");
                        }

                        @Given("I have no authentication token")
                        public void i_have_no_authentication_token() {
                            currentToken = null;
                        }

                        @When("I create a product with name {string}, description {string}, category {string}, price {double}, and quantity {int}")
                        public void i_create_a_complete_product(String productName, String description, String category, Double price, Integer quantity) {
                            try {
                                Producto producto = Producto.builder()
                                        .nombre(productName)
                                        .descripcion(description)
                                        .categoria(category)
                                        .precio(price)
                                        .cantidadInicial(quantity)
                                        .build();

                                response = httpClientx.createProduct(producto, currentToken);

                                if (response.getStatusCode().is2xxSuccessful()) {
                                    createdProduct = objectMapper.readValue(response.getBody(), Producto.class);
                                    createdProductId = createdProduct.getId();
                                }
                            } catch (Exception e) {
                                thrownException = e;
                            }
                        }

                        @Given("I have created a complete product with name {string}, description {string}, category {string}, price {double}, and quantity {int}")
                        public void i_have_created_a_complete_product(String productName, String description, String category, Double price, Integer quantity) {
                            i_create_a_complete_product(productName, description, category, price, quantity);
                            assertTrue(response.getStatusCode().is2xxSuccessful(), "Failed to create product for test setup");
                        }

                        @Given("I have created a complete product as admin with name {string}, description {string}, category {string}, price {double}, and quantity {int}")
                        public void i_have_created_a_complete_product_as_admin(String productName, String description, String category, Double price, Integer quantity) {
                            String originalToken = currentToken;
                            currentToken = adminToken;
                            i_create_a_complete_product(productName, description, category, price, quantity);
                            currentToken = originalToken;
                        }

                        @Given("there are existing products in the system")
                        public void there_are_existing_products_in_the_system() {
                            i_have_created_a_complete_product("Test Product for List", "Test description", "Test Category", 99.99, 10);
                        }

                        @When("I request all products")
                        public void i_request_all_products() {
                            try {
                                response = httpClientx.getAllProducts();
                            } catch (Exception e) {
                                thrownException = e;
                            }
                        }

                        @When("I request the product by its ID")
                        public void i_request_the_product_by_its_id() {
                            try {
                                response = httpClientx.getProductById(createdProductId);
                            } catch (Exception e) {
                                thrownException = e;
                            }
                        }

                        @When("I update the product with name {string}, description {string}, category {string}, price {double}, and quantity {int}")
                        public void i_update_the_complete_product(String newName, String newDescription, String newCategory, Double newPrice, Integer newQuantity) {
                            try {
                                Producto updatedProduct = Producto.builder()
                                        .id(createdProductId)
                                        .nombre(newName)
                                        .descripcion(newDescription)
                                        .categoria(newCategory)
                                        .precio(newPrice)
                                        .cantidadInicial(newQuantity)
                                        .build();

                                response = httpClientx.updateProduct(updatedProduct, currentToken);
                            } catch (Exception e) {
                                thrownException = e;
                            }
                        }

                        @When("I update the product as employee with name {string}, description {string}, category {string}, price {double}, and quantity {int}")
                        public void i_update_the_product_as_employee(String newName, String newDescription, String newCategory, Double newPrice, Integer newQuantity) {
                            i_update_the_complete_product(newName, newDescription, newCategory, newPrice, newQuantity);
                        }

                        @When("I delete the product")
                        public void i_delete_the_product() {
                            try {
                                response = httpClientx.deleteProduct(createdProductId.intValue(), currentToken);
                            } catch (Exception e) {
                                thrownException = e;
                            }
                        }

                        @When("I attempt to delete the product as employee")
                        public void i_attempt_to_delete_the_product_as_employee() {
                            i_delete_the_product();
                        }

                        @When("I search for products with name {string}")
                        public void i_search_for_products_with_name(String searchName) {
                            try {
                                response = httpClientx.searchProductsByName(searchName);
                            } catch (Exception e) {
                                thrownException = e;
                            }
                        }

                        @When("I search for products with category {string}")
                        public void i_search_for_products_with_category(String category) {
                            try {
                                response = httpClientx.searchProductsByCategory(category);
                            } catch (Exception e) {
                                thrownException = e;
                            }
                        }

                        @When("I attempt to create a product with name {string}, description {string}, category {string}, price {double}, and quantity {int}")
                        public void i_attempt_to_create_a_complete_product(String productName, String description, String category, Double price, Integer quantity) {
                            i_create_a_complete_product(productName, description, category, price, quantity);
                        }

                        @When("I attempt to create a product with empty name {string}, description {string}, category {string}, price {double}, and quantity {int}")
                        public void i_attempt_to_create_a_product_with_empty_name(String productName, String description, String category, Double price, Integer quantity) {
                            i_create_a_complete_product(productName, description, category, price, quantity);
                        }

                        @Then("the product should be created successfully")
                        public void the_product_should_be_created_successfully() {
                            assertNotNull(response);
                            assertTrue(response.getStatusCode().is2xxSuccessful());
                        }

                        @Then("the product should be updated successfully")
                        public void the_product_should_be_updated_successfully() {
                            assertNotNull(response);
                            assertTrue(response.getStatusCode().is2xxSuccessful());
                        }

                        @Then("the product should be deleted successfully")
                        public void the_product_should_be_deleted_successfully() {
                            assertNotNull(response);
                            assertTrue(response.getStatusCode().is2xxSuccessful());
                        }

                        @Then("I should receive a list of products")
                        public void i_should_receive_a_list_of_products() {
                            assertNotNull(response);
                            assertTrue(response.getStatusCode().is2xxSuccessful());
                            assertNotNull(response.getBody());
                        }

                        @Then("I should receive the product details")
                        public void i_should_receive_the_product_details() {
                            assertNotNull(response);
                            assertTrue(response.getStatusCode().is2xxSuccessful());
                            assertNotNull(response.getBody());
                        }

                        @Then("the product name should be {string}")
                        public void the_product_name_should_be(String expectedName) {
                            try {
                                Producto product = objectMapper.readValue(response.getBody(), Producto.class);
                                assertEquals(expectedName, product.getNombre());
                            } catch (Exception e) {
                                fail("Failed to parse product response: " + e.getMessage());
                            }
                        }

                        @Then("the product description should be {string}")
                        public void the_product_description_should_be(String expectedDescription) {
                            try {
                                Producto product = objectMapper.readValue(response.getBody(), Producto.class);
                                assertEquals(expectedDescription, product.getDescripcion());
                            } catch (Exception e) {
                                fail("Failed to parse product response: " + e.getMessage());
                            }
                        }

                        @Then("the product category should be {string}")
                        public void the_product_category_should_be(String expectedCategory) {
                            try {
                                Producto product = objectMapper.readValue(response.getBody(), Producto.class);
                                assertEquals(expectedCategory, product.getCategoria());
                            } catch (Exception e) {
                                fail("Failed to parse product response: " + e.getMessage());
                            }
                        }

                        @Then("I should receive products containing {string} in the name")
                        public void i_should_receive_products_containing_in_the_name(String searchTerm) {
                            try {
                                List<Producto> products = objectMapper.readValue(response.getBody(), new TypeReference<List<Producto>>(){});
                                assertFalse(products.isEmpty());
                                assertTrue(products.stream().anyMatch(p -> p.getNombre().contains(searchTerm)));
                            } catch (Exception e) {
                                fail("Failed to parse products list: " + e.getMessage());
                            }
                        }

                        @Then("I should receive products with category {string}")
                        public void i_should_receive_products_with_category(String category) {
                            try {
                                List<Producto> products = objectMapper.readValue(response.getBody(), new TypeReference<List<Producto>>(){});
                                assertFalse(products.isEmpty());
                                assertTrue(products.stream().anyMatch(p -> category.equals(p.getCategoria())));
                            } catch (Exception e) {
                                fail("Failed to parse products list: " + e.getMessage());
                            }
                        }

                        @Then("the product creation should fail with unauthorized error")
                        public void the_product_creation_should_fail_with_unauthorized_error() {
                            assertNotNull(response);
                            assertEquals(401, response.getStatusCode().value());
                        }

                        @Then("the deletion should fail with forbidden error")
                        public void the_deletion_should_fail_with_forbidden_error() {
                            assertNotNull(response);
                            assertEquals(403, response.getStatusCode().value());
                        }

                        @Then("the product creation should fail with validation error")
                        public void the_product_creation_should_fail_with_validation_error() {
                            assertNotNull(response);
                            assertEquals(400, response.getStatusCode().value());
                        }

                        @And("the response status should be {int}")
                        public void the_response_status_should_be(int expectedStatus) {
                            assertNotNull(response);
                            assertEquals(expectedStatus, response.getStatusCode().value());
                        }
                    }