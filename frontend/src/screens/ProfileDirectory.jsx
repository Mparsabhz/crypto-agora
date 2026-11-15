import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Globe, Hash, KeyRound, Loader2, Search, ShieldCheck, UserRound } from 'lucide-react';
import './ProfileDirectory.css';

const API_BASE = 'http://localhost:3000';

export default function ProfileDirectory({ initialType = 'author' }) {
  const [profileType, setProfileType] = useState(initialType);
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ type: profileType });
    if (search.trim()) params.set('search', search.trim());

    fetch(`${API_BASE}/profiles?${params}`)
      .then((response) => {
        if (!response.ok) throw new Error('Profiles request failed');
        return response.json();
      })
      .then((data) => {
        if (active) setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
      })
      .catch(() => {
        if (active) setProfiles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [profileType, search]);

  const openProfile = async (profile) => {
    setSelectedProfile(profile);
    setDetailsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/profiles/${profile.profile_id}`);
      if (!response.ok) throw new Error('Profile details request failed');
      setProfileDetails(await response.json());
    } catch {
      setProfileDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (selectedProfile) {
    const detail = profileDetails?.profile || selectedProfile;
    const detailBooks = profileDetails?.books || [];
    const author = detail.profile_type === 'author';

    return (
      <div className="directory-page fade-up">
        <button type="button" className="directory-back" onClick={() => { setSelectedProfile(null); setProfileDetails(null); }}>
          <ArrowLeft size={15} /> Înapoi la profiluri
        </button>
        <header className="page-head">
          <h1>{author ? detail.display_name : detail.company_name}</h1>
          <p className="dim">{author ? 'Profil public de autor' : 'Profil public de editură'}</p>
        </header>
        <section className="card directory-detail">
          <p>{author ? detail.bio : detail.description}</p>
          <div className="directory-card__meta">
            {(author ? detail.genres : detail.specialties) && <span>{author ? detail.genres : detail.specialties}</span>}
            {detail.location && <span>{detail.location}</span>}
            {detail.website && <a href={detail.website} target="_blank" rel="noreferrer"><Globe size={12} /> Website</a>}
          </div>
          {detail.public_key && <div className="directory-public-key"><KeyRound size={12} /> <strong className="mono">{detail.public_key}</strong></div>}
        </section>
        <section className="directory-works">
          <div className="section-title"><ShieldCheck size={15} /> {author ? 'Cărți publicate și verificate' : 'Cărți asociate editurii'}</div>
          {detailsLoading ? <div className="directory-empty"><Loader2 className="spin" size={22} /></div> : detailBooks.length === 0 ? (
            <div className="directory-empty"><p>Nu există încă publicații asociate acestui profil.</p></div>
          ) : (
            <div className="directory-books">
              {detailBooks.map((book) => (
                <article className="card directory-book" key={book.book_id}>
                  <div className="directory-book__head">
                    <h2>{book.title}</h2>
                    <span className="pill success-pill"><ShieldCheck size={11} /> {book.web_of_trust_score}</span>
                  </div>
                  <div className="directory-book__data">
                    <span><Hash size={12} /> SHA-256 <strong className="mono">{book.sha256_hash}</strong></span>
                    <span>BLOCK <strong className="mono">#{book.block_index} · {book.block_hash}</strong></span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  const isAuthor = profileType === 'author';

  return (
    <div className="directory-page fade-up">
      <header className="page-head">
        <h1>Discover Profiles</h1>
        <p className="dim">Găsește autori și edituri care folosesc CryptoAgora.</p>
      </header>

      <section className="card directory-controls">
        <div className="directory-tabs">
          <button type="button" className={isAuthor ? 'is-active' : ''} onClick={() => setProfileType('author')}><UserRound size={16} /> Caută autor</button>
          <button type="button" className={!isAuthor ? 'is-active' : ''} onClick={() => setProfileType('publisher')}><Building2 size={16} /> Caută editură</button>
        </div>
        <label className="directory-search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isAuthor ? 'Nume, cheie publică, gen sau descriere...' : 'Nume, cheie publică, locație sau specializare...'} />
        </label>
      </section>

      {loading ? (
        <div className="directory-empty"><Loader2 className="spin" size={24} /><span>Se caută...</span></div>
      ) : profiles.length === 0 ? (
        <div className="directory-empty"><p>Nu am găsit profiluri publice.</p></div>
      ) : (
        <div className="directory-grid">
          {profiles.map((profile) => (
          <button type="button" className="card directory-card" key={profile.profile_id} onClick={() => openProfile(profile)}>
              <div className="directory-card__icon">{isAuthor ? <UserRound size={20} /> : <Building2 size={20} />}</div>
              <h2>{isAuthor ? profile.display_name : profile.company_name}</h2>
              <p>{isAuthor ? profile.bio : profile.description}</p>
              <div className="directory-card__meta">
                {(isAuthor ? profile.genres : profile.specialties) && <span>{isAuthor ? profile.genres : profile.specialties}</span>}
                {profile.location && <span>{profile.location}</span>}
                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer"><Globe size={12} /> Website</a>}
              </div>
              {profile.public_key && <div className="directory-public-key"><KeyRound size={12} /> <strong className="mono">{profile.public_key}</strong></div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
