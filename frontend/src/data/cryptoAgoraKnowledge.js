export const CRYPTOAGORA_KNOWLEDGE_BASE = {
  identity: {
    name: 'CryptoAgora',
    description: 'Protocol descentralizat Physical-to-Digital pentru publicare, verificare și distribuție de cărți anti-cenzură.',
    team: [
      'Alex — Frontend & UI',
      'Parsabhz — Backend & Crypto',
      'Dani Puscaș — echipa CryptoAgora',
    ],
  },
  workflow: [
    {
      name: 'Author Terminal',
      details: 'Autorul se autentifică prin Google, încarcă un manuscris .pdf, .txt sau .md, iar aplicația calculează local amprenta SHA-256 și verifică integritatea binară. În fluxul client, textul nu este trimis unui server central doar pentru calcularea amprentei.',
    },
    {
      name: 'Print House Panel',
      details: 'Tipografia independentă primește permisiunea criptografică de a produce un lot exact. Fiecare exemplar poate primi un cod QR unic asociat cu hash-ul lucrării și portofelul autorului.',
    },
    {
      name: 'Reader Verification',
      details: 'Cititorul scanează QR-ul, verifică autenticitatea matematică a exemplarului și poate debloca accesul digital. Fluxul economic este conceput astfel încât 20% din preț să ajungă direct autorului printr-un portofel crypto, inclusiv Monero, fără intermediari bancari.',
    },
  ],
  economics: {
    traditional: 'Editurile și intermediarii tradiționali pot reține aproximativ 85%–90% și pot plăti autorul după 6–12 luni.',
    cryptoAgora: 'CryptoAgora promovează 20% direct și instant către autor, transparență verificabilă și distribuție fără blocaje bancare.',
  },
  trust: {
    webOfTrust: 'Reputația se formează din validări ale cititorilor reali, tipografiilor partenere și interviului de legitimitate AI, fără o singură autoritate centrală.',
    dynamicTrustScore: 'Scorul 0–100% combină integritatea binară și unicitatea SHA-256, istoricul exemplarelor scanate fără dispute și rezultatul interviului AI.',
  },
  rights: 'Autorul păstrează drepturile asupra operei și trebuie să publice doar conținut pentru care are drepturi. CryptoAgora verifică autenticitatea fișierului, nu transferă automat copyright-ul.',
  piracy: 'Un QR valid, hash-ul și înregistrarea lucrării îi permit cititorului să compare un exemplar cu dovada originală. O copie fără amprenta sau cu o amprentă diferită trebuie tratată ca suspectă.',
};

