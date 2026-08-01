import React from 'react';
import { Droplets } from 'lucide-react';

export default function Home({ onNavigate }) {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#ffffff', color: '#1a1a1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 3rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: '700', color: '#0284c7' }}>
          <Droplets size={28} />
          <span>AquaTrack</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => onNavigate('login')} 
            style={{ padding: '8px 22px', border: '1px solid #0284c7', backgroundColor: 'transparent', color: '#0284c7', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            Login
          </button>
          <button 
            onClick={() => onNavigate('register')} 
            style={{ padding: '8px 22px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Center Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
        <div style={{ backgroundColor: '#e0f2fe', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.25rem', color: '#0284c7' }}>
          <Droplets size={48} />
        </div>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.3', margin: '0 0 1rem 0', color: '#0f172a', maxWidth: '850px' }}>
          Smart Water Usage & Consumer Billing System
        </h1>
        
        <blockquote style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: '500', color: '#475569', maxWidth: '620px', margin: '0 0 2rem 0', lineHeight: '1.6' }}>
          "Water is our most vital resource — track every drop, eliminate leaks, and build a sustainable future with absolute transparency."
        </blockquote>
        
        <div>
          <button 
            onClick={() => onNavigate('login')} 
            style={{ padding: '12px 36px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
          >
            Get Started
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
        © 2026 AquaTrack. All rights reserved.
      </footer>
    </div>
  );
}