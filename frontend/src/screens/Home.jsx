import { BookOpen, HeartHandshake, QrCode, ScanLine, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import './Home.css';

const HOW_IT_WORKS = [
  {
    title: 'Autorul își protejează munca',
    text: 'Scriitorul își încarcă lucrarea și primește un certificat digital de originalitate, ca o semnătură unică pentru cartea sa.',
    icon: ShieldCheck,
  },
  {
    title: 'Tipografia imprimă codul unic',
    text: 'Cartea ajunge pe hârtie, iar pe copertă primește un mic sticker QR care este legat de acel exemplar.',
    icon: QrCode,
  },
  {
    title: 'Cititorul verifică și susține',
    text: 'Scanezi codul cu telefonul, vezi că ai o carte originală și susții direct autorul, fără drumuri ascunse pentru bani.',
    icon: ScanLine,
  },
];

const BENEFITS = [
  {
    title: 'Pentru cititori',
    text: 'Ai liniștea că ții în mână o carte autentică, primești acces și la varianta digitală și știi unde ajunge sprijinul tău.',
    icon: BookOpen,
  },
  {
    title: 'Pentru autori și creatori',
    text: 'Îți păstrezi vocea, libertatea și o parte corectă din valoarea muncii tale, fără să depinzi de aprobarea unor intermediari.',
    icon: UserRound,
  },
  {
    title: 'Pentru cultură și viitor',
    text: 'Același model poate ajuta artiști independenți, jurnaliști și oameni care creează lucruri bune aici, aproape de noi.',
    icon: HeartHandshake,
  },
];

function formatRon(value) {
  return `${value.toLocaleString('ro-RO', { maximumFractionDigits: 2 })} RON`;
}

function TransparencyCalculator() {
  const [price, setPrice] = useState(50);
  const [copies, setCopies] = useState(1000);
  const traditionalPerBook = price * 0.1;
  const cryptoAgoraPerBook = price * 0.2;
  const traditionalTotal = traditionalPerBook * copies;
  const cryptoAgoraTotal = cryptoAgoraPerBook * copies;
  const difference = cryptoAgoraTotal - traditionalTotal;

  return (
    <section className="home-section transparency-section">
      <div className="home-section__heading">
        <span className="home-kicker">Vezi diferența în cifre reale</span>
        <h2>Calculatorul de Transparență: Editură Clasică vs. CryptoAgora</h2>
        <p>Alege prețul unei cărți și câte exemplare vinzi. Calculatorul îți arată simplu cât ajunge la autor în fiecare sistem.</p>
      </div>

      <div className="transparency-controls">
        <label className="transparency-control">
          <span className="transparency-control__header">
            <span>Prețul unei cărți</span>
            <strong>{formatRon(price)}</strong>
          </span>
          <input type="range" min="20" max="150" step="1" value={price} onChange={(event) => setPrice(Number(event.target.value))} aria-label="Prețul unei cărți în RON" />
          <span className="transparency-control__limits"><span>20 RON</span><span>150 RON</span></span>
        </label>

        <label className="transparency-control">
          <span className="transparency-control__header">
            <span>Număr de exemplare vândute</span>
            <strong>{copies.toLocaleString('ro-RO')} cărți</strong>
          </span>
          <input type="range" min="100" max="10000" step="100" value={copies} onChange={(event) => setCopies(Number(event.target.value))} aria-label="Numărul de exemplare vândute" />
          <span className="transparency-control__limits"><span>100 cărți</span><span>10.000 cărți</span></span>
          <span className="transparency-presets">
            {[100, 1000, 5000].map((preset) => (
              <button key={preset} type="button" className={copies === preset ? 'is-selected' : ''} onClick={() => setCopies(preset)}>
                {preset.toLocaleString('ro-RO')} cărți
              </button>
            ))}
          </span>
        </label>
      </div>

      <div className="transparency-cards">
        <article className="transparency-card transparency-card--traditional">
          <span className="transparency-badge">SISTEM VECHI · 85–90% REȚINUT DE INTERMEDIARI</span>
          <h3>Editură clasică &amp; intermediari</h3>
          <p className="transparency-card__intro">Autorul primește aproximativ 10% din valoarea fiecărei cărți.</p>
          <div className="transparency-amounts">
            <div><span>Autorul primește / carte</span><strong>{formatRon(traditionalPerBook)}</strong></div>
            <div><span>Total autor pe tiraj</span><strong>{formatRon(traditionalTotal)}</strong></div>
            <div><span>Editura, distribuția și comisioanele</span><strong>{formatRon(price * 0.9)} / carte</strong></div>
          </div>
          <div className="transparency-progress">
            <div className="transparency-progress__label"><span>Partea autorului</span><strong>10%</strong></div>
            <div className="transparency-progress__track"><span style={{ width: '10%' }} /></div>
          </div>
          <p className="transparency-note">Plată la 6–12 luni · Risc de cenzură sau blocare a contului</p>
        </article>

        <article className="transparency-card transparency-card--crypto">
          <span className="transparency-badge">CRYPTOAGORA · 20% GARANTAT DIRECT LA AUTOR</span>
          <h3>Protocolul CryptoAgora</h3>
          <p className="transparency-card__intro">Prin scanarea cărții, 20% ajunge direct în portofelul autorului.</p>
          <div className="transparency-amounts">
            <div><span>Autorul primește / carte</span><strong>{formatRon(cryptoAgoraPerBook)}</strong></div>
            <div><span>Total autor pe tiraj</span><strong>{formatRon(cryptoAgoraTotal)}</strong></div>
            <div><span>În plus față de sistemul vechi</span><strong>+{formatRon(difference)}</strong></div>
          </div>
          <div className="transparency-gain">+{formatRon(difference)} în plus direct la autor</div>
          <div className="transparency-progress">
            <div className="transparency-progress__label"><span>Partea autorului</span><strong>20%</strong></div>
            <div className="transparency-progress__track"><span style={{ width: '20%' }} /></div>
          </div>
          <p className="transparency-note">Decontare instantanee · 100% necenzurabil · Editezi și distribui liber</p>
        </article>
      </div>
    </section>
  );
}

export default function Home({ onNavigate }) {
  return (
    <>
      <section className="home-screen" aria-label="CryptoAgora">
        <img className="home-screen__logo" src="/logo.png" alt="CryptoAgora" />
        <span className="home-screen__scroll-hint">Scroll pentru a descoperi <span aria-hidden="true">↓</span></span>
      </section>

      <div className="home-story">
        <section className="home-section home-section--mission">
          <div className="home-section__intro">
            <span className="home-kicker">O poveste simplă despre cărți</span>
            <h1>Cărți libere. Autori respectați. Zero intermediari.</h1>
            <p>
              Când cumperi o carte, autorul care a pus timp, curaj și suflet în ea primește uneori doar o mică parte din bani. Restul se pierde pe drum, între multe mâini, iar unele idei pot fi oprite înainte să ajungă la cititori.
            </p>
            <p>
              CryptoAgora face legătura simplă dintre cartea pe care o ții în mână și lumea digitală. Autorii își păstrează libertatea, iar cititorii știu că susțin direct omul care a scris cartea.
            </p>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section__heading">
            <span className="home-kicker">Trei pași, fără complicații</span>
            <h2>Cum funcționează</h2>
            <p>Un drum clar de la ideea autorului la cartea din mâinile tale.</p>
          </div>
          <div className="home-card-grid home-card-grid--steps">
            {HOW_IT_WORKS.map(({ title, text, icon: Icon }) => (
              <article className="home-info-card" key={title}>
                <div className="home-info-card__topline"><Icon size={21} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <TransparencyCalculator />

        <section className="home-section home-section--benefits">
          <div className="home-section__heading">
            <span className="home-kicker">De ce contează</span>
            <h2>Un gest mic poate susține un drum întreg.</h2>
          </div>
          <div className="home-card-grid">
            {BENEFITS.map(({ title, text, icon: Icon }) => (
              <article className="home-info-card home-info-card--benefit" key={title}>
                <Icon size={23} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-cta">
          <span className="home-kicker">Primul pas este al tău</span>
          <h2>Ești gata să testezi platforma?</h2>
          <p>Alege locul de unde vrei să începi.</p>
          <div className="home-cta__actions">
            <button onClick={() => onNavigate('author')}>Încarcă o carte <span>→</span></button>
            <button onClick={() => onNavigate('print')}>Generează un cod QR <span>→</span></button>
            <button onClick={() => onNavigate('reader')}>Verifică o carte <span>→</span></button>
            <button onClick={() => onNavigate('authors')}>Caută autor <span>→</span></button>
            <button onClick={() => onNavigate('publishers')}>Caută editură <span>→</span></button>
          </div>
        </section>

        <footer className="home-footer">
          CryptoAgora — Un proiect creat cu pasiune de echipa CryptoKratos <span>•</span> Publish <span>•</span> Verify <span>•</span> Own
        </footer>
      </div>
    </>
  );
}
