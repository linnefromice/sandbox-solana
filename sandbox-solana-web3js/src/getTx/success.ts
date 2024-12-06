import * as borshByCoralXYZ from "@coral-xyz/borsh";
import * as borsh from "borsh";
import bs58 from "bs58";

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

// https://solscan.io/tx/58MvMBdd21ynUfEf7No2adBGqyqVR9axMKPRoJ1fMZDnKt6aLUJ9Ev7eRE9w1Jp9tEnFEyD5yQwNoNC8A8VpeqHv
// >#1.6 - Raydium Liquidity Pool V4: raydium:swap
// {
//   "discriminator": {
//     "type": "u8",
//     "data": 9
//   },
//   "amountIn": {
//     "type": "u64",
//     "data": 302887059032
//   },
//   "minimumAmountOut": {
//     "type": "u64",
//     "data": 0
//   }
// }
const schemaBorth: borsh.Schema = {
  struct: { discriminator: "u8", amountIn: "u64", minimumAmountOut: "u64" },
};
const schemaCoralXYZ = borshByCoralXYZ.struct([
  borshByCoralXYZ.u8("discriminator"),
  borshByCoralXYZ.u64("amountIn"),
  borshByCoralXYZ.u64("minimumAmountOut"),
]);

const main = async () => {
  const data = "66U3R4Yr2dvgigUqnkjRKqR";
  const dataBuffer = Buffer.from(bs58.decode(data));

  const res = borsh.deserialize(schemaBorth, dataBuffer);
  console.log("> by borsh");
  console.dir(res, { depth: null });

  console.log("> by @coral-xyz/borsh");
  const res2 = schemaCoralXYZ.decode(dataBuffer);
  console.dir({
    discriminator: res2.discriminator.toString(),
    amountIn: res2.amountIn.toString(),
    minimumAmountOut: res2.minimumAmountOut.toString(),
  });
};

main().catch(console.error);
