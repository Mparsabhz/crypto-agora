import { BookOpen, Printer, ShieldCheck, Zap } from 'lucide-react';
import './Navbar.css';

const TABS = [
  { id: 'author', label: 'Author', icon: BookOpen },
  { id: 'print',  label: 'Print House', icon: Printer },
  { id: 'reader', label: 'Verify', icon: ShieldCheck },
];

export default function Navbar({ active, onChange, onDemoFill }) {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <div className="navbar__logo">CA</div>
        <div className="navbar__brand-text">
          <span className="navbar__name">CRYPTOAGORA</span>
          <span className="navbar__tag">PHYSICAL → DIGITAL · v0.1</span>
        </div>
      </div>

      <div className="navbar__tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`navbar__tab ${active === id ? 'is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <button className="navbar__demo" onClick={onDemoFill}>
        <Zap size={14} />
        <span>Demo Autofill</span>
      </button>
    </nav>
  );
}