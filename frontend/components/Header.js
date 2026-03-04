import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.moaiBg}>
        <Image src="/moai.jpg" alt="" fill style={{ objectFit: 'cover', opacity: 0.18 }} priority />
      </div>

      <div className={styles.statusBar}>
        CONCRETE ANALYTICS // CAPITAL EFFICIENCY TERMINAL // ETH MAINNET (1)
      </div>

      <div className={styles.heroWrap}>
        <h1 className={styles.title}>
          <span className={styles.titleMain}>CONCRETE</span>
          <span className={styles.titleSub}>ANALYTICS</span>
        </h1>
        <p className={styles.subtitle}>
          CAPITAL EFFICIENCY &amp; RISK TERMINAL · COMMUNITY CONTRIBUTION · ERC-4626 · ETH MAINNET
        </p>
      </div>

      <a
        href="https://x.com/zerodollar_Anon"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.tm}
        title="Built by @zerodollar_Anon"
      >
        <Image src="/pfp.jpg" alt="@zerodollar_Anon" width={32} height={32} className={styles.pfp} />
        <span>BUILT BY @zerodollar_Anon</span>
      </a>
    </header>
  );
}
