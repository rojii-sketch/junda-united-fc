import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClubCrest from './ui/ClubCrest';

const links = [
  ['/', 'Club News'],
  ['/fixtures', 'Match Centre'],
  ['/fixtures#standings', 'Standings'],
  ['/squad', 'First Team Squad'],
  ['/gallery', 'Media Gallery']
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <Link to="/" className="public-footer__identity">
            <ClubCrest width={104} />
            <span>Junda United FC</span>
          </Link>
          <p>Pride of Mishomoroni. Forging talent, discipline, and community spirit on and off the pitch.</p>
        </div>
        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore">Explore</h2>
          <ul className="public-footer__links">
            {links.map(([path, label]) => <li key={path}><Link to={path}>{label}</Link></li>)}
          </ul>
        </nav>
        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact">Contact us</h2>
          <ul className="public-footer__contact">
            <li><MapPin size={17} aria-hidden="true" /> <span>Junda Grounds, Mishomoroni</span></li>
            <li><Mail size={17} aria-hidden="true" /> <a href="mailto:jundaunited6@gmail.com">jundaunited6@gmail.com</a></li>
            <li><Phone size={17} aria-hidden="true" /> <a href="tel:+254798924762">+254 798 924 762</a></li>
          </ul>
          <a className="public-footer__social"
            href="https://web.facebook.com/profile.php?id=100063770437523&sk=directory_links"
            target="_blank" rel="noopener noreferrer">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </section>
      </div>
      <div className="public-footer__bottom">
        &copy; {year} Junda United Football Club. All rights reserved.
      </div>
    </footer>
  );
}
