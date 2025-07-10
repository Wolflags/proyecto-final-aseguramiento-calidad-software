Feature: Product Management
          As a user
          I want to manage products
          So that I can maintain the inventory

          Background:
            Given I have valid admin credentials "admin1" and "admin1"

          Scenario: Successfully create a complete product
            When I create a product with name "Test Product", description "A test product for testing", category "Electronics", price 100.0, and quantity 50
            Then the product should be created successfully
            And the response status should be 201

          Scenario: Get all products
            Given there are existing products in the system
            When I request all products
            Then I should receive a list of products
            And the response status should be 200

          Scenario: Get product by ID
            Given I have created a complete product with name "Search Product", description "Searchable product", category "Books", price 50.0, and quantity 25
            When I request the product by its ID
            Then I should receive the product details
            And the product name should be "Search Product"
            And the product description should be "Searchable product"
            And the product category should be "Books"
            And the response status should be 200

          Scenario: Update a complete product as admin
            Given I have created a complete product with name "Original Product", description "Original description", category "Tools", price 75.0, and quantity 30
            When I update the product with name "Updated Product", description "Updated description", category "Electronics", price 85.0, and quantity 35
            Then the product should be updated successfully
            And the response status should be 200

          Scenario: Delete a product as admin
            Given I have created a complete product with name "Product to Delete", description "Will be deleted", category "Temporary", price 25.0, and quantity 10
            When I delete the product
            Then the product should be deleted successfully
            And the response status should be 204

          Scenario: Search products by name
            Given I have created a complete product with name "Laptop Gaming", description "High-end gaming laptop", category "Electronics", price 1500.0, and quantity 5
            When I search for products with name "Laptop"
            Then I should receive products containing "Laptop" in the name
            And the response status should be 200

          Scenario: Search products by category
            Given I have created a complete product with name "MacBook Pro", description "Apple laptop", category "Electronics", price 2000.0, and quantity 3
            When I search for products with category "Electronics"
            Then I should receive products with category "Electronics"
            And the response status should be 200

          Scenario: Fail to create product without authentication
            Given I have no authentication token
            When I attempt to create a product with name "Unauthorized Product", description "No auth", category "Test", price 100.0, and quantity 1
            Then the product creation should fail with unauthorized error
            And the response status should be 401

          Scenario: Fail to delete product as non-admin user
            Given I have valid employee credentials "empleado1" and "empleado1"
            And I have created a complete product as admin with name "Protected Product", description "Protected", category "Secure", price 100.0, and quantity 15
            When I attempt to delete the product as employee
            Then the deletion should fail with forbidden error
            And the response status should be 403

          Scenario: Successfully update product as employee
            Given I have valid employee credentials "empleado1" and "empleado1"
            And I have created a complete product as admin with name "Employee Update Product", description "Employee test", category "Office", price 100.0, and quantity 20
            When I update the product as employee with name "Employee Updated", description "Updated by employee", category "Office Supplies", price 120.0, and quantity 25
            Then the product should be updated successfully
            And the response status should be 200

          Scenario: Create product with invalid data - empty name
            When I attempt to create a product with empty name "", description "Valid description", category "Valid", price 100.0, and quantity 10
            Then the product creation should fail with validation error
            And the response status should be 400

          Scenario: Create product with invalid data - negative price
            When I attempt to create a product with name "Valid Product", description "Valid description", category "Valid", price -10.0, and quantity 10
            Then the product creation should fail with validation error
            And the response status should be 400

          Scenario: Create product with invalid data - negative quantity
            When I attempt to create a product with name "Valid Product", description "Valid description", category "Valid", price 100.0, and quantity -5
            Then the product creation should fail with validation error
            And the response status should be 400