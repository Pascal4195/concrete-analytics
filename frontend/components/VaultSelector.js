import { useState } from 'react';
import styles from './VaultSelector.module.css';

const RISK_COLORS = {
  LOW:    '#00FF41',
  MEDIUM: '#ffcc00',
  HIGH:   '#ff3333',
};

const VAULT_NOTES = {
  '0xB9DC54c8261745CB97070CeFBE3D3d815aee8f20': {
    type: 'institutional',
    badge: 'INSTITUTIONAL',
    note: '⬡ Assets held by regulated custodian (BitGo Trust). NAV synced on-chain daily. On-chain APY not available — TVL managed off-chain.',
  },
  '0xacce65B9dB4810125adDEa9797BaAaaaD2B73788': {
    type: 'pending',
    badge: 'COMING SOON',
    note: '⧖ Vault deployed. Awaiting strategy activation. Live yield data will appear once strategies go live.',
  },
};

export default function VaultSelector({ vaults, selected, onSelect }) {
  const [flashing, setFlashing] = useState(null);

  function handleSelect(address) {
    setFlashing(address);
    setTimeout(() => setFlashing(null), 400);
    onSelect(address);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>// SELECT VAULT</div>
      <div className={styles.grid}>
        {vaults.map(v => {
          const note = VAULT_NOTES[v.address];
          const isFlashing = flashing === v.address;
          return (
            <button
              key={v.address}
              className={`
                ${styles.card}
                ${selected === v.address ? styles.active : ''}
                ${isFlashing ? 'vault-selecting' : ''}
              `}
              onClick={() => handleSelect(v.address)}
            >
              <div className={styles.asset}>{v.asset}</div>

              {note?.type === 'institutional' && (
                <div className={styles.institutionalBadge}>{note.badge}</div>
              )}
              {note?.type === 'pending' && (
                <div className={styles.pendingBadge}>{note.badge}</div>
              )}

              <div className={styles.name}>{v.strategy_type}</div>
              <div
                className={styles.risk}
                style={{ color: RISK_COLORS[v.risk_tier] || '#00FF41' }}
              >
                RISK: {v.risk_tier}
              </div>

              {note && (
                <div className={`${styles.vaultNote} ${note.type === 'institutional' ? styles.institutionalNote : styles.pendingNote}`}>
                  {note.note}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}