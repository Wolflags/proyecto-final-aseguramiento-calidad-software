Feature: Product Creation
  As a user
  I want to create products
  So that I can manage the inventory

  Scenario: Successfully create a product with valid authentication
    Given I have valid user credentials "admin1" and "admin1"
    When I create a product with name "Test Product" and price 100.0
    Then the product should be created successfully
    And the response status should be 201

  Scenario: Fail to create a product with invalid authentication
    Given I have invalid user credentials "invaliduser" and "wrongpass"
    When I attempt to create a product with name "Test Product" and price 100.0
    Then the product creation should fail
    And I should receive an authentication error