export const CRYPTOAGORA_QA = [
  { keywords: ['20%', 'autor', 'bani', 'royalt'], answer: 'Autorul primește 20% din valoarea fiecărui exemplar verificat, direct în portofelul configurat pentru lucrare. QR-ul leagă scanarea de dovada lucrării și face fluxul mai ușor de urmărit.' },
  { keywords: ['monero', 'xmr', 'portofel', 'wallet'], answer: 'Monero (XMR) este o opțiune de plată orientată spre confidențialitate. Pentru o plată reală, verifică întotdeauna adresa portofelului și nu divulga seed phrase, parola sau cheia privată.' },
  { keywords: ['sha', 'hash', 'amprent', 'digest'], answer: 'SHA-256 transformă bytes-ii manuscrisului într-o amprentă hexazecimală. Aceeași lucrare produce aceeași amprentă, iar orice modificare a fișierului schimbă hash-ul.' },
  { keywords: ['tipograf', 'print house', 'tipări', 'lot'], answer: 'Print House Panel este zona tipografiei independente. Tipograful lucrează cu un lot exact, iar exemplarele pot primi QR-uri unice legate de lucrare și autor.' },
  { keywords: ['qr', 'cod', 'scan'], answer: 'Codul QR de pe exemplar conduce cititorul către verificarea lucrării. Acolo poate compara dovada publică, hash-ul și statusul exemplarului înainte de a accesa varianta digitală.' },
  { keywords: ['cenzur', 'necenzur', 'blocaj'], answer: 'CryptoAgora este proiectat să reducă dependența de intermediari și puncte unice de blocare. Totuși, niciun serviciu online nu poate promite protecție absolută împotriva tuturor formelor de cenzură sau indisponibilitate.' },
  { keywords: ['google', 'login', 'cont', 'autentific'], answer: 'Autentificarea inițială se face cu Google. Nu împărtăși parola Google cu nimeni; aplicația folosește identitatea pentru acces și pentru asocierea acțiunilor cu profilul autorului.' },
  { keywords: ['alex', 'parsabhz', 'dani', 'echip'], answer: 'CryptoAgora este construit de Alex (Frontend & UI), Parsabhz (Backend & Crypto) și Dani Puscaș, ca echipă de proiect.' },
  { keywords: ['web of trust', 'rețea de încredere', 'reput'], answer: 'Web of Trust este reputația cumulată din validări reale: lucrări integre, scanări fără dispute, tipografii și interviul de legitimitate. Nu este o aprobare juridică și nu trebuie confundat cu o garanție financiară.' },
  { keywords: ['dynamic trust', 'trust score', 'scor'], answer: 'Dynamic Trust Score este între 0 și 100%. Include formatul și integritatea manuscrisului, unicitatea hash-ului, dovezile de utilizare și, dacă există, bonusul interviului AI.' },
  { keywords: ['drept', 'copyright', 'autor de drept', 'propriet'], answer: 'Publică numai materiale asupra cărora ai drepturi. SHA-256 dovedește identitatea fișierului la un moment dat, dar nu este singur o hotărâre juridică privind proprietatea intelectuală.' },
  { keywords: ['pirat', 'fals', 'copie', 'furat'], answer: 'Pentru o posibilă copie piratată, scanează QR-ul și compară hash-ul, titlul și autorul cu înregistrarea. Un mismatch trebuie raportat și nu trebuie folosit pentru a acuza public o persoană fără dovezi.' },
  { keywords: ['pdf', 'txt', 'md', 'format'], answer: 'Author Terminal acceptă .pdf, .txt și .md. PDF-ul este verificat prin header-ul %PDF- și markerul %%EOF, iar TXT/MD prin UTF-8 valid și conținut nevid.' },
  { keywords: ['entrop', 'densitate', 'fișier gol'], answer: 'Entropia Shannon măsoară distribuția bytes-ilor. Un fișier gol, repetitiv sau suspect poate primi un scor mic; este un semnal tehnic, nu o dovadă singură de fraudă.' },
  { keywords: ['public', 'publicare', 'author terminal', 'manuscris'], answer: 'În Author Terminal încarci fișierul, verifici auditul, completezi cheia publică, semnezi lucrarea și folosești Register & Anchor Work doar după ce formatul și unicitatea sunt valide.' },
  { keywords: ['sigur', 'cheie privată', 'seed', 'scam', 'fraud'], answer: 'Nu trimite niciodată cheia privată, seed phrase, parole sau bani unei persoane care pretinde că este suport. Agentul CryptoAgora poate explica pașii, dar nu solicită secrete.' },
];

export const KNOWLEDGE_CONTEXT = JSON.stringify(CRYPTOAGORA_KNOWLEDGE_BASE);

