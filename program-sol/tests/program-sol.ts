import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramSol } from "../target/types/program_sol";
import { assert } from "chai";
import { BN } from "bn.js";

const SOL_UNIT = 10 ** 9;

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
  it(".deposit", async () => {
    const keypair = anchor.web3.Keypair.generate();
    const payer = keypair.publicKey;
    await callInitUser(keypair, user.publicKey);

    const __bankInfo = await program.provider.connection.getAccountInfo(pda);
    console.log(
      `before (before airdrop) > bankInfo.lamports: ${__bankInfo.lamports}`
    );
    const __payerInfo = await program.provider.connection.getAccountInfo(payer);
    console.log(
      `before (before airdrop) > payerInfo.lamports: ${__payerInfo.lamports}`
    );

    await provider.connection.requestAirdrop(payer, 4 * SOL_UNIT);

    const _bankInfo = await program.provider.connection.getAccountInfo(pda);
    console.log(`before > bankInfo.lamports: ${_bankInfo.lamports}`);
    const _payerInfo = await program.provider.connection.getAccountInfo(payer);
    console.log(`before > payerInfo.lamports: ${_payerInfo.lamports}`);

    await program.methods
      .deposit(new BN(3 * SOL_UNIT))
      .accounts({ executor: payer })
      .rpc();

    const bank = await getBank(pda);
    assert(bank.totalAmount.toNumber() == 3 * SOL_UNIT);
    const bankInfo = await program.provider.connection.getAccountInfo(pda);
    console.log(`after > bankInfo.lamports: ${bankInfo.lamports}`);
    // assert(bankInfo.lamports == 3 * SOL_UNIT);
    const userStats = await getUserStats(payer);
    assert(userStats.totalAmount.toNumber() == 3 * SOL_UNIT);
    const payerInfo = await program.provider.connection.getAccountInfo(payer);
    console.log(`after > payerInfo.lamports: ${payerInfo.lamports}`);
    // assert(payerInfo.lamports == 2 * SOL_UNIT);
  });
});
