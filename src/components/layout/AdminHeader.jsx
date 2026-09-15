// src/components/layout/AdminHeader.jsx
import React from 'react';

export default function AdminHeader({ sectionTitle, sectionDescription, onSidebarToggle, sidebarId, isSidebarOpen, isMobile }) {
  return (
    <header className="admin-header">
      {isMobile && (
        <button
          className="admin-mobile-menu-button"
          type="button"
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isSidebarOpen}
          aria-controls={sidebarId}
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
    </header>
  );
}
