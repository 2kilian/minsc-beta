import Head from 'next/head';
import Link from 'next/link';

const SCHRITTE = [
  { icon: '✏️', label: 'Erstellen', text: 'Titel, Zeitraum und Teilnehmer angeben' },
  { icon: '🔗', label: 'Teilen', text: 'Link versenden – keine Anmeldung nötig' },
  { icon: '🎯', label: 'Besten Tag finden', text: 'Automatisch der Termin, an dem die meisten können' },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Wann können wir?</title>
        <meta name="description" content="Gemeinsam den besten Termin finden – einfach und ohne Anmeldung." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: 'var(--primary-grad)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>

          <div style={{ fontSize: 56, marginBottom: '1rem', lineHeight: 1 }}>📅</div>

          <h1 style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 900, color: '#fff', margin: '0 0 0.75rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Wann können wir?
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 2.5rem', lineHeight: 1.6 }}>
            Finde den besten Termin für alle – schnell, einfach, ohne Anmeldung.
          </p>

          <Link href="/erstellen">
            <a style={{
              display: 'block', background: '#fff', color: 'var(--primary)',
              fontWeight: 800, fontSize: '1.1rem', padding: '1rem 2rem',
              borderRadius: 50, boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)'; }}>
              Neue Verabredung erstellen →
            </a>
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.875rem', marginTop: '3rem' }}>
            {SCHRITTE.map(({ icon, label, text }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '1.25rem 0.75rem' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', lineHeight: 1.4 }}>{text}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
