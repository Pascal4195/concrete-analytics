import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
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
    </header>
  );
}