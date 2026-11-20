import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ClubCrest from './ui/ClubCrest';

const menuId = 'public-navbar-mobile-menu';
const compactQuery = '(max-width: 56rem)';
const sections = [
  ['/', 'News'],
  ['/fixtures', 'Match Centre'],
  ['/fixtures#standings', 'Standings'],
  ['/gallery', 'Gallery'],
  ['/squad', 'Squad']
];

function currentSection({ pathname, hash }) {
  const path = pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (path === '/fixtures' && hash === '#standings') return '/fixtures#standings';
  if (path.startsWith('/news/')) return '/';
  if (path.startsWith('/squad/')) return '/squad';
  return path;
}

function SectionLinks({ location, id, hidden }) {
  const current = currentSection(location);
  const address = location.pathname + location.hash;
  return (
    <ul id={id} hidden={hidden} className="public-navbar__links">
      {sections.map(([path, label]) => (
        <li key={path}>
          <Link className="public-navbar__link" to={path}
            aria-current={current === path ? (address === path ? 'page' : 'location') : undefined}>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobileMenu({ location }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const disclosure = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsidePointer(event) {
      if (!disclosure.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  function closeAndRestoreFocus() {
    setOpen(false);
    toggle.current?.focus();
  }

  return (
    <div ref={disclosure} className="public-navbar__disclosure" onBlur={event => {
      if (open && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={event => {
      if (open && event.key === 'Escape') {
        event.preventDefault();
        closeAndRestoreFocus();
      }
    }}>
      <button ref={toggle} type="button" className="public-navbar__toggle" aria-controls={menuId}
        aria-expanded={open} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen(current => !current)}>
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        <span>Menu</span>
      </button>
      <SectionLinks id={menuId} hidden={!open} location={location} />
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigation = useRef(null);
  const pendingHref = useRef(null);

  const subscribe = useCallback(listener => {
    const media = window.matchMedia(compactQuery);
    function onBreakpointChange() {
      // Read the focused link before React replaces the mobile disclosure.
      const link = document.activeElement?.closest('#' + menuId + ' a[href]');
      pendingHref.current = !media.matches && navigation.current?.contains(link) ? link.href : null;
      listener();
    }
    media.addEventListener('change', onBreakpointChange);
    return () => media.removeEventListener('change', onBreakpointChange);
  }, []);
  const compact = useSyncExternalStore(subscribe, () => window.matchMedia(compactQuery).matches, () => false);

  useLayoutEffect(() => {
    const href = pendingHref.current;
    pendingHref.current = null;
    if (compact || !href || document.activeElement !== document.body) return;
    const links = navigation.current?.querySelectorAll('.public-navbar__link');
    const destination = Array.from(links ?? []).find(link => link.href === href);
    destination?.focus({ preventScroll: true });
  }, [compact]);

  return (
    <header className="public-navbar">
      <nav ref={navigation} className="public-navbar__inner" aria-label="Primary navigation">
        <Link to="/" className="public-navbar__brand">
          <ClubCrest width={88} className="public-navbar__logo" />
          <span>Junda United FC</span>
        </Link>
        {compact ? <MobileMenu key={location.key} location={location} /> : <SectionLinks location={location} />}
      </nav>
    </header>
  );
}
