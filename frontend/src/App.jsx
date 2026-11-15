import { BookOpen, HeartHandshake, QrCode, ScanLine, ShieldCheck, UserRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import { useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import AuthorDashboard from './screens/AuthorDashboard';
import PrintHousePanel from './screens/PrintHousePanel';
import ReaderVerification from './screens/ReaderVerification';
import NetworkExplorer from './screens/NetworkExplorer';
import Home from './screens/Home';
import GetHelp from './screens/GetHelp';
import Profile from './screens/Profile';
import ProfileDirectory from './screens/ProfileDirectory';
import PublisherPanel from './screens/PublisherPanel';
import TrustDashboard from './screens/TrustDashboard';
import './App.css';

const API_BASE = 'http://localhost:3000';

function derivePublicKey(email) {
  let hash = 2166136261;
  for (const character of email.toLowerCase()) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  const digest = (hash >>> 0).toString(16).padStart(8, '0').repeat(4);
  return `0xCA${digest.slice(0, 6).toUpperCase()}...${digest.slice(-4).toUpperCase()}`;
}

function LoginPage({ onLogin, onLoginError, onAnonymousLogin }) {
  const [role, setRole] = useState('client');

  return (
    <main className="auth-entry">
      <section className="auth-entry__card">
        <span className="home-kicker">CRYPTOAGORA IDENTITY</span>
        <div className="auth-required__icon"><ShieldCheck size={30} /></div>
        <h1>Welcome to CryptoAgora</h1>
        <p>Conectează-te cu Google sau creează un cont anonim pentru a publica și semna cărți.</p>
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
      <button type="button" className="btn-ghost full" onClick={onAnonymousLogin}>
        Creează cont anonim
      </button>
      <p className="mono muted">Fără email. Dacă pierzi sesiunea anonimă, contul nu poate fi recuperat.</p>
      </section>
    </main>
  );
}

function Shell() {
  const publicVerification = new URLSearchParams(window.location.search).has('copy_id')
    || new URLSearchParams(window.location.search).has('book_id');
  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('book_id') || params.has('copy_id') ? 'reader' : 'home';
  });
  const [allBooks, setAllBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [profileType, setProfileType] = useState('author');
  const [demoSignal, setDemoSignal] = useState(0);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('cryptoagora_user');
    if (!storedUser) return null;
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.name || !parsedUser?.email || !parsedUser?.publicKey || !parsedUser?.credential) {
        localStorage.removeItem('cryptoagora_user');
        return null;
      }
      return { ...parsedUser, role: parsedUser.role || 'client' };
    } catch {
      localStorage.removeItem('cryptoagora_user');
      return null;
    }
  });
  const [aiTrustScore, setAiTrustScore] = useState(() => {
    const storedResult = localStorage.getItem('cryptoagora_ai_trust');
    if (!storedResult) return null;
    try {
      const parsedResult = JSON.parse(storedResult);
      return typeof parsedResult?.score === 'number' ? parsedResult : null;
    } catch {
      localStorage.removeItem('cryptoagora_ai_trust');
      return null;
    }
  });
  const toast = useToast();

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/books`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Public catalog request failed');
        return response.json();
      })
      .then((data) => {
        if (active) setAllBooks(Array.isArray(data.books) ? data.books : []);
      })
      .catch(() => {
        if (active) setAllBooks([]);
      });

    if (user?.credential) {
      fetch(`${API_BASE}/my-books`, {
        headers: { Authorization: `Bearer ${user.credential}` },
      })
        .then(async (response) => {
          if (response.status === 401) throw new Error('AUTH_INVALID');
          if (!response.ok) throw new Error('Private catalog request failed');
          return response.json();
        })
        .then((data) => {
          if (active) setMyBooks(Array.isArray(data.books) ? data.books : []);
        })
        .catch((error) => {
          if (error.message === 'AUTH_INVALID') {
            localStorage.removeItem('cryptoagora_user');
            setUser(null);
            toast('Sesiunea Google a expirat. Conectează-te din nou.', 'error');
            return;
          }
          if (active) setMyBooks([]);
        });

      fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${user.credential}` },
      })
        .then(async (response) => {
          if (!response.ok) throw new Error('Profile request failed');
          return response.json();
        })
        .then((data) => {
          if (active) setProfileType(data.profile?.profile_type || 'author');
        })
        .catch(() => {
          if (active) setProfileType('author');
        });
    } else {
      setMyBooks([]);
      setProfileType('author');
    }

    return () => { active = false; };
  }, [user]);

  const handleRegister = (newBook) => {
    setAllBooks((prev) => [newBook, ...prev]);
    setMyBooks((prev) => [newBook, ...prev]);
    toast(`Registered "${newBook.title}" in protocol`, 'success');
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
        credential: response.credential,
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

  const handleAnonymousLogin = async () => {
    try {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const publicKey = JSON.stringify(await crypto.subtle.exportKey('jwk', keyPair.publicKey));
      const privateKey = JSON.stringify(await crypto.subtle.exportKey('jwk', keyPair.privateKey));
      const response = await fetch(`${API_BASE}/auth/anonymous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: publicKey })
      });
      const data = await response.json();
      if (!response.ok || !data.credential) {
        throw new Error(data.error || 'Contul anonim nu a putut fi creat.');
      }

      const nextUser = {
        name: 'Anonymous contributor',
        email: `anonymous:${data.account_id}`,
        publicKey: data.public_key,
        credential: data.credential,
        role: 'client',
        identityType: 'anonymous',
        privateKey
      };
      setUser(nextUser);
      localStorage.setItem('cryptoagora_user', JSON.stringify(nextUser));
      toast('Cont anonim creat. Salvează cheia privată pentru demo.', 'success');
    } catch (error) {
      toast(error.message || 'Contul anonim nu a putut fi creat.', 'error');
    }
  };

  const handleAiTrustResult = (result) => {
    setAiTrustScore(result);
    localStorage.setItem('cryptoagora_ai_trust', JSON.stringify(result));
  };

  if (!user && publicVerification) {
    return (
      <main className="app-main">
        <ReaderVerification books={allBooks} />
      </main>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={handleGoogleLogin}
        onLoginError={handleGoogleLoginError}
        onAnonymousLogin={handleAnonymousLogin}
      />
    );
  }

  return (
    <>
      <Navbar
        active={screen}
        onChange={setScreen}
        user={user}
        profileType={profileType}
        onLogout={handleLogout}
      />
      <main className={`app-main ${screen === 'home' ? 'home-main' : ''}`}>
        {screen === 'home' && <Home onNavigate={setScreen} />}
        {screen === 'author' && <AuthorDashboard books={myBooks} authToken={user.credential} onRegister={handleRegister} demoSignal={demoSignal} aiTrustScore={aiTrustScore} onOpenHelp={() => setScreen('help')} />}
        {screen === 'print' && (profileType === 'publisher'
          ? <PublisherPanel authToken={user.credential} />
          : <PrintHousePanel books={myBooks} authToken={user.credential} />)}
        {screen === 'reader' && <ReaderVerification books={allBooks} />}
        {screen === 'explorer' && <NetworkExplorer />}
        {screen === 'help' && <GetHelp aiTrustScore={aiTrustScore} onTrustResult={handleAiTrustResult} />}
        {screen === 'profile' && <Profile authToken={user.credential} user={user} onUserImport={(nextUser) => {
          setUser(nextUser);
          localStorage.setItem('cryptoagora_user', JSON.stringify(nextUser));
        }} />}
        {screen === 'trust' && <TrustDashboard authToken={user.credential} />}
        {screen === 'authors' && <ProfileDirectory initialType="author" />}
        {screen === 'publishers' && <ProfileDirectory initialType="publisher" />}
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
