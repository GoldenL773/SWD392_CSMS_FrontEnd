# Transaction API Manual Test Guide

This guide provides manual testing steps for verifying the Transaction API endpoints work correctly with the updated paths.

## Prerequisites

1. Backend inventory-service must be running (default: http://localhost:8083)
2. You need a valid authentication token
3. You need at least one ingredient in the database

## Test 1: Create Transaction (POST /api/transactions)

### Using curl:

```bash
curl -X POST http://localhost:8083/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "ingredientId": 1,
    "transactionType": "IMPORT",
    "quantity": 10.5,
    "unitPrice": 5000,
    "transactionDate": "2024-01-15T10:30:00",
    "note": "Test transaction - API path verification"
  }'
```

### Expected Response (201 Created):

```json
{
  "id": 1,
  "ingredientId": 1,
  "ingredientName": "Coffee Beans",
  "transactionType": "IMPORT",
  "quantity": 10.5,
  "unitPrice": 5000,
  "totalValue": 52500,
  "transactionDate": "2024-01-15T10:30:00",
  "note": "Test transaction - API path verification",
  "createdAt": "2024-01-15T10:30:00"
}
```

### Validation:
- ✓ Status code is 201 (Created)
- ✓ Response includes transaction ID
- ✓ Response includes all submitted fields
- ✓ totalValue is calculated correctly (quantity × unitPrice)

---

## Test 2: Get All Transactions (GET /api/transactions)

### Using curl:

```bash
curl -X GET http://localhost:8083/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Response (200 OK):

```json
[
  {
    "id": 1,
    "ingredientId": 1,
    "ingredientName": "Coffee Beans",
    "transactionType": "IMPORT",
    "quantity": 10.5,
    "unitPrice": 5000,
    "totalValue": 52500,
    "transactionDate": "2024-01-15T10:30:00",
    "note": "Test transaction - API path verification",
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

### Validation:
- ✓ Status code is 200 (OK)
- ✓ Response is an array
- ✓ Array contains the transaction created in Test 1
- ✓ All transaction fields are present

---

## Test 3: Get Transactions by Ingredient (GET /api/transactions/ingredient/{id})

### Using curl:

```bash
curl -X GET http://localhost:8083/api/transactions/ingredient/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Response (200 OK):

```json
[
  {
    "id": 1,
    "ingredientId": 1,
    "ingredientName": "Coffee Beans",
    "transactionType": "IMPORT",
    "quantity": 10.5,
    "unitPrice": 5000,
    "totalValue": 52500,
    "transactionDate": "2024-01-15T10:30:00",
    "note": "Test transaction - API path verification",
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

### Validation:
- ✓ Status code is 200 (OK)
- ✓ Response is an array
- ✓ All transactions have ingredientId matching the requested ID
- ✓ Transactions are filtered correctly

---

## Test 4: Validation Error Handling

### Test 4.1: Missing Required Field (ingredientId)

```bash
curl -X POST http://localhost:8083/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "transactionType": "IMPORT",
    "quantity": 10.5
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Ingredient ID is required"
}
```

### Test 4.2: Invalid Quantity (zero or negative)

```bash
curl -X POST http://localhost:8083/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "ingredientId": 1,
    "transactionType": "IMPORT",
    "quantity": 0
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Quantity must be greater than zero"
}
```

### Test 4.3: Missing Transaction Type

```bash
curl -X POST http://localhost:8083/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "ingredientId": 1,
    "quantity": 10.5
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Transaction type is required"
}
```

---

## Test 5: Frontend Integration Test

### Using Browser Console:

1. Open the CSMS frontend application
2. Login with valid credentials
3. Navigate to Inventory page
4. Open browser console (F12)
5. Run the following code:

```javascript
// Import the API functions
import { recordTransaction, getTransactions } from './api/ingredientApi.jsx';

// Test transaction creation
const testData = {
  ingredientId: 1,
  transactionType: 'IMPORT',
  quantity: 10.5,
  unitPrice: 5000,
  transactionDate: new Date().toISOString(),
  note: 'Frontend integration test'
};

// Create transaction
recordTransaction(testData)
  .then(response => {
    console.log('✓ Transaction created:', response);
    return getTransactions();
  })
  .then(transactions => {
    console.log('✓ Transactions retrieved:', transactions);
  })
  .catch(error => {
    console.error('✗ Test failed:', error);
  });
```

### Validation:
- ✓ No console errors
- ✓ Transaction is created successfully
- ✓ Transaction appears in the list
- ✓ API calls use correct paths (/api/transactions)

---

## Test Results Checklist

Mark each test as you complete it:

- [ ] Test 1: Create Transaction - POST /api/transactions
- [ ] Test 2: Get All Transactions - GET /api/transactions
- [ ] Test 3: Get Transactions by Ingredient - GET /api/transactions/ingredient/{id}
- [ ] Test 4.1: Validation - Missing ingredientId
- [ ] Test 4.2: Validation - Invalid quantity
- [ ] Test 4.3: Validation - Missing transactionType
- [ ] Test 5: Frontend Integration Test

---

## Common Issues and Solutions

### Issue: 404 Not Found
**Cause:** Backend controller mapping is incorrect
**Solution:** Verify TransactionController has `@RequestMapping("/api/transactions")`

### Issue: 401 Unauthorized
**Cause:** Missing or invalid authentication token
**Solution:** Login and use a valid JWT token in Authorization header

### Issue: 400 Bad Request - Validation Error
**Cause:** Request data doesn't meet validation requirements
**Solution:** Check that all required fields are present and valid

### Issue: 500 Internal Server Error
**Cause:** Backend service error (database, business logic)
**Solution:** Check backend logs for detailed error information

---

## Success Criteria

All tests pass when:
1. ✓ POST /api/transactions creates transactions successfully (201 Created)
2. ✓ GET /api/transactions retrieves all transactions (200 OK)
3. ✓ GET /api/transactions/ingredient/{id} filters correctly (200 OK)
4. ✓ Validation errors return appropriate 400 responses
5. ✓ Frontend can create and retrieve transactions without errors
6. ✓ No 404 errors indicating incorrect API paths

---

## Notes

- The API path was changed from `/api/ingredients/transactions` to `/api/transactions`
- This fix addresses Requirement 5: Ingredient Transaction API Path
- Tasks 1.1 and 1.2 updated the frontend API client
- Task 1.3 (this test) verifies the changes work correctly
