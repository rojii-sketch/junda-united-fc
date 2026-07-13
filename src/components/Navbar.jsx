// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import clubLogo from '../assets/logo.png'; // Imports the local logo file

export default function Navbar() {
  // 🎯 Helper function to smooth-scroll down to the standings table element
  const scrollToStandings = () => {
    // Give the page a tiny fraction of a second to load the route first
    setTimeout(() => {
      const element = document.getElementById('standings');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={clubLogo} alt="Junda United FC Logo" className="club-logo-img" />
        <h1>Junda United FC</h1>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          News
        </NavLink>
        
        {/* 🎯 FIX 1: Linked Match Day Centre using your precise NavLink structure */}
        <NavLink to="/fixtures" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Fixtures
        </NavLink>

        {/* 🎯 FIX 2: Linked Standings path with auto-scroll execution */}
        <NavLink 
          to="/fixtures" 
          onClick={scrollToStandings}
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Standings
        </NavLink>

        <NavLink to="/gallery" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Gallery
        </NavLink>
        
        <NavLink to="/squad" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Squad
        </NavLink>
      </div>
    </nav>
  );
}