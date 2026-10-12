# Deploy Trusted Wallet demo on GitHub Pages (no local installation)

1. Create a GitHub repository.
2. Extract this ZIP and upload **all files and folders inside it** to the repository root (including `.github/` and `.nojekyll`). Do not upload the ZIP itself.
3. In GitHub, open **Settings → Pages**. Choose **GitHub Actions** as the build/deployment source if prompted; the included workflow deploys the repository root.
4. Open **Actions** and wait for “Deploy Trusted Wallet to GitHub Pages” to finish successfully.
5. Open the published URL and test with a fresh demo account and no funds.

## Important

This is a browser-only demo. It does not provide shared accounts or server-backed admin controls. Admin changes affect only the current browser's demo ledger, not blockchain balances. BTC sending is not implemented, and live blockchain transaction flows have not been end-to-end tested. Do not use this deployment with valuable funds.
