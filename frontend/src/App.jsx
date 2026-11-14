import { BookOpen, HeartHandshake, QrCode, ScanLine, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { mockBooks } from './data/mockData';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import NodeStatusBar from './components/NodeStatusBar';
import AuthorDashboard from './screens/AuthorDashboard';
import PrintHousePanel from './screens/PrintHousePanel';
import ReaderVerification from './screens/ReaderVerification';
import NetworkExplorer from './screens/NetworkExplorer'; // NOU
import './App.css';

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Autorul își protejează munca',
    text: 'Scriitorul își încarcă lucrarea și primește un certificat digital de originalitate, ca o semnătură unică pentru cartea sa.',
    icon: ShieldCheck,
  },
  {
    number: '02',
    title: 'Tipografia imprimă codul unic',
    text: 'Cartea ajunge pe hârtie, iar pe copertă primește un mic sticker QR care este legat de acel exemplar.',
    icon: QrCode,
  },
  {
    number: '03',
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

function Shell() {
  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('book_id') ? 'reader' : 'home';
  });
  const [books, setBooks] = useState(mockBooks);
  const [demoSignal, setDemoSignal] = useState(0);
  const toast = useToast();

  const handleRegister = (newBook) => {
    setBooks((prev) => [newBook, ...prev]);
    toast(`Registered "${newBook.title}" in protocol`, 'success');
  };

  const handleDemoFill = () => {
    setDemoSignal((n) => n + 1);
    toast('Demo autofill triggered', 'info');
  };

  return (
    <>
      <Navbar active={screen} onChange={setScreen} onDemoFill={handleDemoFill} />
      {screen !== 'home' && <NodeStatusBar />}
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
                  {HOW_IT_WORKS.map(({ number, title, text, icon: Icon }) => (
                    <article className="home-info-card" key={number}>
                      <div className="home-info-card__topline"><Icon size={21} /></div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  ))}
                </div>
              </section>

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