export const SYSTEM_PROMPT = `Ești CryptoAgora Sentinel, AI Trust Arbiter & Support pentru CryptoAgora.
Folosește următoarea bază oficială de cunoștințe ca sursă de adevăr și nu inventa funcții, costuri sau garanții care nu sunt acolo:
${KNOWLEDGE_CONTEXT}

În modul Ghid & Coordonator Clienți:
- Vorbește ca un coleg de echipă pasionat de cărți și tehnologie: cald, direct, empatic, cu umor fin când se potrivește.
- Răspunde în limba utilizatorului și adaptează lungimea: o întrebare relaxată primește 2–3 fraze naturale, iar o nelămurire tehnică primește exemple și pași clari.
- Nu folosi formule robotice precum „În calitate de asistent AI” sau „Conform documentației”, nu repeta saluturi și nu transforma fiecare răspuns într-o listă lungă.
- Poți prinde glume și meme-uri actuale, inclusiv referințe pop-culture precum Epstein, Mia Khalifa sau Bonnie Blue, dar răspunde strict PG-13, fără detalii sexuale, vulgarități sau insinuări explicite. Râzi inteligent și fă apoi legătura naturală cu cărțile, hash-urile sau editurile.
- Dacă utilizatorul înjură, nu repeta cuvântul și nu răspunde rigid: spune o replică scurtă și amuzantă despre păstrarea unui vibe curat, apoi cere reformularea civilizată.
- Ține cont de istoricul conversației, răspunde la intenția reală și nu repeta mecanic ceva ce ai explicat deja. Indică pagina potrivită doar când chiar ajută: Author Terminal, Print House Panel sau Reader Verification.
- Protejează utilizatorul: nu cere parole, seed phrase, chei private sau plăți și nu prezenta afirmații juridice/financiare ca garanții.

Judecă intenția, nu doar cuvintele:
- BINE: încurajează libertatea de exprimare, autorii independenți, educația, ficțiunea, jurnalismul de investigație, transparența financiară și protejarea operei împotriva cenzurii abuzive.
- RĂU: respinge ferm, dar politicos, plagiatul, încărcarea cărților altora pentru a fura recompense, spam-ul automat fără valoare, phishing-ul prin QR, escrocheriile, instigarea la ură și conținutul ilegal.
- Dacă utilizatorul este bine intenționat, dar confuz, explică și încurajează-l. Dacă evită întrebările, recunoaște copierea sau încearcă să păcălească sistemul, pune o întrebare de control clară și scade scorul; explică omenește motivul, fără umilire.

În modul Auditor Anti-Scam:
- Evaluează strict Originalitatea operei, Claritatea publicului țintă, Transparența distribuției QR și Absența semnalelor de plagiat/spam/phishing.
- Un candidat sincer și concret poate primi 85–99%; răspunsurile evazive, recunoașterea copierii sau intenția frauduloasă trebuie să ducă realist la 15–45%.
- Dacă răspunsul este o glumă virală în loc de informații despre manuscris, poți râde scurt, dar explică faptul că memele nu țin loc de dovadă și cere un răspuns real. Limbajul vulgar blochează trustBonus și un scor pozitiv.
- Returnează JSON valid, fără markdown, în forma {"score":0,"verdict":"LEGIT_CREATOR","trustBonus":0,"reasoning":{"originality":"","audience":"","distribution":"","riskSignals":""}}.
- verdict trebuie să fie LEGIT_CREATOR pentru scor >= 75, NEEDS_REVIEW pentru 50–74 și SCAM_RISK sub 50. trustBonus este 15 pentru scor >= 75, altfel 0.`;

const SUSPICIOUS_TERMS = ['copiat', 'furat', 'spam', 'test', 'scam', 'fake', 'nu stiu'];
const DETAIL_TERMS = ['personaj', 'capitol', 'cititor', 'public', 'qr', 'hash', 'tipograf', 'distribu', 'autor', 'manuscris'];
const GOOD_INTENT_TERMS = ['original', 'propri', 'educa', 'cititor', 'transparent', 'drept', 'verific', 'public'];
const VULGARITY_STEMS = [
  ['p', 'ula'].join(''),
  ['piz', 'd'].join(''),
  ['m', 'uie'].join(''),
  ['f', 'ut'].join(''),
  ['cur', 'v'].join(''),
  ['f', 'uck'].join(''),
  ['sh', 'it'].join(''),
  ['bit', 'ch'].join(''),
  ['cu', 'nt'].join(''),
  ['di', 'ck'].join(''),
];
const VULGARITY_PATTERN = new RegExp(`(?:^|\\s|[^a-zăâîșț])(?:${VULGARITY_STEMS.join('|')})(?:\\w*)?(?=$|\\s|[^a-zăâîșț])`, 'i');
const CLEAN_LANGUAGE_RESPONSES = [
  'Hopaaa, spală tastatura cu apă sfințită! Aici păstrăm vibe-ul curat — reformulează fără înjurături și spune-mi ce carte vrei să publici.',
  'A intrat un mic filtru de politețe în scenă. Fără cuvinte grele, te rog — hash-urile noastre sunt deja destul de serioase.',
  'Punem vulgaritatea pe mute, ca pe un comentariu spam. Vorbește civilizat și revenim imediat la manuscris, QR și trust score.',
];
const MEME_RESPONSES = [
  'Plot twist: lista asta ar fi mai bine păzită decât hash-urile SHA-256. La CryptoAgora preferăm dovezi verificabile și manuscrise reale, nu teorii de internet.',
  'Algoritmul a detectat un meme cu potențial de tiraj viral. Râdem, dar pentru publicare avem nevoie și de autor, lucrare și un QR care chiar duce undeva.',
  'Asta a fost o referință cu mai mult reach decât unele edituri. Bună gluma — acum hai să vedem dacă manuscrisul tău trece verificarea fără plot twist-uri suspecte.',
];
const MEME_TERMS = ['epstein', 'mia khalifa', 'bonnie blue', 'onlyfans', 'meme', 'viral', 'crypto bro', 'diamond hands', 'rug pull'];
const FALLBACK_OPENINGS = [
  'Da, sigur —',
  'Pe scurt,',
  'Bună întrebare.',
  'Hai să o luăm simplu:',
  'Exact aici ajută protocolul:',
];
const FALLBACK_CLOSINGS = [
  'Dacă vrei, îți explic și pasul următor.',
  'În aplicație, următorul loc de verificat este cel indicat mai sus.',
  'Nu ezita să-mi spui ce parte ți se pare neclară.',
  'Important este să verifici dovada înainte să distribui sau să plătești.',
];
let lastFallbackAnswer = '';
let lastSpecialResponse = '';

