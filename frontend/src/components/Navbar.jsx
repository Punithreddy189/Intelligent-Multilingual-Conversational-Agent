import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { GraduationCap, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        right: '12px',
        height: '64px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        background: 'var(--bg-glass)',
      }}
    >
      {/* Brand Header */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            background: 'var(--gradient-brand)',
            padding: '8px',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <GraduationCap size={22} />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 800,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--color-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          EduMultilingual AI
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/') ? 'var(--color-cyan)' : 'var(--text-secondary)',
            background: isActive('/') ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Home
        </Link>
        <Link
          to="/chat"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/chat') ? 'var(--color-cyan)' : 'var(--text-secondary)',
            background: isActive('/chat') ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Chatbot
        </Link>
        <Link
          to="/resources"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/resources') ? 'var(--color-cyan)' : 'var(--text-secondary)',
            background: isActive('/resources') ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Resources
        </Link>
        <Link
          to="/dashboard"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/dashboard') ? 'var(--color-cyan)' : 'var(--text-secondary)',
            background: isActive('/dashboard') ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Dashboard
        </Link>
        <Link
          to="/about"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/about') ? 'var(--color-cyan)' : 'var(--text-secondary)',
            background: isActive('/about') ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          About
        </Link>
      </div>

      {/* Actions (Auth & Theme) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ThemeToggle />
        
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                background: 'rgba(255,255,255,0.05)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}
            >
              Hi, {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/login"
              className="btn-secondary"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              <LogIn size={14} />
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              <UserPlus size={14} />
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
