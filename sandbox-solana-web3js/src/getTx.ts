import * as borsh from "borsh";
import bs58 from "bs58";

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

const schema: borsh.Schema = {
  struct: { discriminator: "u8", amountIn: "u64", minimumAmountOut: "u64" },
};

const main = async () => {
  const data = "66U3R4Yr2dvgigUqnkjRKqR";
  const dataBuffer = Buffer.from(bs58.decode(data));

  const res = borsh.deserialize(schema, dataBuffer);
  console.dir(res, { depth: null });
};

main().catch(console.error);
