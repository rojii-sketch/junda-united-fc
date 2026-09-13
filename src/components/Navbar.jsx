import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import clubLogo from '../assets/navbar-logo.webp';

const mobileMenuId = 'public-navbar-mobile-menu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const scrollToStandings = () => {
    closeMenu();
    setTimeout(() => {
      const element = document.getElementById('standings');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const linkClassName = ({ isActive }) => (
    isActive
      ? 'public-navbar__link public-navbar__link--active'
      : 'public-navbar__link'
  );

  return (
    <nav className="public-ui public-navbar" aria-label="Primary navigation">
      <div className="public-navbar__inner">
        <div className="public-navbar__brand">
          <img
            src={clubLogo}
            alt="Junda United FC crest"
            className="public-navbar__logo"
          />
          <span className="public-navbar__name">Junda United FC</span>
        </div>

        <div className="public-navbar__links public-navbar__links--desktop">
          <NavLink to="/" className={linkClassName}>
            News
          </NavLink>
          <NavLink to="/fixtures" className={linkClassName}>
            Fixtures
          </NavLink>
          <NavLink
            to="/fixtures"
            onClick={scrollToStandings}
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
          type="button"
          className="public-navbar__toggle"
          onClick={() => setIsOpen(open => !open)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls={mobileMenuId}
        >
          <span aria-hidden="true">{isOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      <div
        id={mobileMenuId}
        className={`public-navbar__mobile-menu${isOpen ? ' public-navbar__mobile-menu--open' : ''}`}
        aria-hidden={!isOpen}
      >
        <NavLink to="/" onClick={closeMenu} className={linkClassName}>
          News
        </NavLink>
        <NavLink to="/fixtures" onClick={closeMenu} className={linkClassName}>
          Fixtures
        </NavLink>
        <NavLink to="/fixtures" onClick={scrollToStandings} className="public-navbar__link">
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
