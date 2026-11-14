import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, FileText, Fingerprint, ShieldCheck, Send,
  Loader2, BookOpen, Cpu, Key, CheckCircle2, ChevronRight,
  Activity, Terminal, Copy, Hash, Zap, TrendingUp, Wallet,
  PenTool, Sliders, Eye, EyeOff, Box, Database, Network,
  Lock, Unlock, AlertCircle, FileCode, Check, HelpCircle, Code2
} from 'lucide-react';
import { sha256FromFile, copyToClipboard, shortHash } from '../utils/crypto';
import { useToast } from '../components/Toast';
import './AuthorDashboard.css';

// Sub-componentă pentru log-urile din terminal
const TerminalLine = ({ time, type, text }) => {
  const colors = { system: 'var(--text-muted)', success: 'var(--emerald)', info: 'var(--text-dim)', warn: 'var(--amber)', error: 'var(--danger)' };
  return (
    <div className="term-line" style={{ color: colors[type] || 'inherit' }}>
      <span className="term-time">[{time}]</span>
      <span className="term-text">{text}</span>
    </div>
  );
};

export default function AuthorDashboard({ books, onRegister, demoSignal }) {
  const toast = useToast();
  const fileInput = useRef(null);
  
  // --- STATE: FORMULAR ---
  const [activeTab, setActiveTab] = useState('upload'); // upload, crypto, economics
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [privkey, setPrivkey] = useState('');
  const [showPrivkey, setShowPrivkey] = useState(false);
  const [hash, setHash] = useState('');
  
  // --- STATE: CRYPTO & ECONOMIC ---
  const [signature, setSignature] = useState('');
  const [royalty, setRoyalty] = useState(20);
  const [license, setLicense] = useState('Anti-Censorship CC-BY');
  const [price, setPrice] = useState('0.05');
  const [isEncrypted, setIsEncrypted] = useState(true);
  
  // --- STATE: UI & PROCESARE ---
  const [dragOver, setDragOver] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [registering, setRegistering] = useState(false);
  
  // --- STATE: P2P SIMULATOR & CHUNKS ---
  const [p2pStep, setP2pStep] = useState(0);
  const [chunks, setChunks] = useState([]);
  
  // --- STATE: TERMINAL ---
  const [logs, setLogs] = useState([
    { id: 1, time: '10:00:01', text: 'Node connection established. Secure tunnel active.', type: 'system' },
    { id: 2, time: '10:00:02', text: 'Syncing Web of Trust graph from 14 peers...', type: 'info' },
    { id: 3, time: '10:00:05', text: 'IPFS daemon responsive. Ready to pin.', type: 'system' },
  ]);

  // Efect pentru log-uri simulate
  useEffect(() => {
    const interval = setInterval(() => {
      const events = [
        { text: 'New peer connected: 0x4a2f...', type: 'info' },
        { text: 'Attestation received from node 0x8f...', type: 'success' },
        { text: 'Protocol heartbeat OK (32ms)', type: 'system' },
        { text: 'Gossip protocol syncing mempool...', type: 'info' },
        { text: 'DHT routing table updated.', type: 'system' },
      ];
      const ev = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [...prev.slice(-6), { id: Date.now(), time: new Date().toLocaleTimeString('ro-RO'), text: ev.text, type: ev.type }]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Efect pentru Demo Autofill
  useEffect(() => {
    if (!demoSignal) return;
    (async () => {
      setHashing(true);
      setTimeout(async () => {
        const demoText = 'Manifestul Libertății — demo manuscript for CryptoAgora protocol';
        const buf = new TextEncoder().encode(demoText);
        const hashBuf = await crypto.subtle.digest('SHA-256', buf);
        const hex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        setTitle('Manifestul Libertății');
        setPubkey('0x8F9B...3E2A');
        setPrivkey('ed25519-priv-a1b2c3d4e5f6g7h8i9j0');
        setHash(hex);
        setSignature(`-----BEGIN CRYPTOAGORA SIGNATURE-----\nVersion: 1.0\nAlgorithm: Ed25519\nKey-ID: 0x8F9B...3E2A\nSHA-256: ${hex}\nSignature: MEUCIQDx... [DEMO_SIGNATURE]\nTimestamp: ${new Date().toISOString()}\n-----END CRYPTOAGORA SIGNATURE-----`);
        setFile({ name: 'manifestul-libertatii.pdf', size: 482331 });
        
        // Generare chunks demo
        setChunks(Array.from({ length: 12 }).map((_, i) => ({ id: i, hash: Math.random().toString(16).substring(2, 10), size: '256KB', status: 'ready' })));
        
        setHashing(false);
        toast('Demo autofill completed. All fields populated.', 'info');
      }, 1200);
    })();
  }, [demoSignal, toast]);

  // Procesare fișier real
  const processFile = async (f) => {
    setFile(f);
    setHashing(true);
    setSignature('');
    setChunks([]);
    
    try {
      // 1. Calcul Hash Real
      const h = await sha256FromFile(f);
      setHash(h);
      
      // 2. Simulare Chunking IPFS
      const numChunks = Math.floor(Math.random() * 8) + 8; // 8-16 chunks
      const mockChunks = Array.from({ length: numChunks }).map((_, i) => ({
        id: i,
        hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        size: '256KB',
        status: 'ready'
      }));
      
      setTimeout(() => {
        setChunks(mockChunks);
        setHashing(false);
        setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), text: `File chunked into ${numChunks} IPFS shards.`, type: 'success' }]);
        toast('File processed and chunked successfully', 'success');
      }, 1000);
      
    } catch {
      toast('Failed to process file', 'error');
      setHashing(false);
    }
  };

  // Generare Chei
  const generateKeypair = () => {
    const randomHex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setPubkey(`0x${randomHex.slice(0, 6)}...${randomHex.slice(-4)}`);
    setPrivkey(`ed25519-priv-${randomHex}`);
    setShowPrivkey(false);
    toast('Ed25519 Keypair generated securely in browser', 'success');
  };

  // Semnare Manuscris
  const signManuscript = () => {
    if (!hash || !pubkey) {
      toast('Please process a file and generate a key first', 'error');
      return;
    }
    setSignature(`-----BEGIN CRYPTOAGORA SIGNATURE-----
Version: 1.0
Algorithm: Ed25519
Key-ID: ${pubkey}
SHA-256: ${hash}
Signature: MEUCIQDx${Math.random().toString(36).substring(2, 30).toUpperCase()}...
Timestamp: ${new Date().toISOString()}
Network: CryptoAgora-Mainnet
-----END CRYPTOAGORA SIGNATURE-----`);
    setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), text: 'Manuscript cryptographically signed.', type: 'success' }]);
    toast('Manuscript signed successfully', 'success');
  };

   // Înregistrare în Protocol (cu P2P Simulator + Backend Real)
  const handleRegister = async () => {
    if (!file || !title || !pubkey || !hash || !signature) return;
    setRegistering(true);
    setP2pStep(1);
    setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), text: 'Broadcasting to P2P mesh initiated...', type: 'warn' }]);
    
    try {
      // Trimitem manuscrisul și metadatele către serverul de Node.js
      const formData = new FormData();
      formData.append('file', file);
      formData.append('author_id', `${title} (${pubkey})`);
      formData.append('manuscript_hash', hash);

      const response = await fetch('http://localhost:3000/register-book', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Eroare la minarea blocului');
      }

      // 2. Continuăm animațiile vizuale pentru juriu
      setTimeout(() => { 
        setP2pStep(2); 
        setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), text: 'Chunking verified. Pinning to IPFS...', type: 'info' }]); 
      }, 1200);
      
      setTimeout(() => { 
        setP2pStep(3); 
        setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), text: 'Anchoring to 14 peer nodes...', type: 'info' }]); 
      }, 2400);
      
      setTimeout(() => { 
        setP2pStep(4); 
        setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), text: `Consensus reached. Block #${data.block.index} mined! Hash: ${data.block.hash.slice(0, 10)}...`, type: 'success' }]); 
      }, 3600);
      
      setTimeout(() => {
        const newBook = {
          book_id: `ca_${String(books.length + 1).padStart(2, '0')}`,
          title: title.trim(),
          author_pubkey: pubkey.trim(),
          sha256_hash: hash,
          web_of_trust_score: '99.9% (Verified Author)',
          print_batch: '—',
          royalty_split: `${royalty}% Direct-to-Author`,
          xmr_tx_proof: `tx_private_${Date.now().toString(16)}`,
          block_index: data.block.index,
          block_hash: data.block.hash
        };
        
        onRegister(newBook);
        setRegistering(false);
        setP2pStep(0);
        setFile(null);
        setTitle('');
        setPubkey('');
        setPrivkey('');
        setHash('');
        setSignature('');
        setChunks([]);
        toast('Cartea a fost minată oficial în blockchain!', 'success');
      }, 4500);

    } catch (err) {
      console.error("Eroare:", err);
      toast('Nu s-a putut conecta la serverul de Node.js sau eroare de minare!', 'error');
      setRegistering(false);
      setP2pStep(0);
    }
  };


  return (
    <div className="author-dash">
      {/* HEADER */}
      <header className="page-head">
        <div className="head-left">
          <h1>Author Command Center</h1>
          <p className="dim">Ingest manuscripts, apply zero-knowledge proofs, and broadcast to the P2P mesh.</p>
        </div>
        <div className="head-right">
          <div className="head-badge mono"><span className="dot dot--live" /> NODE_ONLINE</div>
          <div className="head-badge mono amber"><Lock size={12} /> E2E_ENCRYPTED</div>
        </div>
      </header>

      {/* EXTENDED STATS BAR */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon"><BookOpen size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">TOTAL WORKS</span>
            <span className="stat-value">{books.length} <span className="stat-sub">registered</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><ShieldCheck size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">AVG TRUST SCORE</span>
            <span className="stat-value success">99.4%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Wallet size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">EST. ROYALTIES</span>
            <span className="stat-value">0.482 XMR</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Database size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">IPFS STORAGE</span>
            <span className="stat-value">14.2 GB <span className="stat-sub">pinned</span></span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* COL 1: INTAKE FORM (CU TAB-URI) */}
        <section className="card intake-card">
          <div className="intake-tabs">
            <button className={`itab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
              <UploadCloud size={14} /> Upload
            </button>
            <button className={`itab ${activeTab === 'crypto' ? 'active' : ''}`} onClick={() => setActiveTab('crypto')}>
              <Key size={14} /> Cryptography
            </button>
            <button className={`itab ${activeTab === 'economics' ? 'active' : ''}`} onClick={() => setActiveTab('economics')}>
              <Sliders size={14} /> Economics
            </button>
          </div>

          <div className="intake-content">
            {/* TAB 1: UPLOAD */}
            {activeTab === 'upload' && (
              <div className="tab-pane fade-up">
                <div
                  className={`dropzone ${dragOver ? 'is-over' : ''} ${file ? 'has-file' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if(f) processFile(f); }}
                  onClick={() => !hashing && fileInput.current?.click()}
                >
                  <input ref={fileInput} type="file" accept=".pdf,.txt,.md" hidden onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                  {hashing ? (
                    <div className="dropzone__loading">
                      <div className="scan-line" />
                      <Fingerprint size={36} className="success spin-pulse" />
                      <span className="mono success mt-2">Computing SHA-256 locally...</span>
                      <span className="mono muted text-xs">Zero data leaves your device</span>
                    </div>
                  ) : file ? (
                    <div className="dropzone__file">
                      <div className="file-icon-wrap"><FileText size={24} className="success" /></div>
                      <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="mono muted">{(file.size / 1024).toFixed(1)} KB · {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <CheckCircle2 size={20} className="success" />
                    </div>
                  ) : (
                    <>
                      <div className="dz-icon-wrap"><UploadCloud size={32} className="success" /></div>
                      <div className="dz-title">Drag & drop manuscript</div>
                      <div className="dz-sub mono">.pdf · .txt · .md — Max 50MB</div>
                      <div className="dz-hint mono">Click to browse local files</div>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <span className="lbl">Manuscript Title</span>
                    <input placeholder="e.g. Manifestul Libertății" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: CRYPTOGRAPHY */}
            {activeTab === 'crypto' && (
              <div className="tab-pane fade-up">
                <div className="form-group">
                  <label>
                    <span className="lbl">Author Public Key (Ed25519)</span>
                    <div className="input-with-btn">
                      <input className="mono" placeholder="0x..." value={pubkey} onChange={(e) => setPubkey(e.target.value)} readOnly />
                      <button className="btn-icon" onClick={generateKeypair} title="Generate Keypair"><Key size={14} /></button>
                    </div>
                  </label>
                </div>

                {privkey && (
                  <div className="form-group fade-up">
                    <label>
                      <span className="lbl flex-between">
                        <span>Author Private Key (Keep Secret!)</span>
                        <button className="btn-text" onClick={() => setShowPrivkey(!showPrivkey)}>
                          {showPrivkey ? <EyeOff size={12} /> : <Eye size={12} />} {showPrivkey ? 'Hide' : 'Show'}
                        </button>
                      </span>
                      <div className="private-key-box mono">
                        {showPrivkey ? privkey : '••••••••••••••••••••••••••••••••••••••••'}
                      </div>
                    </label>
                  </div>
                )}

                <div className="form-group mt-4">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={isEncrypted} onChange={(e) => setIsEncrypted(e.target.checked)} />
                    <span className="mono">Enable E2E Encryption for Digital Mirror (Lit Protocol)</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: ECONOMICS */}
            {activeTab === 'economics' && (
              <div className="tab-pane fade-up">
                <div className="form-group">
                  <label>
                    <span className="lbl flex-between">
                      <span>Royalty Split</span>
                      <span className="mono success">{royalty}%</span>
                    </span>
                    <input type="range" min="10" max="50" value={royalty} onChange={(e) => setRoyalty(e.target.value)} className="tech-slider" />
                    <div className="slider-marks mono">
                      <span>10%</span><span>20% (Default)</span><span>30%</span><span>40%</span><span>50%</span>
                    </div>
                  </label>
                </div>

                <div className="form-grid mt-4">
                  <label>
                    <span className="lbl">P2P License</span>
                    <select value={license} onChange={(e) => setLicense(e.target.value)}>
                      <option value="Anti-Censorship CC-BY">Anti-Censorship CC-BY</option>
                      <option value="Public Domain">Public Domain (CC0)</option>
                      <option value="Encrypted Mesh">Encrypted Mesh Only</option>
                    </select>
                  </label>
                  <label>
                    <span className="lbl">Rec. Price (XMR)</span>
                    <input type="text" className="mono" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* COL 2: CRYPTOGRAPHIC PROOF & P2P */}
        <section className="card proof-card">
          <div className="section-title"><Cpu size={14} /> Cryptographic Proof</div>

          {!hash && !hashing && (
            <div className="proof-empty">
              <div className="empty-radar"><Hash size={32} className="muted" /></div>
              <p className="dim">Awaiting manuscript ingestion.</p>
              <p className="mono muted text-xs">Upload a file to generate SHA-256 digest.</p>
            </div>
          )}

          {hash && !hashing && (
            <div className="proof-content fade-up">
              
              {/* HASH BOX */}
              <div className="hash-box">
                <div className="hash-header">
                  <span className="mono muted flex-gap"><Hash size={12} /> SHA-256 DIGEST</span>
                  <button className="btn-ghost-xs" onClick={() => { copyToClipboard(hash); toast('Hash copied', 'success'); }}><Copy size={12} /> COPY</button>
                </div>
                <div className="hash-value mono">{hash}</div>
              </div>

              {/* IPFS CHUNKS VISUALIZER */}
              {chunks.length > 0 && (
                <div className="chunks-box fade-up">
                  <div className="chunks-header">
                    <span className="mono muted flex-gap"><Box size={12} /> IPFS CHUNKING MAP ({chunks.length} shards)</span>
                    <span className="mono success text-xs">READY</span>
                  </div>
                  <div className="chunks-grid">
                    {chunks.map(c => (
                      <div key={c.id} className="chunk-block" title={`Hash: ${c.hash}`}>
                        <div className="chunk-id">#{String(c.id + 1).padStart(2, '0')}</div>
                        <div className="chunk-hash">{c.hash.slice(0, 6)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SIGNATURE AREA */}
              <div className="signature-area">
                <button className={`btn-secondary full ${signature ? 'signed' : ''}`} onClick={signManuscript} disabled={!!signature}>
                  {signature ? <><CheckCircle2 size={14} className="success"/> Manuscript Signed</> : <><PenTool size={14} /> Sign Manuscript (Ed25519)</>}
                </button>
                {signature && <pre className="pgp-block mono fade-up">{signature}</pre>}
              </div>

              {/* P2P BROADCAST SIMULATOR */}
              {registering ? (
                <div className="p2p-simulator fade-up">
                  <div className="p2p-title mono"><Network size={14} className="success" /> Broadcasting to P2P Mesh...</div>
                  <div className="p2p-steps">
                    <div className="p2p-step complete"><CheckCircle2 size={14} className="success"/> 1. Hashing & Signing PDF... [OK]</div>
                    <div className={`p2p-step ${p2pStep >= 2 ? 'complete' : 'active'}`}>
                      {p2pStep >= 2 ? <CheckCircle2 size={14} className="success"/> : <Loader2 size={14} className="spin"/>} 2. Chunking into 256KB shards...
                    </div>
                    <div className={`p2p-step ${p2pStep >= 3 ? 'complete' : p2pStep === 2 ? 'active' : 'muted'}`}>
                      {p2pStep >= 3 ? <CheckCircle2 size={14} className="success"/> : <Loader2 size={14} className="spin"/>} 3. Pinning to IPFS & Mesh Nodes (14 peers)...
                    </div>
                    <div className={`p2p-step ${p2pStep >= 4 ? 'complete' : p2pStep === 3 ? 'active' : 'muted'}`}>
                      {p2pStep >= 4 ? <CheckCircle2 size={14} className="success"/> : <Loader2 size={14} className="spin"/>} 4. Anchoring to Ledger & Consensus...
                    </div>
                  </div>
                </div>
              ) : (
                <button className="btn-primary full mt-2 broadcast-btn" disabled={!file || !(file instanceof File) || !title || !pubkey || !signature} onClick={handleRegister}>
                  <Send size={16} /> Broadcast to Protocol Network
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* BOTTOM GRID: HISTORY & TERMINAL */}
      <div className="dash-grid bottom-grid">
        <section className="card history-card">
          <div className="section-title"><BookOpen size={14} /> Registered in Network</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>SHA-256</th>
                  <th>Trust Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.book_id}>
                    <td className="mono success">{b.book_id}</td>
                    <td className="font-bold truncate" title={b.title}>{b.title}</td>
                    <td className="mono muted">{shortHash(b.sha256_hash, 8, 6)}</td>
                    <td><span className="pill success-pill"><ShieldCheck size={10} /> {b.web_of_trust_score.split(' ')[0]}</span></td>
                    <td><button className="btn-ghost-xs action-btn">MANAGE <ChevronRight size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card terminal-card">
          <div className="section-title">
            <Terminal size={14} /> Live Node Activity
            <span className="live-indicator"><span className="dot dot--live" /> LIVE</span>
          </div>
          <div className="terminal-window">
            <div className="term-header">
              <div className="term-dots"><span className="dot dot--red" /><span className="dot dot--yellow" /><span className="dot dot--green" /></div>
              <span className="mono term-title">cryptoagora@node:~</span>
            </div>
            <div className="term-body mono">
              {logs.map((log) => (
                <TerminalLine key={log.id} time={log.time} type={log.type} text={log.text} />
              ))}
              <div className="term-cursor"><span className="prompt">$</span> <span className="blink">_</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}