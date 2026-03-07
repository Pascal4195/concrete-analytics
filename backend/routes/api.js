const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

function getWindowDays(window) {
  const map = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
  return map[window] || 7;
}

// GET /api/vaults - list all vaults
router.get('/vaults', async (req, res) => {
  const { data, error } = await supabase.from('vaults').select('*').eq('active', true);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/snapshots/all/latest - latest snapshot per vault
// IMPORTANT: this route must be defined BEFORE /snapshots/:address
router.get('/snapshots/all/latest', async (req, res) => {
  const { data: vaults } = await supabase.from('vaults').select('*').eq('active', true);
  if (!vaults) return res.json([]);

  const results = [];
  for (const vault of vaults) {
    const { data } = await supabase
      .from('vault_snapshots')
      .select('*')
      .eq('vault_address', vault.address)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (data) results.push({ ...vault, latest: data });
  }

  res.json(results);
});

// GET /api/snapshots/:address?window=7d
router.get('/snapshots/:address', async (req, res) => {
  const { address } = req.params;
  const window = req.query.window || '7d';
  const days = getWindowDays(window);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data, error } = await supabase
    .from('vault_snapshots')
    .select('*')
    .eq('vault_address', address)
    .gte('timestamp', cutoff.toISOString())
    .order('timestamp', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/metrics/:address?window=7d
router.get('/metrics/:address', async (req, res) => {
  const { address } = req.params;
  const window = req.query.window || '7d';

  const { data, error } = await supabase
    .from('vault_metrics')
    .select('*')
    .eq('vault_address', address)
    .eq('time_window', window)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();  // returns null instead of error when no row found

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'No metrics found for this window' });
  res.json(data);
});

// GET /api/metrics?window=7d - all vaults latest metrics
router.get('/metrics', async (req, res) => {
  const window = req.query.window || '7d';

  const { data: vaults } = await supabase.from('vaults').select('address').eq('active', true);
  if (!vaults) return res.json([]);

  const results = [];
  for (const vault of vaults) {
    const { data } = await supabase
      .from('vault_metrics')
      .select('*')
      .eq('vault_address', vault.address)
      .eq('time_window', window)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle();  // returns null instead of error when no row found

    if (data) results.push(data);
  }

  res.json(results);
});

module.exports = router;