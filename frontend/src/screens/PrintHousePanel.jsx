import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer, Download, Hash, Package, Barcode, CheckCircle2, Loader2,
} from 'lucide-react';
import { shortHash } from '../utils/crypto';
import { useToast } from '../components/Toast';
import CopyButton from '../components/CopyButton';
import './PrintHousePanel.css';

export default function PrintHousePanel({ books, authToken }) {
  const toast = useToast();
  const qrWrapRef = useRef(null);
  const [bookId, setBookId] = useState(books[0]?.book_id || '');
  const [batch, setBatch] = useState(500);
  const [royalty, setRoyalty] = useState(20);
  const [code, setCode] = useState('RO');
  const [run, setRun] = useState(null);
  const [printRuns, setPrintRuns] = useState([]);
  const [selectedCopyId, setSelectedCopyId] = useState('');
  const [generating, setGenerating] = useState(false);

  const book = useMemo(() => books.find((b) => b.book_id === bookId), [books, bookId]);
  const copies = run?.copies || [];
  const copy = copies.find((item) => item.copy_id === selectedCopyId) || copies[0];
  const token = run?.run_id || '';

  useEffect(() => {
    let active = true;
    fetch('http://localhost:3000/my-print-runs', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Istoricul tirajelor nu a putut fi încărcat.');
        return data;
      })
      .then((data) => {
        if (active) setPrintRuns(Array.isArray(data.print_runs) ? data.print_runs : []);
      })
      .catch(() => {
        if (active) setPrintRuns([]);
      });

    return () => {
      active = false;
    };
  }, [authToken]);

  const verifyUrl = useMemo(() => {
    if (!book || !copy) return '';
    const origin = window.location.origin;
    return `${origin}/?copy_id=${encodeURIComponent(copy.copy_id)}`;
  }, [book, copy]);

  const handleGenerate = async () => {
    if (!book) return;
    setGenerating(true);
    try {
      const response = await fetch('http://localhost:3000/print-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          book_id: book.book_id,
          quantity: batch,
          royalty_percent: royalty,
          print_house_code: code,
        }),
      });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          response.status === 404
            ? 'Backendul rulează o versiune veche. Oprește-l și pornește din nou cu npm start.'
            : 'Backendul a trimis un răspuns invalid.'
        );
      }
      if (!response.ok) throw new Error(data.error || 'Tirajul nu a putut fi creat.');
      setRun(data.run);
      setPrintRuns((previous) => [data.run, ...previous]);
      setSelectedCopyId(data.run.copies[0]?.copy_id || '');
      toast(`Tiraj aprobat: ${data.run.quantity} exemplare unice`, 'success');
    } catch (error) {
      toast(error.message || 'Nu s-a putut crea tirajul.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  const downloadPng = async () => {
    const qrSvgEl = qrWrapRef.current?.querySelector('svg');
    if (!qrSvgEl || !book || !copy) return;
    toast('Rendering sticker PNG…', 'info');

    const qrSvgString = new XMLSerializer().serializeToString(qrSvgEl);
    const qrDataUrl =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(qrSvgString)));

    const W = 640, H = 820;
    const esc = (s = '') =>
      String(s).replace(/[<>&"']/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c])
      );

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <rect width="100%" height="100%" fill="#05070a"/>
      <rect x="16" y="16" width="${W - 32}" height="${H - 32}" fill="none" stroke="#00e5ff" stroke-width="2" stroke-dasharray="10 8" rx="8"/>
      <text x="${W / 2}" y="70" text-anchor="middle" fill="#00e5ff" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" letter-spacing="4">CRYPTOAGORA</text>
      <text x="${W / 2}" y="96" text-anchor="middle" fill="#7f8ea3" font-family="JetBrains Mono, monospace" font-size="10" letter-spacing="3">PUBLISH • VERIFY • OWN</text>
      <image href="${qrDataUrl}" x="${W / 2 - 210}" y="130" width="420" height="420"/>
      <text x="${W / 2}" y="600" text-anchor="middle" fill="#e8ecef" font-family="JetBrains Mono, monospace" font-size="16" font-weight="600">${esc(book.title)}</text>
      <text x="${W / 2}" y="630" text-anchor="middle" fill="#f59e0b" font-family="JetBrains Mono, monospace" font-size="14" letter-spacing="1">${esc(token)}</text>
      <text x="${W / 2}" y="665" text-anchor="middle" fill="#7f8ea3" font-family="JetBrains Mono, monospace" font-size="10">SHA-256 · ${esc(shortHash(book.sha256_hash, 20, 10))}</text>
      <text x="${W / 2}" y="690" text-anchor="middle" fill="#7f8ea3" font-family="JetBrains Mono, monospace" font-size="10">BOOK ID · ${esc(book.book_id)}</text>
      <text x="${W / 2}" y="760" text-anchor="middle" fill="#10b981" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="2">SCAN TO VERIFY AUTHENTICITY</text>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = W * 2;
      c.height = H * 2;
      const ctx = c.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, W, H);
      c.toBlob((pngBlob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(pngBlob);
        a.download = `cryptoagora-${copy.copy_id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = url;
  };

  return (
    <div className="print-house">
      <header className="page-head">
        <h1>Print House Panel</h1>
        <p className="dim">
        Autorul aprobă tirajul, iar fiecare exemplar primește un QR unic verificabil.
        </p>
      </header>

      <section className="card no-print">
        <div className="section-title">Approved Print Runs</div>
        {printRuns.length === 0 ? (
          <p className="dim">Nu ai încă tiraje aprobate pentru cărțile tale.</p>
        ) : (
          <div className="print-runs-list">
            {printRuns.map((item) => (
              <button
                type="button"
                className={`print-run-row ${run?.run_id === item.run_id ? 'is-active' : ''}`}
                key={item.run_id}
                onClick={() => {
                  setRun(item);
                  setSelectedCopyId(item.copies[0]?.copy_id || '');
                  setBookId(item.book_id);
                }}
              >
                <span className="mono">{item.run_id}</span>
                <span>{item.book_id}</span>
                <span>{item.quantity} copii</span>
                <span>{item.royalty_percent}% autor</span>
                <span className="muted">{new Date(item.approved_at).toLocaleDateString('ro-RO')}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="print-house__grid">
        {/* Controls */}
        <section className="card no-print">
          <div className="section-title">Print Run Configuration</div>

          <label className="field">
            <span>Select Registered Work</span>
            <select value={bookId} onChange={(e) => { setBookId(e.target.value); setRun(null); setSelectedCopyId(''); }}>
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.book_id} — {b.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid-2">
            <label className="field">
              <span>Print Run Size</span>
              <input
                type="number"
                min={1}
                value={batch}
                onChange={(e) => setBatch(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <label className="field">
              <span>Author Royalty (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={royalty}
                onChange={(e) => setRoyalty(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
              />
            </label>
            <label className="field">
              <span>Print House Code</span>
              <input
                className="mono"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </label>
          </div>

          {book && (
            <div className="book-preview">
              <div className="book-preview__row">
                <Hash size={13} className="muted" />
                <span className="mono muted">SHA-256</span>
                <span className="mono">{shortHash(book.sha256_hash, 14, 8)}</span>
                <CopyButton value={book.sha256_hash} label="Copy" />
              </div>
              <div className="book-preview__row">
                <Package size={13} className="muted" />
                <span className="mono muted">AUTHOR</span>
                <span className="mono">{book.author_pubkey}</span>
              </div>
            </div>
          )}

          <button
            className="btn-primary full"
            style={{ marginTop: 16 }}
            disabled={!book || generating}
            onClick={handleGenerate}
          >
            {generating ? <Loader2 size={15} className="spin" /> : <Barcode size={15} />}
            {generating ? 'Creating approved run…' : 'Approve Print Run'}
          </button>

          {run && (
            <div className="token-badge">
              <CheckCircle2 size={16} className="success" />
              <span><strong className="mono">{run.run_id}</strong> · {run.quantity} unique copies · {run.royalty_percent}% author royalty</span>
            </div>
          )}
        </section>

        {/* Sticker preview */}
        <section className="card">
          <div className="section-title no-print">
            <Barcode size={14} /> Sticker Preview
          </div>

          {!copy ? (
            <div className="sticker-empty">
              <Barcode size={28} className="muted" />
              <p className="dim">Generate a token to preview the sticker.</p>
            </div>
          ) : (
            <>
              <div className="sticker print-area" ref={qrWrapRef}>
                <div className="sticker__cutmark sticker__cutmark--tl" />
                <div className="sticker__cutmark sticker__cutmark--tr" />
                <div className="sticker__cutmark sticker__cutmark--bl" />
                <div className="sticker__cutmark sticker__cutmark--br" />

                <div className="sticker__head">
                  <div className="sticker__brand">CRYPTOAGORA</div>
                  <div className="sticker__tagline">PHYSICAL-TO-DIGITAL PROTOCOL</div>
                </div>

                <div className="sticker__qr">
                  <QRCodeSVG
                    value={verifyUrl}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#05070a"
                    level="M"
                  />
                </div>

                <div className="sticker__title">{book?.title}</div>
                <div className="sticker__lot mono">{run.run_id} · COPY {copy.sequence}/{run.quantity}</div>
                <div className="sticker__meta mono">
                  SHA-256 · {shortHash(book?.sha256_hash, 16, 8)}
                </div>
                <div className="sticker__meta mono">BOOK ID · {book?.book_id}</div>
                <div className="sticker__meta mono">COPY ID · {copy.copy_id}</div>
                <div className="sticker__cta">SCAN TO VERIFY AUTHENTICITY</div>
              </div>

              <div className="sticker__actions no-print">
                <button className="btn-secondary" onClick={handlePrint}>
                  <Printer size={15} /> Print Sticker
                </button>
                <button className="btn-amber" onClick={downloadPng}>
                  <Download size={15} /> Download PNG
                </button>
              </div>
              <label className="field no-print copy-selector">
                <span>Exemplar pentru printare</span>
                <select value={copy.copy_id} onChange={(event) => setSelectedCopyId(event.target.value)}>
                  {copies.map((item) => (
                    <option key={item.copy_id} value={item.copy_id}>
                      COPY {item.sequence}/{run.quantity} — {item.copy_id}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </section>
      </div>
    </div>
  );
}