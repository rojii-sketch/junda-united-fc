// src/components/layout/AdminLayout.jsx
import React, { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children, sectionTitle, sectionDescription, activeTab, onSelectSection, onSidebarToggle, isSidebarOpen, setIsSidebarOpen }) {
  const sidebarId = 'admin-sidebar';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isSidebarOpen, setIsSidebarOpen]);

  const handleSelectSection = (tab) => {
    onSelectSection(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-ui">
      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          className="admin-backdrop admin-backdrop--visible"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
          style={{ border: 'none', padding: 0 }}
        />
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <AdminSidebar
          id={sidebarId}
          isMobile={isMobile}
          isOpen={isMobile ? isSidebarOpen : true}
          activeTab={activeTab}
          onSelectSection={handleSelectSection}
        />

        {/* Main workspace */}
        <main className="admin-workspace">
          <AdminHeader
            sectionTitle={sectionTitle}
            sectionDescription={sectionDescription}
            onSidebarToggle={onSidebarToggle}
            sidebarId={sidebarId}
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
          />

          <div className="admin-workspace__content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}