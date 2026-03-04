import styles from './VaultSelector.module.css';

const RISK_COLORS = {
  LOW: '#00ff41',
  MEDIUM: '#ffcc00',
  HIGH: '#ff3333',
};

export default function VaultSelector({ vaults, selected, onSelect }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.label}>// SELECT VAULT</div>
      <div className={styles.grid}>
        {vaults.map(v => (
          <button
            key={v.address}
            className={`${styles.card} ${selected === v.address ? styles.active : ''}`}
            onClick={() => onSelect(v.address)}
          >
            <div className={styles.asset}>{v.asset}</div>
            <div className={styles.name}>{v.strategy_type}</div>
            <div className={styles.risk} style={{ color: RISK_COLORS[v.risk_tier] || '#00ff41' }}>
              RISK: {v.risk_tier}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}