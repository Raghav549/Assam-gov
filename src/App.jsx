// ============================================
// MAIN APP COMPONENT (FULLY FIXED)
// ============================================

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';

import AppRoutes from './AppRoutes';

import './styles/global.css';
import './styles/animations.css';
import './styles/responsive.css';

function App() {

return (

<Router>

  <AuthProvider>

    <div
      className="antialiased text-gray-900 bg-gray-50 min-h-screen"
      style={{
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}
    >

      {/* TOAST NOTIFICATIONS */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,

          style: {
            background: '#ffffff',
            color: '#363636',
            borderRadius: '14px',
            padding: '14px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow:
              '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          },

          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },

          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* MAIN ROUTES */}
      <div
        style={{
          width: '100%',
          overflowX: 'hidden'
        }}
      >
        <AppRoutes />
      </div>

    </div>

  </AuthProvider>

</Router>

);
}

export default App;
