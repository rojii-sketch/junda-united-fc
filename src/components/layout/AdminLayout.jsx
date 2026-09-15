// src/components/layout/AdminLayout.jsx
import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children, sectionTitle, sectionDescription, showLogout = true, onLogout, onSidebarToggle, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <div className="admin-ui">
      {/* Mobile backdrop */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && isSidebarOpen && (
        <div className="admin-backdrop admin-backdrop--visible" onClick={onSidebarToggle} />
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={typeof window !== 'undefined' && window.innerWidth < 768 ? isSidebarOpen : true}
          onToggle={onSidebarToggle}
          sectionTitle={sectionTitle}
          showLogout={! (typeof window !== 'undefined' && window.innerWidth < 768)} // Only show logout in sidebar on desktop
          onLogout={onLogout}
        />

        {/* Main workspace */}
        <main className="admin-workspace">
          <AdminHeader
            sectionTitle={sectionTitle}
            sectionDescription={sectionDescription}
            showLogout={typeof window !== 'undefined' && window.innerWidth >= 768 && showLogout} // Show logout in header on desktop
            onLogout={onLogout}
            onSidebarToggle={onSidebarToggle}
            isMobile={typeof window !== 'undefined' && window.innerWidth < 768}
          />

          <div className="admin-workspace__content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}