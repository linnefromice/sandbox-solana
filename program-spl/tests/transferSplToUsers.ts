import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramSpl } from "../target/types/program_spl";
import * as SPL from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { assert } from "chai";

describe("transfer_spl_to_user", () => {
  const fromKeypair = anchor.web3.Keypair.generate();
  const toKeypair = anchor.web3.Keypair.generate();
  const connection = anchor.AnchorProvider.env().connection;
  const fromWallet = new anchor.Wallet(fromKeypair);
  const provider = new anchor.AnchorProvider(connection, fromWallet, {
    commitment: "confirmed",
  });

  const program = anchor.workspace.ProgramSpl as Program<ProgramSpl>;

  it("transfer_to_user", async () => {
    const fromAirdropSignature = await connection.requestAirdrop(
      fromKeypair.publicKey,
      LAMPORTS_PER_SOL
    );
    const toAirdropSignature = await connection.requestAirdrop(
      toKeypair.publicKey,
      LAMPORTS_PER_SOL
    );
    // Wait for airdrop confirmation
    await connection.confirmTransaction({
      signature: fromAirdropSignature,
      ...(await connection.getLatestBlockhash()),
    });
    await connection.confirmTransaction({
      signature: toAirdropSignature,
      ...(await connection.getLatestBlockhash()),
    });

    // initialize
    const decimals = 8;
    const mint = await SPL.createMint(
      program.provider.connection,
      fromKeypair,
      fromKeypair.publicKey,
      null,
      decimals
    );

    const fromTokenAccountPK = await SPL.createAssociatedTokenAccount(
      connection,
      fromKeypair,
      mint,
      fromWallet.publicKey
    );
    console.log(`fromTokenAccount: ${fromTokenAccountPK}`);
    const toTokenAccountPK = await SPL.createAssociatedTokenAccount(
      connection,
      toKeypair,
      mint,
      toKeypair.publicKey
    );
    console.log(`toTokenAccount: ${toTokenAccountPK}`);

    const fromTokenAccountAddress = await SPL.getAssociatedTokenAddress(
      mint,
      fromKeypair.publicKey
    );
    console.log(`fromTokenAccountAddress:`);
    console.dir(fromTokenAccountAddress, { depth: null });
    const toTokenAccountAddress = await SPL.getAssociatedTokenAddress(
      mint,
      toKeypair.publicKey
    );
    console.log(`toTokenAccountAddress:`);
    console.dir(toTokenAccountAddress, { depth: null });
    await SPL.mintTo(
      program.provider.connection,
      fromKeypair,
      mint,
      fromTokenAccountAddress,
      fromKeypair.publicKey,
      1 * Math.pow(10, decimals)
    );
    await SPL.mintTo(
      program.provider.connection,
      fromKeypair,
      mint,
      toTokenAccountAddress,
      fromKeypair.publicKey,
      5 * Math.pow(10, decimals)
    );

    console.dir(await SPL.getAccount(connection, fromTokenAccountAddress));
    console.dir(await SPL.getAccount(connection, toTokenAccountAddress));
  });
});
