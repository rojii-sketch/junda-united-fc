import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const query = '(max-width: 700px)';
function subscribe(listener) {
  const media = window.matchMedia(query);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}

export default function AdminLayout({ theme, children, sectionTitle, sectionDescription, activeTab, onSelectSection, onLogout }) {
  const mobile = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [navigationCount, setNavigationCount] = useState(0);
  const headingRef = useRef(null);
  const toggleRef = useRef(null);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!navigationCount || !heading) return;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [navigationCount]);

  function select(section) {
    onSelectSection(section);
    setMobileOpen(false);
    setNavigationCount(count => count + 1);
  }

  return (
    <div className={`admin-ui club-admin${collapsed ? ' club-admin--collapsed' : ''}`}
      data-admin-theme={theme} onKeyDown={event => {
        if (event.key === 'Escape' && mobile && mobileOpen) {
          setMobileOpen(false);
          toggleRef.current?.focus();
        }
      }}>
      <a className="ui-skip" href="#admin-workspace">Skip to workspace</a>
      <AdminHeader title={sectionTitle} description={sectionDescription} headingRef={headingRef} toggleRef={toggleRef}
        expanded={mobile ? mobileOpen : !collapsed}
        onToggle={() => mobile ? setMobileOpen(open => !open) : setCollapsed(open => !open)} />
      <div className="club-admin-nav" hidden={mobile && !mobileOpen}>
        <AdminSidebar id="admin-sidebar" activeTab={activeTab} onSelectSection={select} onLogout={onLogout} />
      </div>
      <main id="admin-workspace" tabIndex={-1} className="club-admin-workspace">{children(select)}</main>
    </div>
  );
}
