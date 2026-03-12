import { useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import styles from './Charts.module.css';

const GREEN     = '#00ff41';
const GREEN_DIM = '#00cc33';
const YELLOW    = '#EDD97A';
const YELLOW_DIM = '#C9B55A';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTime}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 'var(--fs-xs)' }}>
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

const DEFAULT_VISIBLE = 24;
const MIN_VISIBLE = 6;

function usePanZoom(totalLength) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(DEFAULT_VISIBLE, totalLength)
  );
  const [startIndex, setStartIndex] = useState(
    Math.max(0, totalLength - Math.min(DEFAULT_VISIBLE, totalLength))
  );

  const dragRef = useRef(null);
  const endIndex = Math.min(startIndex + visibleCount, totalLength);

  const pan = useCallback((delta) => {
    setStartIndex(prev => {
      const next = prev + delta;
      const maxStart = totalLength - visibleCount;
      return Math.max(0, Math.min(next, maxStart));
    });
  }, [totalLength, visibleCount]);

  const zoom = useCallback((direction) => {
    setVisibleCount(prev => {
      const next = direction === 'in'
        ? Math.max(MIN_VISIBLE, Math.floor(prev * 0.7))
        : Math.min(totalLength, Math.ceil(prev * 1.4));
      setStartIndex(si => Math.max(0, Math.min(si, totalLength - next)));
      return next;
    });
  }, [totalLength]);

  const onTouchStart = useCallback((e) => {
    dragRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      dist: null,
      direction: null,
    };
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!dragRef.current) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (dragRef.current.dist !== null) {
        const delta = dist - dragRef.current.dist;
        if (Math.abs(delta) > 8) {
          zoom(delta > 0 ? 'in' : 'out');
          dragRef.current.dist = dist;
        }
      } else {
        dragRef.current.dist = dist;
      }
      return;
    }
    const dx = e.touches[0].clientX - dragRef.current.x;
    const dy = e.touches[0].clientY - dragRef.current.y;
    if (!dragRef.current.direction) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        dragRef.current.direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }
      return;
    }
    if (dragRef.current.direction === 'vertical') return;
    e.preventDefault();
    if (Math.abs(dx) > 15) {
      pan(dx < 0 ? 2 : -2);
      dragRef.current.x = e.touches[0].clientX;
    }
  }, [pan, zoom]);

  const onTouchEnd = useCallback(() => { dragRef.current = null; }, []);

  const onMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX, active: true };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current?.active) return;
    const dx = e.clientX - dragRef.current.x;
    if (Math.abs(dx) > 15) {
      pan(dx < 0 ? 1 : -1);
      dragRef.current.x = e.clientX;
    }
  }, [pan]);

  const onMouseUp = useCallback(() => {
    if (dragRef.current) dragRef.current.active = false;
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 'out' : 'in');
  }, [zoom]);

  return {
    sliceStart: startIndex,
    sliceEnd: endIndex,
    visibleCount,
    zoom,
    pan,
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onMouseDown, onMouseMove, onMouseUp, onWheel }
  };
}

function ChartCard({ title, desc, children, handlers, sliceStart, sliceEnd, totalLength, zoom, pan }) {
  const atStart = sliceStart === 0;
  const atEnd = sliceEnd >= totalLength;

  return (
    <div className={styles.chartCard} {...handlers} style={{ userSelect: 'none', cursor: 'grab' }}>
      <div className={styles.chartTitle}>{title}</div>
      <div className={styles.chartDesc}>{desc}</div>
      {children}
      <div className={styles.chartControls}>
        <button className={styles.chartBtn}
          onClick={() => pan(-Math.max(1, Math.floor((sliceEnd - sliceStart) / 2)))}
          disabled={atStart}>◀</button>
        <button className={styles.chartBtn} onClick={() => zoom('in')}>＋</button>
        <button className={styles.chartBtn} onClick={() => zoom('out')}>－</button>
        <button className={styles.chartBtn}
          onClick={() => pan(Math.max(1, Math.floor((sliceEnd - sliceStart) / 2)))}
          disabled={atEnd}>▶</button>
        <span className={styles.chartRange}>{sliceStart + 1}–{sliceEnd} / {totalLength}</span>
      </div>
    </div>
  );
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

  const allData = snapshots.map(s => ({
    time: formatTime(s.timestamp),
    APY: parseFloat(s.apy),
    TVL: parseFloat(s.tvl),
    Utilization: parseFloat((s.utilization * 100).toFixed(2)),
  }));

  const total = allData.length;
  const apy  = usePanZoom(total);
  const tvl  = usePanZoom(total);
  const util = usePanZoom(total);

  const apyData  = allData.slice(apy.sliceStart,  apy.sliceEnd);
  const tvlData  = allData.slice(tvl.sliceStart,  tvl.sliceEnd);
  const utilData = allData.slice(util.sliceStart, util.sliceEnd);

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>// CHART LAYER</div>
      <div className={styles.chartHint}>← DRAG HORIZONTALLY TO PAN · PINCH TO ZOOM →</div>

      <div className={styles.grid}>

        {/* APY Chart */}
        <ChartCard title="APY OVER TIME" desc="How stable is yield delivery?"
          handlers={apy.handlers} sliceStart={apy.sliceStart} sliceEnd={apy.sliceEnd}
          totalLength={total} zoom={apy.zoom} pan={apy.pan}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={apyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(237,217,122,0.1)" />
              <XAxis dataKey="time" tick={{ fill: YELLOW_DIM, fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: YELLOW_DIM, fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="APY" stroke={GREEN} dot={false} strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* TVL Chart */}
        <ChartCard title="TVL OVER TIME" desc="Is capital growing or leaving?"
          handlers={tvl.handlers} sliceStart={tvl.sliceStart} sliceEnd={tvl.sliceEnd}
          totalLength={total} zoom={tvl.zoom} pan={tvl.pan}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={tvlData}>
              <defs>
                <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(237,217,122,0.1)" />
              <XAxis dataKey="time" tick={{ fill: YELLOW_DIM, fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: YELLOW_DIM, fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="TVL" stroke={GREEN} fill="url(#tvlGrad)"
                strokeWidth={2} style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Utilization Chart */}
        <ChartCard title="UTILIZATION OVER TIME" desc="Is capital consistently deployed?"
          handlers={util.handlers} sliceStart={util.sliceStart} sliceEnd={util.sliceEnd}
          totalLength={total} zoom={util.zoom} pan={util.pan}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={utilData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(237,217,122,0.1)" />
              <XAxis dataKey="time" tick={{ fill: YELLOW_DIM, fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: YELLOW_DIM, fontSize: 9 }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={80} stroke={YELLOW} strokeDasharray="4 4"
                label={{ value: 'TARGET', fill: YELLOW, fontSize: 8 }} />
              <Line type="monotone" dataKey="Utilization" stroke={GREEN_DIM} dot={false} strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 4px ${GREEN_DIM})` }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}