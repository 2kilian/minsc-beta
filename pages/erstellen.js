import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

const s = {
  page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '2rem 1rem' },
  card: { background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 640, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  h1: { fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' },
  sub: { color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' },
  label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  section: { marginBottom: '1.5rem' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#7c3aed', borderRadius: 20, padding: '4px 12px', fontSize: '0.875rem', fontWeight: 500, margin: '4px' },
  tagX: { cursor: 'pointer', fontWeight: 700, opacity: 0.7, marginLeft: 2 },
  addRow: { display: 'flex', gap: 8, marginTop: 8 },
  addInput: { flex: 1, padding: '0.6rem 1rem', borderRadius: 10, border: '2px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' },
  addBtn: { padding: '0.6rem 1.2rem', borderRadius: 10, background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' },
  submit: { width: '100%', padding: '1rem', borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 700, marginTop: '0.5rem' },
  back: { color: '#7c3aed', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem' },
};

export default function Erstellen() {
  const router = useRouter();
  const [form, setForm] = useState({
    titel: '',
    beschreibung: '',
    ersteller: '',
    datumVon: '',
    datumBis: '',
    zeitVon: '09:00',
    zeitBis: '18:00',
  });
  const [teilnehmer, setTeilnehmer] = useState([]);
  const [neuerName, setNeuerName] = useState('');
  const [fehler, setFehler] = useState('');
  const [laden, setLaden] = useState(false);

  const heute = new Date().toISOString().split('T')[0];

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const namHinzu = () => {
    const name = neuerName.trim();
    if (!name) return;
    if (teilnehmer.includes(name)) { setFehler(`"${name}" ist bereits in der Liste.`); return; }
    setTeilnehmer(t => [...t, name]);
    setNeuerName('');
    setFehler('');
  };

  const namEntf = (name) => setTeilnehmer(t => t.filter(n => n !== name));

  const submit = async (e) => {
    e.preventDefault();
    setFehler('');
    if (!form.titel.trim()) return setFehler('Bitte gib einen Titel an.');
    if (!form.ersteller.trim()) return setFehler('Bitte gib deinen Namen an.');
    if (!form.datumVon || !form.datumBis) return setFehler('Bitte wähle den Zeitraum aus.');
    if (form.datumBis < form.datumVon) return setFehler('Das Enddatum muss nach dem Startdatum liegen.');
    if (form.zeitBis <= form.zeitVon) return setFehler('Die Endzeit muss nach der Startzeit liegen.');

    const alleTeilnehmer = [...new Set([form.ersteller.trim(), ...teilnehmer])];

    setLaden(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, teilnehmer: alleTeilnehmer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ersteller_${data.id}`, '1');
      }
      router.push(`/treffen/${data.id}?neu=1`);
    } catch (e) {
      setFehler(e.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setLaden(false);
    }
  };

  const focusStyle = { borderColor: '#7c3aed' };

  return (
    <div style={s.page}>
      <Head><title>Verabredung erstellen – Wann können wir?</title></Head>
      <div style={s.card}>
        <a href="/" style={s.back}>← Zurück</a>
        <h1 style={s.h1}>Neue Verabredung</h1>
        <p style={s.sub}>Füll die Details aus und teile den Link mit deinen Leuten.</p>

        {fehler && <div style={s.error}>{fehler}</div>}

        <form onSubmit={submit}>
          <div style={s.section}>
            <label style={s.label}>Dein Name *</label>
            <input style={s.input} placeholder="z.B. Max" value={form.ersteller}
              onChange={e => set('ersteller', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={s.section}>
            <label style={s.label}>Titel der Verabredung *</label>
            <input style={s.input} placeholder="z.B. Spieleabend, Grillparty, Geburtstagsfeier..." value={form.titel}
              onChange={e => set('titel', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={s.section}>
            <label style={s.label}>Beschreibung (optional)</label>
            <textarea style={{ ...s.input, resize: 'vertical', minHeight: 80 }}
              placeholder="Mehr Details zur Verabredung..." value={form.beschreibung}
              onChange={e => set('beschreibung', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={{ ...s.section, ...s.row }}>
            <div>
              <label style={s.label}>Von *</label>
              <input type="date" style={s.input} min={heute} value={form.datumVon}
                onChange={e => { set('datumVon', e.target.value); if (!form.datumBis || form.datumBis < e.target.value) set('datumBis', e.target.value); }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={s.label}>Bis (Deadline) *</label>
              <input type="date" style={s.input} min={form.datumVon || heute} value={form.datumBis}
                onChange={e => set('datumBis', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div style={{ ...s.section, ...s.row }}>
            <div>
              <label style={s.label}>Uhrzeit von</label>
              <input type="time" style={s.input} value={form.zeitVon}
                onChange={e => set('zeitVon', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={s.label}>Uhrzeit bis</label>
              <input type="time" style={s.input} value={form.zeitBis}
                onChange={e => set('zeitBis', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div style={s.section}>
            <label style={s.label}>Eingeladene Personen</label>
            <div style={{ marginBottom: 8 }}>
              {teilnehmer.map(n => (
                <span key={n} style={s.tag}>
                  {n} <span style={s.tagX} onClick={() => namEntf(n)}>×</span>
                </span>
              ))}
              {teilnehmer.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Noch niemand hinzugefügt</span>}
            </div>
            <div style={s.addRow}>
              <input style={s.addInput} placeholder="Name eingeben..." value={neuerName}
                onChange={e => setNeuerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), namHinzu())}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              <button type="button" style={s.addBtn} onClick={namHinzu}>+ Hinzufügen</button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 6 }}>
              Du wirst automatisch als Teilnehmer hinzugefügt.
            </p>
          </div>

          <button type="submit" style={{ ...s.submit, opacity: laden ? 0.7 : 1 }} disabled={laden}>
            {laden ? 'Erstelle...' : '🎉 Verabredung erstellen & Link erhalten'}
          </button>
        </form>
      </div>
    </div>
  );
}
