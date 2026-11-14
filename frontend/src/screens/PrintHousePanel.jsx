import { useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer, Download, Hash, Package, Barcode, CheckCircle2, Loader2,
} from 'lucide-react';
import { shortHash } from '../utils/crypto';
import { useToast } from '../components/Toast';
import CopyButton from '../components/CopyButton';
import './PrintHousePanel.css';

export default function PrintHousePanel({ books }) {
  const toast = useToast();
  const qrWrapRef = useRef(null);
  const [bookId, setBookId] = useState(books[0]?.book_id || '');
  const [batch, setBatch] = useState(500);
  const [code, setCode] = useState('RO');
  const [token, setToken] = useState('');
  const [generating, setGenerating] = useState(false);

  const book = useMemo(() => books.find((b) => b.book_id === bookId), [books, bookId]);

  const verifyUrl = useMemo(() => {
    if (!book || !token) return '';
    const origin = window.location.origin;
    return `${origin}/?book_id=${book.book_id}&lot=${token}`;
  }, [book, token]);

  const handleGenerate = () => {
    if (!book) return;
    setGenerating(true);
    setTimeout(() => {
      setToken(`LOT-2026-${code.toUpperCase()}-${batch}`);
      setGenerating(false);
      toast('Print token generated', 'success');
    }, 700);
  };

  const handlePrint = () => window.print();

  const downloadPng = async () => {
    const qrSvgEl = qrWrapRef.current?.querySelector('svg');
    if (!qrSvgEl || !book) return;
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
      <rect width="100%" height="100%" fill="#0a0c10"/>
      <rect x="16" y="16" width="${W - 32}" height="${H - 32}" fill="none" stroke="#00ff88" stroke-width="2" stroke-dasharray="10 8" rx="8"/>
      <text x="${W / 2}" y="70" text-anchor="middle" fill="#00ff88" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" letter-spacing="4">CRYPTOAGORA</text>
      <text x="${W / 2}" y="96" text-anchor="middle" fill="#8b95a8" font-family="JetBrains Mono, monospace" font-size="10" letter-spacing="3">PHYSICAL-TO-DIGITAL PROTOCOL</text>
      <image href="${qrDataUrl}" x="${W / 2 - 210}" y="130" width="420" height="420"/>
      <text x="${W / 2}" y="600" text-anchor="middle" fill="#e6edf7" font-family="JetBrains Mono, monospace" font-size="16" font-weight="600">${esc(book.title)}</text>
      <text x="${W / 2}" y="630" text-anchor="middle" fill="#f59e0b" font-family="JetBrains Mono, monospace" font-size="14" letter-spacing="1">${esc(token)}</text>
      <text x="${W / 2}" y="665" text-anchor="middle" fill="#5a6478" font-family="JetBrains Mono, monospace" font-size="10">SHA-256 · ${esc(shortHash(book.sha256_hash, 20, 10))}</text>
      <text x="${W / 2}" y="690" text-anchor="middle" fill="#5a6478" font-family="JetBrains Mono, monospace" font-size="10">BOOK ID · ${esc(book.book_id)}</text>
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
        a.download = `cryptoagora-sticker-${token}.png`;
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
          Mint a print-run token and generate a QR sticker for physical distribution.
        </p>
      </header>

      <div className="print-house__grid">
        {/* Controls */}
        <section className="card no-print">
          <div className="section-title">Print Run Configuration</div>

          <label className="field">
            <span>Select Registered Work</span>
            <select value={bookId} onChange={(e) => { setBookId(e.target.value); setToken(''); }}>
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
            {generating ? 'Minting token…' : 'Generate Print Token'}
          </button>

          {token && (
            <div className="token-badge">
              <CheckCircle2 size={16} className="success" />
              <span className="mono">{token}</span>
            </div>
          )}
        </section>

        {/* Sticker preview */}
        <section className="card">
          <div className="section-title no-print">
            <Barcode size={14} /> Sticker Preview
          </div>

          {!token ? (
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
                    fgColor="#0a0c10"
                    level="M"
                  />
                </div>

                <div className="sticker__title">{book?.title}</div>
                <div className="sticker__lot mono">{token}</div>
                <div className="sticker__meta mono">
                  SHA-256 · {shortHash(book?.sha256_hash, 16, 8)}
                </div>
                <div className="sticker__meta mono">BOOK ID · {book?.book_id}</div>
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}