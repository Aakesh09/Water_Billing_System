import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 3rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplets size={28} color="#0284c7" />
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0284c7' }}>AquaTrack</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" style={{ padding: '8px 20px', border: '1px solid #0284c7', color: '#0284c7', textDecoration: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem' }}>
            Login
          </Link>
          <Link to="/register" style={{ padding: '8px 20px', backgroundColor: '#0284c7', color: '#ffffff', textDecoration: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem' }}>
            Register
          </Link>
        </div>
      </header>

      {/* Main Hero Banner */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ padding: '20px', backgroundColor: '#e0f2fe', borderRadius: '50%', marginBottom: '2rem' }}>
          <Droplets size={48} color="#0284c7" />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', maxWidth: '800px', margin: '0 0 1rem 0', lineHeight: '1.2' }}>
          Smart Water Usage & Consumer Billing System
        </h1>

        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#475569', maxWidth: '650px', margin: '0 0 2.5rem 0', lineHeight: '1.6' }}>
          "Water is our most vital resource — track every drop, eliminate leaks, and build a sustainable future with absolute transparency."
        </p>

        <Link to="/login" style={{ padding: '14px 36px', backgroundColor: '#0284c7', color: '#ffffff', textDecoration: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '1rem', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' }}>
          Get Started
        </Link>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
        © 2026 AquaTrack. All rights reserved.
      </footer>
    </div>
  );
}