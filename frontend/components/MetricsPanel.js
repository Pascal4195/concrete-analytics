import styles from './MetricsPanel.module.css';

const METRIC_INFO = {
  avg_apy: {
    label: 'AVG APY',
    unit: '%',
    explain: 'Rolling average yield over the selected window.',
    why: 'Smooths out noise to reveal true earning power of the vault.',
  },
  apy_volatility: {
    label: 'APY VOLATILITY',
    unit: '%',
    explain: 'Standard deviation of APY across the window.',
    why: 'High volatility means unpredictable yield — not ideal for capital planning.',
  },
  tvl_growth_rate: {
    label: 'TVL GROWTH',
    unit: '%',
    explain: 'Percentage change in Total Value Locked from window start to now.',
    why: 'Growing TVL signals confidence. Declining TVL may indicate strategy stress.',
  },
  utilization_stability: {
    label: 'UTIL STABILITY',
    unit: '',
    explain: 'How consistently capital is deployed (1 = perfectly stable).',
    why: 'Stable utilization means capital is always working — a sign of efficient strategy execution.',
  },
  efficiency_index: {
    label: 'EFFICIENCY INDEX',
    unit: 'pts',
    explain: 'Composite score: (Avg APY / (1 + Volatility)) × Utilization Stability × 100.',
    why: 'Captures the Concrete narrative: high yield + low risk + consistent deployment = true capital efficiency.',
  },
};

export default function MetricsPanel({ metrics, window }) {
  if (!metrics) {
    return (
      <div className={styles.wrap}>
        <div className={styles.label}>// METRICS ENGINE · {window.toUpperCase()} WINDOW</div>
        <div className={styles.empty}>COMPUTING... NO DATA YET — SNAPSHOTS ACCUMULATING</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>// METRICS ENGINE · {window.toUpperCase()} WINDOW</div>
      <div className={styles.grid}>
        {Object.entries(METRIC_INFO).map(([key, info]) => {
          const val = metrics[key];
          const display = val != null ? parseFloat(val).toFixed(2) : '—';
          const isEfficiency = key === 'efficiency_index';

          return (
            <div key={key} className={`${styles.card} ${isEfficiency ? styles.highlight : ''}`}>
              <div className={styles.cardLabel}>{info.label}</div>
              <div className={styles.cardValue}>
                {display}<span className={styles.unit}> {info.unit}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.explain}>{info.explain}</div>
              <div className={styles.why}>↳ {info.why}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
