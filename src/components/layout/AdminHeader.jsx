// src/components/layout/AdminHeader.jsx
import React from 'react';

export default function AdminHeader({ sectionTitle, sectionDescription, showLogout, onLogout, onSidebarToggle, isMobile }) {
  return (
    <header className="admin-header">
      {!isMobile && (
        <button
          className="admin-mobile-menu-button"
          aria-label="Open menu"
          onClick={onSidebarToggle}
          style={{ display: 'none' }}
        >
          ☰
        </button>
      )}
      {isMobile && (
        <button
          className="admin-mobile-menu-button"
          aria-label="Open menu"
          onClick={onSidebarToggle}
        >
          ☰
        </button>
      )}
      <div>
        <h1 className="admin-header__title">{sectionTitle || 'Admin Dashboard'}</h1>
        {sectionDescription && (
          <p className="admin-header__description">{sectionDescription}</p>
        )}
      </div>
      {showLogout && (
        <button
          className="admin-header__logout"
          onClick={onLogout}
        >
          Logout
        </button>
      )}
    </header>
  );
}