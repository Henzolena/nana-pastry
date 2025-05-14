#!/bin/bash

# This script guides through manual testing of the cart and checkout functionality for each user type

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}      NANA PASTRY CART & CHECKOUT TEST GUIDE      ${NC}"
echo -e "${BLUE}===================================================${NC}"

echo -e "\n${YELLOW}This guide will help you manually test the cart and checkout functionality for each user type.${NC}\n"

# Guest User Test
echo -e "${GREEN}======= GUEST USER TEST =======${NC}"
echo -e "${YELLOW}1. Open a private/incognito window to ensure you're not logged in${NC}"
echo -e "2. Browse to a product page and add the item to cart"
echo -e "3. Verify the item appears in the cart"
echo -e "4. Proceed to checkout"
echo -e "5. Fill in customer information and continue"
echo -e "6. Select delivery method, date, and time and continue"
echo -e "7. Choose payment method and complete order"
echo -e "8. Verify order confirmation page shows correctly"
echo -e "9. Verify 'Create an account' prompt appears"
echo -e "10. Verify cart is now empty"

read -p "Press Enter after completing Guest User Test..."

# Registered Customer Test
echo -e "\n${GREEN}======= REGISTERED CUSTOMER TEST =======${NC}"
echo -e "${YELLOW}1. Log in as a registered customer${NC}"
echo -e "   * Email: customer@example.com"
echo -e "   * Password: testpassword"
echo -e "2. Browse to a product page and add the item to cart"
echo -e "3. Verify the item appears in the cart"
echo -e "4. Proceed to checkout"
echo -e "5. Verify customer information is pre-filled"
echo -e "6. Complete checkout process"
echo -e "7. Verify order confirmation page (no 'Create an account' prompt)"
echo -e "8. Navigate to Account > Orders"
echo -e "9. Verify the new order appears in order history"

read -p "Press Enter after completing Registered Customer Test..."

# Baker User Test
echo -e "\n${GREEN}======= BAKER USER TEST =======${NC}"
echo -e "${YELLOW}1. Log in as a baker${NC}"
echo -e "   * Email: baker@example.com"
echo -e "   * Password: testpassword"
echo -e "2. Add items to cart and complete checkout"
echo -e "3. Verify order confirmation"
echo -e "4. Navigate to Baker Portal"
echo -e "5. Check if baker can access order information"
echo -e "6. Verify baker-specific permissions"

read -p "Press Enter after completing Baker User Test..."

# Admin User Test
echo -e "\n${GREEN}======= ADMIN USER TEST =======${NC}"
echo -e "${YELLOW}1. Log in as an admin${NC}"
echo -e "   * Email: admin@example.com"
echo -e "   * Password: testpassword"
echo -e "2. Add items to cart and complete checkout"
echo -e "3. Verify order confirmation"
echo -e "4. Navigate to Admin Portal"
echo -e "5. Verify admin can see all orders"
echo -e "6. Test order management functionality (update status, etc.)"

read -p "Press Enter after completing Admin User Test..."

echo -e "\n${GREEN}============== TEST SUMMARY ==============${NC}"
echo -e "For each user type, please report test results:"

# Guest User summary
echo -e "\n${YELLOW}Guest User:${NC}"
read -p "Was the checkout process successful? (y/n): " guest_checkout
read -p "Did the order confirmation display correctly? (y/n): " guest_confirm
read -p "Did the 'Create account' prompt appear? (y/n): " guest_prompt

# Customer summary
echo -e "\n${YELLOW}Registered Customer:${NC}"
read -p "Did customer info pre-fill correctly? (y/n): " customer_prefill
read -p "Was the checkout process successful? (y/n): " customer_checkout
read -p "Did the order appear in order history? (y/n): " customer_history

# Baker summary
echo -e "\n${YELLOW}Baker:${NC}"
read -p "Was the checkout process successful? (y/n): " baker_checkout
read -p "Could the baker access orders in the baker portal? (y/n): " baker_access

# Admin summary
echo -e "\n${YELLOW}Admin:${NC}"
read -p "Was the checkout process successful? (y/n): " admin_checkout
read -p "Could the admin manage orders properly? (y/n): " admin_manage

echo -e "\n${GREEN}============== RESULTS ==============${NC}"

# Display the results
all_passed=true

# Guest User results
echo -e "\n${YELLOW}Guest User:${NC}"
if [[ $guest_checkout == "y" && $guest_confirm == "y" && $guest_prompt == "y" ]]; then
  echo -e "${GREEN}✅ Guest user checkout process - PASSED${NC}"
else
  echo -e "${RED}❌ Guest user checkout process - FAILED${NC}"
  all_passed=false
fi

# Customer results
echo -e "\n${YELLOW}Registered Customer:${NC}"
if [[ $customer_prefill == "y" && $customer_checkout == "y" && $customer_history == "y" ]]; then
  echo -e "${GREEN}✅ Registered customer checkout process - PASSED${NC}"
else
  echo -e "${RED}❌ Registered customer checkout process - FAILED${NC}"
  all_passed=false
fi

# Baker results
echo -e "\n${YELLOW}Baker:${NC}"
if [[ $baker_checkout == "y" && $baker_access == "y" ]]; then
  echo -e "${GREEN}✅ Baker checkout and access - PASSED${NC}"
else
  echo -e "${RED}❌ Baker checkout and access - FAILED${NC}"
  all_passed=false
fi

# Admin results
echo -e "\n${YELLOW}Admin:${NC}"
if [[ $admin_checkout == "y" && $admin_manage == "y" ]]; then
  echo -e "${GREEN}✅ Admin checkout and management - PASSED${NC}"
else
  echo -e "${RED}❌ Admin checkout and management - FAILED${NC}"
  all_passed=false
fi

# Final results
echo -e "\n${BLUE}===================================================${NC}"
if $all_passed; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED! The cart and checkout functionality is working for all user types.${NC}"
else
  echo -e "${RED}⚠️ SOME TESTS FAILED. Please review the issues and fix them.${NC}"
fi
echo -e "${BLUE}===================================================${NC}"
