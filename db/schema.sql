-- Concrete Analytics Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS vaults (
  id SERIAL PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  asset TEXT NOT NULL,
  strategy_type TEXT,
  risk_tier TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault_snapshots (
  id SERIAL PRIMARY KEY,
  vault_address TEXT NOT NULL REFERENCES vaults(address),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  apy NUMERIC,
  tvl NUMERIC,
  utilization NUMERIC,
  block_number BIGINT,
  raw_data JSONB
);

CREATE TABLE IF NOT EXISTS vault_metrics (
  id SERIAL PRIMARY KEY,
  vault_address TEXT NOT NULL REFERENCES vaults(address),
  time_window TEXT NOT NULL CHECK (time_window IN ('1d', '7d', '30d', '90d')),
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  avg_apy NUMERIC,
  apy_volatility NUMERIC,
  tvl_growth_rate NUMERIC,
  utilization_stability NUMERIC,
  efficiency_index NUMERIC
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_snapshots_vault_time ON vault_snapshots(vault_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_vault_window ON vault_metrics(vault_address, time_window, computed_at DESC);

-- Seed vaults
INSERT INTO vaults (address, name, asset, strategy_type, risk_tier) VALUES
  ('0x0E609b710da5e0AA476224b6c0e5445cCc21251E', 'Concrete USDT Vault', 'USDT', 'Stablecoin Yield', 'LOW'),
  ('0xB9DC54c8261745CB97070CeFBE3D3d815aee8f20', 'Concrete WeETH Vault', 'WeETH', 'Wrapped ETH Yield', 'MEDIUM'),
  ('0xacce65B9dB4810125adDEa9797BaAaaaD2B73788', 'Concrete WBTC Vault', 'WBTC', 'Bitcoin Yield', 'MEDIUM'),
  ('0xCF9ceAcf5c7d6D2FE6e8650D81FbE4240c72443f', 'Concrete frxUSD+ Vault', 'frxUSD+', 'Stablecoin Yield', 'LOW')
ON CONFLICT (address) DO NOTHING;