import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PublicHero({ title, description, className = '', home = false }) {
  return (
    <header className={`club-public-hero ${className}`}>
      <div className="club-public-hero__copy">
        <p className="club-public-hero__label">{home ? 'Mishomoroni, Mombasa' : 'Junda United FC'}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {home && <Link to="/fixtures" className="club-public-action">Match Centre <ArrowRight size={18} aria-hidden="true" /></Link>}
      </div>
      <img src="/junda-logo.webp" alt="" width="160" height="160" />
    </header>
  );
}
