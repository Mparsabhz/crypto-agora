import { BookOpen, HeartHandshake, QrCode, ScanLine, ShieldCheck, UserRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import { mockBooks } from './data/mockData';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import AuthorDashboard from './screens/AuthorDashboard';
import PrintHousePanel from './screens/PrintHousePanel';
import ReaderVerification from './screens/ReaderVerification';
import NetworkExplorer from './screens/NetworkExplorer';
import './App.css';

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
        <p>
          Alege prețul unei cărți și câte exemplare vinzi. Calculatorul îți arată simplu cât ajunge la autor în fiecare sistem.
        </p>
      </div>

      <div className="transparency-controls">
        <label className="transparency-control">
          <span className="transparency-control__header">
            <span>Prețul unei cărți</span>
            <strong>{formatRon(price)}</strong>
          </span>
          <input
            type="range"
            min="20"
            max="150"
            step="1"
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            aria-label="Prețul unei cărți în RON"
          />
          <span className="transparency-control__limits"><span>20 RON</span><span>150 RON</span></span>
        </label>

        <label className="transparency-control">
          <span className="transparency-control__header">
            <span>Număr de exemplare vândute</span>
            <strong>{copies.toLocaleString('ro-RO')} cărți</strong>
          </span>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={copies}
            onChange={(event) => setCopies(Number(event.target.value))}
            aria-label="Numărul de exemplare vândute"
          />
          <span className="transparency-control__limits"><span>100 cărți</span><span>10.000 cărți</span></span>
          <span className="transparency-presets">
            {[100, 1000, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                className={copies === preset ? 'is-selected' : ''}
                onClick={() => setCopies(preset)}
              >
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

function derivePublicKey(email) {
  let hash = 2166136261;
  for (const character of email.toLowerCase()) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  const digest = (hash >>> 0).toString(16).padStart(8, '0').repeat(4);
  return `0xCA${digest.slice(0, 6).toUpperCase()}...${digest.slice(-4).toUpperCase()}`;
}

function LoginPage({ onLogin, onLoginError }) {
  const [role, setRole] = useState('client');

  return (
    <main className="auth-entry">
      <section className="auth-entry__card">
        <span className="home-kicker">CRYPTOAGORA IDENTITY</span>
        <div className="auth-required__icon"><ShieldCheck size={30} /></div>
        <h1>Welcome to CryptoAgora</h1>
        <p>Conectează-te cu Google pentru a accesa platforma și a publica sau semna cărți.</p>
      <div className="auth-role-toggle">
        <button type="button" className={role === 'dev' ? 'is-selected' : ''} onClick={() => setRole('dev')}>Login as Dev</button>
        <button type="button" className={role === 'client' ? 'is-selected' : ''} onClick={() => setRole('client')}>Login as Client</button>
      </div>
      <div className="auth-required__login">
        <GoogleLogin
          theme="filled_black"
          shape="pill"
          size="large"
          text="signin_with"
          width="260"
          onSuccess={(response) => onLogin(response, role)}
          onError={onLoginError}
        />
      </div>
      </section>
    </main>
  );
}

function Shell() {
  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('book_id') ? 'reader' : 'home';
  });
  const [books, setBooks] = useState(mockBooks);
  const [demoSignal, setDemoSignal] = useState(0);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('cryptoagora_user');
    if (!storedUser) return null;
    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?.name && parsedUser?.email && parsedUser?.publicKey
        ? { ...parsedUser, role: parsedUser.role || 'client' }
        : null;
    } catch {
      localStorage.removeItem('cryptoagora_user');
      return null;
    }
  });
  const toast = useToast();

  const handleRegister = (newBook) => {
    setBooks((prev) => [newBook, ...prev]);
    toast(`Registered "${newBook.title}" in protocol`, 'success');
  };

  const handleDemoFill = () => {
    setDemoSignal((n) => n + 1);
    toast('Demo autofill triggered', 'info');
  };

  const handleGoogleLogin = (response, role = 'client') => {
    if (!response?.credential) {
      toast('Google authentication did not return credentials.', 'error');
      return;
    }

    try {
      const decoded = jwtDecode(response.credential);
      if (!decoded.email) {
        toast('Google account email is unavailable.', 'error');
        return;
      }
      const nextUser = {
        name: decoded.name || decoded.email,
        email: decoded.email,
        picture: decoded.picture || '',
        publicKey: derivePublicKey(decoded.email),
        role,
      };
      setUser(nextUser);
      localStorage.setItem('cryptoagora_user', JSON.stringify(nextUser));
      toast(`Welcome, ${nextUser.name}`, 'success');
    } catch {
      toast('Google authentication could not be verified.', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cryptoagora_user');
    toast('You have been signed out.', 'info');
  };

  const handleGoogleLoginError = () => {
    toast('Google sign-in was cancelled or failed.', 'error');
  };

  if (!user) {
    return <LoginPage onLogin={handleGoogleLogin} onLoginError={handleGoogleLoginError} />;
  }

  return (
    <>
      <Navbar
        active={screen}
        onChange={setScreen}
        user={user}
        onLogout={handleLogout}
      />
      <main className={`app-main ${screen === 'home' ? 'home-main' : ''}`}>
        {screen === 'home' && (
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
                  <button onClick={() => setScreen('author')}>Încarcă o carte <span>→</span></button>
                  <button onClick={() => setScreen('print')}>Generează un cod QR <span>→</span></button>
                  <button onClick={() => setScreen('reader')}>Verifică o carte <span>→</span></button>
                </div>
              </section>

              <footer className="home-footer">
                CryptoAgora — Un proiect creat cu pasiune de echipa CryptoKratos <span>•</span> Publish <span>•</span> Verify <span>•</span> Own
              </footer>
            </div>
          </>
        )}
        {screen === 'author' && <AuthorDashboard books={books} onRegister={handleRegister} demoSignal={demoSignal} />}
        {screen === 'print' && <PrintHousePanel books={books} />}
        {screen === 'reader' && <ReaderVerification books={books} />}
        {screen === 'explorer' && <NetworkExplorer />} {/* NOU */}
      </main>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}