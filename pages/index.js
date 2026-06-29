import Head from 'next/head';
import Link from 'next/link';

const SCHRITTE = [
  {
    nr: '1',
    label: 'Verabredung erstellen',
    text: 'Titel, Zeitraum und Teilnehmer in unter einer Minute festlegen.',
  },
  {
    nr: '2',
    label: 'Link teilen',
    text: 'Einfach den Link verschicken – kein Account, keine App nötig.',
  },
  {
    nr: '3',
    label: 'Besten Tag finden',
    text: 'Alle klicken ihre verfügbaren Tage an. Das Ergebnis siehst du sofort.',
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Wann können wir? – Termine gemeinsam finden</title>
        <meta name="description" content="Gemeinsam den besten Termin finden – kostenlos, ohne Anmeldung, in Sekunden." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Wann können wir?" />
        <meta property="og:description" content="Gemeinsam den besten Termin finden – kostenlos, ohne Anmeldung." />
      </Head>

      <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>

        {/* ── Nav ── */}
        <nav style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Wann können wir?
          </span>
          <Link href="/erstellen">
            <a style={{
              padding: '0.5rem 1rem', borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'var(--white)', color: 'var(--text)',
              fontWeight: 600, fontSize: '0.825rem',
              letterSpacing: '-0.01em',
            }}>
              Erstellen
            </a>
          </Link>
        </nav>

        {/* ── Hero ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 1.75rem 3rem' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--bg)', borderRadius: 50,
              padding: '5px 14px', marginBottom: '1.75rem',
              fontSize: '0.76rem', fontWeight: 600, color: 'var(--secondary)',
              border: '1px solid var(--border)', letterSpacing: '-0.01em',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              Kostenlos · Keine Anmeldung
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 9vw, 4rem)',
              fontWeight: 700, color: 'var(--text)',
              margin: '0 0 1.25rem',
              lineHeight: 1.05, letterSpacing: '-0.03em',
            }}>
              Gemeinsam den<br />besten Termin<br />finden.
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
              color: 'var(--secondary)', margin: '0 0 2.25rem',
              lineHeight: 1.6, letterSpacing: '-0.01em', maxWidth: 380,
            }}>
              Erstelle in Sekunden eine Abstimmung und finde heraus, wann alle können – ohne App, ohne Account.
            </p>

            <Link href="/erstellen">
              <a style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--text)', color: '#fff',
                fontWeight: 600, fontSize: '1rem',
                padding: '1rem 1.75rem',
                borderRadius: 14, letterSpacing: '-0.015em',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Eigene Verabredung planen
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Link>

          </div>
        </div>

        {/* ── Wie es funktioniert ── */}
        <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '3rem 1.75rem' }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>

            <p style={{
              fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: '1.75rem',
            }}>
              So funktioniert's
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {SCHRITTE.map(({ nr, label, text }, i) => (
                <div key={nr} style={{
                  display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                  padding: '1.25rem 0',
                  borderBottom: i < SCHRITTE.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--text)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                    letterSpacing: '-0.01em',
                  }}>
                    {nr}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.015em' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                      {text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/erstellen">
              <a style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: '2rem',
                padding: '0.9rem', borderRadius: 12,
                background: 'var(--text)', color: '#fff',
                fontWeight: 600, fontSize: '0.95rem',
                letterSpacing: '-0.015em',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Jetzt loslegen – kostenlos
              </a>
            </Link>

          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{
          padding: '1.5rem 1.75rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--white)',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '-0.01em' }}>
              Wann können wir?
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '-0.01em' }}>
              Kostenlos · Ohne Anmeldung · Für alle
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
