import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aquatrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('aquatrack_user');
    setUser(null);
  };

  if (!user) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={(userData) => setUser(userData)} onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}