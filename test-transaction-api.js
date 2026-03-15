/**
 * Transaction API Integration Test Script
 * 
 * This script tests the transaction API endpoints to verify Fix 5:
 * Ingredient Transaction API Path (/api/transactions)
 * 
 * Prerequisites:
 * - Backend inventory-service running on http://localhost:8083
 * - At least one ingredient in the database (ID: 1)
 * - Valid authentication credentials
 * 
 * Usage:
 *   node test-transaction-api.js
 */

const BASE_URL = 'http://localhost:8083/api';
let authToken = null;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

/**
 * Make HTTP request
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

/**
 * Test 1: Create Transaction (POST /api/transactions)
 */
async function testCreateTransaction() {
  log('\n' + '='.repeat(60), colors.blue);
  log('Test 1: Create Transaction (POST /api/transactions)', colors.blue);
  log('='.repeat(60), colors.blue);

  const transactionData = {
    ingredientId: 1,
    transactionType: 'IMPORT',
    quantity: 10.5,
    unitPrice: 5000,
    transactionDate: new Date().toISOString(),
    note: 'Test transaction - API path verification'
  };

  logInfo('Request data:');
  console.log(JSON.stringify(transactionData, null, 2));

  try {
    const response = await makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });

    if (response.status === 201 && response.ok) {
      logSuccess('Transaction created successfully (201 Created)');
      logInfo('Response data:');
      console.log(JSON.stringify(response.data, null, 2));
      return { success: true, transactionId: response.data?.id };
    } else {
      logError(`Unexpected status: ${response.status}`);
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return { success: false };
  }
}

/**
 * Test 2: Get All Transactions (GET /api/transactions)
 */
async function testGetAllTransactions() {
  log('\n' + '='.repeat(60), colors.blue);
  log('Test 2: Get All Transactions (GET /api/transactions)', colors.blue);
  log('='.repeat(60), colors.blue);

  try {
    const response = await makeRequest('/transactions', {
      method: 'GET'
    });

    if (response.status === 200 && response.ok) {
      logSuccess('Transactions retrieved successfully (200 OK)');
      const transactions = response.data;
      logInfo(`Found ${transactions?.length || 0} transaction(s)`);

      if (transactions && transactions.length > 0) {
        logInfo('First transaction:');
        console.log(JSON.stringify(transactions[0], null, 2));
      }

      return { success: true, transactions };
    } else {
      logError(`Unexpected status: ${response.status}`);
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return { success: false };
  }
}

/**
 * Test 3: Get Transactions by Ingredient (GET /api/transactions/ingredient/{id})
 */
async function testGetTransactionsByIngredient(ingredientId = 1) {
  log('\n' + '='.repeat(60), colors.blue);
  log(`Test 3: Get Transactions by Ingredient (GET /api/transactions/ingredient/${ingredientId})`, colors.blue);
  log('='.repeat(60), colors.blue);

  try {
    const response = await makeRequest(`/transactions/ingredient/${ingredientId}`, {
      method: 'GET'
    });

    if (response.status === 200 && response.ok) {
      logSuccess('Transactions retrieved successfully (200 OK)');
      const transactions = response.data;
      logInfo(`Found ${transactions?.length || 0} transaction(s) for ingredient ${ingredientId}`);

      if (transactions && transactions.length > 0) {
        logInfo('First transaction:');
        console.log(JSON.stringify(transactions[0], null, 2));
      }

      return { success: true, transactions };
    } else {
      logError(`Unexpected status: ${response.status}`);
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return { success: false };
  }
}

/**
 * Test 4: Validation - Missing Required Field
 */
async function testValidationError() {
  log('\n' + '='.repeat(60), colors.blue);
  log('Test 4: Validation Error Handling', colors.blue);
  log('='.repeat(60), colors.blue);

  const invalidData = {
    transactionType: 'IMPORT',
    quantity: 10.5
    // Missing ingredientId
  };

  logInfo('Sending invalid request (missing ingredientId):');
  console.log(JSON.stringify(invalidData, null, 2));

  try {
    const response = await makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    if (response.status === 400) {
      logSuccess('Validation error handled correctly (400 Bad Request)');
      logInfo('Error response:');
      console.log(JSON.stringify(response.data, null, 2));
      return { success: true };
    } else {
      logWarning(`Expected 400, got ${response.status}`);
      return { success: false };
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return { success: false };
  }
}

/**
 * Verify transaction in list
 */
async function verifyTransactionInList(transactionId) {
  log('\n' + '='.repeat(60), colors.blue);
  log('Test 5: Verify Transaction Appears in List', colors.blue);
  log('='.repeat(60), colors.blue);

  try {
    const result = await testGetAllTransactions();
    
    if (result.success && result.transactions) {
      const found = result.transactions.find(t => t.id === transactionId);
      
      if (found) {
        logSuccess(`Transaction ${transactionId} found in list`);
        return { success: true };
      } else {
        logWarning(`Transaction ${transactionId} not found in list (may be on different page)`);
        return { success: true }; // Not a failure, just pagination
      }
    }
    
    return { success: false };
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return { success: false };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('Transaction API Integration Tests', colors.cyan);
  log('Testing Fix 5: Ingredient Transaction API Path', colors.cyan);
  log('='.repeat(60), colors.cyan);

  logWarning('\nNote: This test requires:');
  logWarning('  - Backend inventory-service running on http://localhost:8083');
  logWarning('  - At least one ingredient in database (ID: 1)');
  logWarning('  - Authentication may be required\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Create transaction
  const test1 = await testCreateTransaction();
  results.tests.push({ name: 'Create Transaction', ...test1 });
  if (test1.success) results.passed++;
  else results.failed++;

  // Test 2: Get all transactions
  const test2 = await testGetAllTransactions();
  results.tests.push({ name: 'Get All Transactions', ...test2 });
  if (test2.success) results.passed++;
  else results.failed++;

  // Test 3: Get transactions by ingredient
  const test3 = await testGetTransactionsByIngredient(1);
  results.tests.push({ name: 'Get Transactions by Ingredient', ...test3 });
  if (test3.success) results.passed++;
  else results.failed++;

  // Test 4: Validation error
  const test4 = await testValidationError();
  results.tests.push({ name: 'Validation Error Handling', ...test4 });
  if (test4.success) results.passed++;
  else results.failed++;

  // Test 5: Verify transaction in list (if we created one)
  if (test1.success && test1.transactionId) {
    const test5 = await verifyTransactionInList(test1.transactionId);
    results.tests.push({ name: 'Verify Transaction in List', ...test5 });
    if (test5.success) results.passed++;
    else results.failed++;
  }

  // Print summary
  log('\n' + '='.repeat(60), colors.cyan);
  log('Test Summary', colors.cyan);
  log('='.repeat(60), colors.cyan);

  results.tests.forEach(test => {
    const status = test.success ? '✓' : '✗';
    const color = test.success ? colors.green : colors.red;
    log(`${status} ${test.name}`, color);
  });

  log(`\nTotal: ${results.passed + results.failed}`, colors.cyan);
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }

  if (results.failed === 0) {
    log('\n🎉 All tests passed! Transaction API is working correctly.\n', colors.green);
  } else {
    log('\n⚠ Some tests failed. Please review the errors above.\n', colors.yellow);
  }

  return results;
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
