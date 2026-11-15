import { useEffect, useState } from 'react';
import { AlertTriangle, BrainCircuit, CheckCircle2, Clock3, Gauge, Loader2, Network, ShieldCheck } from 'lucide-react';
import { shortHash } from '../utils/crypto';
import './TrustDashboard.css';

const API_BASE = 'http://localhost:3000';

export default function TrustDashboard({ authToken }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/profiles`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Profilurile nu au putut fi încărcate.');
        return response.json();
      })
      .then((data) => {
        const nextProfiles = Array.isArray(data.profiles) ? data.profiles : [];
        setProfiles(nextProfiles);
        setSelectedId(nextProfiles[0]?.profile_id || '');
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  const investigate = async () => {
    if (!selectedId) return;
    setInvestigation(null);
    setMessage('');
    setInvestigating(true);
    try {
      const response = await fetch(`${API_BASE}/trust/investigate/${selectedId}`);
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Investigația a eșuat.');
        return;
      }
      setInvestigation(data);
    } catch (error) {
      setMessage(error.message || 'Investigația a eșuat.');
    } finally {
      setInvestigating(false);
    }
  };

  const selectedProfile = profiles.find((profile) => profile.profile_id === selectedId);
  const selectedIsPublisher = selectedProfile?.profile_type === 'publisher';

  return (
    <div className="trust-page fade-up">
      <header className="page-head">
        <h1>Web of Trust</h1>
        <p className="dim">Demonstrație de verificare comunitară și agenți AI pentru detectarea comportamentului suspect.</p>
      </header>

      <section className="card trust-intro">
        <Network size={24} className="success" />
        <div>
          <strong>Community order layer</strong>
          <p>Attestations ajută autorii legitimi, iar reports trimit cazurile suspecte la review. Agenții recomandă, nu banează automat.</p>
        </div>
      </section>

      <section className="card trust-controls">
        <label className="field">
          <span>Profil investigat</span>
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={loading}>
            {profiles.map((profile) => (
              <option key={profile.profile_id} value={profile.profile_id}>
                {profile.display_name || profile.company_name} — {profile.public_key ? shortHash(profile.public_key, 12, 8) : 'fără cheie'}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-primary" onClick={investigate} disabled={!selectedId || loading}>
          {investigating ? <Loader2 size={15} className="spin" /> : <BrainCircuit size={15} />}
          {investigating ? 'Agenții analizează...' : 'Rulează investigația'}
        </button>
        {selectedProfile && <span className="mono trust-profile-key">{shortHash(selectedProfile.public_key || '', 18, 8)}</span>}
      </section>

      {message && <div className="card trust-message"><AlertTriangle size={16} /> {message}</div>}
      {loading && <div className="trust-empty"><Loader2 size={22} className="spin" /> Se încarcă profilurile...</div>}

      {investigation && (
        <section className="trust-results">
          <div className="card trust-verdict">
            <div>
              <span className="muted">TRUST ARBITER VERDICT</span>
              <h2>{investigation.verdict}</h2>
            </div>
            <strong className="trust-score">{investigation.score}/100</strong>
          </div>
          <div className="trust-scan-meta">
            <span><Clock3 size={13} /> {new Date(investigation.investigated_at).toLocaleTimeString()}</span>
            <span><Gauge size={13} /> {investigation.ai_enabled ? 'AI + deterministic agents' : 'Deterministic agents'}</span>
          </div>
          <div className="trust-metrics">
            <div className="card"><strong>{selectedIsPublisher ? investigation.metrics.print_runs : investigation.metrics.books}</strong><span>{selectedIsPublisher ? 'tiraje' : 'cărți'}</span></div>
            <div className="card"><strong>{selectedIsPublisher ? investigation.metrics.qr_codes : investigation.metrics.attestations}</strong><span>{selectedIsPublisher ? 'coduri QR' : 'attestations'}</span></div>
            <div className="card"><strong>{selectedIsPublisher ? investigation.metrics.payments : investigation.metrics.reports}</strong><span>{selectedIsPublisher ? 'plăți' : 'reports'}</span></div>
            <div className="card"><strong>{selectedIsPublisher ? investigation.metrics.qr_reports : investigation.metrics.duplicate_hashes}</strong><span>{selectedIsPublisher ? 'QR reports' : 'duplicate'}</span></div>
          </div>
          <div className="trust-agents">
            {investigation.agents.map((agent) => {
              const pass = agent.status === 'PASS' || agent.status === 'TRUSTED';
              return (
                <article className="card trust-agent" key={agent.name}>
                  {pass ? <CheckCircle2 size={18} className="success" /> : <AlertTriangle size={18} className="warning" />}
                  <div>
                    <h3>{agent.name}</h3>
                    <strong className={pass ? 'success' : 'warning'}>{agent.status}</strong>
                    <p>{agent.reason}</p>
                    <div className="trust-agent__evidence">{agent.evidence}</div>
                    <div className="trust-confidence">
                      <span>confidence {agent.confidence}%</span>
                      <i><b style={{ width: `${agent.confidence}%` }} /></i>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="card trust-recommendation"><ShieldCheck size={16} className="success" /><span>{investigation.recommendation}</span></div>
        </section>
      )}
    </div>
  );
}
