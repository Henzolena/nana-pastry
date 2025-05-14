#!/bin/bash

# Checkout Flow Test Script for Nana Pastry
# This script helps test the checkout flow for different user types

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   NANA PASTRY CHECKOUT FLOW TEST SCRIPT - v1.1    ${NC}"
echo -e "${BLUE}====================================================${NC}"

echo -e "\n${GREEN}This script guides you through testing the checkout flow for both guest and registered users.${NC}\n"

echo -e "${YELLOW}BEFORE RUNNING TESTS:${NC}"
echo -e "1. Make sure the development server is running"
echo -e "2. Clear browser cookies or use incognito mode for guest user tests"
echo -e "3. Have test accounts ready for the registered user tests\n"

test_guest_checkout() {
  echo -e "\n${BLUE}============== GUEST USER CHECKOUT TEST ==============${NC}"
  echo -e "${YELLOW}Test Steps:${NC}"
  
  echo -e "1. Open the website in incognito/private mode to ensure you're not logged in"
  echo -e "2. Add products to cart from the products page or details page"
  echo -e "3. Click the cart icon and proceed to checkout"
  echo -e "4. Complete the customer information form with name, email, etc."
  echo -e "5. Select delivery method (pickup or delivery) and provide required details"
  echo -e "6. Select payment method (credit card or cash on delivery)"
  echo -e "7. Complete the order process"
  
  echo -e "\n${YELLOW}Expected Results:${NC}"
  echo -e "✓ Order confirmation page should show correctly"
  echo -e "✓ A 'Create an account' prompt should be visible"
  echo -e "✓ The cart should be empty after order completion"
  echo -e "✓ Order details page should be accessible via the confirmation page link"
  echo -e "✓ No authentication required to view the specific order"
  
  echo -e "\n${YELLOW}Test Questions:${NC}"
  read -p "Did the guest checkout flow complete successfully? (y/n): " guest_success
  read -p "Was a 'Create an account' prompt visible? (y/n): " account_prompt
  read -p "Could you view order details without signing in? (y/n): " view_order
  
  echo -e "\n${YELLOW}Guest Checkout Results:${NC}"
  [[ "$guest_success" == "y" ]] && echo -e "✓ Guest checkout: ${GREEN}PASS${NC}" || echo -e "✗ Guest checkout: ${RED}FAIL${NC}"
  [[ "$account_prompt" == "y" ]] && echo -e "✓ Account prompt: ${GREEN}PASS${NC}" || echo -e "✗ Account prompt: ${RED}FAIL${NC}"
  [[ "$view_order" == "y" ]] && echo -e "✓ View order details: ${GREEN}PASS${NC}" || echo -e "✗ View order details: ${RED}FAIL${NC}"
}

test_registered_checkout() {
  echo -e "\n${BLUE}=========== REGISTERED USER CHECKOUT TEST ===========${NC}"
  echo -e "${YELLOW}Test Steps:${NC}"
  
  echo -e "1. Sign in with a registered customer account"
  echo -e "   Test Email: customer@example.com"
  echo -e "   Password: testpassword"
  echo -e "2. Add products to cart from the products page or details page"
  echo -e "3. Click the cart icon and proceed to checkout"
  echo -e "4. Verify customer information is pre-filled from your account"
  echo -e "5. Select delivery method and provide required details"
  echo -e "6. Select payment method"
  echo -e "7. Complete the order process"
  
  echo -e "\n${YELLOW}Expected Results:${NC}"
  echo -e "✓ Customer information form should be pre-filled with account details"
  echo -e "✓ Order confirmation page should NOT show 'Create an account' prompt"
  echo -e "✓ Order details should be accessible from Account > Orders page"
  echo -e "✓ The cart should be empty after order completion"
  echo -e "✓ Same cart should be available across multiple devices (cart persistence)"
  
  echo -e "\n${YELLOW}Test Questions:${NC}"
  read -p "Was customer information pre-filled from account? (y/n): " prefilled
  read -p "Did the registered user checkout flow complete successfully? (y/n): " reg_success
  read -p "Was the order visible in your account order history? (y/n): " order_history
  
  echo -e "\n${YELLOW}Registered User Checkout Results:${NC}"
  [[ "$prefilled" == "y" ]] && echo -e "✓ Pre-filled info: ${GREEN}PASS${NC}" || echo -e "✗ Pre-filled info: ${RED}FAIL${NC}"
  [[ "$reg_success" == "y" ]] && echo -e "✓ Registered checkout: ${GREEN}PASS${NC}" || echo -e "✗ Registered checkout: ${RED}FAIL${NC}"
  [[ "$order_history" == "y" ]] && echo -e "✓ Order history: ${GREEN}PASS${NC}" || echo -e "✗ Order history: ${RED}FAIL${NC}"
}

test_cart_persistence() {
  echo -e "\n${BLUE}============== CART PERSISTENCE TEST ================${NC}"
  echo -e "${YELLOW}Test Steps:${NC}"
  
  echo -e "1. Sign in with a registered account in your main browser"
  echo -e "2. Add some products to your cart"
  echo -e "3. Without checking out, open a different browser or device"
  echo -e "4. Sign in with the same account"
  
  echo -e "\n${YELLOW}Expected Results:${NC}"
  echo -e "✓ Cart items should be synchronized between devices/browsers"
  echo -e "✓ Changes to cart on one device should be reflected on others"
  
  echo -e "\n${YELLOW}Test Questions:${NC}"
  read -p "Did the cart items sync between devices/browsers? (y/n): " cart_sync
  read -p "Were cart updates reflected across devices? (y/n): " cart_updates
  
  echo -e "\n${YELLOW}Cart Persistence Results:${NC}"
  [[ "$cart_sync" == "y" ]] && echo -e "✓ Cart sync: ${GREEN}PASS${NC}" || echo -e "✗ Cart sync: ${RED}FAIL${NC}"
  [[ "$cart_updates" == "y" ]] && echo -e "✓ Cart updates: ${GREEN}PASS${NC}" || echo -e "✗ Cart updates: ${RED}FAIL${NC}"
}

# Menu for selecting which tests to run
echo -e "${YELLOW}Select which test(s) to run:${NC}"
echo -e "1) Guest User Checkout Test"
echo -e "2) Registered User Checkout Test"
echo -e "3) Cart Persistence Test"
echo -e "4) Run All Tests"
echo -e "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
  1) test_guest_checkout ;;
  2) test_registered_checkout ;;
  3) test_cart_persistence ;;
  4)
    test_guest_checkout
    test_registered_checkout
    test_cart_persistence
    ;;
  5) echo -e "\n${BLUE}Exiting test script.${NC}"; exit 0 ;;
  *) echo -e "\n${RED}Invalid choice.${NC}"; exit 1 ;;
esac

echo -e "\n${BLUE}===================================================${NC}"
echo -e "${GREEN}Test script completed. Please report any failures or issues to the development team.${NC}"
echo -e "${BLUE}===================================================${NC}"
