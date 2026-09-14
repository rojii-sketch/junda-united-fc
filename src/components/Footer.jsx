// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        {/* Brand Column */}
        <div className="public-footer__column public-footer__brand">
          <h3>Junda United FC</h3>
          <p>
            Pride of Mishomoroni. Forging talent, discipline, and community spirit on and off the pitch.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="public-footer__column">
          <h4>Explore</h4>
          <ul className="public-footer__links">
            <li>
              <Link to="/" className="public-footer__link">
                Club News
              </Link>
            </li>
            <li>
              <Link to="/fixtures" className="public-footer__link">
                Match Centre
              </Link>
            </li>
            <li>
              <Link to="/squad" className="public-footer__link">
                First Team Squad
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="public-footer__link">
                Media Gallery
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="public-footer__column">
          <h4>Contact Us</h4>
          <ul className="public-footer__contact">
            <li>📍 Junda Grounds, Mishomoroni</li>
            <li>📧 jundaunited6@gmail.com</li>
            <li>📞 +254 798 924 762</li>
          </ul>
        </div>

        {/* Social Media Column */}
        <div className="public-footer__column">
          <h4>Follow Us</h4>
          <ul className="public-footer__social">
            <li>
              <a
                href="https://web.facebook.com/profile.php?id=100063770437523&sk=directory_links"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                {/* Facebook SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="public-footer__bottom">
        &copy; {year} Junda United Football Club. All rights reserved.
      </div>
    </footer>
  );
}