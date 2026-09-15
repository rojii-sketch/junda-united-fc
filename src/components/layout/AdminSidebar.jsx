// src/components/layout/AdminSidebar.jsx
import React from 'react';

const NAV_ITEMS = [
  { tab: 'news', label: 'News', icon: '📰' },
  { tab: 'players', label: 'Squad', icon: '👥' },
  { tab: 'fixtures', label: 'Fixtures', icon: '🏆' },
  { tab: 'standings', label: 'Standings', icon: '📈' },
  { tab: 'gallery', label: 'Gallery', icon: '🖼️' }
];

export default function AdminSidebar({ id, isOpen, isMobile, activeTab, onSelectSection }) {
  const sidebarClassName = `admin-sidebar${isMobile ? (isOpen ? ' admin-sidebar--mobile-open' : ' admin-sidebar--mobile-closed') : ''}`;

  return (
    <aside id={id} className={sidebarClassName}>
      <div className="admin-sidebar__header">
        {/* Logo placeholder - using text for now, can be replaced with image */}
        <div className="admin-sidebar__logo" aria-hidden="true">JU</div>
        <div className="admin-sidebar__title">Junda Admin</div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.tab}
            type="button"
            className={`admin-sidebar__item${activeTab === item.tab ? ' admin-sidebar__item--active' : ''}`}
            onClick={() => onSelectSection(item.tab)}
            aria-current={activeTab === item.tab ? 'page' : undefined}
          >
            <span className="admin-sidebar__item-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
