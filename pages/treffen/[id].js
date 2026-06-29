import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { generateDays, formatDatumLang } from '../../lib/slots';

// ── Share Banner ─────────────────────────────────────────
function ShareBanner({ id, titel }) {
  const [kopiert, setKopiert] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/treffen/${id}` : '';
  const kannTeilen = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const teilen = async () => {
    try {
      await navigator.share({ title: titel, text: 'Wann können wir? Trag ein, wann du kannst!', url: link });
    } catch {}
  };

  const kopieren = async () => {
    try { await navigator.clipboard.writeText(link); } catch {}
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  };

  return (
    <div style={{
      background: 'var(--text)',
      borderRadius: 'var(--radius-card)',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        color: 'rgba(255,255,255,0.45)',
        fontSize: '0.72rem', fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        Einladungslink
      </div>
      {!kannTeilen && (
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 8, padding: '0.625rem 0.875rem',
          fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)',
          wordBreak: 'break-all', lineHeight: 1.4, marginBottom: 10,
          fontFamily: 'monospace',
        }}>
          {link}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {kannTeilen && (
          <button onClick={teilen} style={{
            flex: 1, padding: '0.7rem 1rem', borderRadius: 10,
            background: '#fff', color: 'var(--text)', border: 'none',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            letterSpacing: '-0.01em',
          }}>
            Einladen
          </button>
        )}
        <button onClick={kopieren} style={{
          flex: kannTeilen ? 'none' : 1,
          padding: '0.7rem 1rem', borderRadius: 10,
          background: kopiert ? 'rgba(52,199,89,0.18)' : 'rgba(255,255,255,0.1)',
          color: kopiert ? '#34c759' : 'rgba(255,255,255,0.75)',
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
          transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
        }}>
          {kopiert ? 'Kopiert' : 'Link kopieren'}
        </button>
      </div>
    </div>
  );
}

// ── Kalender ──────────────────────────────────────────────
const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function wochentag(dateStr) {
  return (new Date(dateStr + 'T12:00:00').getDay() + 6) % 7;
}

function Kalender({ tage, ausgewaehlt, onChange }) {
  const tagSet = new Set(tage);

  const toggle = (tag) => {
    const next = new Set(ausgewaehlt);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    onChange(next);
  };

  const monate = {};
  for (const tag of tage) {
    const key = tag.slice(0, 7);
    if (!monate[key]) monate[key] = [];
    monate[key].push(tag);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {Object.entries(monate).map(([key]) => {
        const [year, month] = key.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const vorlauf = wochentag(`${key}-01`);

        return (
          <div key={key}>
            <div style={{
              fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)',
              marginBottom: '0.875rem', letterSpacing: '-0.015em',
            }}>
              {MONATE[month - 1]} {year}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 5 }}>
              {WT.map(w => (
                <div key={w} style={{
                  textAlign: 'center', fontSize: '0.68rem',
                  fontWeight: 600, color: 'var(--muted)', padding: '2px 0',
                  letterSpacing: '0.02em',
                }}>
                  {w}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: vorlauf }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${key}-${String(day).padStart(2, '0')}`;
                const inRange = tagSet.has(dateStr);
                const sel = ausgewaehlt.has(dateStr);

                return (
                  <button
                    key={dateStr}
                    onClick={() => inRange && toggle(dateStr)}
                    style={{
                      aspectRatio: '1 / 1', borderRadius: '50%', border: 'none',
                      cursor: inRange ? 'pointer' : 'default',
                      fontSize: '0.875rem',
                      fontWeight: sel ? 700 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: sel ? 'var(--success)' : inRange ? 'var(--primary-light)' : 'transparent',
                      color: sel ? '#fff' : inRange ? 'var(--primary)' : '#c7c7cc',
                      transition: 'transform 0.1s, background 0.1s',
                      WebkitTapHighlightColor: 'transparent',
                      padding: 0,
                    }}
                    onMouseEnter={e => { if (inRange) e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Haupt-Seite ───────────────────────────────────────────
export default function TreffenSeite() {
  const router = useRouter();
  const { id } = router.query;

  const [meeting, setMeeting] = useState(null);
  const [fehler, setFehler] = useState('');
  const [istErsteller, setIstErsteller] = useState(false);

  const [name, setName] = useState('');
  const [ausgewaehlt, setAusgewaehlt] = useState(new Set());
  const [notiz, setNotiz] = useState('');
  const [speichern, setSpeichern] = useState('idle');
  const [nameEingabe, setNameEingabe] = useState(false);
  const [eigenerName, setEigenerName] = useState('');

  useEffect(() => {
    if (!id) return;
    setIstErsteller(localStorage.getItem(`ersteller_${id}`) === '1');
    fetch(`/api/meetings/${id}`)
      .then(r => r.json())
      .then(d => { if (d.fehler) setFehler(d.fehler); else setMeeting(d); })
      .catch(() => setFehler('Verabredung nicht gefunden.'));
  }, [id]);

  const nameWaehlen = (n) => {
    setName(n);
    const vorhanden = meeting?.antworten?.[n];
    setAusgewaehlt(vorhanden ? new Set(vorhanden) : new Set());
    setNotiz(meeting?.notizen?.[n] || '');
    setSpeichern('idle');
  };

  const handleSpeichern = async () => {
    if (!name) return;
    setSpeichern('saving');
    try {
      const res = await fetch(`/api/meetings/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slots: [...ausgewaehlt], notiz }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler);
      setMeeting(data);
      setSpeichern('saved');
      setTimeout(() => setSpeichern('idle'), 3000);
    } catch {
      setSpeichern('error');
      setTimeout(() => setSpeichern('idle'), 3000);
    }
  };

  const tage = meeting ? generateDays(meeting.datumVon, meeting.datumBis) : [];
  const abgelaufen = meeting ? new Date(meeting.datumBis + 'T23:59:59') < new Date() : false;
  const antwortCount = meeting ? Object.keys(meeting.antworten || {}).length : 0;

  if (fehler) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Fehler</div>
        <h2 style={{ fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>Nicht gefunden</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>{fehler}</p>
        <Link href="/erstellen">
          <a style={{ display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: 12, background: 'var(--text)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
            Neue Verabredung erstellen
          </a>
        </Link>
      </div>
    </div>
  );

  if (!meeting) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <>
      <Head><title>{meeting.titel} – Wann können wir?</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 540, margin: '0 auto', padding: '1.25rem 1rem' }}>

          {/* ── Meeting-Header ── */}
          <Card style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {abgelaufen && <Pill color="#e05c00">Abgelaufen</Pill>}
              {istErsteller && <Pill color="var(--success)">Organisator</Pill>}
            </div>
            <h1 style={{
              fontSize: 'clamp(1.25rem,4vw,1.625rem)', fontWeight: 700,
              margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2,
            }}>
              {meeting.titel}
            </h1>
            {meeting.beschreibung && (
              <p style={{ color: 'var(--secondary)', margin: '0 0 10px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {meeting.beschreibung}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
              <span>{fmtDate(meeting.datumVon)} – {fmtDate(meeting.datumBis)}</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span>{antwortCount} / {meeting.teilnehmer.length} geantwortet</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span>{meeting.ersteller}</span>
            </div>
          </Card>

          {/* ── Share Banner ── */}
          {istErsteller && <ShareBanner id={id} titel={meeting.titel} />}

          {/* ── Abgelaufen ── */}
          {abgelaufen && (
            <div style={{
              background: '#fff8f0', border: '1px solid #f5c080',
              borderRadius: 12, padding: '0.875rem 1rem',
              marginBottom: '1rem', fontSize: '0.875rem',
              color: '#7a3d00', fontWeight: 500, lineHeight: 1.4,
            }}>
              Die Antwortefrist ist abgelaufen.
            </div>
          )}

          {/* ── Name wählen ── */}
          {!abgelaufen && (
            <Card style={{ marginBottom: '1rem' }}>
              <Label>Wer bist du?</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '0.875rem' }}>
                {meeting.teilnehmer.map(n => {
                  const hat = meeting.antworten?.[n] !== undefined;
                  const aktiv = name === n;
                  return (
                    <button key={n} onClick={() => { nameWaehlen(n); setNameEingabe(false); }} style={{
                      padding: '0.55rem 1rem', borderRadius: 50, cursor: 'pointer',
                      fontSize: '0.875rem', fontWeight: aktiv ? 600 : 400,
                      letterSpacing: '-0.01em', transition: 'all 0.15s',
                      border: aktiv ? '1.5px solid var(--text)' : '1.5px solid var(--border)',
                      background: aktiv ? 'var(--text)' : 'var(--white)',
                      color: aktiv ? '#fff' : 'var(--text)',
                    }}>
                      {n}{hat && !aktiv ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>

              {!nameEingabe ? (
                <button onClick={() => setNameEingabe(true)} style={{
                  background: 'none', border: 'none', color: 'var(--muted)',
                  fontSize: '0.85rem', cursor: 'pointer', padding: '2px 0',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  letterSpacing: '-0.01em',
                }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
                  Mein Name fehlt
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <input
                    autoFocus
                    placeholder="Dein Name …"
                    value={eigenerName}
                    onChange={e => setEigenerName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { const n = eigenerName.trim(); if (n) { nameWaehlen(n); setNameEingabe(false); setEigenerName(''); } }
                      if (e.key === 'Escape') { setNameEingabe(false); setEigenerName(''); }
                    }}
                    style={{
                      flex: 1, padding: '0.6rem 0.875rem', borderRadius: 10,
                      border: '1.5px solid var(--text)', fontSize: '0.9rem',
                      outline: 'none', letterSpacing: '-0.01em',
                    }}
                  />
                  <button
                    onClick={() => { const n = eigenerName.trim(); if (n) { nameWaehlen(n); setNameEingabe(false); setEigenerName(''); } }}
                    style={{
                      padding: '0.6rem 1rem', borderRadius: 10,
                      background: 'var(--text)', color: '#fff',
                      border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                    }}>
                    OK
                  </button>
                  <button
                    onClick={() => { setNameEingabe(false); setEigenerName(''); }}
                    style={{
                      padding: '0.6rem 0.75rem', borderRadius: 10,
                      background: 'var(--bg)', color: 'var(--muted)',
                      border: 'none', cursor: 'pointer', fontSize: '1rem',
                    }}>
                    ✕
                  </button>
                </div>
              )}
            </Card>
          )}

          {/* ── Kalender ── */}
          {!abgelaufen && name && (
            <Card style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
                <Label style={{ marginBottom: 0 }}>
                  An welchen Tagen kannst du?
                  {ausgewaehlt.size > 0 && (
                    <span style={{ color: 'var(--success)', fontWeight: 600, marginLeft: 8 }}>
                      {ausgewaehlt.size} ausgewählt
                    </span>
                  )}
                </Label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SmallBtn onClick={() => setAusgewaehlt(new Set(tage))}>Alle</SmallBtn>
                  <SmallBtn onClick={() => setAusgewaehlt(new Set())}>Keine</SmallBtn>
                </div>
              </div>
              <Kalender tage={tage} ausgewaehlt={ausgewaehlt} onChange={setAusgewaehlt} />
            </Card>
          )}

          {/* ── Notiz ── */}
          {!abgelaufen && name && (
            <Card style={{ marginBottom: '1rem' }}>
              <Label style={{ marginBottom: '0.5rem' }}>
                Anmerkung{' '}
                <span style={{ color: 'var(--muted)', fontWeight: 400 }}>– optional</span>
              </Label>
              <textarea
                placeholder={"z.B. „Ich kann erst ab 18 Uhr“ oder „Nur wenn’s in der Nähe ist“"}
                value={notiz}
                onChange={e => setNotiz(e.target.value)}
                maxLength={200}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 10,
                  border: '1.5px solid var(--border)', fontSize: '0.9rem',
                  resize: 'none', outline: 'none', lineHeight: 1.5,
                  minHeight: 72, fontFamily: 'inherit', color: 'var(--text)',
                  transition: 'border-color 0.15s', letterSpacing: '-0.01em',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--text)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </Card>
          )}

          {/* ── Wer hat geantwortet ── */}
          <Card style={{ marginBottom: '1rem' }}>
            <Label>{antwortCount} / {meeting.teilnehmer.length} haben geantwortet</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {meeting.teilnehmer.map(n => {
                const hat = meeting.antworten?.[n] !== undefined;
                return (
                  <div key={n} style={{
                    padding: '5px 13px', borderRadius: 50, fontSize: '0.85rem',
                    fontWeight: hat ? 500 : 400, letterSpacing: '-0.01em',
                    background: hat ? 'var(--success-light)' : 'var(--bg)',
                    color: hat ? '#1a7a40' : 'var(--muted)',
                    border: hat ? '1px solid #b8f0c8' : '1px solid var(--border)',
                  }}>
                    {hat ? '✓ ' : ''}{n}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── Ergebnisse-Link ── */}
          <Link href={`/treffen/${id}/ergebnisse`}>
            <a style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--white)', borderRadius: 'var(--radius-card)',
              padding: '1rem 1.25rem', boxShadow: 'var(--shadow-card)',
              color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem',
              border: '1px solid var(--border)', letterSpacing: '-0.015em',
            }}>
              <span>Beste Termine anzeigen</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {antwortCount > 0 && (
                  <span style={{
                    background: 'var(--text)', color: '#fff',
                    borderRadius: 50, padding: '1px 8px', fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    {antwortCount}
                  </span>
                )}
                <span style={{ color: 'var(--muted)' }}>→</span>
              </div>
            </a>
          </Link>

        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      {name && !abgelaufen && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
          padding: '0.875rem 1rem',
          paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 100,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              letterSpacing: '-0.015em',
            }}>
              {name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 1 }}>
              {ausgewaehlt.size === 0 ? 'Keine Tage ausgewählt' : `${ausgewaehlt.size} Tag${ausgewaehlt.size !== 1 ? 'e' : ''} gewählt`}
            </div>
          </div>
          <button onClick={handleSpeichern} disabled={speichern === 'saving'}
            style={{
              padding: '0.7rem 1.5rem', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              transition: 'all 0.2s', flexShrink: 0, letterSpacing: '-0.01em',
              background: speichern === 'saved' ? 'var(--success)' : speichern === 'error' ? '#e03030' : 'var(--text)',
              color: '#fff', opacity: speichern === 'saving' ? 0.6 : 1,
            }}>
            {speichern === 'saving' ? 'Speichert …'
              : speichern === 'saved' ? 'Gespeichert'
              : speichern === 'error' ? 'Fehler – nochmal?'
              : 'Speichern'}
          </button>
        </div>
      )}
    </>
  );
}

// ── Mini-Komponenten ──────────────────────────────────────
function fmtDate(str) {
  return new Date(str + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}
function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-card)',
      padding: '1.25rem', border: '1px solid var(--border)', ...style,
    }}>
      {children}
    </div>
  );
}
function Label({ children, style }) {
  return (
    <div style={{
      fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)',
      marginBottom: '0.75rem', letterSpacing: '-0.015em', ...style,
    }}>
      {children}
    </div>
  );
}
function Pill({ children, color }) {
  return (
    <span style={{
      display: 'inline-block', borderRadius: 50,
      padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600,
      background: color + '15', color,
      border: `1px solid ${color}30`,
      letterSpacing: '-0.01em',
    }}>
      {children}
    </span>
  );
}
function SmallBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border)',
      background: 'var(--bg)', color: 'var(--secondary)',
      fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
      letterSpacing: '-0.01em',
    }}>
      {children}
    </button>
  );
}
