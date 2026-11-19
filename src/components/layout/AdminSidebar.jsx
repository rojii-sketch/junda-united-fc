import { CalendarDays, ChartNoAxesColumn, Images, LayoutDashboard, LogOut, Newspaper, UsersRound } from 'lucide-react';

const sections = [
  ['overview', 'Overview', LayoutDashboard],
  ['news', 'News', Newspaper],
  ['fixtures', 'Fixtures', CalendarDays],
  ['standings', 'Standings', ChartNoAxesColumn],
  ['squad', 'Squad', UsersRound],
  ['gallery', 'Gallery', Images]
];

export default function AdminSidebar({ id, activeTab, onSelectSection, onLogout }) {
  return (
    <aside id={id} className="club-admin-sidebar">
      <div className="club-admin-brand">
        <img src="/junda-logo.webp" width="42" height="42" alt="" />
        <span>Junda United FC</span>
      </div>
      <nav aria-label="Admin navigation">
        {sections.map(([id, label, Icon]) => (
          <button key={id} type="button" aria-current={activeTab === id ? 'page' : undefined}
            aria-label={label} title={label} onClick={() => onSelectSection(id)}>
            <Icon aria-hidden="true" size={20} /><span>{label}</span>
          </button>
        ))}
        <button type="button" aria-label="Log out" title="Log out" onClick={onLogout}>
          <LogOut aria-hidden="true" size={20} /><span>Log out</span>
        </button>
      </nav>
    </aside>
  );
}
