import { useState } from 'react';
import { mockBooks } from './data/mockData';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import NodeStatusBar from './components/NodeStatusBar';
import AuthorDashboard from './screens/AuthorDashboard';
import PrintHousePanel from './screens/PrintHousePanel';
import ReaderVerification from './screens/ReaderVerification';

function Shell() {
  const [screen, setScreen] = useState('author');
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
      <NodeStatusBar />
      <main className="app-main">
        {screen === 'author' && (
          <AuthorDashboard
            books={books}
            onRegister={handleRegister}
            demoSignal={demoSignal}
          />
        )}
        {screen === 'print' && <PrintHousePanel books={books} />}
        {screen === 'reader' && <ReaderVerification books={books} />}
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