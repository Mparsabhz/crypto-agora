import { useEffect, useState } from 'react';
import { BarChart3, Bot, CheckCircle2, Loader2, MessageCircle, Send, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  CRYPTOAGORA_QA,
  FALLBACK_ENGINE,
  SYSTEM_PROMPT,
  readKnowledgeStats,
  recordFeedback,
  recordInterview,
} from '../data/cryptoAgoraKnowledge';
import './GetHelp.css';

const QUICK_PROMPTS = [
  'Cum primesc cei 20% ca autor?',
  'Cum protejați cărțile de cenzură?',
  'Ce este Web of Trust și Dynamic Trust Score?',
];

const INTERVIEW_QUESTIONS = [
  'Despre ce este cartea sau manuscrisul tău și confirmi că ești autorul de drept, fără conținut copiat sau spam?',
  'Cui se adresează cartea și cum vrei să o distribui către cititori?',
  'Ești de acord ca amprenta digitală a cărții să fie verificată public prin cod QR pentru a preveni falsurile?',
];

async function askGemini(contents) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key is not configured');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.85, topP: 0.95, maxOutputTokens: 700 },
    }),
  });
  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function evaluateInterview(answers) {
  const prompt = `Modul Auditor Anti-Scam este activ. Returnează strict JSON valid, fără markdown, în forma {"score":0,"verdict":"LEGIT_CREATOR","trustBonus":0,"reasoning":{"originality":"","audience":"","distribution":"","riskSignals":""},"summary":""}.
Răspunsuri:
1. ${answers[0]}
2. ${answers[1]}
3. ${answers[2]}`;
  const text = await askGemini([{ role: 'user', parts: [{ text: prompt }] }]);
  const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim());
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
  const vulgarityDetected = FALLBACK_ENGINE.containsVulgarity(answers.join(' '));
  const safeScore = vulgarityDetected ? Math.min(score, 35) : score;
  return {
    score: safeScore,
    verdict: safeScore >= 75 ? 'LEGIT_CREATOR' : safeScore >= 50 ? 'NEEDS_REVIEW' : 'SCAM_RISK',
    trustBonus: safeScore >= 75 ? 15 : 0,
    status: safeScore >= 75 ? 'VERIFIED LEGIT AUTHOR' : safeScore >= 50 ? 'NEEDS REVIEW' : 'HIGH SCAM RISK',
    summary: vulgarityDetected
      ? 'Putem continua imediat ce răspunsurile sunt reformulate civilizat. Un interviu de încredere are nevoie de claritate, nu de limbaj agresiv.'
      : String(parsed.summary || parsed.reasoning?.riskSignals || 'Evaluarea a fost finalizată.'),
    reasoning: parsed.reasoning || {},
    source: 'gemini',
  };
}

