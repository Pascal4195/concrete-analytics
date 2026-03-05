import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Glowing green Moai tiled background */}
      <div className="moai-bg" />
      <div className="moai-overlay" />
      <div className="scanlines" />
      <Component {...pageProps} />
    </>
  );
}