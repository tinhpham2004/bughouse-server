const ethers = require("ethers");

// Configuration
const rpcUrl = process.env.RPC_URL; // Use environment variable for RPC URL
const chainId = parseInt(process.env.CHAIN_ID || "1", 10); // Use environment variable for Chain ID
const provider = new ethers.providers.JsonRpcProvider(rpcUrl, { chainId });
const JSON_PROVIDER = new ethers.providers.JsonRpcProvider();

// Initiallize Smart House contract
const smartHouseAbi = require("../web3/smart-house-abi.json");
const smartHouseContract = new ethers.Contract(
  ethers.constants.AddressZero,
  smartHouseAbi,
  provider
);
const ifaceSmartHouse = ethers.Interface.from(smartHouseAbi);

const retryWithDelay = async (fn, retries = 10, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithDelay(fn, retries - 1, delay);
  }
};

const smartHouseTopics = {
  SetRoomForRent: ifaceSmartHouse.getEvent("SetRoomForRent").topicHash,
  RentStarted: ifaceSmartHouse.getEvent("RentStarted").topicHash,
  PayForRent: ifaceSmartHouse.getEvent("PayForRent").topicHash,
  RentEnded: ifaceSmartHouse.getEvent("RentEnded").topicHash,
  EndRentWithPenalty: ifaceSmartHouse.getEvent("EndRentWithPenalty").topicHash,
  ReOpen: ifaceSmartHouse.getEvent("ReOpen").topicHash,
  TransferBalance: ifaceSmartHouse.getEvent("TransferBalance").topicHash,
  ExtendRentalRoom: ifaceSmartHouse.getEvent("ExtendRentalRoom").topicHash,
};

const getBlockNumber = async () => {
  const blockNumber = await provider.getBlockNumber();
  return blockNumber - 10; // Offset
};

const getBlock = async (blockNumber) => {
  return retryWithDelay(() => provider.getBlock(blockNumber));
};

const getTransaction = async (txHash) => {
  return retryWithDelay(() => provider.getTransaction(txHash));
};

const readContract = async (contract, functionName, params) => {
  return retryWithDelay(() => contract[functionName](...params));
};

const isContract = async (address) => {
  const code = await provider.getCode(address);
  return code !== "0x";
};

const getNakedAddress = (address) => address.toLowerCase().replace("0x", "");

const _this = {
  smartHouseContract,
  smartHouseTopics,
  ifaceSmartHouse,
  getBlockNumber,
  getBlock,
  getTransaction,
  readContract,
  isContract,
  getNakedAddress,
};

module.exports = _this;
