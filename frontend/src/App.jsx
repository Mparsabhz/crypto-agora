import { useEffect, useState } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './screens/Home';
import AuthorDashboard from './screens/AuthorDashboard';
import PrintHousePanel from './screens/PrintHousePanel';
import ReaderVerification from './screens/ReaderVerification';
import NetworkExplorer from './screens/NetworkExplorer'; // NOU
import './App.css';

const API_BASE = 'http://localhost:3000';

function Shell() {
  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('book_id') ? 'reader' : 'home';
  });
  const [books, setBooks] = useState([]);
  const [demoSignal, setDemoSignal] = useState(0);
  const toast = useToast();

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/books`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Books request failed');
        return response.json();
      })
      .then((data) => {
        if (active && Array.isArray(data.books)) {
          setBooks(data.books);
        }
      })
      .catch(() => {
        if (active) setBooks([]);
      });

    return () => {
      active = false;
    };
  }, []);

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
      <main className={`app-main ${screen === 'home' ? 'home-main' : ''}`}>
        {screen === 'home' && <Home onNavigate={setScreen} />}
        {screen === 'author' && <AuthorDashboard books={books} onRegister={handleRegister} demoSignal={demoSignal} />}
        {screen === 'print' && <PrintHousePanel books={books} />}
        {screen === 'reader' && <ReaderVerification books={books} />}
        {screen === 'explorer' && <NetworkExplorer />}
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