# CSMS Frontend Implementation Guide

## Project Status

### ✅ Completed (Phase 1-2)

**Project Structure & Setup:**
- ✅ React project initialized with Vite
- ✅ Folder structure following `file-structure.md`
- ✅ All files use `.tsx` extension (universal TSX convention)
- ✅ Package.json with dependencies
- ✅ Global styles and CSS variables (dark mode theme)
- ✅ Utility functions and constants
- ✅ Mock data matching ENTITIES.md

**Core Infrastructure:**
- ✅ Authentication context and provider
- ✅ Theme context and provider
- ✅ Custom hooks (useAuth, useApiQuery)
- ✅ API client with authentication
- ✅ API services (auth, product, ingredient, order, employee, report)
- ✅ Routing with protected routes
- ✅ Role-based access control

**Layout Components:**
- ✅ AppLayout with Header, Sidebar, BottomNav
- ✅ Responsive design (desktop 1024px+, mobile fallback)
- ✅ Navigation with active states
- ✅ User menu and logout

**Common Components:**
- ✅ Button component with variants

**Pages:**
- ✅ LoginPage with authentication
- ✅ DashboardPage with stats and quick actions
- ✅ Stub pages for all routes (Inventory, Employees, Orders, Reports, Admin, Finance, Settings)
- ✅ NotFoundPage

## Installation & Setup

### 1. Install Dependencies

```bash
cd D:\WhyFPT\swd392\code\CSMS\SWD392-CSMS-FrontEnd
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### 3. Login Credentials (Mock)

- **Username:** `admin`, `manager01`, or `staff01`
- **Password:** `password`

## Next Steps (Remaining Implementation)

### Phase 3: Complete Feature Pages

#### 3.1 Inventory Page (`/inventory`)
**Components to create:**
- `src/features/inventory/ProductsTable.tsx` - Display products with CRUD
- `src/features/inventory/IngredientsTable.tsx` - Display ingredients with CRUD
- `src/features/inventory/ProductForm.tsx` - Add/Edit product form
- `src/features/inventory/IngredientForm.tsx` - Add/Edit ingredient form

**Entity mapping:**
- Products: `id`, `name`, `category`, `price`, `status`
- Ingredients: `id`, `name`, `unit`, `quantity`, `pricePerUnit`

#### 3.2 Employees Page (`/employees`)
**Components to create:**
- `src/features/employees/EmployeeCard.tsx` - Employee grid card
- `src/features/employees/EmployeeDetailView.tsx` - Split-screen detail view
- `src/features/employees/AttendanceTable.tsx` - Attendance records
- `src/features/employees/SalaryView.tsx` - Salary information

**Entity mapping:**
- Employee: `id`, `fullName`, `dob`, `gender`, `phone`, `position`, `hireDate`, `status`
- Attendance: `id`, `date`, `checkInTime`, `checkOutTime`, `workingHours`, `status`
- Salary: `id`, `month`, `year`, `baseSalary`, `bonus`, `deduction`, `totalSalary`, `status`

#### 3.3 Orders Page (`/orders`)
**Components to create:**
- `src/features/orders/StatusFilter.tsx` - Filter by order status
- `src/features/orders/OrdersTable.tsx` - Orders table with expandable rows
- `src/features/orders/OrderForm.tsx` - Create new order

**Entity mapping:**
- Order: `id`, `employee`, `orderDate`, `totalAmount`, `status`, `orderItems`
- OrderItem: `id`, `product`, `quantity`, `price`

#### 3.4 Reports Page (`/reports`)
**Components to create:**
- `src/features/reports/DailyReportChart.tsx` - Bar/pie charts using CSS
- `src/features/reports/IngredientTransactionTable.tsx` - Transaction logs
- `src/features/reports/ReportFilters.tsx` - Date range filters

**Entity mapping:**
- DailyReport: `id`, `reportDate`, `totalOrders`, `totalRevenue`, `totalIngredientCost`, `totalWorkingHours`
- IngredientTransaction: `id`, `ingredient`, `employee`, `type`, `quantity`, `transactionDate`

#### 3.5 Admin Page (`/admin`) - Protected
**Components to create:**
- `src/features/admin/EmployeeForm.tsx` - Create/edit employees
- `src/features/admin/UserRoleManager.tsx` - Manage user roles

**Entity mapping:**
- Employee creation/update
- User: `id`, `username`, `roles`
- Role: `id`, `name`

#### 3.6 Finance Page (`/finance`) - Protected
**Components to create:**
- `src/features/finance/FinancialDashboard.tsx` - Financial overview
- `src/features/finance/SalaryPayoutTable.tsx` - Salary management

**Entity mapping:**
- Salary records with employee data
- SalaryUpdatedHistory for audit trail

#### 3.7 Settings Page (`/settings`)
**Components to create:**
- `src/features/settings/ProfileSettings.tsx` - User profile
- `src/features/settings/AuditLog.tsx` - View SalaryUpdatedHistory

### Phase 4: Additional Common Components

Create reusable components in `src/components/common/`:

- **Card** - Container component
- **Table** - Data table with sorting
- **Modal** - Dialog/popup
- **Spinner** - Loading indicator
- **Input** - Form input with validation
- **Select** - Dropdown select
- **DatePicker** - Date selection
- **Badge** - Status badges
- **Tabs** - Tab navigation

### Phase 5: Final Polish

- ✅ Verify all entity fields match ENTITIES.md
- ✅ Add PropTypes to all components
- ✅ Test responsive layouts (laptop, tablet, mobile)
- ✅ Add loading states and error handling
- ✅ Implement keyboard navigation
- ✅ Add hover effects and transitions
- ✅ Test all user flows
- ✅ Fix any console errors

## Design System Reference

### Colors
- **Background:** `#000000` (black)
- **Primary:** `#B8860B` (dark gold)
- **Text Primary:** `#FFFFFF` (white)
- **Text Secondary:** `#D3D3D3` (pastel gray)
- **Surface:** `#1a1a1a`
- **Border:** `#333333`

