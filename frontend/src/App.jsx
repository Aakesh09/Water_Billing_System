import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'register'
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aquatrack_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('aquatrack_user');
    setUser(null);
    setCurrentPage('home');
  };

  // If user is logged in, render the Dashboard directly
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Guest navigation
  switch (currentPage) {
    case 'login':
      return <Login onLogin={(userData) => setUser(userData)} onNavigate={(page) => setCurrentPage(page)} />;
    case 'register':
      return <Register onSwitchToLogin={() => setCurrentPage('login')} />;
    case 'home':
    default:
      return <Home onNavigate={(page) => setCurrentPage(page)} />;
  }
}