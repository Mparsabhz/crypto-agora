import { useEffect, useRef, useState } from 'react';
import {
  UploadCloud, FileText, Fingerprint, ShieldCheck, Send,
  Loader2, BookOpen, Cpu,
} from 'lucide-react';
import { sha256FromFile, sha256FromText, shortHash } from '../utils/crypto';
import { useToast } from '../components/Toast';
import CopyButton from '../components/CopyButton';
import './AuthorDashboard.css';

export default function AuthorDashboard({ books, onRegister, demoSignal }) {
  const toast = useToast();
  const fileInput = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [hash, setHash] = useState('');
  const [hashing, setHashing] = useState(false);
  const [wot] = useState('99.4%');
  const [submitting, setSubmitting] = useState(false);

  // Demo autofill
  useEffect(() => {
    if (!demoSignal) return;
    (async () => {
      const demoText = 'Manifestul Libertății — demo manuscript for CryptoAgora protocol';
      const h = await sha256FromText(demoText);
      setTitle('Manifestul Libertății');
      setPubkey('0x8F9B...3E2A');
      setHash(h);
      setFile({ name: 'manifestul-libertatii.pdf', size: 482_331 });
    })();
  }, [demoSignal]);

  const processFile = async (f) => {
    setFile(f);
    setHashing(true);
    try {
      const h = await sha256FromFile(f);
      setHash(h);
      toast('SHA-256 hash computed locally', 'success');
    } catch {
      toast('Failed to hash file', 'error');
    } finally {
      setHashing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const canRegister = file && title.trim() && pubkey.trim() && hash && !submitting;

  const handleRegister = () => {
    setSubmitting(true);
    setTimeout(() => {
      const newBook = {
        book_id: `ca_${String(books.length + 1).padStart(2, '0')}`,
        title: title.trim(),
        author_pubkey: pubkey.trim(),
        sha256_hash: hash,
        web_of_trust_score: `${wot} (Verified Author)`,
        print_batch: '—',
        royalty_split: '20% Direct-to-Author',
        xmr_tx_proof: 'tx_private_pending',
      };
      onRegister(newBook);
      setSubmitting(false);
      setFile(null);
      setTitle('');
      setPubkey('');
      setHash('');
    }, 900);
  };

  return (
    <div className="dashboard">
      <header className="page-head">
        <h1>Author Dashboard</h1>
        <p className="dim">
          Upload a manuscript — the SHA-256 fingerprint is computed <b>locally</b> in your browser.
        </p>
      </header>

      <div className="dashboard__grid">
        {/* Upload + form */}
        <section className="card">
          <div className="section-title">Manuscript Intake</div>

          <div
            className={`dropzone ${dragOver ? 'is-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInput.current?.click()}
          >
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.txt,.md"
              hidden
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
            {file ? (
              <div className="dropzone__file">
                <FileText size={26} className="success" />
                <div>
                  <div className="dropzone__filename">{file.name}</div>
                  <div className="mono muted">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            ) : (
              <>
                <UploadCloud size={32} className="success" />
                <div className="dropzone__title">Drag & drop manuscript</div>
                <div className="dim mono">.pdf · .txt · .md — or click to browse</div>
              </>
            )}
          </div>

          <div className="form-grid">
            <label>
              <span>Title</span>
              <input
                placeholder="e.g. Manifestul Libertății"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              <span>Author Public Key</span>
              <input
                className="mono"
                placeholder="0x8F9B...3E2A"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* Fingerprint card */}
        <section className="card fingerprint">
          <div className="section-title">
            <Fingerprint size={14} /> Cryptographic Fingerprint
          </div>

          {!hash && !hashing && (
            <div className="fingerprint__empty">
              <Cpu size={28} className="muted" />
              <p className="dim">Awaiting manuscript…</p>
              <p className="mono muted">SHA-256 will appear here</p>
            </div>
          )}

          {hashing && (
            <div className="fingerprint__empty">
              <Loader2 size={28} className="success spin" />
              <p className="dim">Hashing locally…</p>
            </div>
          )}

          {hash && !hashing && (
            <>
              <div className="fingerprint__hash mono">{hash}</div>
              <div className="fingerprint__hash-actions">
                <CopyButton value={hash} label="Copy hash" />
                <span className="mono muted">{shortHash(hash)}</span>
              </div>

              <div className="trust">
                <div className="trust__label">
                  <ShieldCheck size={14} className="success" />
                  <span>Web of Trust</span>
                </div>
                <div className="trust__bar">
                  <div className="trust__fill" style={{ width: '99.4%' }} />
                </div>
                <div className="trust__value mono">
                  <span className="success">{wot}</span> — Verified Author
                </div>
              </div>

              <button
                className="btn-primary full"
                disabled={!canRegister}
                onClick={handleRegister}
              >
                {submitting ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                {submitting ? 'Broadcasting…' : 'Register in Protocol'}
              </button>
            </>
          )}
        </section>
      </div>

      {/* History */}
      <section className="card history">
        <div className="section-title">
          <BookOpen size={14} /> Registered in Network ({books.length})
        </div>
        <div className="history__list">
          {books.map((b) => (
            <div key={b.book_id} className="history__row">
              <div className="history__row-title">
                <span className="history__badge mono">{b.book_id}</span>
                <span>{b.title}</span>
              </div>
              <div className="history__row-meta mono">
                <span className="muted">{shortHash(b.sha256_hash)}</span>
                <span className="success">{b.web_of_trust_score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}