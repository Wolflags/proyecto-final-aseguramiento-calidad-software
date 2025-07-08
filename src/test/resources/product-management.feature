Feature: Product Management
      As a user
      I want to manage products
      So that I can maintain the inventory

      Background:
        Given I have valid admin credentials "admin1" and "admin1"

      Scenario: Successfully create a product
        When I create a product with name "Test Product" and price 100.0
        Then the product should be created successfully
        And the response status should be 201

      Scenario: Get all products
        Given there are existing products in the system
        When I request all products
        Then I should receive a list of products
        And the response status should be 200

      Scenario: Get product by ID
        Given I have created a product with name "Search Product" and price 50.0
        When I request the product by its ID
        Then I should receive the product details
        And the product name should be "Search Product"
        And the response status should be 200

      Scenario: Update a product as admin
        Given I have created a product with name "Original Product" and price 75.0
        When I update the product name to "Updated Product" and price to 85.0
        Then the product should be updated successfully
        And the response status should be 200

      Scenario: Delete a product as admin
        Given I have created a product with name "Product to Delete" and price 25.0
        When I delete the product
        Then the product should be deleted successfully
        And the response status should be 204

      Scenario: Search products by name
        Given I have created a product with name "Laptop Gaming" and price 1500.0
        When I search for products with name "Laptop"
        Then I should receive products containing "Laptop" in the name
        And the response status should be 200

      Scenario: Search products by category
        Given I have created a product with name "MacBook Pro" and price 2000.0 and category "Electronics"
        When I search for products with category "Electronics"
        Then I should receive products with category "Electronics"
        And the response status should be 200

      Scenario: Fail to create product without authentication
        Given I have no authentication token
        When I attempt to create a product with name "Unauthorized Product" and price 100.0
        Then the product creation should fail with unauthorized error
        And the response status should be 401

      Scenario: Fail to delete product as non-admin user
        Given I have valid employee credentials "empleado1" and "empleado1"
        And I have created a product as admin with name "Protected Product" and price 100.0
        When I attempt to delete the product as employee
        Then the deletion should fail with forbidden error
        And the response status should be 403

      Scenario: Successfully update product as employee
        Given I have valid employee credentials "empleado1" and "empleado1"
        And I have created a product as admin with name "Employee Update Product" and price 100.0
        When I update the product as employee with name "Employee Updated" and price 120.0
        Then the product should be updated successfully
        And the response status should be 200

      Scenario: Create product with invalid data
        When I attempt to create a product with empty name "" and price -10.0
        Then the product creation should fail with validation error
        And the response status should be 400