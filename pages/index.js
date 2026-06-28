import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Wann können wir? – Gemeinsam Termine finden</title>
        <meta name="description" content="Finde den besten Termin für alle – einfach, schnell, ohne Anmeldung." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ textAlign: 'center', color: 'white', maxWidth: 600 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.1 }}>
          Wann können wir?
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, margin: '0 0 2.5rem', lineHeight: 1.6 }}>
          Erstelle eine Verabredung, lade Leute ein und finde automatisch den besten Termin für alle.
        </p>

        <Link href="/erstellen">
          <a style={{ display: 'inline-block', background: 'white', color: '#764ba2', fontWeight: 700, fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: 50, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}>
            ✨ Neue Verabredung erstellen
          </a>
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '4rem' }}>
          {[
            { icon: '✏️', title: 'Erstellen', text: 'Gib Titel, Zeitraum und Teilnehmernamen an' },
            { icon: '🔗', title: 'Einladen', text: 'Teile den Link – keine Anmeldung nötig' },
            { icon: '🎯', title: 'Besten Termin finden', text: 'Die App zeigt automatisch, wann die meisten können' },
          ].map(({ icon, title, text }) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.85, lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
