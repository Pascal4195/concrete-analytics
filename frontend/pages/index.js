import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import VaultSelector from '../components/VaultSelector';
import MetricsPanel from '../components/MetricsPanel';
import Charts from '../components/Charts';
import VaultComparison from '../components/VaultComparison';
import FAQ from '../components/FAQ';
import styles from './index.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TICKER_ITEMS = [
  { label: 'USDT VAULT', key: '0x0E609b710da5e0AA476224b6c0e5445cCc21251E' },
  { label: 'WeETH VAULT', key: '0xB9DC54c8261745CB97070CeFBE3D3d815aee8f20' },
  { label: 'WBTC VAULT', key: '0xacce65B9dB4810125adDEa9797BaAaaaD2B73788' },
  { label: 'frxUSD+ VAULT', key: '0xCF9ceAcf5c7d6D2FE6e8650D81FbE4240c72443f' },
];

export default function Home() {
  const [vaults, setVaults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeWindow, setTimeWindow] = useState('7d');
  const [metrics, setMetrics] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [latestSnapshots, setLatestSnapshots] = useState([]);
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

    axios.get(`${API}/api/snapshots/all/latest`)
      .then(r => setLatestSnapshots(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    Promise.all([
      axios.get(`${API}/api/metrics/${selected}?window=${timeWindow}`).catch(() => ({ data: null })),
      axios.get(`${API}/api/snapshots/${selected}?window=${timeWindow}`).catch(() => ({ data: [] })),
    ]).then(([m, s]) => {
      setMetrics(m.data);
      setSnapshots(s.data || []);
      setLastUpdated(new Date().toISOString());
      setLoading(false);
    });
  }, [selected, timeWindow]);

  useEffect(() => {
    axios.get(`${API}/api/metrics?window=${timeWindow}`)
      .then(r => setAllMetrics(r.data || []))
      .catch(() => setAllMetrics([]));
  }, [timeWindow]);

  const selectedVault = vaults.find(v => v.address === selected);

  const tickerText = latestSnapshots.length > 0
    ? latestSnapshots.map(s => `${s.name.replace('Concrete ', '').replace(' Vault', '')} · APY ${parseFloat(s.latest?.apy || 0).toFixed(2)}% · TVL $${(parseFloat(s.latest?.tvl || 0) / 1000000).toFixed(2)}M`).join('   ·   ')
    : 'USDT VAULT · WeETH VAULT · WBTC VAULT · frxUSD+ VAULT · FETCHING LIVE DATA...';

  return (
    <>
      <Head>
        <title>Concrete Analytics — Capital Efficiency Terminal</title>
        <meta name="description" content="Capital Efficiency & Risk Analytics Terminal for Concrete Vaults. Community contribution." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.page}>
        <Header />

        {/* LIVE TICKER */}
        <div className={styles.tickerWrap}>
          <div className={styles.ticker}>
            <span>{tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}</span>
          </div>
        </div>

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
            {['1d', '7d', '30d', '90d'].map(w => (
              <button
                key={w}
                className={`${styles.windowBtn} ${timeWindow === w ? styles.windowActive : ''}`}
                onClick={() => setTimeWindow(w)}
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

          <MetricsPanel metrics={metrics} window={timeWindow} />
          <Charts snapshots={snapshots} />
          <VaultComparison allMetrics={allMetrics} vaults={vaults} window={timeWindow} />

          <div className={styles.narrative}>
            <div className={styles.narrativeLabel}>// ANALYTICAL INTENT</div>
            <div className={styles.narrativeText}>
              This terminal validates Concrete's core thesis: one-click DeFi is only credible when backed by
              measurable capital efficiency. The Efficiency Index synthesizes yield consistency, risk-adjusted
              returns, and utilization stability into a single defensible score — answering not just "what is
              the APY?" but "is this vault reliably delivering intelligent capital allocation?"
            </div>
          </div>

          {/* FAQ — sits between Analytical Intent and the disclaimer */}
          <FAQ />

          <div className={styles.disclaimer}>
            ⚠ NOT FINANCIAL ADVICE. DEFI CARRIES RISK OF TOTAL LOSS. DYOR. THIS IS A COMMUNITY ANALYTICS
            TOOL AND DOES NOT REPRESENT OFFICIAL CONCRETE PROTOCOL DATA.
          </div>

        </main>

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