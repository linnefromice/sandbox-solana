import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramSpl2 } from "../target/types/program_spl_2";
import * as SPL from "@solana/spl-token";
import { assert } from "chai";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("program-spl-2", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ProgramSpl2 as Program<ProgramSpl2>;

  const ownerKeypair = anchor.web3.Keypair.generate();
  const mintUSDCKeypair = anchor.web3.Keypair.generate();
  const mintDAIKeypair = anchor.web3.Keypair.generate();
  const user1Keypair = anchor.web3.Keypair.generate();
  const user2Keypair = anchor.web3.Keypair.generate();

  it("test", async () => {
    // prepare
    //// airdrop
    const airdropSigs = await Promise.all(
      [
        ownerKeypair,
        mintUSDCKeypair,
        mintDAIKeypair,
        user1Keypair,
        user2Keypair,
      ].map((keypair) =>
        provider.connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL)
      )
    );
    await Promise.all(
      airdropSigs.map((sig) => provider.connection.confirmTransaction(sig))
    );

    // Generate Mint Token
    const decimals = 6;
    console.log(`execute: .createMint`);
    const USDC = await SPL.createMint(
      provider.connection,
      mintUSDCKeypair,
      mintUSDCKeypair.publicKey,
      null,
      decimals
    );
    const DAI = await SPL.createMint(
      provider.connection,
      mintDAIKeypair,
      mintDAIKeypair.publicKey,
      null,
      decimals
    );
    const user1USDC_TA = await SPL.createAccount(
      provider.connection,
      user1Keypair,
      USDC,
      user1Keypair.publicKey
    );
    const user2DAI_TA = await SPL.createAccount(
      provider.connection,
      user2Keypair,
      DAI,
      user2Keypair.publicKey
    );
    await SPL.mintTo(
      provider.connection,
      mintUSDCKeypair,
      USDC,
      user1USDC_TA,
      mintUSDCKeypair,
      3 * Math.pow(10, decimals)
    );
    await SPL.mintTo(
      provider.connection,
      mintDAIKeypair,
      DAI,
      user2DAI_TA,
      mintDAIKeypair,
      5 * Math.pow(10, decimals)
    );
    assert.equal(
      (
        await SPL.getAccount(provider.connection, user1USDC_TA)
      ).amount.toString(),
      (3 * Math.pow(10, decimals)).toString()
    );
    assert.equal(
      (
        await SPL.getAccount(provider.connection, user2DAI_TA)
      ).amount.toString(),
      (5 * Math.pow(10, decimals)).toString()
    );

    // .initialize
    await program.methods
      .initialize()
      .accounts({
        mintAccount: USDC,
        signer: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();
    const [rootUSDCPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("root"), USDC.toBuffer()],
      program.programId
    );
    assert(
      (
        await program.account.rootState.fetch(rootUSDCPda)
      ).totalAmount.toNumber() == 0
    ); // Check if account exists

    await program.methods
      .initialize()
      .accounts({
        mintAccount: DAI,
        signer: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();
    const [rootDAIPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("root"), DAI.toBuffer()],
      program.programId
    );
    assert(
      (
        await program.account.rootState.fetch(rootDAIPda)
      ).totalAmount.toNumber() == 0
    ); // Check if account exists
  });
});