import Head from 'next/head';
import Link from 'next/link';

const SCHRITTE = [
  { nr: '01', label: 'Erstellen', text: 'Titel, Zeitraum und Teilnehmer festlegen' },
  { nr: '02', label: 'Teilen', text: 'Link verschicken – keine Anmeldung nötig' },
  { nr: '03', label: 'Treffen', text: 'Der beste Tag für alle automatisch ermittelt' },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Wann können wir?</title>
        <meta name="description" content="Gemeinsam den besten Termin finden – einfach und ohne Anmeldung." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 1.75rem',
      }}>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>

          <p style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 1.75rem',
          }}>
            Wann können wir
          </p>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 8vw, 3.5rem)',
            fontWeight: 700,
            color: 'var(--text)',
            margin: '0 0 2.25rem',
            lineHeight: 1.06,
            letterSpacing: '-0.028em',
          }}>
            Gemeinsam<br />den besten<br />Termin finden.
          </h1>

          <Link href="/erstellen">
            <a style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--text)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.975rem',
              padding: '0.875rem 1.5rem',
              borderRadius: 12,
              letterSpacing: '-0.015em',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Verabredung erstellen
              <ArrowRight />
            </a>
          </Link>

          <div style={{
            marginTop: '3.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border)',
          }}>
            {SCHRITTE.map(({ nr, label, text }, i) => (
              <div key={nr} style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                paddingBottom: i < SCHRITTE.length - 1 ? '1.25rem' : 0,
                borderBottom: i < SCHRITTE.length - 1 ? '1px solid var(--border)' : 'none',
                marginBottom: i < SCHRITTE.length - 1 ? '1.25rem' : 0,
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  letterSpacing: '0.06em',
                  paddingTop: 2,
                  flexShrink: 0,
                  width: 20,
                }}>
                  {nr}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 3, letterSpacing: '-0.01em' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    {text}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2.5 7.5h10M8.5 3.5l4 4-4 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
