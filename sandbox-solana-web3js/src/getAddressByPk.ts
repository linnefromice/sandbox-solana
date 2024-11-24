import { Keypair } from "@solana/web3.js";
import "dotenv/config";

const privateKeyStr = process.env.PRIVATE_KEY;
const privateKey = JSON.parse(privateKeyStr as string);

const secretKey = Uint8Array.from(privateKey);

const keypair = Keypair.fromSecretKey(secretKey);
console.log(keypair.publicKey.toBase58());
