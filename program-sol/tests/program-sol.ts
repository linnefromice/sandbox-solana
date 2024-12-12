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
  describe(".deposit / .withdraw", () => {
    const keypair1 = anchor.web3.Keypair.generate();
    const payer1 = keypair1.publicKey;
    const keypair2 = anchor.web3.Keypair.generate();
    const payer2 = keypair2.publicKey;

    before(async () => {
      await callInitUser(keypair1, user.publicKey);
      await callInitUser(keypair2, user.publicKey);

      const sig = await provider.connection.requestAirdrop(
        user.publicKey,
        10 * SOL_UNIT
      );
      await provider.connection.confirmTransaction(sig);
    });

    it(".deposit", async () => {
      // NOTE: how to get balance
      //   const accountInfo = await program.provider.connection.getAccountInfo(publicKey);
      //   accountInfo.lamports
      //
      //   await program.provider.connection.getBalance(pda)

      const beforeBankInfo = await provider.connection.getAccountInfo(pda);
      const beforeUserInfo = await provider.connection.getAccountInfo(
        user.publicKey
      );

      {
        const sig = await program.methods
          .deposit(new BN(3 * SOL_UNIT))
          .accounts({
            executor: payer1,
            signer: user.publicKey,
          })
          .rpc();
        await provider.connection.confirmTransaction(sig);

        const bank = await getBank(pda);
        assert(bank.totalAmount.toNumber() == 3 * SOL_UNIT);
        const userStats1 = await getUserStats(payer1);
        assert(userStats1.totalAmount.toNumber() == 3 * SOL_UNIT);
        const userStats2 = await getUserStats(payer2);
        assert(userStats2.totalAmount.toNumber() == 0 * SOL_UNIT);

        const afterBankInfo = await provider.connection.getAccountInfo(pda);
        const afterUserInfo = await provider.connection.getAccountInfo(
          user.publicKey
        );
        console.log(`before > bankInfo.lamports: ${beforeBankInfo.lamports}`);
        console.log(`before > userInfo.lamports: ${beforeUserInfo.lamports}`);
        console.log(`after > bankInfo.lamports: ${afterBankInfo.lamports}`);
        console.log(`after > userInfo.lamports: ${afterUserInfo.lamports}`);
        const diffBank = afterBankInfo.lamports - beforeBankInfo.lamports;
        const diffUser = afterUserInfo.lamports - beforeUserInfo.lamports;
        console.log(`diff > bankInfo.lamports: ${diffBank}`);
        console.log(`diff > userInfo.lamports: ${diffUser}`);
        assert(diffBank == 3 * SOL_UNIT);
        // NOTE: consider fee
        assert(diffUser > -3 * SOL_UNIT * 1.001);
        assert(diffUser < -3 * SOL_UNIT * 1.0);
      }

      {
        const sig = await program.methods
          .deposit(new BN(6 * SOL_UNIT))
          .accounts({
            executor: payer2,
            signer: user.publicKey,
          })
          .rpc();
        await provider.connection.confirmTransaction(sig);

        const bank = await getBank(pda);
        assert(bank.totalAmount.toNumber() == 9 * SOL_UNIT);
        const userStats1 = await getUserStats(payer1);
        assert(userStats1.totalAmount.toNumber() == 3 * SOL_UNIT);
        const userStats2 = await getUserStats(payer2);
        assert(userStats2.totalAmount.toNumber() == 6 * SOL_UNIT);

        const afterBankInfo = await provider.connection.getAccountInfo(pda);
        const afterUserInfo = await provider.connection.getAccountInfo(
          user.publicKey
        );
        console.log(`before > bankInfo.lamports: ${beforeBankInfo.lamports}`);
        console.log(`before > userInfo.lamports: ${beforeUserInfo.lamports}`);
        console.log(`after > bankInfo.lamports: ${afterBankInfo.lamports}`);
        console.log(`after > userInfo.lamports: ${afterUserInfo.lamports}`);
        const diffBank = afterBankInfo.lamports - beforeBankInfo.lamports;
        const diffUser = afterUserInfo.lamports - beforeUserInfo.lamports;
        console.log(`diff > bankInfo.lamports: ${diffBank}`);
        console.log(`diff > userInfo.lamports: ${diffUser}`);
        assert(diffBank == 9 * SOL_UNIT);
        // NOTE: consider fee
        assert(diffUser > -9 * SOL_UNIT * 1.001);
        assert(diffUser < -9 * SOL_UNIT * 1.0);
      }
    });
    it(".withdraw", async () => {
      const beforeBankInfo = await provider.connection.getAccountInfo(pda);
      const beforeUserInfo = await provider.connection.getAccountInfo(
        user.publicKey
      );

      {
        const sig = await program.methods
          .withdraw(new BN(2 * SOL_UNIT))
          .accounts({
            executor: payer1,
            signer: user.publicKey,
          })
          .rpc();
        await provider.connection.confirmTransaction(sig);

        const bank = await getBank(pda);
        assert(bank.totalAmount.toNumber() == 7 * SOL_UNIT);
        const userStats1 = await getUserStats(payer1);
        assert(userStats1.totalAmount.toNumber() == 1 * SOL_UNIT);
        const userStats2 = await getUserStats(payer2);
        assert(userStats2.totalAmount.toNumber() == 6 * SOL_UNIT);

        const afterBankInfo = await provider.connection.getAccountInfo(pda);
        const afterUserInfo = await provider.connection.getAccountInfo(
          user.publicKey
        );
        console.log(`before > bankInfo.lamports: ${beforeBankInfo.lamports}`);
        console.log(`before > userInfo.lamports: ${beforeUserInfo.lamports}`);
        console.log(`after > bankInfo.lamports: ${afterBankInfo.lamports}`);
        console.log(`after > userInfo.lamports: ${afterUserInfo.lamports}`);
        const diffBank = afterBankInfo.lamports - beforeBankInfo.lamports;
        const diffUser = afterUserInfo.lamports - beforeUserInfo.lamports;
        console.log(`diff > bankInfo.lamports: ${diffBank}`);
        console.log(`diff > userInfo.lamports: ${diffUser}`);
        assert(diffBank == -2 * SOL_UNIT);
        // NOTE: consider fee
        assert(diffUser < 2 * SOL_UNIT * 1.0);
        assert(diffUser > 2 * SOL_UNIT * 0.999);
      }

      {
        const sig = await program.methods
          .withdraw(new BN(4 * SOL_UNIT))
          .accounts({
            executor: payer2,
            signer: user.publicKey,
          })
          .rpc();
        await provider.connection.confirmTransaction(sig);

        const bank = await getBank(pda);
        assert(bank.totalAmount.toNumber() == 3 * SOL_UNIT);
        const userStats1 = await getUserStats(payer1);
        assert(userStats1.totalAmount.toNumber() == 1 * SOL_UNIT);
        const userStats2 = await getUserStats(payer2);
        assert(userStats2.totalAmount.toNumber() == 2 * SOL_UNIT);

        const afterBankInfo = await provider.connection.getAccountInfo(pda);
        const afterUserInfo = await provider.connection.getAccountInfo(
          user.publicKey
        );
        console.log(`before > bankInfo.lamports: ${beforeBankInfo.lamports}`);
        console.log(`before > userInfo.lamports: ${beforeUserInfo.lamports}`);
        console.log(`after > bankInfo.lamports: ${afterBankInfo.lamports}`);
        console.log(`after > userInfo.lamports: ${afterUserInfo.lamports}`);
        const diffBank = afterBankInfo.lamports - beforeBankInfo.lamports;
        const diffUser = afterUserInfo.lamports - beforeUserInfo.lamports;
        console.log(`diff > bankInfo.lamports: ${diffBank}`);
        console.log(`diff > userInfo.lamports: ${diffUser}`);
        assert(diffBank == -6 * SOL_UNIT);
        // NOTE: consider fee
        assert(diffUser < 6 * SOL_UNIT * 1.0);
        assert(diffUser > 6 * SOL_UNIT * 0.999);
      }
    });
  });
});
