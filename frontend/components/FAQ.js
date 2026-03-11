import { useState } from 'react';
import styles from './FAQ.module.css';

const FAQS = [
  {
    q: 'What is Concrete Analytics?',
    a: 'Concrete Analytics is a community-built capital efficiency terminal for Concrete Protocol\'s ERC-4626 vaults on Ethereum Mainnet. It tracks real-time on-chain data and computes metrics that answer not just "what is the APY?" but "is this vault reliably delivering intelligent capital allocation?"',
  },
  {
    q: 'What is the Efficiency Index?',
    a: 'The Efficiency Index is a composite score computed as: (Avg APY / (1 + APY Volatility)) × Utilization Stability × 100. It rewards vaults that deliver high yield consistently, with stable capital deployment. A score of 100 is the maximum — it means high yield, low risk, and perfectly stable utilization.',
  },
  {
    q: 'What does Utilization Stability mean?',
    a: 'Utilization Stability measures how consistently capital is deployed inside the vault. A score of 1.00 means capital is always working — perfectly stable deployment. Lower scores indicate the vault\'s capital sits idle at times, which reduces efficiency.',
  },
  {
    q: 'What does APY Volatility mean?',
    a: 'APY Volatility is the standard deviation of the vault\'s yield over the selected time window. Lower volatility means the APY is consistent day to day. Higher volatility means yield is unpredictable — it might spike and drop. Consistent yield is a sign of a well-managed strategy.',
  },
  {
    q: 'Why does WeETH show no APY data?',
    a: 'The WeETH vault is an institutional vault. Its assets are held by a regulated custodian (BitGo Trust) and NAV is synced on-chain daily. Because yield is managed off-chain, on-chain APY is not available through standard ERC-4626 methods. TVL data is still tracked.',
  },
  {
    q: 'Why does WBTC show no yield data?',
    a: 'The WBTC vault has been deployed but is currently awaiting strategy activation. Once strategies go live, live yield data will appear automatically on this dashboard.',
  },
  {
    q: 'How often does data update?',
    a: 'Snapshots are taken every 60 minutes. An automated ping wakes the backend hourly, fetches fresh on-chain data from all four vaults via Alchemy RPC, stores it in the database, and recomputes all metrics for every time window (1D, 7D, 30D, 90D).',
  },
  {
    q: 'What do the time windows (1D / 7D / 30D / 90D) mean?',
    a: 'Each time window filters the historical snapshot data to that period. 1D shows the last 24 hours of snapshots, 7D shows the last 7 days, and so on. All metrics — APY, volatility, TVL growth, utilization stability, and the Efficiency Index — are recomputed fresh for whichever window you select.',
  },
  {
    q: 'Is this official Concrete Protocol data?',
    a: 'No. This is an independent community analytics tool built by @zerodollar_Anon. It reads publicly available on-chain data directly from Concrete\'s ERC-4626 vault contracts. It is not affiliated with, endorsed by, or representative of the official Concrete Protocol team.',
  },
  {
    q: 'What are ERC-4626 vaults?',
    a: 'ERC-4626 is an Ethereum token standard for yield-bearing vaults. It defines a common interface for depositing assets, receiving shares, and redeeming yield — making it easy for protocols and analytics tools to interact with vaults in a standardised way. Concrete Protocol\'s vaults are built on this standard.',
  },
  {
    q: 'Is my money safe in these vaults?',
    a: 'This dashboard does not manage, hold, or interact with any funds. It is read-only analytics. DeFi carries risk of total loss — smart contract risk, strategy risk, and market risk all apply. Always do your own research before depositing into any protocol.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex(prev => prev === i ? null : i);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>// FAQ · FREQUENTLY ASKED QUESTIONS</div>
      <div className={styles.list}>
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
              <button
                className={styles.question}
                onClick={() => toggle(i)}
              >
                <span className={styles.prompt}>{isOpen ? '▼' : '▶'}</span>
                <span className={styles.questionText}>{item.q}</span>
              </button>
              {isOpen && (
                <div className={styles.answer}>
                  <span className={styles.cursor}>$&nbsp;</span>
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}