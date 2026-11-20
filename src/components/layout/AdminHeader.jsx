import ClubCrest from '../ui/ClubCrest';
import { PanelLeft } from 'lucide-react';

export default function AdminHeader({ title, description, onToggle, expanded, headingRef, toggleRef }) {
  return (
    <header className="club-admin-header">
      <button ref={toggleRef} type="button" onClick={onToggle} aria-controls="admin-sidebar" aria-expanded={expanded}>
        <PanelLeft size={20} aria-hidden="true" /> <span>Menu</span>
      </button>
      <div className="club-admin-header__title">
        <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
        <p>{description}</p>
      </div>
      <ClubCrest width={64} className="club-admin-header__crest" alt="Junda United FC crest" />
    </header>
  );
}
