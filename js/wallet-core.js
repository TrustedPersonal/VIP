// Bundled modern-target ESM builds avoid incompatible transpiled class constructors
// in browser-only GitHub Pages deployments.
import { ethers } from 'https://esm.sh/ethers@6.15.0?bundle&target=es2022';
import * as bip39 from 'https://esm.sh/bip39@3.1.0?bundle&target=es2022';
import { Keypair, Connection, PublicKey, SystemProgram, Transaction } from 'https://esm.sh/@solana/web3.js@1.98.4?target=es2022';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from 'https://esm.sh/@solana/spl-token@0.4.14?bundle&target=es2022';
import * as ecc from 'https://esm.sh/tiny-secp256k1@2.2.3?bundle&target=es2022';
import BIP32Factory from 'https://esm.sh/bip32@4.0.0?bundle&target=es2022';
import * as bitcoin from 'https://esm.sh/bitcoinjs-lib@6.1.7?bundle&target=es2022';
import { Buffer } from 'https://esm.sh/buffer@6.0.3?bundle&target=es2022';

export { ethers };
const bip32 = BIP32Factory(ecc);
bitcoin.initEccLib(ecc);
export const NETWORKS={
 ETH:{name:'Ethereum',chainId:1,rpc:'https://ethereum-rpc.publicnode.com',symbol:'ETH',explorer:'https://etherscan.io'},
 BNB:{name:'BNB Smart Chain',chainId:56,rpc:'https://bsc-dataseed.binance.org',symbol:'BNB',explorer:'https://bscscan.com'},
 SOL:{name:'Solana',rpc:'https://api.mainnet-beta.solana.com',symbol:'SOL',explorer:'https://solscan.io'},
 BTC:{name:'Bitcoin',symbol:'BTC',explorer:'https://mempool.space'}
};
export const TOKENS={
 ETH:[
  {network:'ETH',symbol:'USDT',name:'Tether USD',address:'0xdAC17F958D2ee523a2206206994597C13D831ec7',decimals:6},
  {network:'ETH',symbol:'USDC',name:'USD Coin',address:'0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',decimals:6},
  {network:'ETH',symbol:'DAI',name:'Dai Stablecoin',address:'0x6B175474E89094C44Da98b954EedeAC495271d0F',decimals:18}
 ],
 BNB:[
  {network:'BNB',symbol:'USDT',name:'Tether USD',address:'0x55d398326f99059fF775485246999027B3197955',decimals:18},
  {network:'BNB',symbol:'USDC',name:'USD Coin',address:'0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',decimals:18},
 ],
 SOL:[]
};
const ERC20_ABI=['function balanceOf(address) view returns (uint256)','function decimals() view returns (uint8)','function symbol() view returns (string)','function name() view returns (string)','function transfer(address,uint256) returns (bool)'];
const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))),from64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function keyFromPassword(password,salt,usage){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,usage)}
export async function encryptVault(vault,password){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await keyFromPassword(password,salt,['encrypt']);const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(vault)));return {version:1,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:250000,salt:b64(salt),iv:b64(iv),ciphertext:b64(ct)} }
export async function decryptVault(blob,password){const salt=from64(blob.salt),iv=from64(blob.iv),key=await keyFromPassword(password,salt,['decrypt']);const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,from64(blob.ciphertext));return JSON.parse(new TextDecoder().decode(pt))}
export function generateMnemonic(){return bip39.generateMnemonic(256)}
export function validMnemonic(m){return bip39.validateMnemonic(String(m).trim().replace(/\s+/g,' '))}
async function hmacSha512(key,data){
 const cryptoKey=await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-512'},false,['sign']);
 return new Uint8Array(await crypto.subtle.sign('HMAC',cryptoKey,data));
}
async function deriveEd25519Slip10(seed,path){
 let I=await hmacSha512(new TextEncoder().encode('ed25519 seed'),seed);
 let key=I.slice(0,32),chain=I.slice(32);
 for(const part of path.split('/').slice(1)){
  if(part==='m'||!part)continue;
  const hardened=part.endsWith("'");
  if(!hardened)throw new Error('Solana derivation path must use hardened indices');
  const index=Number(part.slice(0,-1));
  if(!Number.isSafeInteger(index)||index<0||index>=0x80000000)throw new Error('Invalid Solana derivation index');
  const data=new Uint8Array(37);data[0]=0;data.set(key,1);new DataView(data.buffer).setUint32(33,index+0x80000000,false);
  I=await hmacSha512(chain,data);key=I.slice(0,32);chain=I.slice(32);
 }
 return key;
}
export async function deriveWallets(mnemonic){
 if(!validMnemonic(mnemonic))throw new Error('Invalid recovery phrase');
 const eth=ethers.HDNodeWallet.fromPhrase(mnemonic,undefined,"m/44'/60'/0'/0/0");
 const seed=await bip39.mnemonicToSeed(mnemonic);
 const solSeed=await deriveEd25519Slip10(seed,"m/44'/501'/0'/0'");
 const sol=Keypair.fromSeed(solSeed);
 // BIP-84 native SegWit Bitcoin account (bc1q...) derived from the same BIP-39 seed.
 const root=bip32.fromSeed(Buffer.from(seed));
 const btcNode=root.derivePath("m/84'/0'/0'/0/0");
 const btcPayment=bitcoin.payments.p2wpkh({pubkey:Buffer.from(btcNode.publicKey),network:bitcoin.networks.bitcoin});
 if(!btcPayment.address || !btcNode.privateKey) throw new Error('Bitcoin account derivation failed');
 return {mnemonic,evm:{address:eth.address,privateKey:eth.privateKey,path:"m/44'/60'/0'/0/0"},sol:{address:sol.publicKey.toBase58(),privateKey:b64(sol.secretKey),path:"m/44'/501'/0'/0'"},btc:{address:btcPayment.address,privateKey:btcNode.privateKey.toString('hex'),path:"m/84'/0'/0'/0/0",format:'native-segwit'}}
}
export function evmProvider(network){return new ethers.JsonRpcProvider(NETWORKS[network].rpc,NETWORKS[network].chainId,{staticNetwork:true})}
export function solConnection(){return new Connection(NETWORKS.SOL.rpc,'confirmed')}
export async function nativeBalance(network,address){if(network==='BTC'){const r=await fetch(`https://mempool.space/api/address/${encodeURIComponent(address)}`);if(!r.ok)throw new Error('Bitcoin balance service unavailable');const j=await r.json();const sat=(j.chain_stats?.funded_txo_sum||0)-(j.chain_stats?.spent_txo_sum||0)+(j.mempool_stats?.funded_txo_sum||0)-(j.mempool_stats?.spent_txo_sum||0);return {raw:sat,amount:sat/1e8,symbol:'BTC'}}if(network==='SOL'){const r=await solConnection().getBalance(new PublicKey(address));return {raw:r,amount:Number(r)/1e9,symbol:'SOL'}}const p=evmProvider(network),r=await p.getBalance(address);return {raw:r,amount:Number(ethers.formatEther(r)),symbol:NETWORKS[network].symbol}}
export async function tokenBalance(token,address){const p=evmProvider(token.network),c=new ethers.Contract(token.address,ERC20_ABI,p);const [raw,decimals,symbol,name]=await Promise.all([c.balanceOf(address),c.decimals().catch(()=>token.decimals),c.symbol().catch(()=>token.symbol),c.name().catch(()=>token.name)]);return {raw,amount:Number(ethers.formatUnits(raw,decimals)),decimals,symbol,name,address:token.address,network:token.network}}
export async function discoverEvmToken(network,address,tokenAddress){const p=evmProvider(network),c=new ethers.Contract(tokenAddress,ERC20_ABI,p);const [decimals,symbol,name,balance]=await Promise.all([c.decimals(),c.symbol(),c.name(),c.balanceOf(address)]);return {network,symbol,name,address:tokenAddress,decimals,raw:balance,amount:Number(ethers.formatUnits(balance,decimals))}}
export async function solTokenBalances(owner){const c=solConnection(),r=await c.getParsedTokenAccountsByOwner(new PublicKey(owner),{programId:new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')});return r.value.map(x=>{const info=x.account.data.parsed.info;const a=info.tokenAmount;return {network:'SOL',symbol:a.uiAmountString||a.amount,name:'SPL Token',address:info.mint,decimals:a.decimals,amount:Number(a.uiAmount||0),raw:a.amount}}).filter(x=>x.amount>0)}
export async function sendNative(network,secret,to,amount){if(network==='SOL'){const kp=Keypair.fromSecretKey(from64(secret));const c=solConnection(),lamports=Math.round(Number(amount)*1e9),ix=SystemProgram.transfer({fromPubkey:kp.publicKey,toPubkey:new PublicKey(to),lamports});const tx=new Transaction().add(ix);tx.feePayer=kp.publicKey;tx.recentBlockhash=(await c.getLatestBlockhash()).blockhash;tx.sign(kp);const sig=await c.sendRawTransaction(tx.serialize());await c.confirmTransaction(sig,'confirmed');return {hash:sig,explorer:`${NETWORKS.SOL.explorer}/tx/${sig}`}}
 const wallet=new ethers.Wallet(secret,evmProvider(network));const tx=await wallet.sendTransaction({to,value:ethers.parseEther(String(amount))});await tx.wait();return {hash:tx.hash,explorer:`${NETWORKS[network].explorer}/tx/${tx.hash}`}}
export async function sendErc20(network,secret,token,to,amount){const wallet=new ethers.Wallet(secret,evmProvider(network)),c=new ethers.Contract(token.address,ERC20_ABI,wallet);const tx=await c.transfer(to,ethers.parseUnits(String(amount),token.decimals));await tx.wait();return {hash:tx.hash,explorer:`${NETWORKS[network].explorer}/tx/${tx.hash}`}}
export async function sendSpl(secret,mint,to,amount,decimals){const kp=Keypair.fromSecretKey(from64(secret)),c=solConnection(),mintPk=new PublicKey(mint),dest=new PublicKey(to);const fromAta=await getAssociatedTokenAddress(mintPk,kp.publicKey),toAta=await getAssociatedTokenAddress(mintPk,dest);const tx=new Transaction();const info=await c.getAccountInfo(toAta);if(!info)tx.add(createAssociatedTokenAccountInstruction(kp.publicKey,toAta,dest,mintPk));const rawAmount=BigInt(Math.round(Number(amount)*10**Number(decimals)));tx.add(createTransferInstruction(fromAta,toAta,kp.publicKey,rawAmount));tx.feePayer=kp.publicKey;tx.recentBlockhash=(await c.getLatestBlockhash()).blockhash;tx.sign(kp);const sig=await c.sendRawTransaction(tx.serialize());await c.confirmTransaction(sig,'confirmed');return {hash:sig,explorer:`${NETWORKS.SOL.explorer}/tx/${sig}`}}
