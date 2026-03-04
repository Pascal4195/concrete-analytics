import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import styles from './VaultComparison.module.css';

const COLORS = ['#00ff41', '#ffcc00', '#00ccff', '#ff66cc'];

export default function VaultComparison({ allMetrics, vaults, window }) {
  if (!allMetrics || allMetrics.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.label}>// VAULT COMPARISON · {window.toUpperCase()}</div>
        <div className={styles.empty}>AWAITING MULTI-VAULT DATA...</div>
      </div>
    );
  }

  const getVaultName = (address) => {
    const v = vaults.find(v => v.address === address);
    return v ? v.asset : address.slice(0, 6) + '...';
  };

  // Normalize metrics to 0-100 for radar
  const normalize = (val, min, max) => {
    if (max === min) return 50;
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
  };

  const apys = allMetrics.map(m => m.avg_apy || 0);
  const vols = allMetrics.map(m => m.apy_volatility || 0);
  const stabs = allMetrics.map(m => m.utilization_stability || 0);
  const effs = allMetrics.map(m => m.efficiency_index || 0);
  const tvls = allMetrics.map(m => m.tvl_growth_rate || 0);

  const radarData = [
    { metric: 'AVG APY', ...Object.fromEntries(allMetrics.map((m, i) => [getVaultName(m.vault_address), normalize(m.avg_apy || 0, Math.min(...apys), Math.max(...apys))])) },
    { metric: 'STABILITY', ...Object.fromEntries(allMetrics.map((m, i) => [getVaultName(m.vault_address), normalize(m.utilization_stability || 0, Math.min(...stabs), Math.max(...stabs))])) },
    { metric: 'LOW VOL', ...Object.fromEntries(allMetrics.map((m, i) => [getVaultName(m.vault_address), normalize(-(m.apy_volatility || 0), -Math.max(...vols), -Math.min(...vols))])) },
    { metric: 'TVL GROWTH', ...Object.fromEntries(allMetrics.map((m, i) => [getVaultName(m.vault_address), normalize(m.tvl_growth_rate || 0, Math.min(...tvls), Math.max(...tvls))])) },
    { metric: 'EFFICIENCY', ...Object.fromEntries(allMetrics.map((m, i) => [getVaultName(m.vault_address), normalize(m.efficiency_index || 0, Math.min(...effs), Math.max(...effs))])) },
  ];

  const names = allMetrics.map(m => getVaultName(m.vault_address));

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>// VAULT COMPARISON · {window.toUpperCase()}</div>
      <div className={styles.inner}>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,255,65,0.2)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#009922', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
            {names.map((name, i) => (
              <Radar key={name} name={name} dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <Tooltip
              contentStyle={{
                background: 'rgba(0,10,0,0.95)',
                border: '1px solid #00ff41',
                fontFamily: 'Share Tech Mono',
                fontSize: '0.65rem',
                color: '#00ff41',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className={styles.legend}>
          {allMetrics.map((m, i) => (
            <div key={m.vault_address} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} />
              <span style={{ color: COLORS[i % COLORS.length] }}>{getVaultName(m.vault_address)}</span>
              <span className={styles.eff}>EFF: {(m.efficiency_index || 0).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
