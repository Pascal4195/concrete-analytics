const supabase = require('../lib/supabase');
const { fetchAllVaultSnapshots } = require('../lib/onchain');
const { computeMetrics, filterByWindow } = require('../metrics/engine');

async function runSnapshot() {
  console.log(`[${new Date().toISOString()}] Running vault snapshot...`);

  try {
    const snapshots = await fetchAllVaultSnapshots();

    if (!snapshots.length) {
      console.warn('No snapshots fetched.');
      return;
    }

    // Insert snapshots
    const { error: snapError } = await supabase
      .from('vault_snapshots')
      .insert(snapshots);

    if (snapError) {
      console.error('Snapshot insert error:', snapError.message);
      return;
    }

    console.log(`Inserted ${snapshots.length} snapshots.`);

    // Recompute metrics for each vault
    for (const snap of snapshots) {
      const { data: history } = await supabase
        .from('vault_snapshots')
        .select('*')
        .eq('vault_address', snap.vault_address)
        .order('timestamp', { ascending: true });

      for (const window of ['7d', '30d']) {
        const filtered = filterByWindow(history || [], window);
        const metrics = computeMetrics(filtered, window);

        if (metrics) {
          const { error: metError } = await supabase
            .from('vault_metrics')
            .insert({ vault_address: snap.vault_address, ...metrics });

          if (metError) console.error(`Metrics insert error (${window}):`, metError.message);
        }
      }
    }

    console.log(`[${new Date().toISOString()}] Snapshot complete.`);
  } catch (err) {
    console.error('Snapshot job failed:', err.message);
  }
}

module.exports = { runSnapshot };