### Typography
- **Titles:** 32-56px, bold
- **Body:** 16-18px, normal
- **Small:** 12-14px

### Spacing
- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px

### Breakpoints
- **Desktop:** min-width 1024px (sidebar visible)
- **Tablet:** 768px - 1023px
- **Mobile:** max-width 767px (bottom nav visible)

## File Structure Summary

```
src/
├── api/                    # ✅ API services
├── components/
│   ├── common/            # ✅ Button (add more)
│   └── layout/            # ✅ AppLayout, Header, Sidebar, BottomNav
├── context/               # ✅ AuthProvider, ThemeProvider
├── features/              # ⏳ Feature-specific components (to implement)
├── hooks/                 # ✅ useAuth, useApiQuery
├── pages/                 # ✅ All pages created
├── routes/                # ✅ AppRoutes, ProtectedRoute
├── styles/                # ✅ global.css, variables.css
├── utils/                 # ✅ constants, formatters, mockData
├── App.tsx                # ✅ Root component
└── index.tsx              # ✅ Entry point
```

## Development Guidelines

### 1. Entity Field Mapping
Always verify that component props and form fields match ENTITIES.md exactly:
- Use correct field names
- Use correct data types
- Include all required fields
- Handle relationships properly

### 2. Component Structure
```tsx
import React from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

export default ComponentName;
```

### 3. API Integration
Replace mock implementations in API files with actual backend calls:
```tsx
// Current (mock)
return new Promise((resolve) => {
  setTimeout(() => resolve(mockData), 300);
});

// Replace with
return apiClient.get('/endpoint');
```

### 4. Form Validation
Add validation for all forms matching entity constraints:
- Required fields
- Data type validation
- Format validation (email, phone, etc.)
- Min/max values

### 5. Error Handling
Implement proper error handling:
- Display user-friendly error messages
- Handle network errors
- Handle validation errors
- Provide retry mechanisms

## Testing Checklist

- [ ] Login/logout flow
- [ ] Protected routes (redirect if not authenticated)
- [ ] Role-based access (Admin/Finance pages)
- [ ] Navigation (sidebar, bottom nav)
- [ ] Responsive design (desktop, tablet, mobile)
- [ ] Form submissions
- [ ] Data loading states
- [ ] Error states
- [ ] Empty states
- [ ] Keyboard navigation
- [ ] Browser compatibility

## Known Issues / Notes

1. **TypeScript Errors:** The project uses JavaScript in `.tsx` files, so TypeScript errors are expected and won't affect runtime.

2. **Mock Data:** All API calls currently use mock data. Replace with actual backend integration.

3. **PropTypes:** Add PropTypes validation to all components for runtime type checking.

4. **Accessibility:** Add ARIA labels and keyboard support where needed.

5. **Performance:** Consider implementing:
   - Code splitting for routes
   - Memoization for expensive computations
   - Virtual scrolling for large lists
   - Image optimization

## Resources

- **UI Design Reference:** `Rules/frontend/UI-MASTER-PROMPT.md`
- **Feature Checklist:** `Rules/frontend/UI-CHECKLIST.md`
- **Entity Definitions:** `Rules/ENTITIES.md`
- **Folder Structure:** `Rules/file-structure.md`

## Support

For questions or issues:
1. Check entity definitions in ENTITIES.md
2. Review UI design standards in UI-MASTER-PROMPT.md
3. Verify folder structure in file-structure.md
4. Check implementation checklist in UI-CHECKLIST.md
