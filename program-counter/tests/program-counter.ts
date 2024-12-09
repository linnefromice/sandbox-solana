import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramCounter } from "../target/types/program_counter";
import { assert } from 'chai';

describe("program-counter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ProgramCounter as Program<ProgramCounter>;
  const provider = anchor.AnchorProvider.env();
  const user = provider.wallet;

  // Generate a unique keypair for each executor
  const notInitializedExecutorKeypair = anchor.web3.Keypair.generate();
  const otherExecutorKeypair = anchor.web3.Keypair.generate();

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
    it("add for executor state, other state is not added", async () => {})
    it("fail if not initialized", async () => {})
  })
  describe("sub", async () => {
    it("sub for executor state, other state is not subed", async () => {})
    it("fail if not initialized", async () => {})
  })
});
