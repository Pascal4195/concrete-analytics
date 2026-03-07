import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="moai-bg" aria-hidden="true" />
      <div className="scanlines" />
      <Component {...pageProps} />
    </>
  );
}