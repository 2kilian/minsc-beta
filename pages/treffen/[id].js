import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { generateDays, formatDatumLang } from '../../lib/slots';

// ── Share Banner ─────────────────────────────────────────
function ShareBanner({ id }) {
  const [kopiert, setKopiert] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/treffen/${id}` : '';
  const kopieren = async () => {
    try { await navigator.clipboard.writeText(link); } catch {}
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  };
  return (
    <div style={{ background: 'var(--primary-grad)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ color: '#fff', fontWeight: 700, marginBottom: 10, fontSize: '0.95rem' }}>🔗 Link zum Teilen</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all', lineHeight: 1.4 }}>
          {link}
        </div>
        <button onClick={kopieren} style={{ flexShrink: 0, padding: '0.65rem 1.1rem', borderRadius: 10, background: kopiert ? 'var(--success)' : '#fff', color: kopiert ? '#fff' : 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
          {kopiert ? '✓ Kopiert!' : '📋 Kopieren'}
        </button>
      </div>
    </div>
  );
}

// ── Kalender ──────────────────────────────────────────────
const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

// Wochentag Mo=0 ... So=6
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

  // Tage nach Monat gruppieren
  const monate = {};
  for (const tag of tage) {
    const key = tag.slice(0, 7); // "2026-07"
    if (!monate[key]) monate[key] = [];
    monate[key].push(tag);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {Object.entries(monate).map(([key]) => {
        const [year, month] = key.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const ersterTag = `${key}-01`;
        const vorlauf = wochentag(ersterTag); // leere Zellen am Anfang

        return (
          <div key={key}>
            {/* Monatsname */}
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
              {MONATE[month - 1]} {year}
            </div>

            {/* Wochentag-Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {WT.map(w => (
                <div key={w} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', padding: '2px 0' }}>{w}</div>
              ))}
            </div>

            {/* Tage-Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {/* Leere Zellen */}
              {Array.from({ length: vorlauf }).map((_, i) => <div key={`e${i}`} />)}

              {/* Alle Tage des Monats */}
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
                      aspectRatio: '1 / 1',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: inRange ? 'pointer' : 'default',
                      fontSize: '0.9rem',
                      fontWeight: sel ? 800 : inRange ? 500 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: sel ? 'var(--success)' : inRange ? 'var(--primary-light)' : 'transparent',
                      color: sel ? '#fff' : inRange ? 'var(--primary)' : '#d1d5db',
                      transition: 'transform 0.1s, background 0.15s',
                      WebkitTapHighlightColor: 'transparent',
                      padding: 0,
                    }}
                    onMouseEnter={e => { if (inRange) e.currentTarget.style.transform = 'scale(1.12)'; }}
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
  const [speichern, setSpeichern] = useState('idle');

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
    setSpeichern('idle');
  };

  const handleSpeichern = async () => {
    if (!name) return;
    setSpeichern('saving');
    try {
      const res = await fetch(`/api/meetings/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slots: [...ausgewaehlt] }),
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
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8 }}>Nicht gefunden</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{fehler}</p>
        <Link href="/erstellen"><a style={{ display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: 12, background: 'var(--primary-grad)', color: '#fff', fontWeight: 700 }}>Neue Verabredung erstellen</a></Link>
      </div>
    </div>
  );

  if (!meeting) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <Head><title>{meeting.titel} – Wann können wir?</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.25rem 1rem' }}>

          {/* ── Meeting-Header ── */}
          <Card style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {abgelaufen && <Pill color="#dc2626">Abgelaufen</Pill>}
              {istErsteller && <Pill color="var(--success)">Du bist Organisator</Pill>}
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem,4vw,1.75rem)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {meeting.titel}
            </h1>
            {meeting.beschreibung && (
              <p style={{ color: 'var(--muted)', margin: '0 0 10px', fontSize: '0.9rem', lineHeight: 1.5 }}>{meeting.beschreibung}</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
              <span>📆 {fmtDate(meeting.datumVon)} – {fmtDate(meeting.datumBis)}</span>
              <span>👥 {antwortCount}/{meeting.teilnehmer.length} geantwortet</span>
              <span>👤 {meeting.ersteller}</span>
            </div>
          </Card>

          {/* ── Share Banner ── */}
          {istErsteller && <ShareBanner id={id} />}

          {/* ── Abgelaufen ── */}
          {abgelaufen && (
            <div style={{ background: '#fef3c7', border: '1.5px solid #fbbf24', borderRadius: 14, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400e', fontWeight: 500 }}>
              ⏰ Die Antwortefrist ist abgelaufen.
            </div>
          )}

          {/* ── Name wählen ── */}
          {!abgelaufen && (
            <Card style={{ marginBottom: '1rem' }}>
              <Label>Wer bist du?</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {meeting.teilnehmer.map(n => {
                  const hat = meeting.antworten?.[n] !== undefined;
                  const aktiv = name === n;
                  return (
                    <button key={n} onClick={() => nameWaehlen(n)} style={{
                      padding: '0.6rem 1.1rem', borderRadius: 50, border: '2px solid', cursor: 'pointer',
                      fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.15s',
                      borderColor: aktiv ? 'var(--primary)' : 'var(--border)',
                      background: aktiv ? 'var(--primary)' : '#fff',
                      color: aktiv ? '#fff' : 'var(--text)',
                    }}>
                      {n}{hat && !aktiv ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── Kalender ── */}
          {!abgelaufen && name && (
            <Card style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
                <Label style={{ marginBottom: 0 }}>
                  An welchen Tagen kannst du?{' '}
                  {ausgewaehlt.size > 0 && (
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>{ausgewaehlt.size} ausgewählt</span>
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

          {/* ── Wer hat geantwortet ── */}
          <Card style={{ marginBottom: '1rem' }}>
            <Label>{antwortCount}/{meeting.teilnehmer.length} haben geantwortet</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {meeting.teilnehmer.map(n => {
                const hat = meeting.antworten?.[n] !== undefined;
                return (
                  <div key={n} style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.875rem', fontWeight: 600, background: hat ? 'var(--success-light)' : '#f1f5f9', color: hat ? '#065f46' : 'var(--muted)' }}>
                    {hat ? '✓' : '○'} {n}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── Ergebnisse-Link ── */}
          <Link href={`/treffen/${id}/ergebnisse`}>
            <a style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: '1rem', boxShadow: 'var(--shadow-card)', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', border: '2px solid var(--primary-light)' }}>
              🎯 Beste Termine anzeigen
              {antwortCount > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 50, padding: '1px 8px', fontSize: '0.78rem' }}>{antwortCount}</span>}
            </a>
          </Link>
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      {name && !abgelaufen && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid var(--border)',
          padding: '0.875rem 1rem',
          paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 100,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {ausgewaehlt.size === 0 ? 'Keine Tage ausgewählt' : `${ausgewaehlt.size} Tag${ausgewaehlt.size !== 1 ? 'e' : ''} ausgewählt`}
            </div>
          </div>
          <button onClick={handleSpeichern} disabled={speichern === 'saving'}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.2s', flexShrink: 0,
              background: speichern === 'saved' ? 'var(--success)' : speichern === 'error' ? '#ef4444' : 'var(--primary-grad)',
              color: '#fff', opacity: speichern === 'saving' ? 0.7 : 1,
            }}>
            {speichern === 'saving' ? 'Speichert...' : speichern === 'saved' ? '✓ Gespeichert!' : speichern === 'error' ? 'Fehler – nochmal?' : 'Speichern →'}
          </button>
        </div>
      )}
    </>
  );
}

// ── Hilfsfunktionen & Mini-Komponenten ───────────────────
function fmtDate(str) {
  return new Date(str + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}
function Card({ children, style }) {
  return <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: '1.25rem', boxShadow: 'var(--shadow-card)', ...style }}>{children}</div>;
}
function Label({ children, style }) {
  return <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem', ...style }}>{children}</div>;
}
function Pill({ children, color }) {
  return <span style={{ display: 'inline-block', background: color + '18', color, borderRadius: 50, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{children}</span>;
}
function SmallBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '4px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
      {children}
    </button>
  );
}
