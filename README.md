# CSMS Frontend - Coffee Shop Management System

A modern, responsive React application for managing coffee shop operations including inventory, orders, employees, and financial reporting.

## Features

- **Dashboard**: Real-time business metrics and quick stats
- **Inventory Management**: Products and ingredients tracking
- **Employee Management**: Staff profiles, attendance, and salary
- **Order Processing**: Order creation and status tracking
- **Reports**: Daily reports and transaction logs
- **Admin Panel**: User and role management
- **Finance**: Salary payouts and financial overview

## Tech Stack

- React 18 with Hooks
- React Router for navigation
- Vite for build tooling
- Pure CSS (no external UI libraries)
- PropTypes for runtime validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/              # API communication layer
├── components/       # Reusable UI components
├── context/          # Global state management
├── features/         # Feature-specific components
├── hooks/            # Custom React hooks
├── pages/            # Top-level page components
├── routes/           # Routing configuration
├── styles/           # Global CSS
└── utils/            # Utility functions
```

## Design System

- **Color Palette**: Black (#000000), Dark Gold (#B8860B), Pastel Gray (#D3D3D3), Indigo (#2F4F4F)
- **Typography**: Bold titles (32-56px), Body text (16-18px)
- **Responsive**: Optimized for laptop (1024px+) with mobile fallback

