// src/components/layout/AdminSidebar.jsx
import React from 'react';

export default function AdminSidebar({ isOpen, onToggle, sectionTitle, showLogout, onLogout }) {
  return (
    <aside className={`admin-sidebar ${!isOpen && typeof window !== 'undefined' && window.innerWidth >= 768 ? 'admin-sidebar--collapsed' : ''} ${typeof window !== 'undefined' && window.innerWidth < 768 && !isOpen ? 'admin-sidebar--mobile-closed' : ''}`}>
      <div className="admin-sidebar__header">
        {/* Logo placeholder - using text for now, can be replaced with image */}
        <div className="admin-sidebar__logo" aria-hidden="true">JU</div>
        <div className="admin-sidebar__title">Junda Admin</div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        <button
          className={`admin-sidebar__item admin-sidebar__item--${sectionTitle === 'Dashboard' ? 'active' : ''}`}
          onClick={onToggle}
        >
          <span className="admin-sidebar__item-icon">📊</span>
          <span>Dashboard</span>
        </button>
        <button
          className={`admin-sidebar__item admin-sidebar__item--${sectionTitle === 'News' ? 'active' : ''}`}
          onClick={onToggle}
        >
          <span className="admin-sidebar__item-icon">📰</span>
          <span>News</span>
        </button>
        <button
          className={`admin-sidebar__item admin-sidebar__item--${sectionTitle === 'Players' ? 'active' : ''}`}
          onClick={onToggle}
        >
          <span className="admin-sidebar__item-icon">👥</span>
          <span>Players</span>
        </button>
        <button
          className={`admin-sidebar__item admin-sidebar__item--${sectionTitle === 'Fixtures' ? 'active' : ''}`}
          onClick={onToggle}
        >
          <span className="admin-sidebar__item-icon">🏆</span>
          <span>Fixtures</span>
        </button>
        <button
          className={`admin-sidebar__item admin-sidebar__item--${sectionTitle === 'Standings' ? 'active' : ''}`}
          onClick={onToggle}
        >
          <span className="admin-sidebar__item-icon">📈</span>
          <span>Standings</span>
        </button>
        <button
          className={`admin-sidebar__item admin-sidebar__item--${sectionTitle === 'Gallery' ? 'active' : ''}`}
          onClick={onToggle}
        >
          <span className="admin-sidebar__item-icon">🖼️</span>
          <span>Gallery</span>
        </button>
      </nav>

      {/* Logout section - only show in sidebar on desktop */}
      {showLogout && (
        <div className="admin-sidebar__logout">
          <button
            className="admin-sidebar__logout-button"
            onClick={onLogout}
          >
            <span className="admin-sidebar__item-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}