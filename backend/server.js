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

// Health check + snapshot trigger
// UptimeRobot pings this once per hour to wake the backend
// On every wake-up, a snapshot runs immediately then Render goes back to sleep
app.get('/health', async (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
  // Run snapshot after responding so the ping doesn't time out
  await runSnapshot();
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Concrete Analytics Backend running on port ${PORT}`);
  // Run once immediately on first startup
  runSnapshot();
});