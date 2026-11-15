import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Globe, KeyRound, UserRound } from 'lucide-react';
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

export default function Profile({ authToken, user }) {
  const toast = useToast();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Profilul nu a putut fi încărcat.');
        return data;
      })
      .then((data) => {
        if (active && data.profile) setProfile({ ...emptyProfile, ...data.profile });
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

  if (loading) {
    return <div className="profile-page"><p className="dim">Se încarcă profilul…</p></div>;
  }

  const isAuthor = profile.profile_type === 'author';

  return (
    <div className="profile-page fade-up">
      <header className="page-head">
        <h1>Identity Profile</h1>
        <p className="dim">Profilul tău este salvat pe server și este legat de contul Google.</p>
      </header>

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
              <label className="field"><span><KeyRound size={12} /> Cheie publică</span><input className="mono" value={profile.public_key} onChange={update('public_key')} placeholder="0x..." /></label>
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
          </>
        )}

        <button className="btn-primary profile-save" type="submit" disabled={saving}>
          {saving ? 'Se salvează…' : <><CheckCircle2 size={15} /> Salvează profilul</>}
        </button>
      </form>
    </div>
  );
}
