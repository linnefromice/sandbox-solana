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

describe("native-transfer", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const mintKeypair = anchor.web3.Keypair.generate();
  const fromKeypair = anchor.web3.Keypair.generate();
  const toKeypair = anchor.web3.Keypair.generate();

  // const provider = new anchor.AnchorProvider(connection, fromWallet, {
  //   commitment: "confirmed",
  // });

  // const program = anchor.workspace.ProgramSpl as Program<ProgramSpl>;

  it("native-transfer", async () => {
    console.log(`execute: .requestAirdrop`);
    const mintAccountAirdropSignature = await connection.requestAirdrop(
      mintKeypair.publicKey,
      LAMPORTS_PER_SOL
    );
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
      signature: mintAccountAirdropSignature,
      ...(await connection.getLatestBlockhash()),
    });
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
    console.log(`execute: .createMint`);
    const mintAccount = await SPL.createMint(
      connection,
      mintKeypair,
      mintKeypair.publicKey,
      null,
      decimals
    );

    console.log(`execute: .createAccount for from`);
    const fromTokenAccount = await SPL.createAccount(
      connection,
      fromKeypair,
      mintAccount,
      fromKeypair.publicKey
    );
    console.log(`execute: .createAccount for to`);
    const toTokenAccount = await SPL.createAccount(
      connection,
      toKeypair,
      mintAccount,
      toKeypair.publicKey
    );

    // NOTE: associated token account
    // console.log(`execute: .createAssociatedTokenAccount`);
    // const fromTokenAccountPK = await SPL.createAssociatedTokenAccount(
    //   connection,
    //   fromKeypair,
    //   mintAccount,
    //   wallet.publicKey
    // );
    // console.log(`fromTokenAccount: ${fromTokenAccountPK}`);
    // const toTokenAccountPK = await SPL.createAssociatedTokenAccount(
    //   connection,
    //   toKeypair,
    //   mintAccount,
    //   toKeypair.publicKey
    // );
    // console.log(`toTokenAccount: ${toTokenAccountPK}`);
    // const fromTokenAccountAddress = await SPL.getAssociatedTokenAddress(
    //   mintAccount,
    //   fromKeypair.publicKey
    // );
    // console.log(`fromTokenAccountAddress:`);
    // console.dir(fromTokenAccountAddress, { depth: null });
    // const toTokenAccountAddress = await SPL.getAssociatedTokenAddress(
    //   mintAccount,
    //   toKeypair.publicKey
    // );
    // console.log(`toTokenAccountAddress:`);
    // console.dir(toTokenAccountAddress, { depth: null });

    console.log(`execute: .mintTo for from`);
    await SPL.mintTo(
      connection,
      mintKeypair,
      mintAccount,
      fromTokenAccount,
      mintKeypair,
      3 * Math.pow(10, decimals)
    );
    console.log(`execute: .mintTo for to`);
    await SPL.mintTo(
      connection,
      mintKeypair,
      mintAccount,
      toTokenAccount,
      mintKeypair,
      5 * Math.pow(10, decimals)
    );

    const fromAccount = await SPL.getAccount(connection, fromTokenAccount);
    const toAccount = await SPL.getAccount(connection, toTokenAccount);
    assert.equal(
      fromAccount.amount.toString(),
      (3 * Math.pow(10, decimals)).toString()
    );
    assert.equal(
      toAccount.amount.toString(),
      (5 * Math.pow(10, decimals)).toString()
    );

    const amount = 2 * Math.pow(10, decimals);
    console.log(`execute: .transferToUser`);

    await SPL.transfer(
      connection,
      fromKeypair,
      fromTokenAccount,
      toTokenAccount,
      fromKeypair,
      amount
    );

    // NOTE: .transferToUser (not working)
    // const args = {
    //   from: fromKeypair.publicKey,
    //   fromTokenAccount: fromTokenAccount,
    //   toTokenAccount: toTokenAccount,
    //   // from: fromKeypair.publicKey,
    //   // to: toKeypair.publicKey,
    //   // mintAccount: mintAccount,
    // };
    // console.dir(args);
    // const sig = await program.methods
    //   .transferToUser(new BN(amount))
    //   .accounts(args)
    //   .signers([fromKeypair])
    //   .rpc();
    // console.log(`execute: confirm tx for .transferToUser`);
    // await connection.confirmTransaction({
    //   signature: sig,
    //   ...(await connection.getLatestBlockhash()),
    // });

    const _fromAccount = await SPL.getAccount(connection, fromTokenAccount);
    const _toAccount = await SPL.getAccount(connection, toTokenAccount);
    assert.equal(
      _fromAccount.amount.toString(),
      ((3 - 2) * Math.pow(10, decimals)).toString()
    );
    assert.equal(
      _toAccount.amount.toString(),
      ((5 + 2) * Math.pow(10, decimals)).toString()
    );
  });
});
