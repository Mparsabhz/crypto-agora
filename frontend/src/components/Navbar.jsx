import { BookOpen, ChevronDown, HelpCircle, Home, Instagram, Linkedin, Printer, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import './Navbar.css';

const MODULES = [
  { id: 'author', label: 'Author Terminal', icon: BookOpen },
  { id: 'print', label: 'Print House Panel', icon: Printer },
  { id: 'reader', label: 'Reader Verification', icon: ShieldCheck },
  { id: 'help', label: 'Get Help', icon: HelpCircle, badge: 'AI' },
  { id: 'profile', label: 'My Profile', icon: UserRound },
];

export default function Navbar({ active, onChange, user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const navigate = (id) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${active === 'home' ? 'is-home' : 'is-subpage'} ${isOpen ? 'is-menu-open' : ''}`}>
      {active !== 'home' && (
        <button className="navbar__brand" onClick={() => navigate('home')} aria-label="Go to CryptoAgora home">
          <div className="navbar__brand-text">
            <span className="navbar__name"><span>CRYPTO</span><strong>AGORA</strong></span>
            <span className="navbar__tag">PUBLISH <b>•</b> VERIFY <b>•</b> OWN</span>
          </div>
        </button>
      )}

      <button
        className="navbar__menu-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        <span /><span /><span />
      </button>

      {isOpen && <button className="navbar__backdrop" aria-label="Close navigation menu" onClick={() => setIsOpen(false)} />}

      <aside className={`navbar__drawer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <div className="navbar__drawer-head">
          <span className="mono">CONTROL NAVIGATION</span>
          <span className="navbar__drawer-status"><i /> ONLINE</span>
        </div>
        <div className="navbar__drawer-section">
          <span className="navbar__drawer-label">MODULE PROTOCOL</span>
          <div className="navbar__modules">
            <button className={`navbar__module ${active === 'home' ? 'is-active' : ''}`} onClick={() => navigate('home')}>
              <Home size={17} />
              <span>Home</span>
              {active === 'home' && <i className="navbar__module-active" />}
            </button>
            {MODULES.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} className={`navbar__module ${active === id ? 'is-active' : ''}`} onClick={() => navigate(id)}>
                <Icon size={17} />
                <span>{label}</span>
                {active === id && <i className="navbar__module-active" />}
              </button>
            ))}
          </div>
        </div>
        <div className="navbar__session">
          <span className="navbar__role-badge">{user.role === 'dev' ? 'DEV ACCESS' : 'CLIENT ACCESS'}</span>
          <button className="navbar__logout" type="button" onClick={onLogout}>Sign Out</button>
        </div>
        <div className="navbar__drawer-footer">
          <button className={`navbar__contacts-toggle ${contactsOpen ? 'is-open' : ''}`} type="button" onClick={() => setContactsOpen((open) => !open)} aria-expanded={contactsOpen}>
            <span className="navbar__drawer-label">TEAM // CONTACT</span>
            <ChevronDown size={15} />
          </button>
          {contactsOpen && <div className="navbar__contacts-list">
            <div className="navbar__contact">
            <span>Alex</span>
            <div className="navbar__contact-links">
              <a className="navbar__social navbar__social--instagram" href="https://www.instagram.com/alexandru.j1/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Alex on Instagram">
                <Instagram size={17} />
              </a>
              <a className="navbar__social navbar__social--linkedin" href="https://linkedin.com/in/alex-username" target="_blank" rel="noopener noreferrer" aria-label="Alex on LinkedIn">
                <Linkedin size={17} />
              </a>
            </div>
          </div>
            <div className="navbar__contact">
            <span>Parsabhz</span>
            <div className="navbar__contact-links">
              <a className="navbar__social navbar__social--instagram" href="https://www.instagram.com/pars.bhz4/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Parsabhz on Instagram">
                <Instagram size={17} />
              </a>
              <a className="navbar__social navbar__social--linkedin" href="https://linkedin.com/in/parsabhz-username" target="_blank" rel="noopener noreferrer" aria-label="Parsabhz on LinkedIn">
                <Linkedin size={17} />
              </a>
            </div>
          </div>
            <div className="navbar__contact">
            <span>Dani Puscaș</span>
            <div className="navbar__contact-links">
              <a className="navbar__social navbar__social--instagram" href="https://www.instagram.com/puscasdani07/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Dani Puscaș on Instagram">
                <Instagram size={17} />
              </a>
              <a className="navbar__social navbar__social--linkedin" href="https://linkedin.com/in/dani-puscas" target="_blank" rel="noopener noreferrer" aria-label="Dani Puscaș on LinkedIn">
                <Linkedin size={17} />
              </a>
            </div>
          </div>
          </div>}
        </div>
      </aside>
    </nav>
  );
}