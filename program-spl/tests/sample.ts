import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramSpl } from "../target/types/program_spl";
import { assert } from "chai";
import * as base64 from "@coral-xyz/anchor/dist/cjs/utils/bytes/base64";

describe("sample", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ProgramSpl as Program<ProgramSpl>;

  it("hello", async () => {
    // Add your test here.
    const tx = await program.methods.hello().rpc();
    console.log("Your transaction signature", tx);
    await program.provider.connection.confirmTransaction(tx, "confirmed");
    const status = await program.provider.connection.getSignatureStatus(tx);
    console.dir(status);
    const parsedTx = await program.provider.connection.getTransaction(tx, {
      commitment: "confirmed",
    });
    // console.dir(parsedTx, { depth: null });
    const returnData = (parsedTx.meta as any).returnData.data as string[];
    const decoded = Buffer.from(base64.decode(returnData[0]));
    console.log(decoded);
    console.log(decoded.toString());
    const actualData = decoded.subarray(4);
    console.log(actualData);
    console.log(actualData.toString());
    assert.equal(actualData.toString(), "Hello,world!");
    // assert.equal(decoded.toString(), "Hello,world!");
    // AssertionError: expected '\f\u0000\u0000\u0000Hello,world!' to equal 'Hello,world!'
  });
});
