import OrderList from "../../src/components/OrderList";
import { Provider } from "react-redux";
import React from "react";
import store from "../../src/js/store/store";
import { searchSlice } from "../../src/js/reducer/rootreducer";

describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/adminlogin");
    cy.get('[data-testid="pagelogin"]').should("exist");
  });

  it("redirects unauthenticated user to /adminlogin", () => {
    cy.visit("http://localhost:3000/dashboard");
    cy.url().should("include", "/adminlogin");
  });

  it("allows access to dashboard for authenticated users", () => {
    localStorage.setItem("sessionId", "fake-valid-token");

    // Intercept the auth check API call
    cy.intercept("GET", "/api/access", {
      statusCode: 200,
      body: { authenticated: true },
    }).as("authCheck");

    cy.visit("http://localhost:3000/dashboard");
    cy.wait("@authCheck"); // Wait specifically for the authCheck call to complete
  });

  it("redirects authenticated users from /adminlogin to /dashboard", () => {
    localStorage.setItem("sessionId", "fake-valid-token");
    

    // Intercept necessary API calls
    cy.intercept("GET", "/api/access", {
      statusCode: 200,
      body: { authenticated: true },
    }).as("authCheck");

    cy.intercept("GET", "/api/orders", {
      statusCode: 200,
     
      body: { orders: [{ id: 1, name: "Order 1" }, { id: 2, name: "Order 2" }] },
    }).as("getorders");

    cy.intercept("POST", "/api/orders", {
      statusCode: 200,
      body: { authenticated: true },
    }).as("POSTorders");

    

    // Visit the page after intercepts are set
    cy.visit("http://localhost:3000/requestlist");


    // Ensure the URL includes '/dashboard' after all API calls are done
    cy.url().should("include", "/dashboard");
  });
});
describe('OrdersDashboard - Real Backend', () => {
  beforeEach(() => {
    // Simulate admin login by setting localStorage values
    cy.visit('http://127.0.0.1:3000/dashboard', {
      onBeforeLoad(win) {
        win.localStorage.setItem('auth_token', 'mock-auth-token');
        win.localStorage.setItem('user_role', 'admin');
        win.localStorage.setItem('user_email', 'admin@example.com');
      }
    });
  });

  it('displays existing orders on the dashboard', () => {
    cy.visit('http://localhost:3000/dashboard');

    // Wait for page and orders to load
    cy.get('.order-list').should('exist');

    // Check for an actual known order in the test database
    cy.contains('.order-list', 'Office Chairs').should('be.visible');
  });
});

describe('OrdersDashboard', () => {
  it('loads mock orders for admin user with token', () => {
    // Mock sign-in for admin user
    cy.mockSignIn('admin');
    
    // Visit the page that will trigger the orders API call
    cy.visit('http://localhost:3000/dashboard');
    
    // Wait for the API call to complete
    cy.wait('@getOrders');
    
    // Verify that the mock data is rendered correctly
    cy.get('.order-list').contains('Office Chairs').should('be.visible');
  });
});

describe('OrdersDashboard Pagination', () => {
  beforeEach(() => {
    // Mock the user context
    cy.mockSignIn('admin');
    cy.stub(window.localStorage, 'getItem').returns(JSON.stringify({ role: 'admin', email: 'admin@example.com' }));
    cy.visit('http://localhost:3000/dashboard');
    // Intercept the API request to return mock data
    cy.intercept('GET', '/api/orders', { fixture: 'orders.json' }).as('getOrders');
    cy.wait('@getOrders');
  });

  it('should navigate to the next page when clicking "Next"', () => {
    cy.get('button').contains('Next ▶').click();
    cy.get('span').contains('Page 2 of 3').should('be.visible');
  });

  it('should navigate to the previous page when clicking "Previous"', () => {
    cy.get('button').contains('Previous ◀').click();
    cy.get('span').contains('Page 1 of 3').should('be.visible');
  });

  it('should disable the "Previous" button on the first page', () => {
    cy.get('button').contains('Previous ◀').should('be.disabled');
  });

  it('should disable the "Next" button on the last page', () => {
    cy.get('button').contains('Next ▶').should('be.disabled');
  });
});


