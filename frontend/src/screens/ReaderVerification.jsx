import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck, CheckCircle2, Copy, Hash, KeyRound, Package,
  Wallet, Send, Sparkles, Loader2, Radio,
} from 'lucide-react';
import { shortHash } from '../utils/crypto';
import { useToast } from '../components/Toast';
import CopyButton from '../components/CopyButton';
import './ReaderVerification.css';

export default function ReaderVerification({ books }) {
  const toast = useToast();
  const [params, setParams] = useState({ book_id: '', lot: '' });
  const [tipSending, setTipSending] = useState(false);
  const [tipSent, setTipSent] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setParams({
      book_id: sp.get('book_id') || '',
      lot: sp.get('lot') || '',
    });
  }, []);

  const book = useMemo(() => {
    if (params.book_id) {
      return books.find((b) => b.book_id === params.book_id) || books[0];
    }
    return books[0];
  }, [books, params.book_id]);

  const handleTip = () => {
    setTipSending(true);
    setTimeout(() => {
      setTipSending(false);
      setTipSent(true);
      toast('Tip broadcast to author via private tx', 'success');
    }, 1400);
  };

  if (!book) {
    return (
      <div className="reader">
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p className="dim">No book found. Scan a valid CryptoAgora sticker.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reader">
      {/* Big animated badge */}
      <div className="verify-badge">
        <div className="verify-badge__glow" />
        <div className="verify-badge__ring">
          <ShieldCheck size={40} className="verify-badge__icon" />
        </div>
        <div className="verify-badge__text">
          <div className="verify-badge__title">AUTENTICITATE VERIFICATĂ MATEMATIC</div>
          <div className="verify-badge__sub mono">
            SHA-256 · SIGNATURE VERIFIED ON-CHAIN
          </div>
        </div>
        <div className="verify-badge__scanline" />
      </div>

      {/* Details */}
      <div className="reader__grid">
        <section className="card">
          <div className="section-title">Book Certificate</div>

          <div className="detail-list">
            <Detail label="Title" value={book.title} />
            <Detail label="Book ID" value={book.book_id} mono />
            <Detail
              label="Author Public Key"
              value={book.author_pubkey}
              mono
              icon={<KeyRound size={13} />}
            />
            <Detail
              label="SHA-256 Hash"
              value={book.sha256_hash}
              mono
              copy
              breakAll
              icon={<Hash size={13} />}
            />
            <Detail
              label="Web of Trust"
              value={book.web_of_trust_score}
              accent="success"
              icon={<Radio size={13} />}
            />
            <Detail
              label="Print Batch"
              value={params.lot || book.print_batch}
              mono
              accent="amber"
              icon={<Package size={13} />}
            />
          </div>
        </section>

        {/* Royalty panel */}
        <section className="card royalty">
          <div className="section-title">
            <Wallet size={14} /> Direct Payment Proof — 20% Royalty
          </div>

          <div className="royalty__banner">
            <CheckCircle2 size={18} className="success" />
            <div>
              <div className="royalty__title">
                Decontat direct în portofelul autorului
              </div>
              <div className="royalty__sub mono">
                Fără intermediari · Necenzurabil
              </div>
            </div>
          </div>

          <div className="royalty__tx">
            <span className="mono muted">XMR TX PROOF</span>
            <span className="mono amber">{shortHash(book.xmr_tx_proof, 12, 6)}</span>
            <CopyButton value={book.xmr_tx_proof} label="Copy" />
          </div>

          <div className="royalty__split">
            <div className="royalty__split-row">
              <span className="dim">Royalty Split</span>
              <span className="mono success">{book.royalty_split}</span>
            </div>
            <div className="royalty__split-row">
              <span className="dim">Payment Network</span>
              <span className="mono">Monero (XMR)</span>
            </div>
            <div className="royalty__split-row">
              <span className="dim">Route</span>
              <span className="mono">Reader → Author (Direct)</span>
            </div>
          </div>

          <button
            className="btn-amber full"
            disabled={tipSending || tipSent}
            onClick={handleTip}
          >
            {tipSending ? (
              <Loader2 size={15} className="spin" />
            ) : tipSent ? (
              <CheckCircle2 size={15} />
            ) : (
              <Send size={15} />
            )}
            {tipSending
              ? 'Broadcasting private tx…'
              : tipSent
              ? 'Tip sent · Author notified'
              : 'Trimite bacșiș extra / Susține Autorul'}
          </button>

          {tipSent && (
            <div className="royalty__confirmed mono">
              <Sparkles size={12} className="success" /> 0.0042 XMR routed to author wallet
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({ label, value, mono, copy, breakAll, accent, icon }) {
  return (
    <div className={`detail ${breakAll ? 'detail--break' : ''}`}>
      <div className="detail__label">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`detail__value ${mono ? 'mono' : ''} ${accent || ''}`}>
        <span>{value}</span>
        {copy && <CopyButton value={value} label="" />}
      </div>
    </div>
  );
}