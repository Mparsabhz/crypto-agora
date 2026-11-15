import { useEffect, useRef, useState } from 'react';
import { Building2, CheckCircle2, Download, Globe, KeyRound, Upload, UserRound } from 'lucide-react';
import { useToast } from '../components/Toast';
import './Profile.css';

const API_BASE = 'http://localhost:3000';

const emptyProfile = {
  profile_type: 'author',
  display_name: '',
  bio: '',
  website: '',
  genres: '',
  public_key: '',
  payout_address: '',
  company_name: '',
  description: '',
  contact_email: '',
  location: '',
  specialties: '',
};

export default function Profile({ authToken, user, onUserImport }) {
  const toast = useToast();
  const [profile, setProfile] = useState({ ...emptyProfile, public_key: user.publicKey || '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const identityFile = useRef(null);

  useEffect(() => {
    let active = true;
    if (!authToken) {
      setLoading(false);
      return undefined;
    }

    fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Profilul nu a putut fi încărcat.');
        return data;
      })
      .then((data) => {
        if (active) {
          setProfile({
            ...emptyProfile,
            ...data.profile,
            public_key: data.profile?.public_key || user.publicKey || '',
          });
        }
      })
      .catch((error) => {
        if (active) toast(error.message, 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authToken, toast]);

  const update = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Profilul nu a putut fi salvat.');
      setProfile({ ...emptyProfile, ...data.profile });
      toast('Profilul a fost salvat.', 'success');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const exportAnonymousIdentity = () => {
    const identity = {
      format: 'cryptoagora-anonymous-identity-v1',
      account_id: user.email.replace('anonymous:', ''),
      public_key: user.publicKey,
      private_key: user.privateKey,
      credential: user.credential,
    };
    const blob = new Blob([JSON.stringify(identity, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cryptoagora-anonymous-${identity.account_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast('Identitatea anonimă a fost exportată. Păstrează fișierul offline.', 'success');
  };

  const importAnonymousIdentity = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';
    if (!file) return;

    try {
      const identity = JSON.parse(await file.text());
      if (
        identity.format !== 'cryptoagora-anonymous-identity-v1'
        || typeof identity.public_key !== 'string'
        || typeof identity.private_key !== 'string'
        || typeof identity.credential !== 'string'
        || !identity.credential.startsWith('anon_')
      ) {
        throw new Error('Fișierul de identitate anonimă este invalid.');
      }

      const response = await fetch(`${API_BASE}/my-books`, {
        headers: { Authorization: `Bearer ${identity.credential}` },
      });
      if (!response.ok) throw new Error('Sesiunea anonimă din fișier nu mai este valabilă.');

      onUserImport({
        name: 'Anonymous contributor',
        email: `anonymous:${identity.account_id}`,
        publicKey: identity.public_key,
        privateKey: identity.private_key,
        credential: identity.credential,
        identityType: 'anonymous',
        role: 'client',
      });
      toast('Identitatea anonimă a fost importată.', 'success');
    } catch (error) {
      toast(error.message || 'Identitatea anonimă nu a putut fi importată.', 'error');
    }
  };

  if (loading) {
    return <div className="profile-page"><p className="dim">Se încarcă profilul…</p></div>;
  }

  const isAuthor = profile.profile_type === 'author';

  return (
    <div className="profile-page fade-up">
      <header className="page-head">
        <h1>Identity Profile</h1>
        <p className="dim">Profilul tău este salvat pe server și este legat de identitatea activă.</p>
      </header>

      {user.identityType === 'anonymous' && (
        <section className="profile-card card">
          <div className="profile-account">
            <KeyRound size={24} className="success" />
            <div>
              <strong>Identitate anonimă</strong>
              <span className="mono">{user.email.replace('anonymous:', '')}</span>
            </div>
          </div>
          <p className="dim">Exportă fișierul și păstrează-l offline. Conține credential-ul care îți permite accesul la cont.</p>
          <div className="profile-grid">
            <button type="button" className="btn-ghost" onClick={exportAnonymousIdentity}><Download size={15} /> Exportă identitatea</button>
            <button type="button" className="btn-ghost" onClick={() => identityFile.current?.click()}><Upload size={15} /> Importă identitatea</button>
          </div>
          <input ref={identityFile} type="file" accept="application/json" hidden onChange={importAnonymousIdentity} />
        </section>
      )}

      <form className="profile-card card" onSubmit={save}>
        <div className="profile-type-toggle">
          <button type="button" className={isAuthor ? 'is-selected' : ''} onClick={() => setProfile((current) => ({ ...current, profile_type: 'author' }))}>
            <UserRound size={17} /> Autor
          </button>
          <button type="button" className={!isAuthor ? 'is-selected' : ''} onClick={() => setProfile((current) => ({ ...current, profile_type: 'publisher' }))}>
            <Building2 size={17} /> Editură
          </button>
        </div>

        <div className="profile-account">
          <img src={user.picture || '/logo.svg'} alt="" />
          <div>
            <strong>{user.name}</strong>
            <span className="mono">{user.email}</span>
          </div>
        </div>

        {isAuthor ? (
          <>
            <div className="profile-grid">
              <label className="field"><span>Nume public *</span><input value={profile.display_name} onChange={update('display_name')} placeholder="Numele sub care publici" /></label>
              <label className="field"><span>Website</span><input value={profile.website} onChange={update('website')} placeholder="https://..." /></label>
            </div>
            <label className="field"><span>Bio autor *</span><textarea value={profile.bio} onChange={update('bio')} rows={4} placeholder="Cine ești și ce publici?" /></label>
            <label className="field"><span>Genuri</span><input value={profile.genres} onChange={update('genres')} placeholder="ficțiune, eseu, poezie" /></label>
            <div className="profile-grid">
              <label className="field"><span><KeyRound size={12} /> Cheie publică (generată automat)</span><input className="mono" value={profile.public_key} readOnly aria-readonly="true" /></label>
              <label className="field"><span>Adresă payout</span><input className="mono" value={profile.payout_address} onChange={update('payout_address')} placeholder="Adresa pentru royalty" /></label>
            </div>
          </>
        ) : (
          <>
            <div className="profile-grid">
              <label className="field"><span>Nume editură *</span><input value={profile.company_name} onChange={update('company_name')} placeholder="Numele companiei" /></label>
              <label className="field"><span><Globe size={12} /> Website</span><input value={profile.website} onChange={update('website')} placeholder="https://..." /></label>
            </div>
            <label className="field"><span>Descriere *</span><textarea value={profile.description} onChange={update('description')} rows={4} placeholder="Ce tip de cărți publică editura?" /></label>
            <div className="profile-grid">
              <label className="field"><span>Email de contact *</span><input type="email" value={profile.contact_email} onChange={update('contact_email')} placeholder="contact@editura.ro" /></label>
              <label className="field"><span>Locație</span><input value={profile.location} onChange={update('location')} placeholder="București, România" /></label>
            </div>
            <label className="field"><span>Specializări</span><input value={profile.specialties} onChange={update('specialties')} placeholder="tipar, distribuție, fantasy" /></label>
            <div className="profile-grid">
              <label className="field"><span><KeyRound size={12} /> Cheie publică editură (generată automat)</span><input className="mono" value={profile.public_key} readOnly aria-readonly="true" /></label>
              <label className="field"><span>Adresă payout editură</span><input className="mono" value={profile.payout_address} onChange={update('payout_address')} placeholder="Adresa pentru decontare" /></label>
            </div>
          </>
        )}

        <button className="btn-primary profile-save" type="submit" disabled={saving}>
          {saving ? 'Se salvează…' : <><CheckCircle2 size={15} /> Salvează profilul</>}
        </button>
      </form>
    </div>
  );
}
