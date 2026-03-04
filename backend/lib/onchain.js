const { ethers } = require('ethers');

// ERC-4626 minimal ABI + extras for Concrete vaults
const VAULT_ABI = [
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function asset() view returns (address)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
];

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function balanceOf(address account) view returns (uint256)',
];

const VAULTS = [
  { address: '0x0E609b710da5e0AA476224b6c0e5445cCc21251E', name: 'Concrete USDT Vault', decimals: 6 },
  { address: '0xB9DC54c8261745CB97070CeFBE3D3d815aee8f20', name: 'Concrete WeETH Vault', decimals: 18 },
  { address: '0xacce65B9dB4810125adDEa9797BaAaaaD2B73788', name: 'Concrete WBTC Vault', decimals: 8 },
  { address: '0xCF9ceAcf5c7d6D2FE6e8650D81FbE4240c72443f', name: 'Concrete frxUSD+ Vault', decimals: 18 },
];

async function getProvider() {
  const rpcUrl = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com';
  return new ethers.JsonRpcProvider(rpcUrl);
}

async function fetchVaultSnapshot(vaultConfig, provider) {
  try {
    const contract = new ethers.Contract(vaultConfig.address, VAULT_ABI, provider);
    const block = await provider.getBlock('latest');

    const totalAssets = await contract.totalAssets();
    const totalSupply = await contract.totalSupply();

    const decimals = vaultConfig.decimals;
    const tvl = parseFloat(ethers.formatUnits(totalAssets, decimals));

    // Share price: how many assets per 1 share (normalized to 1e18 shares)
    let sharePrice = 1.0;
    if (totalSupply > 0n) {
      const oneShare = ethers.parseUnits('1', decimals);
      try {
        const assetsPerShare = await contract.convertToAssets(oneShare);
        sharePrice = parseFloat(ethers.formatUnits(assetsPerShare, decimals));
      } catch {
        sharePrice = tvl / parseFloat(ethers.formatUnits(totalSupply, decimals));
      }
    }

    // Utilization: real onchain calculation
    // idle = vault's direct token balance (capital not yet deployed to any strategy)
    // deployed = totalAssets - idle
    // utilization = deployed / totalAssets
    let utilization = 0;
    try {
      const assetAddress = await contract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const idleAssets = await assetContract.balanceOf(vaultConfig.address);
      const idle = parseFloat(ethers.formatUnits(idleAssets, decimals));
      const deployed = Math.max(0, tvl - idle);
      utilization = tvl > 0 ? deployed / tvl : 0;
    } catch (err) {
      console.warn(`Could not fetch idle balance for ${vaultConfig.address}, defaulting utilization to 0:`, err.message);
    }

    // APY: derived from share price (will improve accuracy over time with historical data)
    // For first snapshot, use a baseline from share price
    const apy = sharePrice > 1 ? (sharePrice - 1) * 52 * 100 : 0; // annualized weekly estimate

    return {
      vault_address: vaultConfig.address,
      timestamp: new Date().toISOString(),
      apy: parseFloat(apy.toFixed(4)),
      tvl: parseFloat(tvl.toFixed(2)),
      utilization: parseFloat(utilization.toFixed(4)),
      block_number: block.number,
      raw_data: {
        totalAssets: totalAssets.toString(),
        totalSupply: totalSupply.toString(),
        sharePrice: sharePrice.toString(),
      }
    };
  } catch (err) {
    console.error(`Error fetching vault ${vaultConfig.address}:`, err.message);
    return null;
  }
}

async function fetchAllVaultSnapshots() {
  const provider = await getProvider();
  const results = [];

  for (const vault of VAULTS) {
    const snapshot = await fetchVaultSnapshot(vault, provider);
    if (snapshot) results.push(snapshot);
  }

  return results;
}

module.exports = { fetchAllVaultSnapshots, VAULTS };
