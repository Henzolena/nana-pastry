# Testing Plan for Nana Pastry Cart & Checkout

## User Types to Test
1. Guest User (Not logged in)
2. Registered Customer (Role: "customer")
3. Baker (Role: "baker")
4. Admin (Role: "admin")

## Test Scenarios

### 1. Guest User Flow
- Add items to cart as a guest
- Proceed to checkout
- Fill in customer info, delivery details, and payment info
- Complete checkout without logging in
- Verify order confirmation is displayed correctly
- Verify cart is cleared after order completion
- Verify prompt to create account appears on order confirmation page

### 2. Registered Customer Flow
- Log in as a registered customer
- Add items to cart
- Verify customer info is pre-filled from profile
- Complete checkout with saved information
- Verify order is linked to user account
- Verify order appears in order history
- Verify cart maintains state between sessions

### 3. Baker Flow
- Log in as a baker
- Add items to cart
- Complete checkout
- Verify order is linked to baker account
- Verify baker can access orders through baker portal
- Verify baker-specific permissions

### 4. Admin Flow
- Log in as admin
- Add items to cart
- Complete checkout
- Verify admin can see all orders
- Verify admin has appropriate access to order management

## Test Priority
1. Guest User Flow (Most common)
2. Registered Customer Flow
3. Admin Flow
4. Baker Flow
