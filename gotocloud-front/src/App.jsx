import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Home } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
import InternalDashboard from './pages/InternalDashboard';

const DemoNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 p-1.5 rounded-full shadow-2xl flex items-center gap-2">
      <Link
        to="/"
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === '/'
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
      >
        <Home size={16} />
        Inicio
      </Link>

      <Link
        to="/chat"
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === '/chat'
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
      >
        <MessageSquare size={16} />
        Portal Cliente
      </Link>

      <Link
        to="/dashboard"
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === '/dashboard'
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
      >
        <LayoutDashboard size={16} />
        Intelligence Center
      </Link>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-zinc-950 font-sans text-slate-800">

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<CustomerPortal />} />
          <Route path="/dashboard" element={<InternalDashboard />} />
        </Routes>

      </div>
    </Router>
  );
}