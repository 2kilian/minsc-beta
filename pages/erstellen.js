import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

function Fortschritt({ schritt }) {
  const labels = ['Über dich', 'Zeitraum', 'Einladen'];
  const total = labels.length;
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.015em' }}>
          {labels[schritt - 1]}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.01em' }}>
          {schritt} / {total}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {labels.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: schritt > i ? 'var(--text)' : 'var(--border)',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block', fontWeight: 500, color: 'var(--secondary)',
        marginBottom: 6, fontSize: '0.82rem', letterSpacing: '-0.01em',
      }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ margin: '5px 0 0', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.875rem 1rem', borderRadius: 'var(--radius-input)',
  border: '1.5px solid var(--border)', fontSize: '0.975rem', outline: 'none',
  transition: 'border-color 0.15s', background: 'var(--white)',
  color: 'var(--text)', letterSpacing: '-0.01em',
};

const focusHandlers = {
  onFocus: e => e.target.style.borderColor = 'var(--text)',
  onBlur:  e => e.target.style.borderColor = 'var(--border)',
};

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

      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.25rem 1rem', paddingBottom: 'calc(88px + env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>

          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--muted)', fontWeight: 500, fontSize: '0.875rem',
            marginBottom: '1.5rem', letterSpacing: '-0.01em',
          }}>
            ← Zurück
          </a>

          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-card)',
            padding: '1.75rem',
            border: '1px solid var(--border)',
          }}>
            <h1 style={{
              fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1.75rem',
              letterSpacing: '-0.025em', color: 'var(--text)',
            }}>
              Neue Verabredung
            </h1>

            <Fortschritt schritt={schritt} />

            {fehler && (
              <div style={{
                background: '#fff2f2', color: '#cc0000',
                padding: '0.75rem 1rem', borderRadius: 8,
                marginBottom: '1.25rem', fontSize: '0.85rem',
                fontWeight: 500, border: '1px solid #fcc',
              }}>
                {fehler}
              </div>
            )}

            {schritt === 1 && (
              <>
                <Field label="Dein Name">
                  <input style={inputStyle} {...focusHandlers}
                    placeholder="z.B. Max"
                    value={form.ersteller}
                    onChange={e => set('ersteller', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && weiter()}
                    autoFocus
                  />
                </Field>
                <Field label="Titel der Verabredung">
                  <input style={inputStyle} {...focusHandlers}
                    placeholder="z.B. Spieleabend, Grillparty, Kino …"
                    value={form.titel}
                    onChange={e => set('titel', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && weiter()}
                  />
                </Field>
                <Field label="Beschreibung" hint="Optional">
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }} {...focusHandlers}
                    placeholder="Details, Treffpunkt, …"
                    value={form.beschreibung}
                    onChange={e => set('beschreibung', e.target.value)}
                  />
                </Field>
              </>
            )}

            {schritt === 2 && (
              <>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                  In welchem Zeitraum soll der Termin stattfinden?
                </p>

                {/* Datum-Range-Karte */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                    borderRadius: 14, border: '1.5px solid var(--border)',
                    overflow: 'hidden', background: 'var(--white)',
                  }}>
                    {/* Ab */}
                    <label style={{ display: 'block', padding: '1rem', cursor: 'pointer', position: 'relative', minHeight: 72 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Ab
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.975rem', color: form.datumVon ? 'var(--text)' : 'var(--muted)', letterSpacing: '-0.015em' }}>
                        {form.datumVon ? fmtDateLang(form.datumVon) : 'Datum'}
                      </div>
                      <input type="date"
                        min={heute}
                        value={form.datumVon}
                        onChange={e => {
                          set('datumVon', e.target.value);
                          if (!form.datumBis || form.datumBis < e.target.value) set('datumBis', e.target.value);
                        }}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Pfeil */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
                      padding: '0 0.75rem', color: 'var(--muted)', fontSize: '1rem',
                    }}>
                      →
                    </div>

                    {/* Bis */}
                    <label style={{ display: 'block', padding: '1rem', cursor: 'pointer', position: 'relative', minHeight: 72 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Bis
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.975rem', color: form.datumBis ? 'var(--text)' : 'var(--muted)', letterSpacing: '-0.015em' }}>
                        {form.datumBis ? fmtDateLang(form.datumBis) : 'Datum'}
                      </div>
                      <input type="date"
                        min={form.datumVon || heute}
                        value={form.datumBis}
                        onChange={e => set('datumBis', e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </label>
                  </div>

                  {/* Hinweis */}
                  <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.82rem', color: 'var(--secondary)' }}>
                    {form.datumVon && form.datumBis
                      ? `${Math.round((new Date(form.datumBis) - new Date(form.datumVon)) / 86400000) + 1} Tage im Auswahlbereich`
                      : 'Tippe auf Ab oder Bis, um ein Datum zu wählen'}
                  </div>
                </div>
              </>
            )}

            {schritt === 3 && (
              <>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                  Wer soll abstimmen? Du bist automatisch dabei. Weitere können sich auch beim Öffnen des Links selbst eintragen.
                </p>

                {(teilnehmer.length > 0 || form.ersteller) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
                    <Chip label={form.ersteller} isYou />
                    {teilnehmer.map(n => (
                      <Chip key={n} label={n} onRemove={() => setTeilnehmer(t => t.filter(x => x !== n))} />
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} {...focusHandlers}
                    placeholder="Name eingeben …"
                    value={neuerName}
                    onChange={e => setNeuerName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), namHinzu())}
                  />
                  <button type="button" onClick={namHinzu}
                    style={{
                      padding: '0 1.25rem', borderRadius: 'var(--radius-input)',
                      background: 'var(--text)', color: '#fff', border: 'none',
                      cursor: 'pointer', fontWeight: 500, fontSize: '1.25rem', flexShrink: 0,
                    }}>
                    +
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Sticky Navigation ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        padding: '0.875rem 1rem',
        paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', gap: 10 }}>
          {schritt > 1 && (
            <button onClick={() => { setFehler(''); setSchritt(s => s - 1); }}
              style={{
                flex: 1, padding: '0.875rem',
                borderRadius: 12, border: '1.5px solid var(--border)',
                background: 'var(--white)', color: 'var(--text)',
                fontWeight: 600, fontSize: '0.975rem', cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}>
              Zurück
            </button>
          )}
          {schritt < 3 ? (
            <button onClick={weiter}
              style={{
                flex: 2, padding: '0.875rem', borderRadius: 12,
                background: 'var(--text)', color: '#fff', border: 'none',
                fontWeight: 600, fontSize: '0.975rem', cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}>
              Weiter
            </button>
          ) : (
            <button onClick={submit} disabled={laden}
              style={{
                flex: 2, padding: '0.875rem', borderRadius: 12,
                background: 'var(--text)', color: '#fff', border: 'none',
                fontWeight: 600, fontSize: '0.975rem', cursor: 'pointer',
                opacity: laden ? 0.6 : 1, letterSpacing: '-0.01em',
              }}>
              {laden ? 'Erstelle …' : 'Link erstellen'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function fmtDateLang(str) {
  return new Date(str + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
}

function Chip({ label, isYou, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: isYou ? 'var(--text)' : 'var(--bg)',
      color: isYou ? '#fff' : 'var(--secondary)',
      border: isYou ? 'none' : '1px solid var(--border)',
      borderRadius: 50, padding: '5px 12px',
      fontSize: '0.85rem', fontWeight: 500, letterSpacing: '-0.01em',
    }}>
      {label}
      {isYou && <span style={{ opacity: 0.45, fontSize: '0.72rem', fontWeight: 400 }}>du</span>}
      {onRemove && (
        <span onClick={onRemove} style={{
          cursor: 'pointer', opacity: 0.45, fontWeight: 500,
          lineHeight: 1, fontSize: '1rem',
        }}>×</span>
      )}
    </span>
  );
}
