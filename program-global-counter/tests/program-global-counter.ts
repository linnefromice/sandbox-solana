import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramGlobalCounter } from "../target/types/program_global_counter";
import { assert } from 'chai';

describe("program-global-counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ProgramGlobalCounter as Program<ProgramGlobalCounter>;
  const user = provider.wallet;
  const keypair = anchor.web3.Keypair.generate();

  it("initialize", async () => {
    await program.methods
      .initialize()
      .accounts({
        executor: keypair.publicKey,
        signer: user.publicKey
      })
      .signers([keypair])
      .rpc();

    const userStats = await program.account.stats.fetch(
      keypair.publicKey
    );
    assert(userStats.total.toNumber() == 0)
    assert(userStats.addCount.toNumber() == 0)
    assert(userStats.subCount.toNumber() == 0)
  });
  it("initProgram", async () => {
    const tx = await program.methods
      .initProgram()
      .rpc();
    console.log("Your transaction signature", tx);
    // ref: https://solana.com/developers/courses/onchain-development/anchor-pdas#testing
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      program.programId
    )
    const globalStats = await program.account.stats.fetch(pda);
    assert(globalStats.total.toNumber() == 500)
    assert(globalStats.addCount.toNumber() == 0)
    assert(globalStats.subCount.toNumber() == 0)
  });
});