function containsVulgarity(text) {
  return VULGARITY_PATTERN.test(String(text || ''));
}

function chooseVariation(options, previousValue = '') {
  const available = options.filter((option) => option !== previousValue);
  return (available.length ? available : options)[Math.floor(Math.random() * (available.length ? available.length : options.length))];
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function localInterviewEvaluation(answers) {
  const normalizedAnswers = answers.map((answer) => answer.trim());
  const combined = normalizedAnswers.join(' ');
  const normalizedCombined = combined.toLowerCase();
  const words = normalizedCombined.match(/[a-zăâîșț0-9]+/gi) || [];
  const uniqueRatio = words.length ? new Set(words).size / words.length : 0;
  const lengths = normalizedAnswers.map((answer) => answer.length);
  const detailedAnswers = normalizedAnswers.filter((answer) => answer.length >= 45).length;
  const detailHits = DETAIL_TERMS.filter((term) => normalizedCombined.includes(term)).length;
  const goodIntentHits = GOOD_INTENT_TERMS.filter((term) => normalizedCombined.includes(term)).length;
  const suspiciousHits = SUSPICIOUS_TERMS.filter((term) => normalizedCombined.includes(term));
  const emptyAnswers = normalizedAnswers.filter((answer) => answer.length < 20).length;
  const sentenceCount = (combined.match(/[.!?]+/g) || []).length;
  const coherentStructure = sentenceCount >= 3 && uniqueRatio >= 0.35;
  const explicitlyMalicious = /furat|copiez|copiat|phishing|escrocher|vreau să păcălesc|fake author/i.test(normalizedCombined);
  const vulgarityDetected = containsVulgarity(combined);
  let score = Math.round(clamp(
    42 + Math.min(24, lengths.reduce((total, length) => total + Math.min(length, 180), 0) / 540 * 24)
    + detailedAnswers * 7 + Math.min(14, detailHits * 2) + Math.min(10, uniqueRatio * 10)
    + Math.min(9, goodIntentHits * 1.5) + (coherentStructure ? 5 : 0)
    - suspiciousHits.length * 13 - emptyAnswers * 10,
  ));
  if (explicitlyMalicious) score = Math.min(score, 35 + Math.min(10, goodIntentHits));
  if (normalizedCombined.includes('nu stiu') || emptyAnswers >= 2) score = Math.min(score, 45);
  if (vulgarityDetected) score = Math.min(score, 35);
  score = clamp(score);
  const verdict = score >= 75 ? 'LEGIT_CREATOR' : score >= 50 ? 'NEEDS_REVIEW' : 'SCAM_RISK';
  return {
    score,
    verdict,
    trustBonus: score >= 75 ? 15 : 0,
    status: score >= 75 ? 'VERIFIED LEGIT AUTHOR' : score >= 50 ? 'NEEDS REVIEW' : 'HIGH SCAM RISK',
    reasoning: {
      originality: detailedAnswers > 0 && goodIntentHits > 0 ? 'Există detalii concrete și un semnal de intenție legitimă.' : 'Lipsesc detalii verificabile despre lucrare.',
      audience: lengths[1] >= 35 && uniqueRatio >= 0.35 ? 'Publicul țintă și ideea sunt descrise coerent.' : 'Publicul țintă nu este descris clar.',
      distribution: detailHits > 0 && /qr|hash|distribu|tipograf/i.test(normalizedAnswers[2] || '') ? 'Răspunsul menționează mecanisme de distribuție sau verificare.' : 'Planul de distribuție QR este insuficient explicat.',
      riskSignals: vulgarityDetected
        ? 'Limbajul vulgar blochează bonusul de încredere până la reformulare.'
        : suspiciousHits.length ? `Semnale de risc detectate în răspunsuri: ${suspiciousHits.join(', ')}.` : 'Nu au fost detectate semnale evidente de risc.',
    },
    summary: score >= 75
      ? 'Răspunsurile sunt suficient de clare și coerente pentru o primă verificare. Păstrează dovezile operei și acceptă verificarea publică a amprentei digitale.'
      : 'Răspunsurile necesită clarificări suplimentare înainte de a considera autorul verificat. Nu solicita bani sau date sensibile de la cititori.',
    source: 'local',
  };
}

function findLocalAnswer(question) {
  const normalized = question.toLowerCase();
  if (containsVulgarity(question)) {
    const response = chooseVariation(CLEAN_LANGUAGE_RESPONSES, lastSpecialResponse);
    lastSpecialResponse = response;
    return response;
  }
  if (MEME_TERMS.some((term) => normalized.includes(term))) {
    const response = chooseVariation(MEME_RESPONSES, lastSpecialResponse);
    lastSpecialResponse = response;
    return response;
  }
  const match = CRYPTOAGORA_QA.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
  const baseAnswer = match?.answer || 'Pot explica publicarea, QR-ul, SHA-256, Web of Trust, trust score sau siguranța contului. Spune-mi ce vrei să faci și îți voi indica pas cu pas pagina potrivită.';
  const options = FALLBACK_OPENINGS.flatMap((opening) => FALLBACK_CLOSINGS.map((closing) => `${opening} ${baseAnswer} ${closing}`));
  const available = options.filter((option) => option !== lastFallbackAnswer);
  const response = (available.length ? available : options)[Math.floor(Math.random() * (available.length ? available.length : options.length))];
  lastFallbackAnswer = response;
  return response;
}

export const FALLBACK_ENGINE = {
  answer: findLocalAnswer,
  evaluateInterview: localInterviewEvaluation,
  suspiciousTerms: SUSPICIOUS_TERMS,
  containsVulgarity,
};

export const FEEDBACK_STORAGE_KEY = 'cryptoagora_ai_feedback';
export const STATS_STORAGE_KEY = 'cryptoagora_ai_stats';

export function readKnowledgeStats() {
  try {
    const stored = JSON.parse(localStorage.getItem(STATS_STORAGE_KEY) || '{}');
    const feedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    const helpful = feedback.filter((item) => item.value === 'helpful').length;
    return {
      interviews: Number(stored.interviews) || 0,
      feedbackCount: feedback.length,
      helpful,
      accuracy: feedback.length ? Math.round((helpful / feedback.length) * 100) : 98,
    };
  } catch {
    return { interviews: 0, feedbackCount: 0, helpful: 0, accuracy: 98 };
  }
}

export function recordInterview() {
  const stats = readKnowledgeStats();
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify({ interviews: stats.interviews + 1 }));
}

export function recordFeedback(question, value) {
  let feedback = [];
  try {
    feedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
  } catch {
    feedback = [];
  }
  feedback.push({ question, value, createdAt: new Date().toISOString() });
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback.slice(-100)));
}
