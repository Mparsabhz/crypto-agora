import { Activity, BookOpen, Home, Printer, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import './Navbar.css';

const MODULES = [
  { id: 'author', label: 'Author Terminal', icon: BookOpen },
  { id: 'print', label: 'Print House Panel', icon: Printer },
  { id: 'reader', label: 'Reader Verification', icon: ShieldCheck },
];

export default function Navbar({ active, onChange, onDemoFill }) {
  const [isOpen, setIsOpen] = useState(false);

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
          <span className="mono">CONTROL // NAVIGATION</span>
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
            {MODULES.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`navbar__module ${active === id ? 'is-active' : ''}`} onClick={() => navigate(id)}>
                <Icon size={17} />
                <span>{label}</span>
                {active === id && <i className="navbar__module-active" />}
              </button>
            ))}
          </div>
        </div>
        <div className="navbar__drawer-footer">
          <span className="navbar__drawer-label">UTILITIES &amp; DEMO</span>
          <button className="navbar__demo-link" onClick={() => { onDemoFill(); setIsOpen(false); }}>
            <Activity size={14} /> Load Demo Data
          </button>
          <span className="navbar__network-status"><i /> Node: Synced <b>•</b> P2P Active</span>
        </div>
      </aside>
    </nav>
  );
}