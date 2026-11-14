import { useState, useEffect } from 'react';
import {
  Globe, Activity, ShieldCheck, Zap, Radio, Network,
  ArrowRightLeft, Server, Hash, CheckCircle2, Clock,
  Database, Lock, Unlock, Cpu, ExternalLink
} from 'lucide-react';
import { shortHash } from '../utils/crypto';
import './NetworkExplorer.css';

export default function NetworkExplorer() {
  // Simulare date rețea
  const [feed, setFeed] = useState([
    { id: 1, type: 'tx', text: 'Batch LOT-2026-RO-500 verified', value: '+0.024 XMR sent to 0x8F9B...3E2A', time: '2 mins ago' },
    { id: 2, type: 'book', text: 'New book registered: "Codul Sursă al Rezistenței"', value: 'ca_03', time: '15 mins ago' },
    { id: 3, type: 'wot', text: 'Node 0x4A2F added 3 attestations', value: 'Web of Trust updated', time: '1 hr ago' },
    { id: 4, type: 'tx', text: 'Royalty split executed', value: '+0.012 XMR to 0x2E5D...8B3C', time: '2 hrs ago' },
  ]);

  const [nodes] = useState([
    { id: '0x4A2F...1B3C', latency: 24, status: 'synced', ipfs: 'pinned', type: 'Validator' },
    { id: '0x8F9B...3E2A', latency: 18, status: 'synced', ipfs: 'pinned', type: 'Author' },
    { id: '0x2E5D...8B3C', latency: 45, status: 'synced', ipfs: 'pinning', type: 'Relay' },
    { id: '0x9C1A...7F2D', latency: 12, status: 'synced', ipfs: 'pinned', type: 'Validator' },
    { id: '0x5B3E...4A1F', latency: 89, status: 'syncing', ipfs: 'none', type: 'Edge' },
  ]);

  // Generare feed live
  useEffect(() => {
    const interval = setInterval(() => {
      const events = [
        { type: 'tx', text: 'Micro-transaction confirmed', value: `+0.005 XMR to 0x${Math.random().toString(16).substring(2,6)}...${Math.random().toString(16).substring(2,6)}` },
        { type: 'book', text: 'New IPFS manifest pinned', value: `ca_0${Math.floor(Math.random() * 9) + 1}` },
        { type: 'wot', text: 'PGP Key verified by node', value: 'Trust score +0.1%' },
        { type: 'tx', text: 'Direct royalty split executed', value: `+0.018 XMR to 0x8F9B...3E2A` },
      ];
      const ev = events[Math.floor(Math.random() * events.length)];
      setFeed(prev => [{ id: Date.now(), ...ev, time: 'Just now' }, ...prev].slice(0, 6));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="explorer-page fade-up">
      <header className="page-head">
        <div>
          <h1>Network Explorer</h1>
          <p className="dim">Real-time telemetry of the CryptoAgora P2P mesh, IPFS shards, and Web of Trust.</p>
        </div>
        <div className="head-badge mono"><span className="dot dot--live" /> MAINNET · SYNCED</div>
      </header>

      {/* STATS ROW */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon"><Globe size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">ACTIVE NODES</span>
            <span className="stat-value">1,428</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Database size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">IPFS PINNED BOOKS</span>
            <span className="stat-value">342</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ArrowRightLeft size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">XMR TX / 24H</span>
            <span className="stat-value success">8,291</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Cpu size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">NETWORK LOAD</span>
            <span className="stat-value">14%</span>
          </div>
        </div>
      </div>

      <div className="explorer-grid">
        {/* LIVE FEED */}
        <section className="card">
          <div className="section-title">
            <Activity size={14} /> Live Global Feed
            <span className="live-badge mono"><span className="dot dot--live" /> LIVE</span>
          </div>
          <div className="feed-list">
            {feed.map((item) => (
              <div key={item.id} className="feed-item fade-up">
                <div className={`feed-icon ${item.type}`}>
                  {item.type === 'tx' && <ArrowRightLeft size={16} />}
                  {item.type === 'book' && <Globe size={16} />}
                  {item.type === 'wot' && <ShieldCheck size={16} />}
                </div>
                <div className="feed-content">
                  <div className="feed-text">{item.text}</div>
                  <div className="feed-value mono">{item.value}</div>
                </div>
                <div className="feed-time mono">{item.time}</div>
              </div>
            ))}
          </div>
        </section>

        {/* WEB OF TRUST ENDORSERS */}
        <section className="card">
          <div className="section-title"><Network size={14} /> Web of Trust Endorsers</div>
          <p className="dim text-sm mb-4">Author <span className="mono success">0x8F9B...3E2A</span> is cryptographically endorsed by:</p>
          
          <div className="endorser-grid">
            <div className="endorser-card">
              <div className="end-icon"><Zap size={18} className="amber"/></div>
              <div className="end-info">
                <div className="end-name">EFF Node #4</div>
                <div className="end-meta mono">PGP Age: 8.2 yrs · 14 attestations</div>
              </div>
              <div className="end-score mono success">+1.0</div>
            </div>

            <div className="endorser-card">
              <div className="end-icon"><Radio size={18} className="success"/></div>
              <div className="end-info">
                <div className="end-name">Independent Press TM</div>
                <div className="end-meta mono">PGP Age: 4.1 yrs · 8 attestations</div>
              </div>
              <div className="end-score mono success">+1.0</div>
            </div>

            <div className="endorser-card">
              <div className="end-icon"><Lock size={18} /></div>
              <div className="end-info">
                <div className="end-name">Anonymous Mesh DAO</div>
                <div className="end-meta mono">PGP Age: 2.5 yrs · 21 attestations</div>
              </div>
              <div className="end-score mono success">+1.0</div>
            </div>

            <div className="endorser-card">
              <div className="end-icon"><Server size={18} /></div>
              <div className="end-info">
                <div className="end-name">CryptoAgora Core Node</div>
                <div className="end-meta mono">Genesis Node · 100% uptime</div>
              </div>
              <div className="end-score mono success">+1.0</div>
            </div>
          </div>
          
          <div className="wot-summary">
            <div className="wot-score-big mono">99.4%</div>
            <div className="wot-text">
              <div className="success font-bold">Consensus Reached</div>
              <div className="mono muted">12 endorsers verified the signature mathematically.</div>
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM GRID: MESH TOPOLOGY & NODE LIST */}
      <div className="explorer-grid bottom-grid">
        
        {/* MESH GRAPH VISUALIZER */}
        <section className="card mesh-card">
          <div className="section-title"><Network size={14} /> P2P Mesh Topology</div>
          <div className="mesh-container">
            <svg className="mesh-lines" viewBox="0 0 400 250">
              {/* Linii care leagă nodurile */}
              <line x1="200" y1="125" x2="80" y2="60" stroke="var(--emerald-2)" strokeWidth="1.5" strokeDasharray="4 4" className="mesh-line" />
              <line x1="200" y1="125" x2="320" y2="60" stroke="var(--emerald-2)" strokeWidth="1.5" strokeDasharray="4 4" className="mesh-line" />
              <line x1="200" y1="125" x2="80" y2="190" stroke="var(--emerald-2)" strokeWidth="1.5" strokeDasharray="4 4" className="mesh-line" />
              <line x1="200" y1="125" x2="320" y2="190" stroke="var(--emerald-2)" strokeWidth="1.5" strokeDasharray="4 4" className="mesh-line" />
              <line x1="80" y1="60" x2="320" y2="60" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="2 4" />
              <line x1="80" y1="190" x2="320" y2="190" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="2 4" />
            </svg>
            
            {/* Nodul Central */}
            <div className="mesh-node center">
              <div className="node-pulse" />
              <ShieldCheck size={20} className="success" />
              <span className="node-label mono">Author</span>
            </div>
            
            {/* Noduri Periferice */}
            <div className="mesh-node top-left"><Server size={16} /><span className="node-label mono">Peer 0x4A</span></div>
            <div className="mesh-node top-right"><Radio size={16} /><span className="node-label mono">Peer 0x8F</span></div>
            <div className="mesh-node bottom-left"><Database size={16} /><span className="node-label mono">IPFS</span></div>
            <div className="mesh-node bottom-right"><Globe size={16} /><span className="node-label mono">Relay</span></div>
          </div>
        </section>

        {/* NODE TABLE */}
        <section className="card">
          <div className="section-title"><Server size={14} /> Active Peers</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Node ID</th><th>Type</th><th>Latency</th><th>IPFS</th></tr>
              </thead>
              <tbody>
                {nodes.map((n, i) => (
                  <tr key={i}>
                    <td className="mono success">{n.id}</td>
                    <td className="mono">{n.type}</td>
                    <td className="mono amber">{n.latency}ms</td>
                    <td>
                      <span className={`ipfs-badge ${n.ipfs}`}>
                        {n.ipfs === 'pinned' ? <CheckCircle2 size={10}/> : <Clock size={10}/>} {n.ipfs}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}