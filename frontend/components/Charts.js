import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import styles from './Charts.module.css';

const GREEN = '#00ff41';
const GREEN_DIM = '#00cc33';
const YELLOW = '#ffcc00';
const RED = '#ff3333';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTime}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: '0.65rem' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
        </div>
      ))}
    </div>
  );
};

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
}

export default function Charts({ snapshots }) {
  if (!snapshots || snapshots.length < 2) {
    return (
      <div className={styles.wrap}>
        <div className={styles.label}>// CHART LAYER</div>
        <div className={styles.empty}>
          ACCUMULATING DATA... CHARTS AVAILABLE AFTER 2+ SNAPSHOTS
          <div className={styles.blink}>_</div>
        </div>
      </div>
    );
  }

  const data = snapshots.map(s => ({
    time: formatTime(s.timestamp),
    APY: parseFloat(s.apy),
    TVL: parseFloat(s.tvl),
    Utilization: parseFloat((s.utilization * 100).toFixed(2)),
  }));

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>// CHART LAYER</div>

      <div className={styles.grid}>

        {/* APY Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>APY OVER TIME</div>
          <div className={styles.chartDesc}>How stable is yield delivery?</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.1)" />
              <XAxis dataKey="time" tick={{ fill: '#009922', fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: '#009922', fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="APY" stroke={GREEN} dot={false} strokeWidth={2}
                strokeShadowColor={GREEN} style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TVL Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>TVL OVER TIME</div>
          <div className={styles.chartDesc}>Is capital growing or leaving?</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.1)" />
              <XAxis dataKey="time" tick={{ fill: '#009922', fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: '#009922', fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="TVL" stroke={GREEN} fill="url(#tvlGrad)"
                strokeWidth={2} style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Utilization Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>UTILIZATION OVER TIME</div>
          <div className={styles.chartDesc}>Is capital consistently deployed?</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.1)" />
              <XAxis dataKey="time" tick={{ fill: '#009922', fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: '#009922', fontSize: 9 }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={80} stroke={YELLOW} strokeDasharray="4 4" label={{ value: 'TARGET', fill: YELLOW, fontSize: 8 }} />
              <Line type="monotone" dataKey="Utilization" stroke={GREEN_DIM} dot={false} strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 4px ${GREEN_DIM})` }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
