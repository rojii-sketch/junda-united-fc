// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import clubLogo from '../assets/logo.png'; // Imports the local logo file

export default function Navbar() {
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