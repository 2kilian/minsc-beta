import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { generateDays, formatDatumLang, besteZeiten } from '../../../lib/slots';

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
function wochentag(dateStr) { return (new Date(dateStr + 'T12:00:00').getDay() + 6) % 7; }

// ── Kalender-Heatmap ──────────────────────────────────────
function KalenderHeatmap({ meeting }) {
  const tage = generateDays(meeting.datumVon, meeting.datumBis);
  const { antworten } = meeting;
  const totalPersons = Object.keys(antworten).length;

  const heatData = {};
  for (const tag of tage) heatData[tag] = 0;
  for (const [, slots] of Object.entries(antworten)) {
    for (const slot of slots) { if (heatData[slot] !== undefined) heatData[slot]++; }
  }
  const maxCount = Math.max(...Object.values(heatData), 1);

  function getColor(count) {
    if (count === 0) return '#f1f5f9';
    const r = count / maxCount;
    if (r <= 0.33) return '#fef3c7';
    if (r <= 0.66) return '#86efac';
    if (r < 1) return '#34d399';
    return '#10b981';
  }

  const [hovered, setHovered] = useState(null);

  const monate = {};
  for (const tag of tage) {
    const key = tag.slice(0, 7);
    if (!monate[key]) monate[key] = [];
    monate[key].push(tag);
  }
  const tagSet = new Set(tage);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(monate).map(([key]) => {
          const [year, month] = key.split('-').map(Number);
          const daysInMonth = new Date(year, month, 0).getDate();
          const vorlauf = wochentag(`${key}-01`);

          return (
            <div key={key}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
                {MONATE[month - 1]} {year}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                {WT.map(w => (
                  <div key={w} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)' }}>{w}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {Array.from({ length: vorlauf }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dateStr = `${key}-${String(i + 1).padStart(2, '0')}`;
                  const inRange = tagSet.has(dateStr);
                  const count = heatData[dateStr] ?? 0;
                  const isH = hovered === dateStr;
                  const wer = Object.entries(antworten).filter(([, s]) => s.includes(dateStr)).map(([n]) => n);

                  return (
                    <div key={dateStr}
                      onMouseEnter={() => inRange && setHovered(dateStr)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        aspectRatio: '1 / 1', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: inRange ? 700 : 400,
                        background: inRange ? getColor(count) : 'transparent',
                        color: inRange ? (count > 0 ? '#065f46' : 'var(--muted)') : '#d1d5db',
                        outline: isH ? '2px solid var(--primary)' : 'none',
                        outlineOffset: 2,
                        cursor: inRange && count > 0 ? 'pointer' : 'default',
                        transition: 'outline 0.1s',
                      }}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover-Tooltip */}
      {hovered && heatData[hovered] > 0 && (() => {
        const wer = Object.entries(antworten).filter(([, s]) => s.includes(hovered)).map(([n]) => n);
        return (
          <div style={{ marginTop: '1rem', background: 'var(--primary-light)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--primary-dark)', fontWeight: 500 }}>
            <strong>{formatDatumLang(hovered)}:</strong> {wer.join(', ')} ({heatData[hovered]}/{totalPersons})
          </div>
        );
      })()}

      {/* Legende */}
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.78rem', color: 'var(--muted)', alignItems: 'center' }}>
        {[['#f1f5f9', 'Niemand'], ['#fef3c7', 'Wenige'], ['#86efac', 'Einige'], ['#10b981', 'Alle']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 14, background: c, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-block' }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Top-Termine ───────────────────────────────────────────
function TopTermine({ meeting }) {
  const { antworten } = meeting;
  const totalPersons = Object.keys(antworten).length;
  const [alle, setAlle] = useState(false);

  if (totalPersons === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        Noch keine Antworten. Teile den Link mit deinen Eingeladenen!
      </div>
    );
  }

  const ranking = besteZeiten(meeting);
  if (ranking.length === 0) {
    return <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>Keine gemeinsamen Tage gefunden.</p>;
  }

  const anzeigen = alle ? ranking : ranking.slice(0, 5);
  const best = ranking[0].count;

  return (
    <div>
      {anzeigen.map(({ slot, persons, count }, i) => {
        const cantCome = Object.keys(antworten).filter(n => !persons.includes(n));
        const ratio = count / totalPersons;
        const isBest = i === 0 && count === best;
        return (
          <div key={slot} style={{ padding: '1rem', borderRadius: 14, marginBottom: 10, border: `2px solid ${isBest ? 'var(--primary)' : 'var(--border)'}`, background: isBest ? 'var(--primary-light)' : 'var(--white)' }}>
            {isBest && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--primary)', color: '#fff', borderRadius: 50, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 800, marginBottom: 8 }}>
                🏆 Bester Tag
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>
                  {formatDatumLang(slot)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600, marginBottom: 2 }}>
                  ✓ {persons.join(', ')}
                </div>
                {cantCome.length > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>✗ {cantCome.join(', ')}</div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)', lineHeight: 1 }}>{count}/{totalPersons}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>können</div>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: 'var(--primary-grad)', width: `${ratio * 100}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        );
      })}
      {ranking.length > 5 && (
        <button onClick={() => setAlle(a => !a)} style={{ width: '100%', padding: '0.75rem', borderRadius: 12, border: '2px solid var(--border)', background: '#fff', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          {alle ? '▲ Weniger anzeigen' : `▼ Alle ${ranking.length} Tage anzeigen`}
        </button>
      )}
    </div>
  );
}

// ── Haupt-Seite ───────────────────────────────────────────
export default function ErgebnisseSeite() {
  const router = useRouter();
  const { id } = router.query;
  const [meeting, setMeeting] = useState(null);
  const [fehler, setFehler] = useState('');
  const [ansicht, setAnsicht] = useState('top');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/meetings/${id}`)
      .then(r => r.json())
      .then(d => { if (d.fehler) setFehler(d.fehler); else setMeeting(d); })
      .catch(() => setFehler('Nicht gefunden.'));
  }, [id]);

  if (fehler || !meeting) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>{fehler || 'Lade...'}</p>
    </div>
  );

  const antwortCount = Object.keys(meeting.antworten || {}).length;
  const top = antwortCount > 0 ? besteZeiten(meeting)[0] : null;

  return (
    <>
      <Head><title>Ergebnisse: {meeting.titel} – Wann können wir?</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.25rem 1rem' }}>

          <Link href={`/treffen/${id}`}>
            <a style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
              ← Zurück
            </a>
          </Link>

          {/* ── Hero: Bester Tag ── */}
          {top && top.count > 0 && (() => {
            const cantCome = Object.keys(meeting.antworten).filter(n => !top.persons.includes(n));
            return (
              <div style={{ background: 'var(--primary-grad)', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem', color: '#fff' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.8, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>🏆 Bester Tag</div>
                <div style={{ fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  {formatDatumLang(top.slot)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.875rem' }}>
                  {top.persons.map(n => (
                    <span key={n} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: '4px 12px', fontSize: '0.85rem', fontWeight: 600 }}>✓ {n}</span>
                  ))}
                  {cantCome.map(n => (
                    <span key={n} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 50, padding: '4px 12px', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>✗ {n}</span>
                  ))}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.5rem 0.875rem', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block' }}>
                  {top.count} von {meeting.teilnehmer.length} können
                </div>
              </div>
            );
          })()}

          {/* ── Toggle ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
            {[['top', '🏆 Ranking'], ['heatmap', '🗓️ Kalender']].map(([key, label]) => (
              <button key={key} onClick={() => setAnsicht(key)} style={{
                padding: '0.6rem 1.1rem', borderRadius: 10, border: '2px solid', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.15s',
                borderColor: ansicht === key ? 'var(--primary)' : 'var(--border)',
                background: ansicht === key ? 'var(--primary)' : '#fff',
                color: ansicht === key ? '#fff' : 'var(--muted)',
              }}>
                {label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500 }}>
              {antwortCount}/{meeting.teilnehmer.length} geantwortet
            </div>
          </div>

          {/* ── Inhalt ── */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: '1.25rem', boxShadow: 'var(--shadow-card)', marginBottom: '1rem' }}>
            {ansicht === 'top' ? <TopTermine meeting={meeting} /> : <KalenderHeatmap meeting={meeting} />}
          </div>

          {/* ── Wer hat geantwortet ── */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: '1.25rem', boxShadow: 'var(--shadow-card)', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Antworten</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {meeting.teilnehmer.map(n => {
                const hat = meeting.antworten?.[n] !== undefined;
                const count = meeting.antworten?.[n]?.length ?? 0;
                return (
                  <div key={n} style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.875rem', fontWeight: 600, background: hat ? 'var(--success-light)' : '#f1f5f9', color: hat ? '#065f46' : 'var(--muted)' }}>
                    {hat ? '✓' : '○'} {n} {hat && <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({count} Tage)</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <Link href={`/treffen/${id}`}>
            <a style={{ display: 'block', textAlign: 'center', padding: '0.875rem', borderRadius: 14, background: 'var(--white)', boxShadow: 'var(--shadow-card)', color: 'var(--primary)', fontWeight: 700, border: '2px solid var(--primary-light)' }}>
              ← Zurück zur Verabredung
            </a>
          </Link>

        </div>
      </div>
    </>
  );
}
