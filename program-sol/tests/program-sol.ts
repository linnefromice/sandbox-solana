import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramSol } from "../target/types/program_sol";
import { assert } from "chai";

describe("program-sol", () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);
  const program = anchor.workspace.ProgramSol as Program<ProgramSol>;
  const user = provider.wallet;

  // ref: https://solana.com/developers/courses/onchain-development/anchor-pdas#testing
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [],
    program.programId
  );

  const callInitUser = async (
    keypair: anchor.web3.Keypair,
    signer: anchor.Address
  ) => {
    await program.methods
      .initUser()
      .accounts({
        executor: keypair.publicKey,
        signer: signer,
      })
      .signers([keypair])
      .rpc();
  };

  const getBank = async (address: anchor.Address) => {
    return await program.account.bank.fetch(address);
  };

  const getUserStats = async (address: anchor.Address) => {
    return await program.account.userStats.fetch(address);
  };

  it(".initProgram", async () => {
    await program.methods.initProgram().rpc();
    const bank = await getBank(pda);
    assert(bank.totalAmount.toNumber() == 0);
  });
  it(".initUser", async () => {
    const keypair = anchor.web3.Keypair.generate();
    await callInitUser(keypair, user.publicKey);
    const userStats = await getUserStats(keypair.publicKey);
    assert(userStats.totalAmount.toNumber() == 0);
  });
});
