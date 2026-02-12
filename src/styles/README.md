# CSMS Visual Design System

This directory contains the Visual Design System for the Coffee Shop Management System (CSMS). The design system provides a cohesive set of colors, typography, and styling rules applied across the application.

## Files

- **variables.css** - CSS custom properties (variables) for colors, typography, spacing, and more
- **global.css** - Global styles, resets, and base element styling
- **theme.css** - Theme-specific components and patterns

## Color Palette

### Primary Colors
- **Coffee Bean Brown** (`#4B3621`) - Headers, navigation, primary text
- **Creamy White** (`#FDFBF7`) - Background color to reduce eye strain
- **Vibrant Orange** (`#FF9F43`) - Primary buttons and call-to-action elements
- **Peach Gradient** (`#FFCBA4`) - Hero sections and highlights

### Functional Colors
- **Natural Green** (`#2ECC71`) - Success states and positive metrics
- **Alert Red** (`#E74C3C`) - Errors, warnings, and critical alerts
- **Warning** (`#f59e0b`) - Warning states
- **Info** (`#3b82f6`) - Informational messages

## Typography

### Font Families
- **Headings**: Montserrat (Bold/ExtraBold)
  - Imported from Google Fonts
  - Used for all h1-h6 elements
  - Page titles at 32px (h4)
  
- **Body Text**: Nunito or Roboto (Regular)
  - Imported from Google Fonts
  - Used for all body text
  - Base size: 14-16px

### Font Sizes
```css
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 24px
--font-size-2xl: 32px  /* Page titles */
--font-size-3xl: 40px
--font-size-4xl: 48px
--font-size-5xl: 56px
```

### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

## Icons

The application uses **Phosphor Icons** for a consistent, thin, and rounded icon style.

### Installation
```bash
npm install phosphor-react
```

### Usage
```jsx
import { HomeIcon, UserIcon } from '@/utils/icons';

<HomeIcon size={24} weight="regular" />
```

### Icon Weights
- `thin` - Very thin stroke
- `light` - Light stroke
- `regular` - Default, thin rounded style (recommended)
- `bold` - Bold stroke
- `fill` - Filled icons
- `duotone` - Two-tone icons

## CSS Variables

### Accessing Variables
All CSS variables are prefixed with `--` and can be used in any CSS file:

```css
.my-component {
  color: var(--color-coffee-brown);
  background-color: var(--color-creamy-white);
  font-family: var(--font-family-heading);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
}
```

### Semantic Color Variables
```css
--color-primary: var(--color-coffee-brown)
--color-accent: var(--color-vibrant-orange)
--color-background: var(--color-creamy-white)
--color-text-primary: var(--color-coffee-brown)
--color-success: var(--color-natural-green)
--color-error: var(--color-alert-red)
```

### Spacing Scale
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

### Border Radius
```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px
```

## Utility Classes

### Buttons
```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary">Secondary Action</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-error">Delete</button>
```

### Cards
```html
<div class="card">
  <div class="card-header">Card Title</div>
  <p>Card content goes here</p>
</div>
```

### Status Labels
```html
<span class="status-label success">Active</span>
<span class="status-label warning">Pending</span>
<span class="status-label error">Inactive</span>
```

### Badges
```html
<span class="badge badge-success">New</span>
<span class="badge badge-primary">Featured</span>
<span class="badge badge-error">Out of Stock</span>
```

### Alerts
```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-error">Error message</div>
<div class="alert alert-info">Info message</div>
```

### Product Images
```html
<img src="product.jpg" class="product-image" alt="Product" />
```

### Hero Section
```html
<div class="hero-section">
  <h1>Welcome to CSMS</h1>
  <p>Streamline your coffee shop operations</p>
  <button class="btn btn-primary">Get Started</button>
</div>
```

## Layout Components

### Page Structure
```html
<div class="page-container">
  <header class="page-header">
    <h1 class="page-title">Page Title</h1>
  </header>
  <main class="page-content">
    <!-- Page content -->
  </main>
</div>
```

### Navigation
```html
<nav class="nav-menu">
  <a href="/" class="nav-item active">
    <HomeIcon size={20} />
    <span>Dashboard</span>
  </a>
  <a href="/orders" class="nav-item">
    <OrderIcon size={20} />
    <span>Orders</span>
  </a>
</nav>
```

### Dashboard Metrics
```html
<div class="metric-card success">
  <div class="metric-value">$12,345</div>
  <div class="metric-label">Monthly Revenue</div>
  <div class="metric-trend positive">
    <TrendUpIcon size={16} />
    <span>+12.5%</span>
  </div>
</div>
```

### Tables
```html
<div class="table-container">
  <div class="table-header">
    <h2 class="table-title">Products</h2>
    <div class="table-actions">
      <button class="btn btn-primary">Add Product</button>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Price</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <!-- Table rows -->
    </tbody>
  </table>
</div>
```

### Modals
```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">Modal Title</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <!-- Modal content -->
    </div>
  </div>
</div>
```

### Forms
```html
<div class="form-group">
  <label class="form-label">Product Name</label>
  <input type="text" class="form-input" placeholder="Enter product name" />
  <div class="form-help">This will be displayed to customers</div>
</div>

<div class="form-group">
  <label class="form-label">Description</label>
  <textarea class="form-textarea" rows="4"></textarea>
  <div class="form-error">This field is required</div>
</div>
```

## Responsive Design

The design system includes responsive breakpoints:

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

All components automatically adapt to different screen sizes using CSS media queries.

## Best Practices

1. **Always use CSS variables** instead of hardcoded values
2. **Use semantic color names** (e.g., `--color-primary` instead of `--color-coffee-brown`)
3. **Apply utility classes** for common patterns instead of writing custom CSS
4. **Use Phosphor Icons** with `weight="regular"` for consistency
5. **Follow the spacing scale** for consistent padding and margins
6. **Use Montserrat for headings** and Nunito/Roboto for body text
7. **Apply uppercase styling** to table headers and status labels
8. **Use rounded corners** on product images with light backgrounds

## Importing Styles

To use the design system in your components:

```jsx
// In your main App.jsx or index.jsx
import './styles/theme.css';

// Or import individual files
import './styles/variables.css';
import './styles/global.css';
```

The `theme.css` file automatically imports both `variables.css` and `global.css`, so you only need to import `theme.css` in most cases.

## Customization

To customize the design system:

1. Edit `variables.css` to change colors, fonts, spacing, etc.
2. Add new utility classes to `global.css`
3. Add new component patterns to `theme.css`

All changes will automatically propagate throughout the application.
