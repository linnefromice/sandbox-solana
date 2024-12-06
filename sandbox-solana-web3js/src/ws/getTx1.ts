import * as borsh from "@coral-xyz/borsh";
import bs58 from "bs58";

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

const schema = borsh.struct([
  borsh.u8("discriminator"),
  borsh.u64("amountIn"),
  borsh.u64("minimumAmountOut"),
]);

const main = async () => {
  // solscan.io/tx/58MvMBdd21ynUfEf7No2adBGqyqVR9axMKPRoJ1fMZDnKt6aLUJ9Ev7eRE9w1Jp9tEnFEyD5yQwNoNC8A8VpeqHv // 1.6
  const data = "66U3R4Yr2dvgigUqnkjRKqR";
  const dataBuffer = Buffer.from(bs58.decode(data));
  const res = schema.decode(dataBuffer);
  // -> Succeeded
  console.dir({
    discriminator: res.discriminator.toString(),
    amountIn: res.amountIn.toString(),
    minimumAmountOut: res.minimumAmountOut.toString(),
  });
};

main().catch(console.error);
