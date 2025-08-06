import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: "0UOKwMZTkrlew0L-7t0dh",
  network: Network.MATIC_AMOY, // Use Network.MATIC_MAINNET for Polygon mainnet
};

const alchemy = new Alchemy(settings);

async function getLatestBlock() {
  const block = await alchemy.core.getBlockNumber();
  console.log("Latest Block Number:", block);
}

getLatestBlock();
