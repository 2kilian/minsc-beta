import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { generateDays, formatDatumLang, besteZeiten } from '../../../lib/slots';

function icsExport(dateStr, titel, beschreibung) {
  const d = new Date(dateStr + 'T12:00:00');
  const pad = n => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//WannKoennenWir//DE',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${ymd}`,
    `DTEND;VALUE=DATE:${ymd}`,
    `SUMMARY:${titel}`,
    beschreibung ? `DESCRIPTION:${beschreibung}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${titel.replace(/\s+/g, '_')}.ics`;
  a.click();
}

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
    if (count === 0) return 'var(--bg)';
    const r = count / maxCount;
    if (r <= 0.33) return '#fef3c7';
    if (r <= 0.66) return '#bbf7d0';
    if (r < 1) return '#4ade80';
    return 'var(--success)';
  }

  function getTextColor(count) {
    if (count === 0) return '#c7c7cc';
    const r = count / maxCount;
    return r >= 0.66 ? '#166534' : '#1d1d1f';
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {Object.entries(monate).map(([key]) => {
          const [year, month] = key.split('-').map(Number);
          const daysInMonth = new Date(year, month, 0).getDate();
          const vorlauf = wochentag(`${key}-01`);

          return (
            <div key={key}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.875rem', letterSpacing: '-0.015em' }}>
                {MONATE[month - 1]} {year}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 5 }}>
                {WT.map(w => (
                  <div key={w} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.02em' }}>{w}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {Array.from({ length: vorlauf }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dateStr = `${key}-${String(i + 1).padStart(2, '0')}`;
                  const inRange = tagSet.has(dateStr);
                  const count = heatData[dateStr] ?? 0;
                  const isH = hovered === dateStr;

                  return (
                    <div key={dateStr}
                      onMouseEnter={() => inRange && setHovered(dateStr)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        aspectRatio: '1 / 1', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.875rem', fontWeight: inRange && count > 0 ? 600 : 400,
                        background: inRange ? getColor(count) : 'transparent',
                        color: inRange ? getTextColor(count) : '#c7c7cc',
                        outline: isH ? '2px solid var(--text)' : 'none',
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

      {hovered && heatData[hovered] > 0 && (() => {
        const wer = Object.entries(antworten).filter(([, s]) => s.includes(hovered)).map(([n]) => n);
        return (
          <div style={{
            marginTop: '1rem', background: 'var(--bg)', borderRadius: 10,
            padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--secondary)',
            border: '1px solid var(--border)', letterSpacing: '-0.01em',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{formatDatumLang(hovered)}</span>
            {' – '}{wer.join(', ')}
            <span style={{ color: 'var(--muted)' }}> ({heatData[hovered]}/{totalPersons})</span>
          </div>
        );
      })()}

      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.75rem', color: 'var(--muted)', alignItems: 'center' }}>
        {[['var(--bg)', 'Niemand'], ['#fef3c7', 'Wenige'], ['#bbf7d0', 'Einige'], ['var(--success)', 'Alle']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, background: c, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-block' }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Top-Termine ───────────────────────────────────────────
function TopTermine({ meeting }) {
  const { antworten, notizen } = meeting;
  const totalPersons = Object.keys(antworten).length;
  const [alle, setAlle] = useState(false);

  if (totalPersons === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>○</div>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
          Noch keine Antworten.<br />Teile den Link mit deinen Eingeladenen.
        </div>
      </div>
    );
  }

  const ranking = besteZeiten(meeting);
  if (ranking.length === 0) {
    return (
      <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
        Keine gemeinsamen Tage gefunden.
      </p>
    );
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
          <div key={slot} style={{
            padding: '1rem',
            borderRadius: 12,
            marginBottom: 8,
            border: `1.5px solid ${isBest ? 'var(--text)' : 'var(--border)'}`,
            background: isBest ? 'var(--bg)' : 'var(--white)',
          }}>
            {isBest && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--text)', color: '#fff', borderRadius: 50,
                padding: '2px 9px', fontSize: '0.7rem', fontWeight: 600,
                marginBottom: 8, letterSpacing: '0.02em',
              }}>
                Bester Tag
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                  {formatDatumLang(slot)}
                </div>
                <div style={{ marginBottom: cantCome.length > 0 ? 4 : 0 }}>
                  {persons.map(n => {
                    const note = notizen?.[n];
                    return (
                      <div key={n} style={{ fontSize: '0.82rem', color: '#1a7a40', fontWeight: 500, lineHeight: 1.5, letterSpacing: '-0.01em' }}>
                        ✓ {n}
                        {note && (
                          <span style={{
                            display: 'block', paddingLeft: '1rem',
                            fontSize: '0.76rem', color: 'var(--muted)',
                            fontWeight: 400, fontStyle: 'italic', lineHeight: 1.4,
                          }}>
                            „{note}"
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {cantCome.length > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '-0.01em' }}>
                    ✗ {cantCome.join(', ')}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1.375rem', color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {count}<span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 400 }}>/{totalPersons}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 3, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: 'var(--text)', width: `${ratio * 100}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        );
      })}
      {ranking.length > 5 && (
        <button onClick={() => setAlle(a => !a)} style={{
          width: '100%', padding: '0.75rem', borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--bg)',
          color: 'var(--muted)', fontWeight: 500, cursor: 'pointer',
          fontSize: '0.85rem', letterSpacing: '-0.01em',
        }}>
          {alle ? 'Weniger anzeigen' : `Alle ${ranking.length} Tage anzeigen`}
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
  const [istErsteller, setIstErsteller] = useState(false);
  const [bestaetigen, setBestaetigen] = useState('idle');

  useEffect(() => {
    if (!id) return;
    setIstErsteller(localStorage.getItem(`ersteller_${id}`) === '1');
    fetch(`/api/meetings/${id}`)
      .then(r => r.json())
      .then(d => { if (d.fehler) setFehler(d.fehler); else setMeeting(d); })
      .catch(() => setFehler('Nicht gefunden.'));
  }, [id]);

  const tagBestaetigen = async (tag) => {
    setBestaetigen('saving');
    try {
      const res = await fetch(`/api/meetings/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler);
      setMeeting(data);
      setBestaetigen('done');
    } catch { setBestaetigen('idle'); }
  };

  if (fehler || !meeting) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const antwortCount = Object.keys(meeting.antworten || {}).length;
  const top = antwortCount > 0 ? besteZeiten(meeting)[0] : null;

  return (
    <>
      <Head><title>Ergebnisse: {meeting.titel} – Wann können wir?</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', padding: '1.25rem 1rem' }}>

          <Link href={`/treffen/${id}`}>
            <a style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--muted)', fontWeight: 500, fontSize: '0.875rem',
              marginBottom: '1rem', letterSpacing: '-0.01em',
            }}>
              ← Zurück
            </a>
          </Link>

          {/* ── Bestätigter Termin ── */}
          {meeting.bestaetigterTag && (
            <div style={{
              background: 'var(--text)',
              borderRadius: 'var(--radius-card)',
              padding: '1.5rem',
              marginBottom: '1rem',
              color: '#fff',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--success)', color: '#fff',
                borderRadius: 50, padding: '3px 10px',
                fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Termin steht fest
              </div>
              <div style={{
                fontSize: 'clamp(1.375rem,5vw,1.875rem)', fontWeight: 700,
                marginBottom: '1.25rem', letterSpacing: '-0.025em', lineHeight: 1.15,
              }}>
                {formatDatumLang(meeting.bestaetigterTag)}
              </div>
              <button
                onClick={() => icsExport(meeting.bestaetigterTag, meeting.titel, meeting.beschreibung)}
                style={{
                  padding: '0.65rem 1.1rem', borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                  letterSpacing: '-0.01em',
                }}>
                Zum Kalender hinzufügen
              </button>
            </div>
          )}

          {/* ── Hero: Bester Tag ── */}
          {!meeting.bestaetigterTag && top && top.count > 0 && (() => {
            const cantCome = Object.keys(meeting.antworten).filter(n => !top.persons.includes(n));
            return (
              <div style={{
                background: 'var(--primary)',
                borderRadius: 'var(--radius-card)',
                padding: '1.5rem',
                marginBottom: '1rem',
                color: '#fff',
              }}>
                <div style={{
                  fontSize: '0.7rem', fontWeight: 600, opacity: 0.65,
                  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Bester Tag
                </div>
                <div style={{
                  fontSize: 'clamp(1.375rem,5vw,1.875rem)', fontWeight: 700,
                  marginBottom: '1rem', letterSpacing: '-0.025em', lineHeight: 1.15,
                }}>
                  {formatDatumLang(top.slot)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.875rem' }}>
                  {top.persons.map(n => (
                    <span key={n} style={{
                      background: 'rgba(255,255,255,0.18)', borderRadius: 50,
                      padding: '3px 11px', fontSize: '0.82rem', fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}>
                      ✓ {n}
                    </span>
                  ))}
                  {cantCome.map(n => (
                    <span key={n} style={{
                      background: 'rgba(0,0,0,0.12)', borderRadius: 50,
                      padding: '3px 11px', fontSize: '0.82rem', fontWeight: 500,
                      opacity: 0.65, letterSpacing: '-0.01em',
                    }}>
                      ✗ {n}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', opacity: 0.75, letterSpacing: '-0.01em' }}>
                    {top.count} von {meeting.teilnehmer.length} können
                  </span>
                  {istErsteller && (
                    <button
                      onClick={() => tagBestaetigen(top.slot)}
                      disabled={bestaetigen === 'saving'}
                      style={{
                        padding: '0.6rem 1.1rem', borderRadius: 10,
                        background: '#fff', color: 'var(--primary)',
                        border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.875rem',
                        opacity: bestaetigen === 'saving' ? 0.6 : 1,
                        letterSpacing: '-0.01em',
                      }}>
                      {bestaetigen === 'saving' ? '…' : 'Termin bestätigen'}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Toggle ── */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: '1rem',
            background: 'var(--border)', borderRadius: 10, padding: 3,
          }}>
            {[['top', 'Ranking'], ['heatmap', 'Kalender']].map(([key, label]) => (
              <button key={key} onClick={() => setAnsicht(key)} style={{
                flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontWeight: ansicht === key ? 600 : 400,
                fontSize: '0.875rem', letterSpacing: '-0.01em',
                transition: 'all 0.15s',
                background: ansicht === key ? 'var(--white)' : 'transparent',
                color: ansicht === key ? 'var(--text)' : 'var(--muted)',
                boxShadow: ansicht === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
                {label}
              </button>
            ))}
            <div style={{
              display: 'flex', alignItems: 'center', paddingRight: 6,
              fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500,
              flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              {antwortCount}/{meeting.teilnehmer.length}
            </div>
          </div>

          {/* ── Inhalt ── */}
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-card)',
            padding: '1.25rem', border: '1px solid var(--border)',
            marginBottom: '1rem',
          }}>
            {ansicht === 'top' ? <TopTermine meeting={meeting} /> : <KalenderHeatmap meeting={meeting} />}
          </div>

          {/* ── Antworten ── */}
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-card)',
            padding: '1.25rem', border: '1px solid var(--border)',
            marginBottom: '1rem',
          }}>
            <div style={{
              fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem',
              letterSpacing: '-0.015em', color: 'var(--text)',
            }}>
              Antworten
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {meeting.teilnehmer.map(n => {
                const hat = meeting.antworten?.[n] !== undefined;
                const count = meeting.antworten?.[n]?.length ?? 0;
                return (
                  <div key={n} style={{
                    padding: '5px 13px', borderRadius: 50,
                    fontSize: '0.85rem', fontWeight: hat ? 500 : 400,
                    background: hat ? 'var(--success-light)' : 'var(--bg)',
                    color: hat ? '#1a7a40' : 'var(--muted)',
                    border: hat ? '1px solid #b8f0c8' : '1px solid var(--border)',
                    letterSpacing: '-0.01em',
                  }}>
                    {hat ? '✓ ' : ''}{n}
                    {hat && <span style={{ opacity: 0.5, fontSize: '0.78rem', marginLeft: 4 }}>({count})</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <Link href={`/treffen/${id}`}>
            <a style={{
              display: 'block', textAlign: 'center',
              padding: '0.875rem', borderRadius: 12,
              background: 'var(--white)', border: '1px solid var(--border)',
              color: 'var(--muted)', fontWeight: 500,
              fontSize: '0.9rem', letterSpacing: '-0.01em',
            }}>
              ← Zurück zur Verabredung
            </a>
          </Link>

        </div>
      </div>
    </>
  );
}
