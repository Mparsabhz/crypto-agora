# CryptoAgora

CryptoAgora este o platformă demonstrativă pentru publicarea, verificarea și distribuirea transparentă a cărților. Aplicația leagă autorii, editurile, tipografiile și cititorii printr-un registru local de tip blockchain, identificatori publici, verificarea criptografică a manuscriselor și un flux de trasabilitate pentru tiraje și exemplare.

Proiectul este construit ca o aplicație full-stack pentru prototipare și demonstrații:

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Persistență:** SQLite prin `better-sqlite3`
- **Identitate:** Google OAuth și conturi anonime cu chei ECDSA
- **AI:** Google Gemini și Groq, configurabile opțional
- **Verificare:** hash-uri SHA-256, registru local și coduri QR

> **Notă:** CryptoAgora este un prototip local. Blockchain-ul, plățile și datele de rețea sunt implementate pentru demonstrații și nu reprezintă încă o infrastructură blockchain sau un sistem financiar production-ready.

## Cuprins

- [Funcționalități](#funcționalități)
- [Arhitectură](#arhitectură)
- [Cerințe](#cerințe)
- [Pornire rapidă](#pornire-rapidă)
- [Configurarea variabilelor de mediu](#configurarea-variabilelor-de-mediu)
- [Fluxuri principale](#fluxuri-principale)
- [API](#api)
- [Structura proiectului](#structura-proiectului)
- [Persistență și fișiere generate](#persistență-și-fișiere-generate)
- [Securitate și limitări](#securitate-și-limitări)
- [Depanare](#depanare)
- [Comenzi utile](#comenzi-utile)

## Funcționalități

### Identitate și acces

- autentificare cu Google OAuth;
- autentificare anonimă printr-o pereche de chei ECDSA P-256 generată în browser;
- roluri demonstrative pentru dezvoltator și client;
- profiluri de autor, publisher și cititor;
- credentiale verificate de backend înaintea accesului la resurse private.

### Publicare și verificare

- încărcarea manuscriselor în formatele `.pdf`, `.txt` și `.md`;
- limită de încărcare de 50 MB;
- calcularea hash-ului SHA-256 pentru fiecare manuscris;
- înregistrarea cărții în registrul local;
- verificarea unei cărți după hash sau ID;
- generarea și verificarea identificatorilor pentru exemplare.

### Tiraje și trasabilitate

- creare de print runs pentru o carte;
- generare de exemplare individuale;
- verificare publică prin URL și cod QR;
- explorarea registrului local;
- distribuirea veniturilor între autor și publisher în modelul demonstrativ;
- simularea plăților și a unui ID de tranzacție.

### Web of trust și AI

- atestări între profiluri;
- raportarea profilurilor;
- calcularea unui flux de investigație pentru trust;
- chat AI pentru ajutor;
- analiză AI opțională pentru scorul de încredere;
- fallback local atunci când serviciile AI nu sunt configurate.

## Arhitectură

```text
┌─────────────────────┐       HTTP        ┌────────────────────────┐
│ React + Vite         │ ───────────────▶ │ Express API             │
│ localhost:5173       │                  │ localhost:3000          │
└─────────────────────┘                  └───────────┬────────────┘
                                                      │
                             ┌────────────────────────┼──────────────────────┐
                             │                        │                      │
                       SQLite database          blockchain.json        uploads/
                       crypto-agora.sqlite      local ledger            manuscripts
                                                      │
                                      ┌───────────────┴───────────────┐
                                      │                               │
                                Google OAuth                    Gemini / Groq
```

Frontend-ul folosește în prezent `http://localhost:3000` pentru API. Backend-ul acceptă originile `http://localhost:5173` și `http://127.0.0.1:5173`.

## Cerințe

- Node.js 18+ recomandat;
- npm;
- un browser modern cu suport pentru Web Crypto API;
- opțional:
  - Google OAuth Client ID;
  - Google Gemini API key;
  - Groq API key.

## Pornire rapidă

### 1. Clonează proiectul

```bash
git clone <repository-url>
cd crypto-agora
```

### 2. Instalează dependențele backend-ului

```bash
cd backend
npm install
```

### 3. Instalează dependențele frontend-ului

```bash
cd ../frontend
npm install
```

### 4. Opțional: rulează prototipul FastAPI

`main.py` este un prototip Python separat de aplicația principală Express. Pentru a-l porni:

```bash
cd ..
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
uvicorn main:app --reload
```

Pe Windows, activarea mediului virtual este:

```powershell
.venv\Scripts\Activate.ps1
```

Prototipul FastAPI folosește un fișier local `db.json` și nu este necesar pentru rularea frontend-ului împreună cu backend-ul Express.

### 5. Configurează backend-ul

Creează fișierul `backend/.env`:

```env
PORT=3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

Toate cheile sunt opționale pentru pornirea aplicației:

- fără `GEMINI_API_KEY` sau `GROQ_API_KEY`, funcțiile AI folosesc fallback-ul local sau returnează un răspuns indisponibil;
- fără `GOOGLE_CLIENT_ID`, proiectul folosește Client ID-ul demonstrativ inclus în cod;
- nu comite niciodată fișiere `.env` sau chei API.

### 6. Pornește API-ul

Într-un terminal:

```bash
cd backend
npm start
```

Pentru dezvoltare cu restart automat:

```bash
npm run dev
```

Backend-ul rulează pe [http://localhost:3000](http://localhost:3000).

### 7. Pornește frontend-ul

Într-un al doilea terminal:

```bash
cd frontend
npm run dev
```

Deschide URL-ul afișat de Vite, de regulă [http://localhost:5173](http://localhost:5173).

### 7. Verifică serviciul

```bash
curl http://localhost:3000/
```

Un răspuns valid confirmă că nodul CryptoAgora este pornit și returnează starea registrului.

## Configurarea variabilelor de mediu

### Backend

| Variabilă | Obligatorie | Scop |
|---|---:|---|
| `PORT` | Nu | Portul serverului Express; valoarea implicită este `3000`. |
| `GOOGLE_CLIENT_ID` | Nu | Client ID folosit pentru validarea tokenurilor Google. |
| `GEMINI_API_KEY` | Nu | Activează integrarea Google Gemini pentru analiza AI. |
| `GROQ_API_KEY` | Nu | Activează integrarea Groq pentru chat și fallback AI. |

Backend-ul încarcă mai întâi `backend/.env`, apoi încearcă și `backend/gemini-site/.env`. Fișierele de mediu sunt ignorate de Git.

### Frontend

Frontend-ul poate primi următoarea variabilă la build:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_AI_CHAT_ENDPOINT=http://localhost:3000/api/chat
```

Dacă `VITE_AI_CHAT_ENDPOINT` nu este setată, interfața folosește `/api/chat`. În setup-ul local recomandat, setează explicit:

```env
VITE_AI_CHAT_ENDPOINT=http://localhost:3000/api/chat
```

Variabilele cu prefix `VITE_` ajung în bundle-ul frontend și nu trebuie să conțină secrete.

## Fluxuri principale

### Publicarea unei cărți

1. Utilizatorul se autentifică prin Google sau creează un cont anonim.
2. Autorul selectează un manuscris `.pdf`, `.txt` sau `.md`.
3. Backend-ul calculează hash-ul SHA-256 și salvează fișierul în `backend/uploads/`.
4. Cartea este înregistrată în SQLite și în blockchain-ul local.
5. Interfața afișează ID-ul cărții, hash-ul și starea de înregistrare.

### Crearea unui tiraj

1. Publisherul selectează o carte înregistrată.
2. Backend-ul creează un print run și exemplare numerotate.
3. Fiecărui exemplar îi este atribuit un `copy_id`.
4. Cititorul poate verifica exemplarul din QR code sau prin pagina de verificare.

### Verificarea unui exemplar

URL-urile cu `book_id` sau `copy_id` pot deschide direct ecranul de verificare, inclusiv fără sesiune activă. Backend-ul verifică datele publice ale cărții și ale exemplarului și afișează istoricul relevant.

### Contul anonim

Cheia privată este generată și exportată în browser. Serverul primește doar cheia publică și emite un credential pentru sesiune. Dacă utilizatorul pierde cheia privată sau datele din browser, contul anonim nu poate fi recuperat.

## API

API-ul rulează implicit pe `http://localhost:3000`.

### Autentificare

| Metodă | Rută | Auth | Descriere |
|---|---|---:|---|
| `POST` | `/auth/anonymous` | Nu | Creează un cont anonim pe baza unei chei publice. |
| `GET` | `/profile` | Da | Returnează profilul utilizatorului curent. |
| `PUT` | `/profile` | Da | Actualizează profilul utilizatorului curent. |

Pentru rutele protejate, trimite credentialul în header:

```http
Authorization: Bearer <credential>
```

### Cărți și registru

| Metodă | Rută | Auth | Descriere |
|---|---|---:|---|
| `POST` | `/register-book` | Da | Înregistrează un manuscris multipart și calculează hash-ul. |
| `GET` | `/books` | Nu | Listează catalogul public. |
| `GET` | `/books/:bookId` | Nu | Returnează o carte după ID. |
| `GET` | `/my-books` | Da | Listează cărțile utilizatorului curent. |
| `GET` | `/ledger` | Nu | Returnează blockchain-ul local. |
| `GET` | `/verify/:hash` | Nu | Verifică un manuscris după hash. |

Exemplu de încărcare:

```bash
curl -X POST http://localhost:3000/register-book \
  -H "Authorization: Bearer <credential>" \
  -F "title=Titlul manuscrisului" \
  -F "file=@./manuscript.pdf"
```

### Profiluri și trust

| Metodă | Rută | Auth | Descriere |
|---|---|---:|---|
| `GET` | `/profiles` | Nu | Listează profilurile publice, cu filtre opționale. |
| `GET` | `/profiles/:profileId` | Nu | Returnează un profil. |
| `GET` | `/trust/profile/:profileId` | Nu | Returnează semnale și scoruri de trust. |
| `POST` | `/trust/attestations` | Da | Adaugă o atestare între profiluri. |
| `POST` | `/trust/reports` | Da | Raportează un profil. |
| `GET` | `/trust/investigate/:profileId` | Nu | Rulează investigația de trust pentru un profil. |

### Print runs, copii și plăți

| Metodă | Rută | Auth | Descriere |
|---|---|---:|---|
| `POST` | `/print-runs` | Da | Creează un tiraj. |
| `GET` | `/my-print-runs` | Da | Listează tirajele utilizatorului. |
| `GET` | `/my-publisher-runs` | Da | Listează tirajele publisherului. |
| `GET` | `/copies/:copyId` | Nu | Verifică un exemplar. |
| `POST` | `/payments/simulate` | Nu | Simulează o plată și distribuirea royalty-ului. |

### AI

| Metodă | Rută | Auth | Descriere |
|---|---|---:|---|
| `POST` | `/api/chat` | Nu | Trimite o întrebare către integrarea AI configurată. |

## Structura proiectului

```text
crypto-agora/
├── backend/
│   ├── server.js                 # API Express și logica aplicației
│   ├── database.js               # Schema și accesul SQLite
│   ├── package.json              # Dependențe și scripturi backend
│   ├── blockchain.json           # Registru blockchain local generat la runtime
│   ├── crypto-agora.sqlite       # Baza SQLite locală
│   ├── uploads/                  # Manuscrise încărcate local
│   └── gemini-site/              # Server AI Groq separat/istoric
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Shell-ul aplicației și autentificarea
│   │   ├── main.jsx              # Bootstrap React și Google OAuth
│   │   ├── components/           # Componente reutilizabile
│   │   └── screens/              # Ecranele produsului
│   ├── package.json              # Dependențe și scripturi frontend
│   └── public/                   # Resurse statice
├── main.py                       # Prototip FastAPI legacy, separat de aplicația principală
├── requirements.txt              # Dependențe pentru prototipul FastAPI
└── README.md
```

## Persistență și fișiere generate

Backend-ul folosește SQLite ca sursă principală de date. La prima pornire, schema este creată automat în `backend/crypto-agora.sqlite`.

Tabelele principale includ:

- `profiles`;
- `books`;
- `print_runs`;
- `copies`;
- `trust_attestations`;
- `trust_reports`;
- `payments`;
- `anonymous_accounts`.

Fișierele generate local nu trebuie versionate:

- `backend/crypto-agora.sqlite`;
- `backend/blockchain.json`;
- `backend/uploads/`;
- fișierele `.env`;
- `node_modules/`;
- build-ul `frontend/dist/`.

Datele de seed din `backend/books.json`, `backend/profiles.json` și `backend/print-runs.json`, atunci când există, sunt importate automat dacă tabelele corespunzătoare sunt goale.

## Securitate și limitări

- Nu introduce chei API, tokenuri OAuth sau credentiale în Git.
- `VITE_*` nu reprezintă secrete: valorile sunt incluse în bundle-ul frontend.
- Tokenurile Google trebuie validate pe backend înaintea accesului la date private.
- Conturile anonime depind de cheia privată păstrată în browser.
- Blockchain-ul este un registru local într-un fișier JSON, nu o rețea distribuită.
- Proof-of-work-ul este simplificat și are dificultate mică pentru demonstrații.
- `/payments/simulate` nu execută tranzacții reale.
- Fișierele încărcate sunt stocate pe discul local al serverului.
- CORS este restricționat la originile locale configurate în `backend/server.js`.
- Pentru producție ar trebui adăugate rate limiting, validare mai strictă a fișierelor, stocare externă, management de secrete, logging structurat, backup și autentificare/autorizație harden-uite.

## Depanare

### Frontend-ul nu poate accesa API-ul

Verifică:

1. că backend-ul rulează pe portul `3000`;
2. că frontend-ul rulează pe portul `5173`;
3. că origin-ul este `http://localhost:5173` sau `http://127.0.0.1:5173`;
4. că `VITE_AI_CHAT_ENDPOINT` indică serverul corect.

### Google Login nu funcționează

- verifică `GOOGLE_CLIENT_ID`;
- adaugă origin-ul frontend-ului în Google Cloud Console;
- verifică să folosești același Client ID în frontend și backend;
- șterge sesiunea locală din browser și încearcă din nou.

### Funcțiile AI sunt indisponibile

Verifică existența și încărcarea `GEMINI_API_KEY` sau `GROQ_API_KEY` în fișierul `.env`. Repornește backend-ul după orice modificare a variabilelor de mediu.

### Baza locală trebuie recreată

Oprește backend-ul și fă o copie de siguranță înainte de a șterge baza. Fișierul este regenerat automat la următoarea pornire:

```bash
cp backend/crypto-agora.sqlite backend/crypto-agora.sqlite.backup
rm backend/crypto-agora.sqlite
```

Această operație șterge datele locale curente; folosește-o doar pentru dezvoltare sau resetarea unui demo.

## Comenzi utile

### Backend

```bash
cd backend
npm install
npm start
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
```

### Verificare build frontend

```bash
cd frontend
npm run build
```

## Licență

Proiectul nu definește în prezent un fișier de licență. Adaugă o licență explicită înainte de distribuirea publică sau reutilizarea codului în afara echipei.
