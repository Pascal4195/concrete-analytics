import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Tiled Moai emoji background */}
      <div className="moai-bg" aria-hidden="true">
        {Array.from({ length: 200 }).map((_, i) => (
          <span key={i} className="moai-emoji">🗿</span>
        ))}
      </div>
      <div className="moai-overlay" />
      <div className="scanlines" />
      <Component {...pageProps} />
    </>
  );
}