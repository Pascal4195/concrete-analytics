# Concrete Analytics — Capital Efficiency Terminal

> A community-built analytics dashboard for [Concrete Protocol](https://concrete.xyz) ERC-4626 vaults on Ethereum Mainnet. Built by [@zerodollar_Anon](https://x.com/zerodollar_Anon).

---

## What Is This?

Concrete Analytics is a real-time capital efficiency terminal that tracks and scores Concrete Protocol's four yield vaults. It answers not just *"what is the APY?"* but *"is this vault reliably delivering intelligent capital allocation?"*

The dashboard computes a composite **Efficiency Index** from on-chain data, giving a single defensible score per vault based on yield consistency, risk-adjusted returns, and utilization stability.

---

## Live Dashboard

**Frontend:** [concrete-analytics-9ktf.onrender.com](https://concrete-analytics-9ktf.onrender.com)

> ⚠ Hosted on Render free tier. First load may take 30–50 seconds to wake up.

---

## Tracked Vaults

| Vault | Asset | Address |
|-------|-------|---------|
| USDT Vault | USDT | `0x0E609b710da5e0AA476224b6c0e5445cCc21251E` |
| WeETH Vault | WeETH | `0xB9DC54c8261745CB97070CeFBE3D3d815aee8f20` |
| WBTC Vault | WBTC | `0xacce65B9dB4810125adDEa9797BaAaaaD2B73788` |
| frxUSD+ Vault | frxUSD+ | `0xCF9ceAcf5c7d6D2FE6e8650D81FbE4240c72443f` |

**Notes:**
- WeETH vault assets are held by a regulated custodian (BitGo Trust). NAV is synced on-chain daily. On-chain APY is not available — TVL is managed off-chain.
- WBTC vault is deployed but awaiting strategy activation. Live yield data will appear once strategies go live.

---

## Metrics Explained

| Metric | Description |
|--------|-------------|
| **Avg APY** | Rolling average yield over the selected time window |
| **APY Volatility** | Standard deviation of APY — lower is more consistent |
| **TVL Growth** | Percentage change in Total Value Locked over the window |
| **Util Stability** | How consistently capital is deployed (1.00 = perfectly stable) |
| **Efficiency Index** | Composite score: `(Avg APY / (1 + Volatility)) × Util Stability × 100` |

### Time Windows

- **1D** — Last 24 hours of snapshots
- **7D** — Last 7 days
- **30D** — Last 30 days
- **90D** — Last 90 days

---

## Tech Stack

### Frontend
- **Next.js** (React) — pages router
- **Recharts** — interactive charts with pan and zoom
- **CSS Modules** — scoped styling
- **Fonts:** Orbitron + Share Tech Mono (Google Fonts)
- Deployed on **Render** (static/SSR)

### Backend
- **Node.js + Express** — REST API
- **Alchemy** — Ethereum RPC for on-chain ERC-4626 vault data
- **Supabase** (PostgreSQL) — snapshot and metrics storage
- Deployed on **Render** (free tier web service)

### Data Pipeline
- **UptimeRobot** pings `/health` every 60 minutes
- Each ping wakes the Render backend and triggers a vault snapshot
- Snapshots are stored in Supabase and metrics recomputed for all time windows
- A snapshot lock prevents concurrent jobs from running simultaneously

---

## Project Structure

```
concrete-analytics/
│
├── backend/
│   ├── server.js              # Express app + health endpoint + snapshot trigger
│   ├── lib/
│   │   ├── supabase.js        # Supabase client
│   │   └── onchain.js         # Alchemy RPC — fetches vault data
│   ├── jobs/
│   │   └── snapshot.js        # Snapshot job — inserts data + recomputes metrics
│   ├── metrics/
│   │   └── engine.js          # Metric calculations (APY, volatility, efficiency index)
│   └── routes/
│       └── api.js             # REST API routes
│
└── frontend/
    ├── pages/
    │   └── index.js           # Main dashboard page
    ├── components/
    │   ├── Header.js          # Site header
    │   ├── VaultSelector.js   # Vault switching with scan/glitch animation
    │   ├── MetricsPanel.js    # Metric cards
    │   ├── Charts.js          # Interactive pan/zoom charts
    │   └── VaultComparison.js # Multi-vault comparison view
    ├── styles/
    │   └── globals.css        # Global styles, Moai background, CRT scanlines
    └── public/
        ├── moai.png           # Tiled background image (add manually)
        └── pfp.jpg            # Footer avatar (add manually)
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Alchemy API key (free tier works)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_KEY, ALCHEMY_URL
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase anon/service key |
| `ALCHEMY_URL` | Alchemy RPC endpoint (Ethereum mainnet) |
| `FRONTEND_URL` | Frontend URL for CORS (or `*` for dev) |
| `PORT` | Server port (default: 4000) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `https://your-backend.onrender.com`) |

---

## Database Schema

Two tables in Supabase:

**`vault_snapshots`** — raw on-chain data per vault per hour
- `vault_address`, `timestamp`, `apy`, `tvl`, `utilization`

**`vault_metrics`** — computed metrics per vault per time window
- `vault_address`, `time_window` (`1d`/`7d`/`30d`/`90d`), `avg_apy`, `apy_volatility`, `tvl_growth`, `util_stability`, `efficiency_index`

> Note: The column is named `time_window` (not `window`) — `window` is a reserved keyword in PostgreSQL.

---

## Deployment (Render Free Tier)

Both services are deployed on Render's free tier:

- **Backend** — Web Service (Node.js). Sleeps after 15 minutes of inactivity.
- **Frontend** — Static Site or Web Service (Next.js).

### Keeping the Backend Alive

UptimeRobot is configured to ping `https://your-backend.onrender.com/health` every **60 minutes**. This wakes the backend and triggers a snapshot. The backend may take 30–50 seconds to respond during a cold start — this is expected and does not prevent the snapshot from running.

---

## Disclaimer

⚠ **NOT FINANCIAL ADVICE.** DeFi carries risk of total loss. DYOR. This is a community analytics tool and does not represent official Concrete Protocol data.

---

## Author

Built by [@zerodollar_Anon](https://x.com/zerodollar_Anon) — community contributor to [Concrete Protocol](https://concrete.xyz).

Source: [github.com/Pascal4195/concrete-analytics](https://github.com/Pascal4195/concrete-analytics)
