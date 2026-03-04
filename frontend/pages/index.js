import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import VaultSelector from '../components/VaultSelector';
import MetricsPanel from '../components/MetricsPanel';
import Charts from '../components/Charts';
import VaultComparison from '../components/VaultComparison';
import styles from './index.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [vaults, setVaults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [window, setWindow] = useState('7d');
  const [metrics, setMetrics] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('INITIALIZING...');

  useEffect(() => {
    axios.get(`${API}/api/vaults`)
      .then(r => {
        setVaults(r.data);
        if (r.data.length > 0) setSelected(r.data[0].address);
        setStatus('ONLINE');
      })
      .catch(() => setStatus('BACKEND OFFLINE — CHECK RENDER LOGS'));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    Promise.all([
      axios.get(`${API}/api/metrics/${selected}?window=${window}`).catch(() => ({ data: null })),
      axios.get(`${API}/api/snapshots/${selected}?window=${window}`).catch(() => ({ data: [] })),
    ]).then(([m, s]) => {
      setMetrics(m.data);
      setSnapshots(s.data || []);
      setLastUpdated(new Date().toISOString());
      setLoading(false);
    });
  }, [selected, window]);

  useEffect(() => {
    axios.get(`${API}/api/metrics?window=${window}`)
      .then(r => setAllMetrics(r.data || []))
      .catch(() => setAllMetrics([]));
  }, [window]);

  const selectedVault = vaults.find(v => v.address === selected);

  return (
    <>
      <Head>
        <title>Concrete Analytics — Capital Efficiency Terminal</title>
        <meta name="description" content="Capital Efficiency & Risk Analytics Terminal for Concrete Vaults. Community contribution." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.page}>
        <Header />

        <main className={styles.main}>

          <div className={styles.statusRow}>
            <span className={`${styles.statusDot} ${status === 'ONLINE' ? styles.online : styles.offline}`} />
            <span className={styles.statusText}>{status}</span>
            {lastUpdated && (
              <span className={styles.statusTime}>
                LAST UPDATED: {new Date(lastUpdated).toUTCString()}
              </span>
            )}
          </div>

          <div className={styles.windowRow}>
            <span className={styles.windowLabel}>// TIME WINDOW:</span>
            {['7d', '30d'].map(w => (
              <button
                key={w}
                className={`${styles.windowBtn} ${window === w ? styles.windowActive : ''}`}
                onClick={() => setWindow(w)}
              >
                {w.toUpperCase()}
              </button>
            ))}
          </div>

          <VaultSelector vaults={vaults} selected={selected} onSelect={setSelected} />

          {selectedVault && (
            <div className={styles.vaultInfo}>
              <span className={styles.vaultInfoAsset}>{selectedVault.asset}</span>
              <span className={styles.vaultInfoAddr}>{selected}</span>
              <span className={styles.vaultInfoRisk}>RISK TIER: {selectedVault.risk_tier}</span>
            </div>
          )}

          {loading && <div className={styles.loading}>FETCHING DATA<span className={styles.blink}>_</span></div>}

          <MetricsPanel metrics={metrics} window={window} />
          <Charts snapshots={snapshots} />
          <VaultComparison allMetrics={allMetrics} vaults={vaults} window={window} />

          <div className={styles.narrative}>
            <div className={styles.narrativeLabel}>// ANALYTICAL INTENT</div>
            <div className={styles.narrativeText}>
              This terminal validates Concrete's core thesis: one-click DeFi is only credible when backed by
              measurable capital efficiency. The Efficiency Index synthesizes yield consistency, risk-adjusted
              returns, and utilization stability into a single defensible score — answering not just "what is
              the APY?" but "is this vault reliably delivering intelligent capital allocation?"
            </div>
          </div>

          <div className={styles.disclaimer}>
            ⚠ NOT FINANCIAL ADVICE. DEFI CARRIES RISK OF TOTAL LOSS. DYOR. THIS IS A COMMUNITY ANALYTICS
            TOOL AND DOES NOT REPRESENT OFFICIAL CONCRETE PROTOCOL DATA.
          </div>

        </main>

        {/* TM at bottom of page */}
        <footer className={styles.footer}>
          <a
            href="https://x.com/zerodollar_Anon"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.tm}
          >
            <Image src="/pfp.jpg" alt="@zerodollar_Anon" width={28} height={28} className={styles.pfp} />
            <span>BUILT BY @zerodollar_Anon</span>
          </a>
          <span className={styles.footerRight}>
            CONCRETE ANALYTICS // COMMUNITY CONTRIBUTION // ETH MAINNET
          </span>
        </footer>
      </div>
    </>
  );
}