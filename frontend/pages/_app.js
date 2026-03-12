import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="moai-bg" aria-hidden="true" />
      <div className="moai-overlay" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <Component {...pageProps} />
    </>
  );
}