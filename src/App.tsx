import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.tsx';
import { ThemeProvider } from './context/ThemeProvider.tsx';
import AppRoutes from './routes/AppRoutes.tsx';
import './styles/global.css';

/**
 * App Component
 * Root application component with providers and routing
 */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
              <div className="loading"></div>
            </div>
          }>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
