import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importación del Proveedor de Idioma Global
import { LanguageProvider } from './context/LanguageContext';

// Importación de Componentes y Páginas
import DemoNavigation from './components/DemoNavigation';
import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
import InternalDashboard from './pages/InternalDashboard';
import Login from './pages/Login';

// 1. COMPONENTE PROTECTOR DE RUTAS (Faltaba esto en el último paso)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth_token');

  if (!isAuthenticated) {
    // Si no está logueado, lo manda directo al login
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. ENRUTADOR PRINCIPAL
export default function App() {
  return (
    // Envolvemos la app completa con el contexto de traducción
    <LanguageProvider>
      <Router>
        <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100">

          {/* La barra de navegación global inyectada en el Layout superior */}
          <DemoNavigation />

          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<CustomerPortal />} />
            <Route path="/login" element={<Login />} />

            {/* Ruta Privada Protegida */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <InternalDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback por si la ruta no existe */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </div>
      </Router>
    </LanguageProvider>
  );
}