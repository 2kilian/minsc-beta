import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { generateSlots, getDays, getTimes, formatDatumKurz } from '../../lib/slots';

// ── Share Banner ─────────────────────────────────────────
function ShareBanner({ id }) {
  const [kopiert, setKopiert] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/treffen/${id}` : '';

  const kopieren = async () => {
    try { await navigator.clipboard.writeText(link); } catch { }
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  };

  return (
    <div style={{ background: 'var(--primary-grad)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ color: '#fff', fontWeight: 700, marginBottom: 10, fontSize: '0.95rem' }}>
        🔗 Link zum Teilen
      </div>
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

// ── Verfügbarkeits-Raster ─────────────────────────────────
function Raster({ slots, ausgewaehlt, onChange }) {
  const days = getDays(slots);
  const times = getTimes(slots);
  const dragging = useRef(false);
  const dragAction = useRef('select');
  const containerRef = useRef(null);

  const applySlot = useCallback((slot, action) => {
    onChange(prev => {
      const next = new Set(prev);
      if (action === 'select') next.add(slot); else next.delete(slot);
      return next;
    });
  }, [onChange]);

  const onMouseDown = (slot) => {
    dragging.current = true;
    dragAction.current = ausgewaehlt.has(slot) ? 'deselect' : 'select';
    applySlot(slot, dragAction.current);
  };
  const onMouseEnter = (slot) => { if (dragging.current) applySlot(slot, dragAction.current); };
  const stopDrag = () => { dragging.current = false; };

  // Touch: nur Tap (kein Drag, da scroll kollidiert)
  const onTouchEnd = (slot, e) => {
    e.preventDefault();
    const action = ausgewaehlt.has(slot) ? 'deselect' : 'select';
    applySlot(slot, action);
  };

  const TIME_COL = 48;
  const CELL_H = 36;
  const MIN_CELL_W = 52;

  return (
    <div ref={containerRef} onMouseUp={stopDrag} onMouseLeave={stopDrag} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginLeft: -4, marginRight: -4 }}>
      <div style={{ display: 'inline-block', minWidth: '100%', paddingLeft: 4, paddingRight: 4 }}>
        {/* Tages-Header */}
        <div style={{ display: 'flex', marginLeft: TIME_COL }}>
          {days.map(d => {
            const { wt, datum } = formatDatumKurz(d);
            return (
              <div key={d} style={{ minWidth: MIN_CELL_W, flex: 1, textAlign: 'center', padding: '2px 2px 8px', borderLeft: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{wt}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{datum}</div>
              </div>
            );
          })}
        </div>

        {/* Zeit-Zeilen */}
        {times.map((time) => (
          <div key={time} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ width: TIME_COL, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
              {time}
            </div>
            {days.map(d => {
              const slot = `${d}T${time}`;
              const sel = ausgewaehlt.has(slot);
              return (
                <div
                  key={slot}
                  data-slot={slot}
                  onMouseDown={() => onMouseDown(slot)}
                  onMouseEnter={() => onMouseEnter(slot)}
                  onTouchEnd={(e) => onTouchEnd(slot, e)}
                  style={{
                    minWidth: MIN_CELL_W, flex: 1, height: CELL_H,
                    background: sel ? 'var(--success)' : '#f1f5f9',
                    borderLeft: '1px solid var(--border)',
                    borderTop: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.08s',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Haupt-Seite ───────────────────────────────────────────
export default function TreffenSeite() {
  const router = useRouter();
  const { id, neu } = router.query;

  const [meeting, setMeeting] = useState(null);
  const [fehler, setFehler] = useState('');
  const [istErsteller, setIstErsteller] = useState(false);

  const [name, setName] = useState('');
  const [ausgewaehlt, setAusgewaehlt] = useState(new Set());
  const [speichern, setSpeichern] = useState('idle'); // idle | saving | saved | error

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
    }
  };

  const slots = meeting ? generateSlots(meeting.datumVon, meeting.datumBis) : [];
  const abgelaufen = meeting ? new Date(meeting.datumBis + 'T23:59:59') < new Date() : false;
  const antwortCount = meeting ? Object.keys(meeting.antworten || {}).length : 0;

  // Error / loading
  if (fehler) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8 }}>Nicht gefunden</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{fehler}</p>
        <Link href="/erstellen"><a style={btnStyle(true)}>Neue Verabredung erstellen</a></Link>
      </div>
    </div>
  );

  if (!meeting) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );

  return (
    <>
      <Head><title>{meeting.titel} – Wann können wir?</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.25rem 1rem' }}>

          {/* ── Meeting-Header ── */}
          <Card style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {abgelaufen && <Pill color="#dc2626">Abgelaufen</Pill>}
                  {istErsteller && <Pill color="var(--success)">Du bist Organisator</Pill>}
                </div>
                <h1 style={{ fontSize: 'clamp(1.25rem,3.5vw,1.75rem)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  {meeting.titel}
                </h1>
                {meeting.beschreibung && <p style={{ color: 'var(--muted)', margin: '0 0 10px', fontSize: '0.9rem', lineHeight: 1.5 }}>{meeting.beschreibung}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  <span>📆 {fmtDate(meeting.datumVon)} – {fmtDate(meeting.datumBis)}</span>
                  <span>👥 {antwortCount}/{meeting.teilnehmer.length} geantwortet</span>
                  <span>👤 {meeting.ersteller}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ── Share Banner (Ersteller) ── */}
          {istErsteller && <ShareBanner id={id} />}

          {/* ── Abgelaufen-Banner ── */}
          {abgelaufen && (
            <div style={{ background: '#fef3c7', border: '1.5px solid #fbbf24', borderRadius: 14, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400e', fontWeight: 500 }}>
              ⏰ Die Antwortefrist ist abgelaufen.
            </div>
          )}

          {/* ── Name wählen ── */}
          {!abgelaufen && (
            <Card style={{ marginBottom: '1rem' }}>
              <SectionLabel>Wer bist du?</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {meeting.teilnehmer.map(n => {
                  const hat = meeting.antworten?.[n] !== undefined;
                  const aktiv = name === n;
                  return (
                    <button key={n} onClick={() => nameWaehlen(n)} style={{
                      padding: '0.6rem 1.1rem', borderRadius: 50, border: '2px solid', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.15s',
                      borderColor: aktiv ? 'var(--primary)' : 'var(--border)',
                      background: aktiv ? 'var(--primary)' : '#fff',
                      color: aktiv ? '#fff' : 'var(--text)',
                    }}>
                      {n} {hat && !aktiv && <span style={{ opacity: 0.6 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── Verfügbarkeitsraster ── */}
          {!abgelaufen && name && (
            <Card style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
                <SectionLabel style={{ marginBottom: 0 }}>
                  Wann kannst du?{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{ausgewaehlt.size} ausgewählt</span>
                </SectionLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SmallBtn onClick={() => setAusgewaehlt(new Set(slots))}>Alle</SmallBtn>
                  <SmallBtn onClick={() => setAusgewaehlt(new Set())}>Keine</SmallBtn>
                </div>
              </div>

              <Raster slots={slots} ausgewaehlt={ausgewaehlt} onChange={setAusgewaehlt} />

              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: '0.75rem', color: 'var(--muted)', alignItems: 'center' }}>
                <LegendDot color="var(--success)" label="Ich kann" />
                <LegendDot color="#f1f5f9" label="Nicht verfügbar" border />
                <span style={{ marginLeft: 'auto' }}>Tippen zum Auswählen</span>
              </div>
            </Card>
          )}

          {/* ── Wer hat geantwortet ── */}
          <Card style={{ marginBottom: '1rem' }}>
            <SectionLabel>{antwortCount}/{meeting.teilnehmer.length} haben geantwortet</SectionLabel>
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

          {/* ── Zu den Ergebnissen ── */}
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
          padding: '0.875rem 1rem', paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 100,
        }}>
          <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{name}</span>
            {' · '}{ausgewaehlt.size} Zeitfenster
          </div>
          <button onClick={handleSpeichern} disabled={speichern === 'saving'}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.2s',
              background: speichern === 'saved' ? 'var(--success)' : speichern === 'error' ? '#ef4444' : 'var(--primary-grad)',
              color: '#fff', opacity: speichern === 'saving' ? 0.7 : 1, flexShrink: 0,
            }}>
            {speichern === 'saving' ? 'Speichert...' : speichern === 'saved' ? '✓ Gespeichert!' : speichern === 'error' ? 'Fehler' : 'Speichern →'}
          </button>
        </div>
      )}
    </>
  );
}

// ── Hilfsfunktionen & Komponenten ────────────────────────
function fmtDate(str) {
  return new Date(str + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function Card({ children, style }) {
  return <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: '1.25rem', boxShadow: 'var(--shadow-card)', ...style }}>{children}</div>;
}

function SectionLabel({ children, style }) {
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

function LegendDot({ color, label, border }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 14, height: 14, background: color, borderRadius: 3, display: 'inline-block', border: border ? '1px solid var(--border)' : 'none' }} />
      {label}
    </span>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

function btnStyle(primary) {
  return {
    display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: 12,
    background: primary ? 'var(--primary-grad)' : '#fff',
    color: primary ? '#fff' : 'var(--text)', fontWeight: 700, fontSize: '0.95rem',
    border: primary ? 'none' : '2px solid var(--border)',
  };
}
