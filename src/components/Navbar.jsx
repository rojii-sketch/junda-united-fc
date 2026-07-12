// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
  <h1>Junda United FC</h1>
</div>
      <div className="nav-links">
        {/* NavLink automatically adds an 'active' class when the URL matches */}
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