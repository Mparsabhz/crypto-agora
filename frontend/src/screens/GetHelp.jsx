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

const AI_CHAT_ENDPOINT = import.meta.env.VITE_AI_CHAT_ENDPOINT || '/api/chat';

async function askGroq(contents) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const prompt = [
    SYSTEM_PROMPT,
    ...contents.map((content) => `${content.role === 'model' ? 'CryptoAgora Sentinel' : 'Utilizator'}: ${content.parts.map((part) => part.text || '').join('')}`),
  ].join('\n\n');

  try {
    console.log('[CryptoAgora AI] Trimit cererea către Groq...');
    const response = await fetch(AI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
      }),
    });
    console.log('[CryptoAgora AI] Status HTTP:', response.status);

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    console.log('[CryptoAgora AI] Răspuns brut:', data);

    if (!response.ok) {
      const error = new Error(data?.error || `Groq request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const aiText = data?.reply?.trim();
    if (!aiText) throw new Error(data?.error || 'Groq returned an empty response');
    console.log('[CryptoAgora AI] Răspuns live:', aiText);
    return { text: aiText, source: 'groq' };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function evaluateInterview(answers) {
  const prompt = `Modul Auditor Anti-Scam este activ. Returnează strict JSON valid, fără markdown, în forma {"score":0,"verdict":"LEGIT_CREATOR","trustBonus":0,"reasoning":{"originality":"","audience":"","distribution":"","riskSignals":""},"summary":""}.
Răspunsuri:
1. ${answers[0]}
2. ${answers[1]}
3. ${answers[2]}`;
  const { text } = await askGroq([{ role: 'user', parts: [{ text: prompt }] }]);
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
    source: 'groq',
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
    let responseSource = 'local';
    let fallbackNotice = '';
    try {
      if (FALLBACK_ENGINE.containsVulgarity(trimmedQuestion)) {
        response = FALLBACK_ENGINE.answer(trimmedQuestion);
      } else {
        const liveResponse = await askGroq(conversation);
        response = liveResponse.text;
        responseSource = liveResponse.source;
      }
    } catch (error) {
      console.error('[CryptoAgora AI] Cererea Groq a eșuat, folosesc fallback local:', error);
      response = FALLBACK_ENGINE.answer(trimmedQuestion);
      fallbackNotice = error?.status === 503
        ? '🟡 Groq API ocupat (503) — mod local activ'
        : error?.name === 'AbortError'
          ? '🟡 Groq API nu a răspuns în 15 secunde — mod local activ'
          : '';
    } finally {
      setChatting(false);
    }
    setMessages((current) => [...current, {
      id: Date.now() + 1,
      role: 'assistant',
      text: response,
      source: responseSource,
      notice: fallbackNotice,
      feedback: null,
    }]);
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
                  {message.notice && <small className="help-fallback-notice">{message.notice}</small>}
                  <p>{message.text}</p>
                  {message.source === 'groq' && <small className="help-live-badge">🟢 LIVE GROQ AI</small>}
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
              <span className="help-step">CARD OFICIAL DE VERDICT AI · {verdict.source === 'groq' ? 'GROQ' : 'LOCAL FALLBACK'}</span>
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
