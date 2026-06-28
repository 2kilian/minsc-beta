import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { generateSlots, getDays, getTimes, formatDatum } from '../../lib/slots';

// ────────────────────────────────────────────
// Shared styles
// ────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '1.5rem 1rem', paddingBottom: '4rem' },
  card: { background: 'white', borderRadius: 20, padding: '1.75rem', maxWidth: 900, margin: '0 auto 1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  badge: (color) => ({ display: 'inline-block', background: color + '22', color, borderRadius: 20, padding: '3px 10px', fontSize: '0.8rem', fontWeight: 600, marginRight: 6 }),
  btn: (primary) => ({ padding: '0.7rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, background: primary ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#f1f5f9', color: primary ? 'white' : '#374151', transition: 'opacity 0.15s' }),
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem' },
  success: { background: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem' },
};

// ────────────────────────────────────────────
// Share Link Banner
// ────────────────────────────────────────────
function ShareBanner({ id }) {
  const [kopiert, setKopiert] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/treffen/${id}` : '';

  const kopieren = async () => {
    await navigator.clipboard.writeText(link);
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 16, padding: '1.25rem 1.5rem', color: 'white', marginBottom: '1.5rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>🔗 Link zum Teilen</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.875rem', wordBreak: 'break-all', minWidth: 200 }}>
          {link}
        </div>
        <button onClick={kopieren} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: 'white', color: '#764ba2', border: 'none', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {kopiert ? '✓ Kopiert!' : '📋 Kopieren'}
        </button>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
        Schicke diesen Link an alle Eingeladenen – keine Anmeldung nötig.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────
// Availability Grid
// ────────────────────────────────────────────
function VerfügbarkeitsRaster({ slots, ausgewaehlt, onChange }) {
  const days = getDays(slots);
  const times = getTimes(slots);
  const dragging = useRef(false);
  const dragAction = useRef('select');

  const toggle = (slot) => {
    const next = new Set(ausgewaehlt);
    if (next.has(slot)) next.delete(slot); else next.add(slot);
    onChange(next);
  };

  const onDown = (slot) => {
    dragging.current = true;
    dragAction.current = ausgewaehlt.has(slot) ? 'deselect' : 'select';
    const next = new Set(ausgewaehlt);
    if (dragAction.current === 'select') next.add(slot); else next.delete(slot);
    onChange(next);
  };

  const onEnter = (slot) => {
    if (!dragging.current) return;
    const next = new Set(ausgewaehlt);
    if (dragAction.current === 'select') next.add(slot); else next.delete(slot);
    onChange(next);
  };

  const stopDrag = () => { dragging.current = false; };

  const cellW = Math.max(72, Math.floor((Math.min(window?.innerWidth || 900, 860) - 56) / days.length));

  return (
    <div onMouseUp={stopDrag} onMouseLeave={stopDrag} style={{ overflowX: 'auto', userSelect: 'none' }}>
      <div style={{ display: 'inline-block', minWidth: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', marginLeft: 52 }}>
          {days.map(d => (
            <div key={d} style={{ width: cellW, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', padding: '4px 2px', borderLeft: '1px solid #e5e7eb' }}>
              {formatDatum(d).split(',').map((t, i) => <div key={i}>{t.trim()}</div>)}
            </div>
          ))}
        </div>

        {/* Rows */}
        {times.map((time, ti) => (
          <div key={time} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 52, fontSize: '0.75rem', color: '#6b7280', textAlign: 'right', paddingRight: 8, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {time.endsWith(':00') ? time : ''}
            </div>
            {days.map(d => {
              const slot = `${d}T${time}`;
              const sel = ausgewaehlt.has(slot);
              return (
                <div
                  key={slot}
                  onMouseDown={() => onDown(slot)}
                  onMouseEnter={() => onEnter(slot)}
                  style={{
                    width: cellW,
                    height: 22,
                    background: sel ? '#10b981' : '#f3f4f6',
                    borderLeft: '1px solid #e5e7eb',
                    borderTop: time.endsWith(':00') ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background 0.08s',
                    flexShrink: 0,
                  }}
                  title={`${formatDatum(d)}, ${time}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: '0.8rem', color: '#6b7280', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 16, height: 16, background: '#10b981', borderRadius: 3, display: 'inline-block' }} /> Ich kann
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 16, height: 16, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 3, display: 'inline-block' }} /> Nicht verfügbar
        </span>
        <span style={{ color: '#94a3b8' }}>Klicken oder ziehen um Zeiten auszuwählen</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Response Form
