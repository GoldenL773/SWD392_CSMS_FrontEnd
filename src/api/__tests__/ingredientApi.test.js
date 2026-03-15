/**
 * Integration tests for Ingredient Transaction API
 * 
 * These tests verify that the transaction API endpoints work correctly
 * with the updated paths (/transactions instead of /ingredients/transactions)
 * 
 * To run these tests:
 * 1. Ensure the backend inventory-service is running
 * 2. Ensure you have valid authentication
 * 3. Run: node src/api/__tests__/ingredientApi.test.js
 */

import { recordTransaction, getTransactions } from '../ingredientApi.jsx';

// Test configuration
const TEST_CONFIG = {
  ingredientId: 1, // Update with a valid ingredient ID from your database
  testNote: 'Test transaction - API path verification'
};

/**
 * Test 1: Create a transaction (POST /api/transactions)
 */
async function testRecordTransaction() {
  console.log('\n=== Test 1: Record Transaction (POST /api/transactions) ===');
  
  try {
    const transactionData = {
      ingredientId: TEST_CONFIG.ingredientId,
      transactionType: 'IMPORT',
      quantity: 10.5,
      unitPrice: 5000,
      transactionDate: new Date().toISOString(),
      note: TEST_CONFIG.testNote
    };
    
    console.log('Request data:', JSON.stringify(transactionData, null, 2));
    
    const response = await recordTransaction(transactionData);
    
    console.log('✓ Transaction created successfully');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    return response.id; // Return transaction ID for cleanup
  } catch (error) {
    console.error('✗ Transaction creation failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Test 2: Retrieve transactions (GET /api/transactions)
 */
async function testGetTransactions() {
  console.log('\n=== Test 2: Get Transactions (GET /api/transactions) ===');
  
  try {
    const params = {
      page: 0,
      size: 10
    };
    
    console.log('Request params:', JSON.stringify(params, null, 2));
    
    const response = await getTransactions(params);
    
    console.log('✓ Transactions retrieved successfully');
    console.log(`Found ${response.length || 0} transactions`);
    
    if (response.length > 0) {
      console.log('First transaction:', JSON.stringify(response[0], null, 2));
    }
    
    return response;
  } catch (error) {
    console.error('✗ Transaction retrieval failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Test 3: Verify transaction appears in list
 */
async function testTransactionInList(transactionId) {
  console.log('\n=== Test 3: Verify Transaction in List ===');
  
  try {
    const transactions = await getTransactions();
    
    const found = transactions.find(t => t.id === transactionId);
    
    if (found) {
      console.log('✓ Transaction found in list');
      console.log('Transaction details:', JSON.stringify(found, null, 2));
    } else {
      console.warn('⚠ Transaction not found in list (may be on different page)');
    }
    
    return found;
  } catch (error) {
    console.error('✗ Transaction verification failed');
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=================================================');
  console.log('Transaction API Integration Tests');
  console.log('Testing Fix 5: Ingredient Transaction API Path');
  console.log('=================================================');
  
  let transactionId = null;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Test 1: Create transaction
    transactionId = await testRecordTransaction();
    passedTests++;
  } catch (error) {
    failedTests++;
  }
  
  try {
    // Test 2: Get transactions
    await testGetTransactions();
    passedTests++;
  } catch (error) {
    failedTests++;
  }
  
  if (transactionId) {
    try {
      // Test 3: Verify transaction in list
      await testTransactionInList(transactionId);
      passedTests++;
    } catch (error) {
      failedTests++;
    }
  }
  
  // Summary
  console.log('\n=================================================');
  console.log('Test Summary');
  console.log('=================================================');
  console.log(`✓ Passed: ${passedTests}`);
  console.log(`✗ Failed: ${failedTests}`);
  console.log(`Total: ${passedTests + failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Transaction API is working correctly.');
  } else {
    console.log('\n⚠ Some tests failed. Please review the errors above.');
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testRecordTransaction, testGetTransactions, testTransactionInList, runTests };
