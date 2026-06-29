import '@styles/globals.css';
import Head from 'next/head';

function Application({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/IMG_0190.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/IMG_0190.jpeg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default Application;
