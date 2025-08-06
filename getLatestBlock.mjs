import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: "0UOKwMZTkrlew0L-7t0dh",
  network: Network.MATIC_AMOY, // Use Network.MATIC_MAINNET for Polygon mainnet
};

const alchemy = new Alchemy(settings);

async function getLatestBlock() {
  try {
    console.log("Connecting to Alchemy Amoy testnet...");
    const block = await alchemy.core.getBlockNumber();
    console.log("Latest Block Number:", block);
  } catch (err) {
    console.error("Failed to fetch latest block number:", err);
  }
}

getLatestBlock();
