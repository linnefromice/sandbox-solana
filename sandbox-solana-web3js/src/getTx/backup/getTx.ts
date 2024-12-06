import {
  clusterApiUrl,
  Connection,
  PartiallyDecodedInstruction,
} from "@solana/web3.js";
import * as borsh from "borsh";
import bs58 from "bs58";

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

const schemaSwapBaseInput: borsh.Schema = {
  struct: { amountIn: "u64", minimumAmountOut: "u64" },
};

function parseLittleEndian(buffer: Uint8Array, offset = 0): bigint {
  const view = new DataView(buffer.buffer, offset, 8); // 8 バイトの `u64`
  return view.getBigUint64(0, true); // true は Little Endian
}

const main = async () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const txSig =
    "3VZCqk372X55cfwaavSy85AqvgiLyb8RUc4uJbbgowuhDixP3RyTUGAzJ1kigMouVYBuJs3HU9GFdd7PyGw1nJhE";
  // txSig = "3TZR1jg6dQmgx8376LpnebaRUiGjUvGwYiHVYAWE3eBgZ92aFarRbtjAbdYn9TevLnfAXRcib7m5Be2G5WSgzkbK"

  // https://solana.com/docs/advanced/versions#how-to-set-max-supported-version
  // const parsedTx = await connection.getTransaction(txSig, { maxSupportedTransactionVersion: 0 });
  const tx = await connection.getParsedTransaction(txSig, {
    maxSupportedTransactionVersion: 0,
  });
  // console.dir(tx, { depth: null });
  tx?.transaction.message.instructions.forEach((inst, index) => {
    console.log(`Instruction ${index}:`);
    console.log(`Program ID: ${inst.programId.toBase58()}`);
    if (
      inst.programId.toBase58() ==
      "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
    ) {
      const _inst = inst as PartiallyDecodedInstruction;
      console.log(`Data: ${_inst.data}`);
      // https://solscan.io/account/CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C#anchorProgramIdl
      // https://solscan.io/tx/3TZR1jg6dQmgx8376LpnebaRUiGjUvGwYiHVYAWE3eBgZ92aFarRbtjAbdYn9TevLnfAXRcib7m5Be2G5WSgzkbK
      // const swapBase = borsh.deserialize(
      //   schemaSwapBaseInput,
      //   Buffer.from(bs58.decode(_inst.data)),
      // );
      // console.log(`Swap Base: ${JSON.stringify(swapBase)}`);

      console.log(_inst.data);
      console.log(
        borsh.deserialize(
          schemaSwapBaseInput,
          Buffer.from(bs58.decode("E73fXHPWvSR4YydNXLVmFCz61YzYYYsh1")),
        ),
      );
      // console.log(
      //   borsh.deserialize(
      //     schemaSwapBaseInput,
      //     Buffer.from(bs58.decode("j75a2sQeM94gbZINAAAAAGsw")),
      //   ),
      // );

      const dataBuffer = Buffer.from(
        bs58.decode("E73fXHPWvSR4YydNXLVmFCz61YzYYYsh1"),
      );
      const amountIn = parseLittleEndian(dataBuffer, 0); // 最初の 8 バイト
      const minimumAmountOut = parseLittleEndian(dataBuffer, 8); // 次の 8 バイト
      console.log({ amountIn, minimumAmountOut });
    }
  });
};

main().catch(console.error);
