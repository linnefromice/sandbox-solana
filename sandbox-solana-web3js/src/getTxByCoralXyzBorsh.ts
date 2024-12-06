import * as borsh from "@coral-xyz/borsh";
import bs58 from "bs58";

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

const schemaSwapBaseInput = borsh.struct([
  borsh.u64("amountIn"),
  borsh.u64("minimumAmountOut"),
]);

const main = async () => {
  // https://solana.fm/tx/3VZCqk372X55cfwaavSy85AqvgiLyb8RUc4uJbbgowuhDixP3RyTUGAzJ1kigMouVYBuJs3HU9GFdd7PyGw1nJhE?cluster=mainnet-alpha
  const data = "E73fXHPWvSR4YydNXLVmFCz61YzYYYsh1";
  const dataBuffer = Buffer.from(bs58.decode(data));
  const res = schemaSwapBaseInput.decode(dataBuffer);
  console.dir({
    amountIn: res.amountIn.toString(),
    minimumAmountOut: res.minimumAmountOut.toString(),
  });

  // https://solana.fm/tx/3TZR1jg6dQmgx8376LpnebaRUiGjUvGwYiHVYAWE3eBgZ92aFarRbtjAbdYn9TevLnfAXRcib7m5Be2G5WSgzkbK?cluster=mainnet-alpha
  const data2 = "E73fXHPWvSRKYwxM2Akmy7GVPYMTvxTfM";
  const dataBuffer2 = Buffer.from(bs58.decode(data2));
  const res2 = schemaSwapBaseInput.decode(dataBuffer2);
  console.dir({
    amountIn: res2.amountIn.toString(),
    minimumAmountOut: res2.minimumAmountOut.toString(),
  });
};

main().catch(console.error);
