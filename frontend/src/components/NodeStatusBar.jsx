import { useEffect, useState } from 'react';
import { Radio, ShieldCheck, Activity, Wifi } from 'lucide-react';
import './NodeStatusBar.css';

export default function NodeStatusBar() {
  const [peers, setPeers] = useState(1247);
  const [latency, setLatency] = useState(38);
  const [wot, setWot] = useState(99.4);

  useEffect(() => {
    const id = setInterval(() => {
      setPeers((p) => Math.max(1180, p + Math.floor(Math.random() * 9) - 4));
      setLatency((l) => Math.max(20, Math.min(120, l + Math.floor(Math.random() * 7) - 3)));
      setWot((w) => Math.max(99.0, Math.min(99.9, w + (Math.random() - 0.5) * 0.05)));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="node-bar">
      <div className="node-bar__group">
        <div className="node-bar__item">
          <span className="dot dot--live" />
          <span className="node-bar__label">NODE</span>
          <span className="node-bar__value success">ONLINE</span>
        </div>
        <div className="node-bar__item">
          <Radio size={13} />
          <span className="node-bar__label">P2P PEERS</span>
          <span className="node-bar__value">{peers.toLocaleString()}</span>
        </div>
        <div className="node-bar__item">
          <Activity size={13} />
          <span className="node-bar__label">LATENCY</span>
          <span className="node-bar__value amber">{latency}ms</span>
        </div>
      </div>
      <div className="node-bar__group">
        <div className="node-bar__item">
          <ShieldCheck size={13} />
          <span className="node-bar__label">WEB OF TRUST</span>
          <span className="node-bar__value success">{wot.toFixed(2)}%</span>
        </div>
        <div className="node-bar__item">
          <Wifi size={13} />
          <span className="node-bar__label">CHAIN</span>
          <span className="node-bar__value">SYNCED</span>
        </div>
      </div>
    </div>
  );
}