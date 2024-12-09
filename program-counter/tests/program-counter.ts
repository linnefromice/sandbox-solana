import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramCounter } from "../target/types/program_counter";
import { assert } from 'chai';
import { BN } from "bn.js";

describe("program-counter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ProgramCounter as Program<ProgramCounter>;
  const provider = anchor.AnchorProvider.env();
  const user = provider.wallet;

  describe("initialize", () => {    
    it("success", async () => {
      const keypair = anchor.web3.Keypair.generate();

      await program.methods
      .initialize()
      .accounts({
        executor: keypair.publicKey,
        signer: user.publicKey
      })
      .signers([keypair])
      .rpc();

      // Fetch the account data to verify initialization
      const account = await program.account.accountStats.fetch(
        keypair.publicKey
      );
      assert(account.total.toNumber() == 0)
      assert(account.addCount.toNumber() == 0)
      assert(account.subCount.toNumber() == 0)
    });
    it("no data if not initialized", async () => {
      const keypair = anchor.web3.Keypair.generate();

      let isSucceed = false;
      try {
        await program.account.accountStats.fetch(
          keypair.publicKey
        );
        isSucceed = true;
      } catch (err) {
        assert(err.toString().includes("Account does not exist or has no data"));
      } finally {
        assert(!isSucceed);
      }
    })
    it("fail if already initialized", async () => {
      const keypair = anchor.web3.Keypair.generate();

      await program.methods
        .initialize()
        .accounts({
          executor: keypair.publicKey,
          signer: user.publicKey
        })
        .signers([keypair])
        .rpc();

      let isSucceed = false;
      try {
        await program.methods
          .initialize()
          .accounts({
            executor: keypair.publicKey,
            signer: user.publicKey
          })
          .signers([keypair])
          .rpc();
        isSucceed = true;
      } catch (err) {
        // TODO: customize error message
        assert(err.toString().includes("Simulation failed"));
      } finally {
        assert(!isSucceed);
      }
    });
  })
  describe("add", () => {
    // Generate a unique keypair for each executor
    const executorKeypair = anchor.web3.Keypair.generate();
    const otherExecutorKeypair = anchor.web3.Keypair.generate();

    before(async () => {
      await program.methods
        .initialize()
        .accounts({
          executor: executorKeypair.publicKey,
          signer: user.publicKey
        })
        .signers([executorKeypair])
        .rpc();
      await program.methods
        .initialize()
        .accounts({
          executor: otherExecutorKeypair.publicKey,
          signer: user.publicKey
        })
        .signers([otherExecutorKeypair])
        .rpc();
    })

    it("add for executor state, other state is not added", async () => {
      await program.methods.add({
        count: new BN(5),
        value: new BN(3)
      }).accounts({ executor: executorKeypair.publicKey }).rpc()

      const executorStats = await program.account.accountStats.fetch(
        executorKeypair.publicKey
      );
      assert(executorStats.total.toNumber() == 15)
      assert(executorStats.addCount.toNumber() == 5)
      assert(executorStats.subCount.toNumber() == 0)

      const notExecutorStats = await program.account.accountStats.fetch(
        otherExecutorKeypair.publicKey
      );
      assert(notExecutorStats.total.toNumber() == 0)
      assert(notExecutorStats.addCount.toNumber() == 0)
      assert(notExecutorStats.subCount.toNumber() == 0)
    })
  })
  describe("sub", async () => {
    // Generate a unique keypair for each executor
    const executorKeypair = anchor.web3.Keypair.generate();
    const otherExecutorKeypair = anchor.web3.Keypair.generate();

    before(async () => {
      await program.methods
        .initialize()
        .accounts({
          executor: executorKeypair.publicKey,
          signer: user.publicKey
        })
        .signers([executorKeypair])
        .rpc();
      await program.methods
        .initialize()
        .accounts({
          executor: otherExecutorKeypair.publicKey,
          signer: user.publicKey
        })
        .signers([otherExecutorKeypair])
        .rpc();
      
      await program.methods.add({
        count: new BN(10),
        value: new BN(10)
      }).accounts({ executor: executorKeypair.publicKey }).rpc()
      await program.methods.add({
        count: new BN(10),
        value: new BN(10)
      }).accounts({ executor: otherExecutorKeypair.publicKey }).rpc()
    })

    it("sub for executor state, other state is not subed", async () => {
      await program.methods.sub({
        count: new BN(8),
        value: new BN(5)
      }).accounts({ executor: executorKeypair.publicKey }).rpc()

      const executorStats = await program.account.accountStats.fetch(
        executorKeypair.publicKey
      );
      assert(executorStats.total.toNumber() == 60)
      assert(executorStats.addCount.toNumber() == 10)
      assert(executorStats.subCount.toNumber() == 8)

      const notExecutorStats = await program.account.accountStats.fetch(
        otherExecutorKeypair.publicKey
      );
      assert(notExecutorStats.total.toNumber() == 100)
      assert(notExecutorStats.addCount.toNumber() == 10)
      assert(notExecutorStats.subCount.toNumber() == 0)
    })
  })
});
