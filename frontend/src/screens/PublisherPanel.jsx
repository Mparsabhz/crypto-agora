import { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, Package, Printer, ShieldCheck, UserRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './PublisherPanel.css';

export default function PublisherPanel({ authToken }) {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedCopyId, setSelectedCopyId] = useState('');
  const [printAll, setPrintAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('http://localhost:3000/my-publisher-runs', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Tirajele nu au putut fi încărcate.');
        return data;
      })
      .then((data) => {
        if (active) setRuns(Array.isArray(data.print_runs) ? data.print_runs : []);
      })
      .catch(() => {
        if (active) setRuns([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [authToken]);

  const selectedCopy = selectedRun?.copies?.find((copy) => copy.copy_id === selectedCopyId)
    || selectedRun?.copies?.[0];
  const verificationUrl = selectedCopy
    ? `${window.location.origin}/?copy_id=${encodeURIComponent(selectedCopy.copy_id)}`
    : '';
  const printPages = selectedRun
    ? Array.from({ length: Math.ceil(selectedRun.copies.length / 12) }, (_, pageIndex) => (
      selectedRun.copies.slice(pageIndex * 12, pageIndex * 12 + 12)
    ))
    : [];

  return (
    <div className="publisher-panel fade-up">
      <header className="page-head">
        <h1>Publisher Workspace</h1>
        <p className="dim">Tirajele pe care autorii le-au binecuvântat pentru editura ta.</p>
      </header>

      <section className="card publisher-panel__intro">
        <ShieldCheck size={24} className="success" />
        <div>
          <strong>Author blessing registry</strong>
          <p>Un tiraj apare aici doar după ce autorul îl aprobă explicit pentru editura ta.</p>
        </div>
      </section>

      {loading ? (
        <div className="publisher-panel__empty"><Loader2 size={24} className="spin" /> Se încarcă aprobările...</div>
      ) : runs.length === 0 ? (
        <div className="card publisher-panel__empty">Nu ai încă tiraje aprobate de autori.</div>
      ) : (
        <div className="publisher-runs">
          {runs.map((run) => (
            <article className="card publisher-run" key={run.run_id}>
              <div className="publisher-run__header">
                <div>
                  <span className="mono muted">{run.run_id}</span>
                  <h2>{run.book_title || run.book_id}</h2>
                  <p className="publisher-run__author"><UserRound size={12} /> {run.author_name || 'Autor necunoscut'}</p>
                </div>
                <span className="pill success-pill"><CheckCircle2 size={11} /> BLESSED</span>
              </div>
              <div className="publisher-run__data">
                <span><Package size={13} /> {run.quantity} exemplare</span>
                <span>{run.royalty_percent}% royalty autor</span>
                <span>Coduri QR unice per exemplar</span>
              </div>
              <div className="publisher-run__keys">
                <div><KeyRound size={12} /> AUTHOR KEY <strong className="mono">{run.author_public_key}</strong></div>
                <div><KeyRound size={12} /> PUBLISHER KEY <strong className="mono">{run.publisher_public_key}</strong></div>
              </div>
              <button type="button" className="btn-secondary publisher-run__button" onClick={() => {
                setSelectedRun(run);
                setSelectedCopyId(run.copies?.[0]?.copy_id || '');
              }}>
                <Printer size={14} /> Deschide codurile QR
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedRun && selectedCopy && (
        <section className="card publisher-codes">
          <div className="publisher-codes__header">
            <div>
              <div className="section-title"><Printer size={15} /> QR codes pentru {selectedRun.book_title || selectedRun.book_id}</div>
              <p className="dim">Fiecare exemplar are un cod unic care verifică exact copia scanată.</p>
            </div>
            <button type="button" className="btn-icon" onClick={() => setSelectedRun(null)} aria-label="Închide codurile QR">×</button>
          </div>
          <label className="field no-print">
            <span>Exemplar</span>
            <select value={selectedCopy.copy_id} onChange={(event) => setSelectedCopyId(event.target.value)}>
              {selectedRun.copies.map((copy) => (
                <option key={copy.copy_id} value={copy.copy_id}>
                  COPY {copy.sequence}/{selectedRun.quantity} — {copy.copy_id}
                </option>
              ))}
            </select>
          </label>
          <div className={`publisher-qr-card ${printAll ? 'no-print' : 'print-area'}`}>
            <QRCodeSVG value={verificationUrl} size={240} bgColor="#ffffff" fgColor="#05070a" level="M" />
            <strong>{selectedRun.book_id} · COPY {selectedCopy.sequence}/{selectedRun.quantity}</strong>
            <span className="mono">{selectedCopy.copy_id}</span>
          </div>
          <div className="publisher-codes__actions no-print">
            <button type="button" className="btn-primary" onClick={() => window.print()}><Printer size={14} /> Printează acest exemplar</button>
            <button type="button" className="btn-secondary" onClick={() => {
              setPrintAll(true);
              window.setTimeout(() => {
                window.print();
                setPrintAll(false);
              }, 100);
            }}><Printer size={14} /> Printează tirajul</button>
          </div>
          {printAll && (
            <div className="publisher-print-sheet print-area">
              {printPages.map((page, pageIndex) => (
                <div className={`publisher-print-page ${pageIndex > 0 ? 'publisher-print-page--next' : ''}`} key={`print-page-${pageIndex}`}>
                  {page.map((copy) => (
                    <div className="publisher-print-label" key={copy.copy_id}>
                      <QRCodeSVG value={`${window.location.origin}/?copy_id=${encodeURIComponent(copy.copy_id)}`} size={130} bgColor="#ffffff" fgColor="#05070a" level="M" />
                      <strong>{selectedRun.book_title || selectedRun.book_id} · COPY {copy.sequence}/{selectedRun.quantity}</strong>
                      <span className="mono">{copy.copy_id}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
