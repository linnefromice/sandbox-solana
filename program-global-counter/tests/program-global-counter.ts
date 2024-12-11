import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramGlobalCounter } from "../target/types/program_global_counter";
import { assert } from 'chai';
import { BN } from "bn.js";

describe("program-global-counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ProgramGlobalCounter as Program<ProgramGlobalCounter>;
  const user = provider.wallet;

  const callInitialize = async (
    keypair: anchor.web3.Keypair,
    signer: anchor.Address,
  ) => {
    await program.methods
      .initialize()
      .accounts({
        executor: keypair.publicKey,
        signer: signer
      })
      .signers([keypair])
      .rpc();
  }

  const callAdd = async (input: {
    executor: anchor.Address,
    count: number,
    value: number
  }) => {
    const { executor, count, value } = input;
    await program.methods.add({
      count: new BN(count),
      value: new BN(value)
    }).accounts({ executor }).rpc()
  }

  const getStats = async (address: anchor.Address) => {
    return await program.account.stats.fetch(
      address
    );
  }

  // ref: https://solana.com/developers/courses/onchain-development/anchor-pdas#testing
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  )

  it("initialize", async () => {
    const keypair = anchor.web3.Keypair.generate();
    
    await callInitialize(keypair, user.publicKey);
    const userStats = await getStats(keypair.publicKey);
    assert(userStats.total.toNumber() == 0)
    assert(userStats.addCount.toNumber() == 0)
    assert(userStats.subCount.toNumber() == 0)
  });
  it("initProgram", async () => {
    const tx = await program.methods
      .initProgram()
      .rpc();
    console.log("Your transaction signature", tx);
    const globalStats = await getStats(pda);
    assert(globalStats.total.toNumber() == 500)
    assert(globalStats.addCount.toNumber() == 0)
    assert(globalStats.subCount.toNumber() == 0)
  });
  it("add", async () => {
    const keypairA = anchor.web3.Keypair.generate();
    const keypairB = anchor.web3.Keypair.generate();

    await callInitialize(keypairA, user.publicKey);
    await callInitialize(keypairB, user.publicKey);
    
    await callAdd({
      executor: keypairA.publicKey,
      value: 20,
      count: 5,
    })
    await callAdd({
      executor: keypairB.publicKey,
      value: 50,
      count: 3,
    })
    const globalStats = await getStats(pda);
    const statsA = await getStats(keypairA.publicKey);
    const statsB = await getStats(keypairB.publicKey);
    assert(globalStats.total.toNumber() == 500 + 100 + 150)
    assert(globalStats.addCount.toNumber() == 8)
    assert(globalStats.subCount.toNumber() == 0)
    assert(statsA.total.toNumber() == 100)
    assert(statsA.addCount.toNumber() == 5)
    assert(statsA.subCount.toNumber() == 0)
    assert(statsB.total.toNumber() == 150)
    assert(statsB.addCount.toNumber() == 3)
    assert(statsB.subCount.toNumber() == 0)
  })
});
