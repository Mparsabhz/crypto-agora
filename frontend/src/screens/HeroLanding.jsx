import { BookOpen, Globe, Printer, ShieldCheck } from 'lucide-react';
import './HeroLanding.css';

const MODULES = [
  { id: 'author', label: 'Author Terminal', detail: 'Publish a sovereign work', icon: BookOpen },
  { id: 'print', label: 'Print House', detail: 'Mint a physical proof', icon: Printer },
  { id: 'reader', label: 'Verify Book', detail: 'Validate authenticity', icon: ShieldCheck },
];

export default function HeroLanding({ onNavigate }) {
  return (
    <section className="hero-landing" aria-labelledby="hero-title">
      <div className="hero-landing__halo" />
      <div className="hero-landing__circuit hero-landing__circuit--left" />
      <div className="hero-landing__circuit hero-landing__circuit--right" />

      <div className="hero-landing__content fade-up">
        <p className="hero-landing__eyebrow mono">CRYPTOAGORA // PROTOCOL ONLINE</p>
        <div className="hero-landing__logo-wrap">
          <img className="hero-landing__logo" src="/logo.png" alt="CryptoAgora" />
        </div>
        <h1 id="hero-title">Own the page. Verify the origin.</h1>
        <p className="hero-landing__tag mono">SOVEREIGN PHYSICAL-TO-DIGITAL PUBLISHING PROTOCOL</p>

        <div className="hero-landing__modules">
          {MODULES.map(({ id, label, detail, icon: Icon }, index) => (
            <button key={id} className="hero-module" onClick={() => onNavigate(id)}>
              <span className="hero-module__index">0{index + 1} //</span>
              <span className="hero-module__icon"><Icon size={18} /></span>
              <span className="hero-module__copy">
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <span className="hero-module__arrow" aria-hidden="true">-&gt;</span>
            </button>
          ))}
        </div>

        <button className="hero-landing__network" onClick={() => onNavigate('explorer')}>
          <Globe size={14} /> Explore the live protocol network
        </button>
      </div>
    </section>
  );
}
