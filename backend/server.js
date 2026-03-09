require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { runSnapshot } = require('./jobs/snapshot');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

// ── Snapshot lock — prevents two jobs running at the same time ──
let snapshotRunning = false;

function safeSnapshot() {
  if (snapshotRunning) {
    console.log('[snapshot] Already running — skipping this trigger.');
    return;
  }
  snapshotRunning = true;
  runSnapshot()
    .catch(err => console.error('[snapshot] Unhandled error:', err.message))
    .finally(() => { snapshotRunning = false; });
}

// ── Health check ──
// UptimeRobot pings this once per hour to wake the backend.
// Respond immediately so the ping never times out,
// then fire the snapshot in the background.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
  safeSnapshot(); // fire-and-forget, no await
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Concrete Analytics Backend running on port ${PORT}`);
  // Delay first snapshot by 5s to let the server fully boot before hitting RPC
  setTimeout(safeSnapshot, 5000);
});