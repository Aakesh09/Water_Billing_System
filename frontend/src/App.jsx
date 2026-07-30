import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aquatrack_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('aquatrack_user');
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={(userData) => setUser(userData)} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}