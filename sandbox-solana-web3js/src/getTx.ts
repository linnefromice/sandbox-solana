import { clusterApiUrl, Connection } from "@solana/web3.js";

const main = async () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const txSig =
    "3TZR1jg6dQmgx8376LpnebaRUiGjUvGwYiHVYAWE3eBgZ92aFarRbtjAbdYn9TevLnfAXRcib7m5Be2G5WSgzkbK";
  // txSig = "3VZCqk372X55cfwaavSy85AqvgiLyb8RUc4uJbbgowuhDixP3RyTUGAzJ1kigMouVYBuJs3HU9GFdd7PyGw1nJhE"

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
      const _inst = inst as any;
      console.log(`Data: ${Buffer.from(_inst.data).toString("base64")}`);
      // https://solscan.io/account/CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C#anchorProgramIdl
      // https://solscan.io/tx/3TZR1jg6dQmgx8376LpnebaRUiGjUvGwYiHVYAWE3eBgZ92aFarRbtjAbdYn9TevLnfAXRcib7m5Be2G5WSgzkbK
    }
  });
};

main().catch(console.error);