export default function GetHelp({ aiTrustScore, onTrustResult }) {
  const [mode, setMode] = useState('chat');
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Salut! Sunt CryptoAgora AI Trust Arbiter & Support. Îți explic platforma și te pot ghida prin interviul de verificare.' },
  ]);
  const [question, setQuestion] = useState('');
  const [chatting, setChatting] = useState(false);
  const [interviewStep, setInterviewStep] = useState(-1);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [verdict, setVerdict] = useState(aiTrustScore || null);
  const [stats, setStats] = useState(() => readKnowledgeStats());

  useEffect(() => {
    if (aiTrustScore) setVerdict(aiTrustScore);
  }, [aiTrustScore]);

  const sendQuestion = async (value = question) => {
    const trimmedQuestion = value.trim();
    if (!trimmedQuestion || chatting) return;
    setQuestion('');
    const conversation = [
      ...messages
        .filter((message) => message.role === 'assistant' || message.role === 'user')
        .map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.text }],
        })),
      {
        role: 'user',
        parts: [{ text: `Modul Ghid & Coordonator Clienți este activ. Răspunde natural și indică pagina potrivită doar dacă ajută. Întrebarea utilizatorului: ${trimmedQuestion}` }],
      },
    ];
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: trimmedQuestion }]);
    setChatting(true);
    let response;
    if (FALLBACK_ENGINE.containsVulgarity(trimmedQuestion)) {
      response = FALLBACK_ENGINE.answer(trimmedQuestion);
    } else {
      try {
        response = await askGemini(conversation);
      } catch {
        response = FALLBACK_ENGINE.answer(trimmedQuestion);
      }
    }
    setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: response, feedback: null }]);
    setChatting(false);
  };

  const handleFeedback = (messageId, messageText, value) => {
    setMessages((current) => current.map((message) => (
      message.id === messageId && !message.feedback ? { ...message, feedback: value } : message
    )));
    recordFeedback(messageText, value);
    setStats(readKnowledgeStats());
  };

  const startInterview = () => {
    setMode('interview');
    setInterviewStep(0);
    setAnswers([]);
    setAnswer('');
    setVerdict(null);
  };

  const submitAnswer = async () => {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer || evaluating) return;
    const nextAnswers = [...answers, trimmedAnswer];
    setAnswers(nextAnswers);
    setAnswer('');
    if (interviewStep < INTERVIEW_QUESTIONS.length - 1) {
      setInterviewStep((step) => step + 1);
      return;
    }

    setEvaluating(true);
    let result;
    try {
      result = await evaluateInterview(nextAnswers);
    } catch {
      result = FALLBACK_ENGINE.evaluateInterview(nextAnswers);
    }
    setVerdict(result);
    onTrustResult(result);
    recordInterview();
    setStats(readKnowledgeStats());
    setEvaluating(false);
  };

  return (
    <div className="help-screen">
      <header className="help-header">
        <div>
          <span className="help-kicker">CRYPTOAGORA AI</span>
          <h1>Trust Arbiter &amp; Support</h1>
          <p>Un ghid prietenos pentru platformă și un prim filtru de încredere pentru autori.</p>
        </div>
        <div className="help-header__side">
          <div className="help-header__icon"><Bot size={28} /></div>
          <aside className="help-stats">
            <div className="help-stats__title"><Sparkles size={13} /> AI KNOWLEDGE STATS</div>
            <strong>{CRYPTOAGORA_QA.length} module de cunoștințe active</strong>
            <span>{stats.interviews} interviuri auditate · Acuratețe estimată: {stats.accuracy}%</span>
          </aside>
        </div>
      </header>

      <div className="help-tabs">
        <button className={mode === 'chat' ? 'is-active' : ''} onClick={() => setMode('chat')}><MessageCircle size={15} /> Ghid &amp; Asistent</button>
        <button className={mode === 'interview' ? 'is-active' : ''} onClick={() => setMode('interview')}><ShieldCheck size={15} /> Trust Interview</button>
      </div>

      {mode === 'chat' && (
        <section className="help-card help-chat">
          <div className="help-messages">
            {messages.map((message) => (
              <div key={message.id} className={`help-message help-message--${message.role}`}>
                <span>{message.role === 'assistant' ? 'AI' : 'TU'}</span>
                <div>
                  <p>{message.text}</p>
                  {message.role === 'assistant' && (
                    <div className="help-feedback">
                      <button className={message.feedback === 'helpful' ? 'is-selected' : ''} disabled={Boolean(message.feedback)} onClick={() => handleFeedback(message.id, message.text, 'helpful')}><ThumbsUp size={12} /> Răspuns util</button>
                      <button className={message.feedback === 'unclear' ? 'is-selected' : ''} disabled={Boolean(message.feedback)} onClick={() => handleFeedback(message.id, message.text, 'unclear')}><ThumbsDown size={12} /> Mai clarifică</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatting && <div className="help-typing"><Loader2 size={14} className="help-spin" /> AI scrie un răspuns...</div>}
          </div>
          <div className="help-suggestions">
            {QUICK_PROMPTS.map((prompt) => <button key={prompt} onClick={() => sendQuestion(prompt)}>{prompt}</button>)}
          </div>
          <form className="help-input" onSubmit={(event) => { event.preventDefault(); sendQuestion(); }}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Întreabă despre CryptoAgora..." aria-label="Întrebarea ta" />
            <button type="submit" disabled={!question.trim() || chatting} aria-label="Trimite întrebarea"><Send size={16} /></button>
          </form>
        </section>
      )}

      {mode === 'interview' && (
        <section className="help-card help-interview">
          {interviewStep === -1 && !verdict && (
            <div className="help-interview__intro">
              <div className="help-interview__icon"><ShieldCheck size={30} /></div>
              <h2>Interviu Anti-Scam &amp; Legitimitate</h2>
              <p>Răspunde la trei întrebări scurte despre lucrare și planul tău. Rezultatul este o evaluare orientativă, nu o decizie juridică.</p>
              <button className="help-primary" onClick={startInterview}>🛡️ Începe Interviul de Verificare AI</button>
            </div>
          )}
          {interviewStep >= 0 && !verdict && (
            <div className="help-interview__form">
              <div className="help-progress"><span style={{ width: `${((interviewStep + 1) / 3) * 100}%` }} /></div>
              <span className="help-step">ÎNTREBAREA {interviewStep + 1} / 3</span>
              <h2>{INTERVIEW_QUESTIONS[interviewStep]}</h2>
              <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Scrie răspunsul tău aici..." rows="6" />
              <button className="help-primary" onClick={submitAnswer} disabled={!answer.trim() || evaluating}>
                {evaluating ? <><Loader2 size={16} className="help-spin" /> Analizez răspunsurile...</> : <>Continuă <Send size={16} /></>}
              </button>
            </div>
          )}
          {verdict && (
            <div className={`help-verdict ${verdict.score >= 75 ? 'is-positive' : 'is-risk'}`}>
              <CheckCircle2 size={30} />
              <span className="help-step">CARD OFICIAL DE VERDICT AI · {verdict.source === 'gemini' ? 'GEMINI' : 'LOCAL FALLBACK'}</span>
              <strong className="help-verdict__score">{verdict.score}%</strong>
              <h2>{verdict.status}</h2>
              <p>{verdict.summary}</p>
              <button className="help-secondary" onClick={startInterview}>Refă interviul</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
