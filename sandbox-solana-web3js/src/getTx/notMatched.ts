import * as borshByCoralXYZ from "@coral-xyz/borsh";
import * as borsh from "borsh";
import bs58 from "bs58";

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

// https://solscan.io/tx/3VZCqk372X55cfwaavSy85AqvgiLyb8RUc4uJbbgowuhDixP3RyTUGAzJ1kigMouVYBuJs3HU9GFdd7PyGw1nJhE
// >#6 - Raydium CPMM: swapBaseInput
// {
//   "amountIn": {
//     "type": "u64",
//     "data": "227700000"
//   },
//   "minimumAmountOut": {
//     "type": "u64",
//     "data": "21608804459"
//   }
// }
const schemaBorth: borsh.Schema = {
  struct: { amountIn: "u64", minimumAmountOut: "u64" },
};
const schemaCoralXYZ = borshByCoralXYZ.struct([
  borshByCoralXYZ.u64("amountIn"),
  borshByCoralXYZ.u64("minimumAmountOut"),
]);

const main = async () => {
  const data = "E73fXHPWvSR4YydNXLVmFCz61YzYYYsh1";
  const dataBuffer = Buffer.from(bs58.decode(data));

  const res = borsh.deserialize(schemaBorth, dataBuffer);
  console.log("> by borsh");
  console.dir(res, { depth: null });

  console.log("> by @coral-xyz/borsh");
  const res2 = schemaCoralXYZ.decode(dataBuffer);
  console.dir({
    amountIn: res2.amountIn.toString(),
    minimumAmountOut: res2.minimumAmountOut.toString(),
  });
};

main().catch(console.error);
