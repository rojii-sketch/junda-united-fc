import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clubLogo from '../assets/navbar-logo.webp';

const mobileMenuId = 'public-navbar-mobile-menu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggle.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const linkClassName = ({ isActive }) => (
    isActive
      ? 'public-navbar__link public-navbar__link--active'
      : 'public-navbar__link'
  );

  return (
    <nav className="public-ui public-navbar" aria-label="Primary navigation">
      <div className="public-navbar__inner">
        <NavLink to="/" className="public-navbar__brand" onClick={closeMenu}>
          <img
            src={clubLogo}
            alt=""
            className="public-navbar__logo"
          />
          <span className="public-navbar__name">Junda United FC</span>
        </NavLink>

        <div className="public-navbar__links public-navbar__links--desktop">
          <NavLink to="/" className={linkClassName}>
            News
          </NavLink>
          <NavLink to="/fixtures" className={linkClassName}>
            Match Centre
          </NavLink>
          <NavLink
            to="/fixtures#standings"
            className="public-navbar__link"
          >
            Standings
          </NavLink>
          <NavLink to="/gallery" className={linkClassName}>
            Gallery
          </NavLink>
          <NavLink to="/squad" className={linkClassName}>
            Squad
          </NavLink>
        </div>

        <button
          ref={toggle}
          type="button"
          className="public-navbar__toggle"
          onClick={() => setIsOpen(open => !open)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls={mobileMenuId}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div
        id={mobileMenuId}
        className={`public-navbar__mobile-menu${isOpen ? ' public-navbar__mobile-menu--open' : ''}`}
        hidden={!isOpen}
      >
        <NavLink to="/" onClick={closeMenu} className={linkClassName}>
          News
        </NavLink>
        <NavLink to="/fixtures" onClick={closeMenu} className={linkClassName}>
          Match Centre
        </NavLink>
        <NavLink to="/fixtures#standings" onClick={closeMenu} className="public-navbar__link">
          Standings
        </NavLink>
        <NavLink to="/gallery" onClick={closeMenu} className={linkClassName}>
          Gallery
        </NavLink>
        <NavLink to="/squad" onClick={closeMenu} className={linkClassName}>
          Squad
        </NavLink>
      </div>
    </nav>
  );
}
