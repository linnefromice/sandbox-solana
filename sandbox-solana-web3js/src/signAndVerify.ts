import { Keypair } from "@solana/web3.js";
import "dotenv/config";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

// Recover keypair from secret key
const privateKeyStr = process.env.PRIVATE_KEY;
const privateKey = JSON.parse(privateKeyStr as string);
const secretKey = Uint8Array.from(privateKey);
const keypair = Keypair.fromSecretKey(secretKey);

const rawMsg = "Hello, Solana!";
const messageBytes = decodeUTF8(rawMsg);
const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
const result = nacl.sign.detached.verify(
  messageBytes,
  signature,
  keypair.publicKey.toBytes(),
);
console.log(result);
