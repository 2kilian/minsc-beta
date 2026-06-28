import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { generateSlots, getDays, getTimes, formatDatum, formatDatumLang, besteZeiten } from '../../../lib/slots';

const s = {
  page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '1.5rem 1rem', paddingBottom: '4rem' },
  card: { background: 'white', borderRadius: 20, padding: '1.75rem', maxWidth: 900, margin: '0 auto 1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  back: { color: '#7c3aed', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1rem' },
};

function getHeatColor(count, max) {
  if (max === 0) return '#f3f4f6';
  const ratio = count / max;
  if (ratio === 0) return '#f3f4f6';
  if (ratio <= 0.33) return '#fef3c7';
  if (ratio <= 0.66) return '#fed7aa';
  if (ratio < 1) return '#86efac';
  return '#10b981';
}

function HeatMap({ meeting }) {
  const slots = generateSlots(meeting.datumVon, meeting.datumBis, meeting.zeitVon, meeting.zeitBis);
  const days = getDays(slots);
  const times = getTimes(slots);
  const { antworten, teilnehmer } = meeting;

  // Build heatmap data
  const heatData = {};
  for (const slot of slots) {
    heatData[slot] = 0;
  }
  for (const [, personSlots] of Object.entries(antworten)) {
    for (const slot of personSlots) {
      if (heatData[slot] !== undefined) heatData[slot]++;
    }
  }
  const maxCount = Math.max(...Object.values(heatData), 1);
  const totalPersons = Object.keys(antworten).length;

  const cellW = Math.max(72, Math.floor((Math.min((typeof window !== 'undefined' ? window.innerWidth : 900), 860) - 56) / days.length));

  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div style={{ overflowX: 'auto', userSelect: 'none' }}>
        <div style={{ display: 'inline-block', minWidth: '100%' }}>
          <div style={{ display: 'flex', marginLeft: 52 }}>
            {days.map(d => (
              <div key={d} style={{ width: cellW, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', padding: '4px 2px', borderLeft: '1px solid #e5e7eb' }}>
                {formatDatum(d).split(',').map((t, i) => <div key={i}>{t.trim()}</div>)}
              </div>
            ))}
          </div>
          {times.map(time => (
            <div key={time} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 52, fontSize: '0.75rem', color: '#6b7280', textAlign: 'right', paddingRight: 8, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {time.endsWith(':00') ? time : ''}
              </div>
              {days.map(d => {
                const slot = `${d}T${time}`;
                const count = heatData[slot] || 0;
                const isHovered = hovered === slot;
                const whoCanCome = Object.entries(antworten).filter(([, s]) => s.includes(slot)).map(([n]) => n);
                return (
                  <div
                    key={slot}
                    onMouseEnter={() => setHovered(slot)}
                    onMouseLeave={() => setHovered(null)}
                    title={count > 0 ? `${count}/${totalPersons}: ${whoCanCome.join(', ')}` : 'Niemand verfügbar'}
                    style={{
                      width: cellW,
                      height: 22,
                      background: getHeatColor(count, maxCount),
                      borderLeft: '1px solid #e5e7eb',
                      borderTop: time.endsWith(':00') ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                      cursor: 'default',
                      flexShrink: 0,
                      outline: isHovered ? '2px solid #7c3aed' : 'none',
                      outlineOffset: -2,
                      position: 'relative',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {hovered && heatData[hovered] > 0 && (
        <div style={{ marginTop: 12, padding: '0.75rem 1rem', background: '#ede9fe', borderRadius: 10, fontSize: '0.875rem', color: '#4c1d95' }}>
          <strong>{formatDatum(hovered.split('T')[0])}, {hovered.split('T')[1]} Uhr:</strong>{' '}
          {Object.entries(antworten).filter(([, s]) => s.includes(hovered)).map(([n]) => n).join(', ')}
          {' '}({heatData[hovered]}/{totalPersons})
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: '#6b7280', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>Legende:</span>
        {[
          { color: '#f3f4f6', label: 'Niemand' },
          { color: '#fef3c7', label: 'Wenige' },
          { color: '#fed7aa', label: 'Einige' },
          { color: '#86efac', label: 'Fast alle' },
          { color: '#10b981', label: 'Alle' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 16, height: 16, background: color, borderRadius: 3, border: '1px solid #d1d5db', display: 'inline-block' }} />
            {label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>Über Zellen hovern für Details</span>
      </div>
    </div>
  );
}

function TopSlots({ meeting }) {
  const { antworten, teilnehmer } = meeting;
  const totalPersons = Object.keys(antworten).length;

  if (totalPersons === 0) {
    return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>Noch keine Antworten vorhanden.</p>;
  }

  const ranking = besteZeiten(meeting).slice(0, 10);

  if (ranking.length === 0) {
    return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>Keine gemeinsamen Zeiten gefunden.</p>;
  }

  const best = ranking[0].count;

  // Group consecutive slots into blocks
  const grouped = [];
  let current = null;
  for (const entry of ranking) {
    if (!current || current.count !== entry.count) {
      if (current) grouped.push(current);
      current = { count: entry.count, slots: [entry] };
    } else {
      current.slots.push(entry);
    }
  }
  if (current) grouped.push(current);

  return (
    <div>
      {ranking.map(({ slot, persons, count }, i) => {
        const [date, time] = slot.split('T');
        const ratio = count / totalPersons;
        const cantCome = Object.keys(antworten).filter(n => !persons.includes(n));
        return (
          <div key={slot} style={{ padding: '1rem', borderRadius: 12, border: `2px solid ${count === best && i === 0 ? '#7c3aed' : '#e5e7eb'}`, marginBottom: 10, background: count === best && i === 0 ? '#faf5ff' : 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                {count === best && i === 0 && <span style={{ background: '#7c3aed', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, display: 'inline-block' }}>🏆 Bester Termin</span>}
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                  {formatDatumLang(date)}, {time} Uhr
                </div>
                <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600, marginTop: 2 }}>
                  ✓ {persons.join(', ')}
                </div>
                {cantCome.length > 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>
                    ✗ {cantCome.join(', ')} können nicht
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#7c3aed' }}>{count}/{totalPersons}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>können</div>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#667eea,#764ba2)', width: `${ratio * 100}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ErgebnisseSeite() {
  const router = useRouter();
  const { id } = router.query;
  const [meeting, setMeeting] = useState(null);
  const [fehler, setFehler] = useState('');
  const [ansicht, setAnsicht] = useState('top'); // 'top' | 'heatmap'

  useEffect(() => {
    if (!id) return;
    fetch(`/api/meetings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.fehler) setFehler(data.fehler);
        else setMeeting(data);
      })
      .catch(() => setFehler('Meeting nicht gefunden.'));
  }, [id]);

  if (fehler || !meeting) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ color: '#64748b' }}>{fehler || 'Lade...'}</p>
        </div>
      </div>
    );
  }

  const antwortCount = Object.keys(meeting.antworten || {}).length;

  return (
    <div style={s.page}>
      <Head><title>Ergebnisse: {meeting.titel} – Wann können wir?</title></Head>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={s.card}>
          <Link href={`/treffen/${id}`}><a style={s.back}>← Zurück zur Verabredung</a></Link>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
            🎯 Beste Termine für „{meeting.titel}"
          </h1>
          <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>
            {antwortCount === 0
              ? 'Noch keine Antworten eingegangen.'
              : `${antwortCount} von ${meeting.teilnehmer.length} Person${meeting.teilnehmer.length !== 1 ? 'en haben' : ' hat'} geantwortet.`}
          </p>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
            {[
              { key: 'top', label: '🏆 Top-Termine' },
              { key: 'heatmap', label: '🗓️ Heatmap' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setAnsicht(key)}
                style={{ padding: '0.5rem 1.2rem', borderRadius: 8, border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.15s',
                  borderColor: ansicht === key ? '#7c3aed' : '#e2e8f0',
                  background: ansicht === key ? '#7c3aed' : 'white',
                  color: ansicht === key ? 'white' : '#374151' }}>
                {label}
              </button>
            ))}
          </div>

          {ansicht === 'top' ? <TopSlots meeting={meeting} /> : <HeatMap meeting={meeting} />}
        </div>

        {/* Who answered summary */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 1rem' }}>Wer hat geantwortet?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {meeting.teilnehmer.map(n => {
              const hat = meeting.antworten?.[n] !== undefined;
              const slotCount = meeting.antworten?.[n]?.length || 0;
              return (
                <div key={n} style={{ padding: '6px 14px', borderRadius: 20, background: hat ? '#d1fae5' : '#f3f4f6', color: hat ? '#065f46' : '#9ca3af', fontSize: '0.875rem', fontWeight: 500 }}>
                  {hat ? '✓' : '○'} {n} {hat && slotCount > 0 ? `(${slotCount} Slots)` : ''}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href={`/treffen/${id}`}><a style={{ display: 'inline-block', padding: '0.75rem 2rem', borderRadius: 12, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', textDecoration: 'none', fontWeight: 700 }}>← Zurück zur Verabredung</a></Link>
        </div>
      </div>
    </div>
  );
}