// ────────────────────────────────────────────
function AntwortFormular({ meeting, onSuccess }) {
  const slots = generateSlots(meeting.datumVon, meeting.datumBis, meeting.zeitVon, meeting.zeitBis);
  const [name, setName] = useState('');
  const [ausgewaehlt, setAusgewaehlt] = useState(new Set());
  const [fehler, setFehler] = useState('');
  const [laden, setLaden] = useState(false);
  const [gesendet, setGesendet] = useState(false);

  const bereitsGeantwortet = Object.keys(meeting.antworten || {});

  const nameWaehlen = (n) => {
    setName(n);
    const vorhanden = meeting.antworten?.[n];
    setAusgewaehlt(vorhanden ? new Set(vorhanden) : new Set());
    setFehler('');
  };

  const submit = async () => {
    if (!name) return setFehler('Bitte wähle deinen Namen aus.');
    setFehler('');
    setLaden(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slots: [...ausgewaehlt] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler);
      setGesendet(true);
      onSuccess(data);
    } catch (e) {
      setFehler(e.message || 'Fehler beim Speichern.');
    } finally {
      setLaden(false);
    }
  };

  if (gesendet) {
    return (
      <div style={s.success}>
        ✅ Deine Verfügbarkeit wurde gespeichert! Du kannst sie jederzeit aktualisieren, indem du deinen Namen erneut auswählst.
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 1rem' }}>Deine Verfügbarkeit eintragen</h3>

      {fehler && <div style={s.error}>{fehler}</div>}

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: '0.9rem' }}>
          Wer bist du?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {meeting.teilnehmer.map(n => (
            <button key={n} onClick={() => nameWaehlen(n)}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 20, border: '2px solid', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                borderColor: name === n ? '#7c3aed' : '#e2e8f0',
                background: name === n ? '#7c3aed' : 'white',
                color: name === n ? 'white' : '#374151' }}>
              {n}
              {bereitsGeantwortet.includes(n) && <span style={{ marginLeft: 5, opacity: 0.7 }}>✓</span>}
            </button>
          ))}
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 6 }}>
          ✓ = hat bereits geantwortet (Antwort wird überschrieben)
        </p>
      </div>

      {name && (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: '0.9rem' }}>
              Wann kannst du? <span style={{ color: '#7c3aed' }}>({ausgewaehlt.size} Zeitfenster ausgewählt)</span>
            </label>
            <VerfügbarkeitsRaster slots={slots} ausgewaehlt={ausgewaehlt} onChange={setAusgewaehlt} />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => setAusgewaehlt(new Set(slots))}
              style={{ ...s.btn(false), fontSize: '0.875rem' }}>Alle auswählen</button>
            <button onClick={() => setAusgewaehlt(new Set())}
              style={{ ...s.btn(false), fontSize: '0.875rem' }}>Alle abwählen</button>
            <button onClick={submit} disabled={laden}
              style={{ ...s.btn(true), opacity: laden ? 0.7 : 1, marginLeft: 'auto' }}>
              {laden ? 'Speichert...' : '💾 Verfügbarkeit speichern'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────
export default function TreffenSeite() {
  const router = useRouter();
  const { id, neu } = router.query;
  const [meeting, setMeeting] = useState(null);
  const [fehler, setFehler] = useState('');
  const [istErsteller, setIstErsteller] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIstErsteller(localStorage.getItem(`ersteller_${id}`) === '1');
    fetch(`/api/meetings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.fehler) setFehler(data.fehler);
        else setMeeting(data);
      })
      .catch(() => setFehler('Meeting nicht gefunden.'));
  }, [id]);

  if (fehler) return (
    <div style={s.page}>
      <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ color: '#1e293b' }}>Meeting nicht gefunden</h2>
        <p style={{ color: '#64748b' }}>{fehler}</p>
        <Link href="/erstellen"><a style={s.btn(true)}>Neues Meeting erstellen</a></Link>
      </div>
    </div>
  );

  if (!meeting) return (
    <div style={s.page}>
      <div style={{ ...s.card, textAlign: 'center', color: '#64748b', padding: '3rem' }}>Lade...</div>
    </div>
  );

  const antwortCount = Object.keys(meeting.antworten || {}).length;
  const totalCount = meeting.teilnehmer.length;
  const deadline = new Date(meeting.datumBis + 'T23:59:59');
  const abgelaufen = deadline < new Date();

  return (
    <div style={s.page}>
      <Head><title>{meeting.titel} – Wann können wir?</title></Head>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={s.card}>
          <div style={{ marginBottom: 12 }}>
            <span style={s.badge('#7c3aed')}>📅 Verabredung</span>
            {abgelaufen && <span style={s.badge('#dc2626')}>Abgelaufen</span>}
            {istErsteller && <span style={s.badge('#059669')}>Du bist Organisator</span>}
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem' }}>{meeting.titel}</h1>
          {meeting.beschreibung && <p style={{ color: '#64748b', margin: '0 0 1rem' }}>{meeting.beschreibung}</p>}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#4b5563', fontSize: '0.9rem' }}>
            <span>📆 {new Date(meeting.datumVon + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} – {new Date(meeting.datumBis + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>🕐 {meeting.zeitVon} – {meeting.zeitBis} Uhr</span>
            <span>👥 {antwortCount}/{totalCount} geantwortet</span>
            <span>👤 Erstellt von {meeting.ersteller}</span>
          </div>
        </div>

        {/* Share Banner for creator */}
        {istErsteller && <div style={{ maxWidth: 900, margin: '0 auto' }}><ShareBanner id={id} /></div>}

        {/* New meeting banner */}
        {neu && !istErsteller && (
          <div style={{ ...s.card, background: '#d1fae5', border: '1px solid #6ee7b7' }}>
            ✅ Meeting erstellt! Teile den Link mit deinen Eingeladenen.
          </div>
        )}

        {/* Response form */}
        {!abgelaufen && (
          <div style={s.card}>
            <AntwortFormular meeting={meeting} onSuccess={(updated) => setMeeting(updated)} />
          </div>
        )}

        {abgelaufen && (
          <div style={{ ...s.card, background: '#fef3c7', border: '1px solid #fbbf24' }}>
            ⏰ Die Antwortefrist ist abgelaufen. Neue Antworten werden nicht mehr akzeptiert.
          </div>
        )}

        {/* Who has responded */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 1rem' }}>
            Antworten ({antwortCount}/{totalCount})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {meeting.teilnehmer.map(n => {
              const hat = meeting.antworten?.[n] !== undefined;
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: hat ? '#d1fae5' : '#f3f4f6', color: hat ? '#065f46' : '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>
                  <span>{hat ? '✓' : '○'}</span> {n}
                </div>
              );
            })}
          </div>
        </div>

        {/* Link to results */}
        <div style={{ ...s.card, textAlign: 'center' }}>
          <p style={{ color: '#64748b', margin: '0 0 1rem' }}>
            {antwortCount > 0 ? `${antwortCount} Person${antwortCount !== 1 ? 'en haben' : ' hat'} geantwortet – schau dir die besten Termine an!` : 'Noch keine Antworten – teile den Link!'}
          </p>
          <Link href={`/treffen/${id}/ergebnisse`}>
            <a style={{ ...s.btn(true), display: 'inline-block', textDecoration: 'none' }}>
              🎯 Beste Termine anzeigen {antwortCount > 0 ? `(${antwortCount} Antworten)` : ''}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
