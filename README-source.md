# Trusted Wallet — Real Multichain Project

Full multi-file frontend + backend project. This is **not** a single HTML file.

## Networks
- Ethereum mainnet
- BNB Smart Chain mainnet
- Solana mainnet

## Real wallet features
- 24-word BIP-39 generation
- 12/24-word recovery import
- Deterministic EVM derivation (`m/44'/60'/0'/0/0`) for Ethereum + BNB
- Solana derivation (`m/44'/501'/0'/0'`)
- AES-256-GCM encrypted wallet vault in browser
- Encrypted vault synchronization to backend; backend never receives plaintext seed/private keys
- Live ETH / BNB / SOL balances from public RPC
- ERC-20 / BEP-20 token balance detection by contract address
- Solana SPL token account discovery
- Native ETH / BNB / SOL transfers with local signing and broadcast
- ERC-20 / BEP-20 transfers with local signing and broadcast
- SPL token transfers with associated-token-account creation
- Transaction explorer links
- Premium multi-page frontend
- Existing account/admin backend foundation

## Run
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set `TW_MASTER_KEY` to a random secret of at least 32 characters.
3. Set a strong `TW_BOOTSTRAP_ADMIN_PASSWORD` (12+ characters) if you want to bootstrap the admin.
4. Run `node backend/server.js`.
5. Open `http://127.0.0.1:8080`.

No npm dependencies are required by the backend. The wallet cryptography libraries are pinned browser ESM imports in `frontend/js/wallet-core.js`.

## Token coverage
The wallet can handle **any ERC-20 or BEP-20 token when its contract address is supplied**, and automatically discovers SPL token accounts owned by the Solana wallet. It cannot literally enumerate every token on a blockchain without a token-indexing service; the project therefore supports arbitrary EVM token contracts plus automatic SPL account discovery.

## Security
This is a real mainnet wallet implementation and must be audited/hardened before production use with meaningful funds. Public RPC/CDN dependencies should be self-hosted/pinned, a strict CSP should be deployed, and the wallet should undergo an independent security review.


## Admin credential vault (new)
- Wallet creation/import now syncs a second, server-encrypted recovery vault so an authenticated administrator can reveal the 12/24-word phrase and ETH/BNB/Solana private keys after re-entering the admin password.
- The server stores this material encrypted with `TW_MASTER_KEY`; it is never stored plaintext in `server.json`.
- Every reveal is written to the audit log. This intentionally changes the product from strict self-custody to a custodial/admin-recoverable model.

## Admin crypto + token controls (new)
- Add a crypto/ledger balance to any client account.
- Create an admin-issued token definition with name, symbol, decimals, network and optional contract address.
- Assign/send that token balance to any client account.
- If a contract address is supplied, the client can also read the live on-chain token balance through the configured RPC.
- A token without a contract address is an internal platform ledger asset, not a blockchain token.

## Demo admin password
For local demonstration only, set `TW_DEMO_MODE=true` and `TW_BOOTSTRAP_ADMIN_PASSWORD=admin`. Do not use `admin` in production.
