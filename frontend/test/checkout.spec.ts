// Test script for Nana Pastry Cart and Checkout Functionality

import { test, expect } from '@playwright/test';

// User credentials for testing
const USERS = {
  customer: {
    email: 'customer@example.com',
    password: 'testpassword',
    role: 'customer'
  },
  baker: {
    email: 'baker@example.com',
    password: 'testpassword',
    role: 'baker'
  },
  admin: {
    email: 'admin@example.com',
    password: 'testpassword',
    role: 'admin'
  }
};

// Product IDs for testing
const TEST_CAKE_ID = 'chocolate-cake-1';

// Test for guest user
test('Guest user can add items to cart and complete checkout', async ({ page }) => {
  // Navigate to the product page
  await page.goto(`/products/${TEST_CAKE_ID}`);
  
  // Add the item to cart
  await page.click('button:has-text("Add to Cart")');
  
  // Wait for success notification
  await page.waitForSelector('text=Added to cart');
  
  // Go to cart
  await page.click('a[href="/cart"]');
  
  // Verify item is in cart
  await expect(page.locator('.cart-item')).toBeVisible();
  
  // Proceed to checkout
  await page.click('a:has-text("Proceed to Checkout")');
  
  // Fill customer info
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="email"]', 'johndoe@example.com');
  await page.fill('input[name="phone"]', '555-123-4567');
  await page.fill('input[name="address"]', '123 Main St');
  await page.fill('input[name="city"]', 'Anytown');
  await page.fill('input[name="state"]', 'CA');
  await page.fill('input[name="zipCode"]', '12345');
  await page.click('button:has-text("Continue")');
  
  // Select delivery method (pickup)
  await page.click('input[name="method"][value="pickup"]');
  await page.fill('input[name="pickupDate"]', '2025-05-20');
  await page.selectOption('select[name="pickupTime"]', '10:00 AM');
  await page.click('button:has-text("Continue")');
  
  // Payment
  await page.click('input[name="method"][value="cash"]');
  await page.click('button:has-text("Complete Order")');
  
  // Verify order confirmation
  await expect(page.locator('text=Thank you for your order')).toBeVisible();
  
  // Verify prompt to create account appears
  await expect(page.locator('text=Create an account to track your orders')).toBeVisible();
});

// Test for registered customer
test('Registered customer can complete checkout with saved info', async ({ page }) => {
  // Login
  await page.goto('/auth');
  await page.fill('input[name="email"]', USERS.customer.email);
  await page.fill('input[name="password"]', USERS.customer.password);
  await page.click('button:has-text("Sign In")');
  
  // Navigate to product and add to cart
  await page.goto(`/products/${TEST_CAKE_ID}`);
  await page.click('button:has-text("Add to Cart")');
  await page.click('a[href="/cart"]');
  await page.click('a:has-text("Proceed to Checkout")');
  
  // Verify customer info is prefilled
  await expect(page.locator('input[name="email"]')).toHaveValue(USERS.customer.email);
  
  // Continue with checkout
  await page.click('button:has-text("Continue")');
  
  // Delivery options
  await page.click('input[name="method"][value="pickup"]');
  await page.fill('input[name="pickupDate"]', '2025-05-20');
  await page.selectOption('select[name="pickupTime"]', '10:00 AM');
  await page.click('button:has-text("Continue")');
  
  // Payment
  await page.click('input[name="method"][value="cash"]');
  await page.click('button:has-text("Complete Order")');
  
  // Verify order confirmation
  await expect(page.locator('text=Thank you for your order')).toBeVisible();
  
  // Verify account prompt doesn't appear for logged-in user
  await expect(page.locator('text=Create an account to track your orders')).not.toBeVisible();
  
  // Check order history
  await page.goto('/account?tab=orders');
  await expect(page.locator('.order-item')).toBeVisible();
});

// Test for baker
test('Baker can complete checkout and view orders', async ({ page }) => {
  // Login as baker
  await page.goto('/auth');
  await page.fill('input[name="email"]', USERS.baker.email);
  await page.fill('input[name="password"]', USERS.baker.password);
  await page.click('button:has-text("Sign In")');
  
  // Complete checkout
  await page.goto(`/products/${TEST_CAKE_ID}`);
  await page.click('button:has-text("Add to Cart")');
  await page.click('a[href="/cart"]');
  await page.click('a:has-text("Proceed to Checkout")');
  await page.click('button:has-text("Continue")');
  
  // Delivery options
  await page.click('input[name="method"][value="pickup"]');
  await page.fill('input[name="pickupDate"]', '2025-05-20');
  await page.selectOption('select[name="pickupTime"]', '10:00 AM');
  await page.click('button:has-text("Continue")');
  
  // Payment
  await page.click('input[name="method"][value="cash"]');
  await page.click('button:has-text("Complete Order")');
  
  // Check baker portal
  await page.goto('/baker-portal/available-orders');
  await expect(page.locator('.order-item')).toBeVisible();
});

// Test for admin
test('Admin can complete checkout and manage orders', async ({ page }) => {
  // Login as admin
  await page.goto('/auth');
  await page.fill('input[name="email"]', USERS.admin.email);
  await page.fill('input[name="password"]', USERS.admin.password);
  await page.click('button:has-text("Sign In")');
  
  // Complete checkout
  await page.goto(`/products/${TEST_CAKE_ID}`);
  await page.click('button:has-text("Add to Cart")');
  await page.click('a[href="/cart"]');
  await page.click('a:has-text("Proceed to Checkout")');
  await page.click('button:has-text("Continue")');
  
  // Delivery options
  await page.click('input[name="method"][value="pickup"]');
  await page.fill('input[name="pickupDate"]', '2025-05-20');
  await page.selectOption('select[name="pickupTime"]', '10:00 AM');
  await page.click('button:has-text("Continue")');
  
  // Payment
  await page.click('input[name="method"][value="cash"]');
  await page.click('button:has-text("Complete Order")');
  
  // Check admin portal
  await page.goto('/admin-portal/orders');
  await expect(page.locator('.order-item')).toBeVisible();
  
  // Verify admin can update order status
  await page.click('.order-item');
  await page.selectOption('select[name="status"]', 'confirmed');
  await page.click('button:has-text("Update Status")');
  await expect(page.locator('text=Order status updated')).toBeVisible();
});
