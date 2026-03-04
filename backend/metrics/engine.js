/**
 * Concrete Analytics - Metrics Engine
 * 
 * Formulas:
 * - Rolling Avg APY: mean(apy[]) over window
 * - APY Volatility: stddev(apy[]) over window
 * - TVL Growth Rate: (tvl_now - tvl_start) / tvl_start * 100
 * - Utilization Stability: 1 - (stddev(util[]) / mean(util[]))
 * - Efficiency Index: (avg_apy / (1 + apy_volatility)) * utilization_stability * 100
 */

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function computeMetrics(snapshots, window) {
  if (!snapshots || snapshots.length === 0) return null;

  const apys = snapshots.map(s => parseFloat(s.apy)).filter(v => !isNaN(v));
  const tvls = snapshots.map(s => parseFloat(s.tvl)).filter(v => !isNaN(v));
  const utils = snapshots.map(s => parseFloat(s.utilization)).filter(v => !isNaN(v));

  const avg_apy = parseFloat(mean(apys).toFixed(4));
  const apy_volatility = parseFloat(stddev(apys).toFixed(4));

  const tvl_growth_rate = tvls.length >= 2
    ? parseFloat((((tvls[tvls.length - 1] - tvls[0]) / tvls[0]) * 100).toFixed(4))
    : 0;

  const util_mean = mean(utils);
  const util_std = stddev(utils);
  const utilization_stability = util_mean > 0
    ? parseFloat((1 - util_std / util_mean).toFixed(4))
    : 0;

  // Efficiency Index: rewards yield, penalizes volatility, weights by utilization consistency
  const efficiency_index = parseFloat(
    ((avg_apy / (1 + apy_volatility)) * Math.max(0, utilization_stability) * 100).toFixed(4)
  );

  return {
    window,
    avg_apy,
    apy_volatility,
    tvl_growth_rate,
    utilization_stability,
    efficiency_index,
    computed_at: new Date().toISOString(),
  };
}

function getWindowDays(window) {
  return window === '7d' ? 7 : 30;
}

function filterByWindow(snapshots, window) {
  const days = getWindowDays(window);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return snapshots.filter(s => new Date(s.timestamp) >= cutoff);
}

module.exports = { computeMetrics, filterByWindow };
