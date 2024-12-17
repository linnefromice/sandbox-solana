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
import { BN } from "bn.js";

describe("transfer_spl_to_user", () => {
  const fromKeypair = anchor.web3.Keypair.generate();
  const fromWallet = new anchor.Wallet(fromKeypair);
  const toKeypair = anchor.web3.Keypair.generate();
  const connection = anchor.AnchorProvider.env().connection;
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
    const mintAccount = await SPL.createMint(
      provider.connection,
      fromKeypair,
      fromKeypair.publicKey,
      null,
      decimals
    );

    const fromTokenAccountPK = await SPL.createAssociatedTokenAccount(
      connection,
      fromKeypair,
      mintAccount,
      fromWallet.publicKey
    );
    console.log(`fromTokenAccount: ${fromTokenAccountPK}`);
    const toTokenAccountPK = await SPL.createAssociatedTokenAccount(
      connection,
      toKeypair,
      mintAccount,
      toKeypair.publicKey
    );
    console.log(`toTokenAccount: ${toTokenAccountPK}`);

    const fromTokenAccountAddress = await SPL.getAssociatedTokenAddress(
      mintAccount,
      fromKeypair.publicKey
    );
    console.log(`fromTokenAccountAddress:`);
    console.dir(fromTokenAccountAddress, { depth: null });
    const toTokenAccountAddress = await SPL.getAssociatedTokenAddress(
      mintAccount,
      toKeypair.publicKey
    );
    console.log(`toTokenAccountAddress:`);
    console.dir(toTokenAccountAddress, { depth: null });
    await SPL.mintTo(
      provider.connection,
      fromKeypair,
      mintAccount,
      fromTokenAccountAddress,
      fromKeypair.publicKey,
      3 * Math.pow(10, decimals)
    );
    await SPL.mintTo(
      provider.connection,
      fromKeypair,
      mintAccount,
      toTokenAccountAddress,
      fromKeypair.publicKey,
      5 * Math.pow(10, decimals)
    );

    const fromAccount = await SPL.getAccount(
      connection,
      fromTokenAccountAddress
    );
    const toAccount = await SPL.getAccount(connection, toTokenAccountAddress);
    assert.equal(
      fromAccount.amount.toString(),
      (3 * Math.pow(10, decimals)).toString()
    );
    assert.equal(
      toAccount.amount.toString(),
      (5 * Math.pow(10, decimals)).toString()
    );

    console.log(`execute: .transferToUser`);
    const amount = 2 * Math.pow(10, decimals);
    const sig = await program.methods
      .transferToUser(new BN(amount))
      .accounts({
        from: fromWallet.publicKey,
        to: toKeypair.publicKey,
        fromAta: fromTokenAccountAddress,
        toAta: toTokenAccountAddress,
        mintAccount: mintAccount,
      })
      .rpc();
    console.log(`execute: confirm tx for .transferToUser`);
    await connection.confirmTransaction({
      signature: sig,
      ...(await connection.getLatestBlockhash()),
    });

    const _fromAccount = await SPL.getAccount(
      connection,
      fromTokenAccountAddress
    );
    console.dir(_fromAccount, { depth: null });
    const _toAccount = await SPL.getAccount(connection, toTokenAccountAddress);
    console.dir(_toAccount, { depth: null });
  });
});
