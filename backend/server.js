require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { startCron } = require('./jobs/snapshot');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Concrete Analytics Backend running on port ${PORT}`);
  startCron();
});
