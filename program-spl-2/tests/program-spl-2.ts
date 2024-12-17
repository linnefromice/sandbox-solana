import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramSpl2 } from "../target/types/program_spl_2";
import { assert } from "chai";

describe("program-spl-2", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ProgramSpl2 as Program<ProgramSpl2>;

  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("root")],
    program.programId
  );

  it(".init", async () => {
    // Add your test here.
    await program.methods.init().rpc();
    const rootState = await program.account.rootState.fetch(pda);
    assert(rootState); // Check if account exists
  });
});
