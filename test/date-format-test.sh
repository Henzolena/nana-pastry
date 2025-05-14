#!/bin/bash
# Test script to validate the date formatting functionality

echo "Date Formatting Validation Test"
echo "==============================="

# Run unit tests for date formatters
echo "Running unit tests for formatters..."
npm test src/utils/__tests__/formatters.test.ts

# Verify the tests pass successfully
if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed. Please check the errors."
  exit 1
fi

echo "✅ Unit tests passed."

# Build the app
echo "Building app..."
npm run build

# Verify the build completes successfully
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please check the errors."
  exit 1
fi

echo "✅ Build succeeded."

# Checkout flow test
echo "Testing checkout flow date formatting..."

# Launch the app and test the checkout flow manually
echo "Please manually verify date formatting in the following screens:"
echo "1. Checkout page - Delivery Options form"
echo "2. Order Confirmation page"
echo "3. Order Detail page"
echo "4. Account Orders page"

echo "Validation points:"
echo "- Dates should be consistently formatted across all pages"
echo "- Date validation errors should be clear and helpful"
echo "- Edge cases like null/undefined dates should be handled gracefully"
echo "- Timezone handling should be consistent"

# Done
echo "==============================="
echo "Please follow the instructions above to complete testing."
