# Salary Updated History Implementation Plan

## Current Status
❌ **NOT IMPLEMENTED** - No code references to `salary_updated_history` table found in frontend

## Database Table (Assumed Structure)
```sql
CREATE TABLE salary_updated_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  salary_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  field_updated VARCHAR(50) NOT NULL,  -- e.g., 'base_salary', 'bonus', 'deductions'
  old_value DECIMAL(10,2),
  new_value DECIMAL(10,2),
  updated_by BIGINT NOT NULL,  -- ID of user who made the change
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,  -- Optional reason for the change
  FOREIGN KEY (salary_id) REFERENCES salaries(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

## Use Cases

### 1. **Audit Trail**
- Track all changes to salary records
- Who changed what and when
- Previous values vs new values

### 2. **Compliance**
- Required for financial auditing
- Prove salary adjustments are legitimate
- Track unauthorized changes

### 3. **Dispute Resolution**
- Employee questions about salary changes
- Show history of adjustments
- Provide transparency

## Implementation Plan

### Phase 1: Backend API (Required First)
**Backend team needs to implement:**

1. **Get Salary History**
   ```
   GET /api/salaries/{id}/history
   Response: Array of salary_updated_history records
   ```

2. **Auto-record on Salary Update**
   - When `PATCH /api/salaries/{id}/adjustments` is called
   - Automatically create history record
   - Include: old values, new values, updated_by (from auth token)

### Phase 2: Frontend Implementation

#### A. Create API Client Function
**File**: `src/api/salaryApi.jsx`
```javascript
// Get salary update history
export const getSalaryHistory = (salaryId) => {
  return apiClient.get(`/salaries/${salaryId}/history`);
};
```

#### B. Add History Modal Component
**File**: `src/components/common/SalaryHistoryModal/index.jsx`
```javascript
/**
 * SalaryHistoryModal Component
 * Displays audit trail of salary changes
 */
const SalaryHistoryModal = ({ salaryId, employeeName, isOpen, onClose }) => {
  const { data: history, loading } = useApiQuery(
    () => getSalaryHistory(salaryId),
    {},
    [salaryId, isOpen]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Salary History - ${employeeName}`}>
      <div className="history-timeline">
        {history?.map(record => (
          <div key={record.id} className="history-item">
            <div className="history-header">
              <span className="field-name">{record.fieldUpdated}</span>
              <span className="timestamp">{formatDateTime(record.updatedAt)}</span>
            </div>
            <div className="history-changes">
              <span className="old-value">{formatCurrency(record.oldValue)}</span>
              <span className="arrow">→</span>
              <span className="new-value">{formatCurrency(record.newValue)}</span>
            </div>
            <div className="history-meta">
              <span>Updated by: {record.updatedByName}</span>
              {record.reason && <p className="reason">{record.reason}</p>}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
```

#### C. Add History Button to Finance Page
**File**: `src/pages/FinancePage.jsx`

In the salary table, add "History" button:
```javascript
<Button 
  variant="ghost" 
  size="small"
  onClick={() => handleViewHistory(salary)}
>
  History
</Button>
```

#### D. Update Edit Salary Form
Add "Reason for adjustment" field:
```javascript
<div className="form-group">
  <label>Reason for Adjustment</label>
  <textarea
    value={editFormData.reason}
    onChange={(e) => setEditFormData({...editFormData, reason: e.target.value})}
    placeholder="Explain why you're adjusting this salary..."
  />
</div>
```

Send reason to backend when updating:
```javascript
await updateSalaryAdjustments(editingSalary.id, {
  bonus: parseFloat(editFormData.bonus),
  deductions: parseFloat(editFormData.deductions),
  reason: editFormData.reason  // New field
});
```

### Phase 3: UI/UX Enhancements

1. **History Icon Indicator**
   - Show icon next to salaries that have been modified
   - Badge with number of changes

2. **Quick Preview**
   - Hover tooltip showing last change
   - Click for full history modal

3. **Filter/Search**
   - Filter history by field updated
   - Search by updated_by user
   - Date range filter

## Required Backend Changes Summary

1. ✅ Create `salary_updated_history` table
2. ✅ Auto-record history on salary updates
3. ✅ GET endpoint: `/api/salaries/{id}/history`
4. ✅ Include `updatedByName` in response (join with users table)
5. ✅ Accept `reason` field in PATCH request body

## Estimated Time
- Backend: 4-6 hours
- Frontend: 6-8 hours
- Testing: 2-3 hours
- **Total**: ~12-17 hours

## Priority: Medium-High
This is important for:
- Financial auditing
- Compliance requirements
- Preventing salary disputes
- Accountability

## Notes
- Backend must be implemented FIRST
- Frontend cannot proceed without API endpoints
- Consider adding permissions (only ADMIN/MANAGER can view full history)
