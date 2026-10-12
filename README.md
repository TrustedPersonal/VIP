# Trusted Wallet — VIP Gold Edition (GitHub Pages)

This ZIP contains the **complete static project folder**, not a single HTML demo. It includes the landing page, client wallet dashboard, admin demo, About, Terms, Privacy, shared CSS, JavaScript modules, and GitHub Pages workflow.

## Visual theme
Premium black-and-gold VIP styling with gold gradients, subtle glow, glass-like panels, responsive layouts, hover/focus states, and reduced-motion support.

## Run / publish without installing anything
1. Create a GitHub repository.
2. Upload **all contents of this folder** (not only `index.html`, and not the ZIP file itself).
3. Commit to the `main` branch.
4. Go to **Settings → Pages** and choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then save.
6. Open the published GitHub Pages URL after deployment completes.

## Included pages and files
- `index.html` — VIP landing page, sign-in/register, create/import wallet dialogs
- `client.html` — client wallet dashboard
- `admin.html` — local demo administration panel
- `about.html`, `terms.html`, `privacy.html` — information and legal pages
- `css/style.css` — shared responsive black-and-gold theme
- `js/landing.js` — landing page interactions
- `js/client.js` — wallet dashboard interactions
- `js/wallet-core.js` — browser-side wallet derivation, encryption, balance and transaction logic
- `js/api.js` — browser-local demo data layer
- `js/admin.js` — local admin demo
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow

## Important security and hosting limitations
This is a **static browser demo**, not a production custody service. The account/admin demo is stored locally in each browser and is not a shared server database. GitHub Pages does not run a backend. Different visitors cannot share accounts or admin changes. Do not use real funds, real recovery phrases, or valuable private keys with this un-audited project. Third-party browser modules and public RPC services require an internet connection and may be unavailable or rate-limited.

The admin page is a local demonstration only; it cannot securely control other visitors' wallets or alter on-chain balances. Real balances come from the relevant blockchain RPC, not from an editable website ledger.

## First test
Use a new test wallet with no funds. Check browser developer tools if an external module or RPC request fails. Never share your recovery phrase or wallet password in a support message.

## Wallet-generation status and asset scope
- Updated the Solana web3.js import to avoid bundling a second copy of its class dependencies; this targets the reported `Class constructor ... cannot be invoked without 'new'` failure.
- Fixed asynchronous wallet-core loading in the recovery-phrase import flow.
- Added responsive image sizing, mobile spacing, touch target sizing, and overflow protection.
- The current key derivation creates Ethereum/EVM and Solana accounts. The BNB account uses the same EVM address. Bitcoin address derivation is not implemented in this build yet, so do not interpret the current wallet list as a true BTC wallet.
- USD is not a blockchain network or native crypto wallet. USDC/USDT are USD-pegged tokens and balances/prices depend on the network and token contract; no fixed USD value is guaranteed.
- The full browser wallet-generation flow remains unverified in this environment; test with a fresh demo wallet before any real funds.


## Bitcoin support added
- Wallet creation/import derives a native SegWit Bitcoin address using BIP-84 (`m/84'/0'/0'/0/0`) from the same recovery phrase.
- BTC address balance is read from the public mempool.space address endpoint.
- Bitcoin transaction signing/broadcasting is **not implemented** in this static build; the UI blocks BTC sends instead of pretending to send.
- Account registration does not require email verification.
- This GitHub Pages edition stores accounts and encrypted vault data in the current browser only; it is not a shared production account service.


## Admin and key safety
The admin page is a local-only demo. It can manage demo ledger values and token definitions, but it cannot mint on-chain assets or change blockchain balances. Client private keys and recovery phrases must remain under the wallet owner's control and are never exposed to the administrator.


## Private-key display
The client dashboard includes an owner-only private-key view while the wallet is unlocked. Closing dialogs or locking the wallet clears the displayed key and recovery phrase from the page. The admin panel cannot access decrypted client secrets.
