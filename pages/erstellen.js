import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

// ── Schritt-Anzeige ──────────────────────────────────────
function Fortschritt({ schritt }) {
  const steps = ['Über dich', 'Zeitraum', 'Einladen'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const aktiv = schritt === n;
        const done = schritt > n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.2s',
                background: done || aktiv ? 'var(--primary)' : 'var(--border)',
                color: done || aktiv ? '#fff' : 'var(--muted)',
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: '0.7rem', marginTop: 4, color: aktiv ? 'var(--primary)' : 'var(--muted)', fontWeight: aktiv ? 700 : 400, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 20, background: done ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Input-Komponenten ──────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontSize: '0.9rem' }}>{label}</label>
      {children}
      {hint && <p style={{ margin: '5px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-input)',
  border: '2px solid var(--border)', fontSize: '1rem', outline: 'none',
  transition: 'border-color 0.15s', background: '#fff', color: 'var(--text)',
};

const focusHandlers = {
  onFocus: e => e.target.style.borderColor = 'var(--primary)',
  onBlur: e => e.target.style.borderColor = 'var(--border)',
};

// ── Haupt-Komponente ──────────────────────────────────────
export default function Erstellen() {
  const router = useRouter();
  const [schritt, setSchritt] = useState(1);
  const [form, setForm] = useState({ titel: '', beschreibung: '', ersteller: '', datumVon: '', datumBis: '' });
  const [teilnehmer, setTeilnehmer] = useState([]);
  const [neuerName, setNeuerName] = useState('');
  const [fehler, setFehler] = useState('');
  const [laden, setLaden] = useState(false);

  const heute = new Date().toISOString().split('T')[0];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const namHinzu = () => {
    const name = neuerName.trim();
    if (!name) return;
    if (name === form.ersteller.trim()) { setFehler('Du bist bereits automatisch dabei.'); return; }
    if (teilnehmer.includes(name)) { setFehler(`„${name}" ist bereits in der Liste.`); return; }
    setTeilnehmer(t => [...t, name]);
    setNeuerName('');
    setFehler('');
  };

  const weiter = () => {
    setFehler('');
    if (schritt === 1) {
      if (!form.ersteller.trim()) return setFehler('Bitte gib deinen Namen ein.');
      if (!form.titel.trim()) return setFehler('Bitte gib einen Titel an.');
    }
    if (schritt === 2) {
      if (!form.datumVon || !form.datumBis) return setFehler('Bitte wähle einen Zeitraum aus.');
      if (form.datumBis < form.datumVon) return setFehler('Das Enddatum muss nach dem Startdatum liegen.');
    }
    setSchritt(s => s + 1);
  };

  const submit = async () => {
    setFehler('');
    setLaden(true);
    try {
      const alleTeilnehmer = [...new Set([form.ersteller.trim(), ...teilnehmer])];
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titel: form.titel.trim(),
          beschreibung: form.beschreibung.trim(),
          ersteller: form.ersteller.trim(),
          teilnehmer: alleTeilnehmer,
          datumVon: form.datumVon,
          datumBis: form.datumBis,
          zeitVon: '00:00',
          zeitBis: '24:00',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler);
      localStorage.setItem(`ersteller_${data.id}`, '1');
      router.push(`/treffen/${data.id}?neu=1`);
    } catch (e) {
      setFehler(e.message || 'Ein Fehler ist aufgetreten.');
      setLaden(false);
    }
  };

  return (
    <>
      <Head><title>Verabredung erstellen – Wann können wir?</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.5rem 1rem 6rem' }}>
        {/* Header */}
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            ← Zurück
          </a>

          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
              Neue Verabredung
            </h1>

            <Fortschritt schritt={schritt} />

            {/* Fehler */}
            {fehler && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>
                {fehler}
              </div>
            )}

            {/* ── Schritt 1: Über dich ── */}
            {schritt === 1 && (
              <>
                <Field label="Dein Name *">
                  <input style={inputStyle} {...focusHandlers} placeholder="z.B. Max"
                    value={form.ersteller} onChange={e => set('ersteller', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && weiter()} autoFocus />
                </Field>
                <Field label="Titel der Verabredung *">
                  <input style={inputStyle} {...focusHandlers} placeholder="z.B. Spieleabend, Grillparty, Kino..."
                    value={form.titel} onChange={e => set('titel', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && weiter()} />
                </Field>
                <Field label="Beschreibung" hint="Optional – mehr Infos zur Verabredung">
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} {...focusHandlers}
                    placeholder="Details, Treffpunkt, ..."
                    value={form.beschreibung} onChange={e => set('beschreibung', e.target.value)} />
                </Field>
              </>
            )}

            {/* ── Schritt 2: Zeitraum ── */}
            {schritt === 2 && (
              <>
                <Field label="Frühestens ab *">
                  <input type="date" style={inputStyle} {...focusHandlers}
                    min={heute} value={form.datumVon}
                    onChange={e => {
                      set('datumVon', e.target.value);
                      if (!form.datumBis || form.datumBis < e.target.value) set('datumBis', e.target.value);
                    }} />
                </Field>
                <Field label="Deadline (spätestens bis) *" hint="Bis zu diesem Datum können alle ihre Verfügbarkeit eintragen">
                  <input type="date" style={inputStyle} {...focusHandlers}
                    min={form.datumVon || heute} value={form.datumBis}
                    onChange={e => set('datumBis', e.target.value)} />
                </Field>

                {form.datumVon && form.datumBis && (
                  <div style={{ background: 'var(--primary-light)', borderRadius: 12, padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                    📅 {Math.round((new Date(form.datumBis) - new Date(form.datumVon)) / 86400000) + 1} Tage im Auswahlbereich
                  </div>
                )}
              </>
            )}

            {/* ── Schritt 3: Einladen ── */}
            {schritt === 3 && (
              <>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>
                  Trage alle ein, die eingeladen werden sollen. Du wirst automatisch hinzugefügt.
                </p>

                {/* Vorhandene Namen */}
                {(teilnehmer.length > 0 || form.ersteller) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
                    <Chip label={`${form.ersteller} (du)`} color="var(--primary)" />
                    {teilnehmer.map(n => (
                      <Chip key={n} label={n} onRemove={() => setTeilnehmer(t => t.filter(x => x !== n))} />
                    ))}
                  </div>
                )}

                {/* Hinzufügen */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} {...focusHandlers}
                    placeholder="Name eingeben..."
                    value={neuerName} onChange={e => setNeuerName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), namHinzu())} />
                  <button type="button" onClick={namHinzu}
                    style={{ padding: '0 1.25rem', borderRadius: 'var(--radius-input)', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.25rem', flexShrink: 0 }}>
                    +
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6 }}>
                  Auch ohne Namen hier geht der Link – jeder kann sich dann beim Öffnen selbst eintragen.
                </p>
              </>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
            {schritt > 1 && (
              <button onClick={() => { setFehler(''); setSchritt(s => s - 1); }}
                style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-input)', border: '2px solid var(--border)', background: '#fff', color: 'var(--text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                ← Zurück
              </button>
            )}
            {schritt < 3 ? (
              <button onClick={weiter}
                style={{ flex: 2, padding: '1rem', borderRadius: 'var(--radius-input)', background: 'var(--primary-grad)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                Weiter →
              </button>
            ) : (
              <button onClick={submit} disabled={laden}
                style={{ flex: 2, padding: '1rem', borderRadius: 'var(--radius-input)', background: 'var(--primary-grad)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', opacity: laden ? 0.7 : 1 }}>
                {laden ? 'Erstelle...' : '🎉 Link erstellen'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Chip({ label, onRemove, color = 'var(--muted)' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: color + '18', color, border: `1.5px solid ${color}33`, borderRadius: 50, padding: '5px 12px', fontSize: '0.875rem', fontWeight: 600 }}>
      {label}
      {onRemove && <span onClick={onRemove} style={{ cursor: 'pointer', opacity: 0.6, fontWeight: 700, lineHeight: 1 }}>×</span>}
    </span>
  );
}
