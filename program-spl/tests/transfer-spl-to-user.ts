import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramSpl } from "../target/types/program_spl";
import { assert } from "chai";
import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/base64";

describe("transfer-spl-to-user", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ProgramSpl as Program<ProgramSpl>;

  it("", async () => {});
});
