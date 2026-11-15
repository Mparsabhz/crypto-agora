import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './screens/Home';
import AuthorDashboard from './screens/AuthorDashboard';
import PrintHousePanel from './screens/PrintHousePanel';
import ReaderVerification from './screens/ReaderVerification';
import NetworkExplorer from './screens/NetworkExplorer'; // NOU
import Profile from './screens/Profile';
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

function LoginPage({ onLogin, onLoginError }) {
  const [role, setRole] = useState('client');

  return (
    <main className="auth-entry">
      <section className="auth-entry__card">
        <span className="home-kicker">CRYPTOAGORA IDENTITY</span>
        <div className="auth-required__icon">CA</div>
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
  const publicVerification = new URLSearchParams(window.location.search).has('copy_id')
    || new URLSearchParams(window.location.search).has('book_id');
  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('book_id') || params.has('copy_id') ? 'reader' : 'home';
  });
  const [allBooks, setAllBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('cryptoagora_user');
    if (!storedUser) return null;
    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?.name && parsedUser?.email && parsedUser?.publicKey
        && parsedUser?.credential
        ? { ...parsedUser, role: parsedUser.role || 'client' }
        : null;
    } catch {
      localStorage.removeItem('cryptoagora_user');
      return null;
    }
  });
  const toast = useToast();

  useEffect(() => {
    let active = true;

    if (!user?.email) return undefined;

    Promise.all([
      fetch(`${API_BASE}/books`),
      fetch(`${API_BASE}/my-books`, {
        headers: { Authorization: `Bearer ${user.credential}` }
      }),
    ])
      .then(async ([allResponse, ownResponse]) => {
        if (!allResponse.ok || !ownResponse.ok) throw new Error('Books request failed');
        return Promise.all([allResponse.json(), ownResponse.json()]);
      })
      .then(([allData, ownData]) => {
        if (!active) return;
        setAllBooks(Array.isArray(allData.books) ? allData.books : []);
        setMyBooks(Array.isArray(ownData.books) ? ownData.books : []);
      })
      .catch(() => {
        if (!active) return;
        setAllBooks([]);
        setMyBooks([]);
      });

    return () => {
      active = false;
    };
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

  if (!user && publicVerification) {
    return (
      <main className="app-main">
        <ReaderVerification books={allBooks} />
      </main>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleGoogleLogin} onLoginError={handleGoogleLoginError} />;
  }

  return (
    <>
      <Navbar active={screen} onChange={setScreen} user={user} onLogout={handleLogout} />
      <main className={`app-main ${screen === 'home' ? 'home-main' : ''}`}>
        {screen === 'home' && <Home onNavigate={setScreen} />}
        {screen === 'author' && <AuthorDashboard books={myBooks} authToken={user.credential} onRegister={handleRegister} />}
        {screen === 'print' && <PrintHousePanel books={myBooks} authToken={user.credential} />}
        {screen === 'reader' && <ReaderVerification books={allBooks} />}
        {screen === 'explorer' && <NetworkExplorer />}
        {screen === 'profile' && <Profile authToken={user.credential} user={user} />}
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