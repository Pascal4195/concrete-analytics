const { ethers } = require('ethers');

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
    const decimals = vaultConfig.decimals;

    const totalAssets = await contract.totalAssets();
    const totalSupply = await contract.totalSupply();

    const tvl = parseFloat(ethers.formatUnits(totalAssets, decimals));

    // Share price: assets per 1 share
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

    // APY: store share price for now
    // Real APY is computed by comparing share prices across snapshots in the metrics engine
    // Single snapshot APY = 0 (can't compute rate of change without history)
    const apy = sharePrice > 1.0
      ? parseFloat(((sharePrice - 1.0) * 100).toFixed(4)) // simple return % not annualized
      : 0;

    // Utilization: real onchain
    let utilization = 0;
    try {
      const assetAddress = await contract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const idleAssets = await assetContract.balanceOf(vaultConfig.address);
      const idle = parseFloat(ethers.formatUnits(idleAssets, decimals));
      const deployed = Math.max(0, tvl - idle);
      utilization = tvl > 0 ? parseFloat((deployed / tvl).toFixed(4)) : 0;
    } catch (err) {
      console.warn(`Could not fetch idle balance for ${vaultConfig.address}:`, err.message);
    }

    return {
      vault_address: vaultConfig.address,
      timestamp: new Date().toISOString(),
      apy,
      tvl: parseFloat(tvl.toFixed(2)),
      utilization,
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