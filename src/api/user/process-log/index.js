const ethers = require("ethers");
const { Chain: ChainModel } = require("../../../model/chain");

const CHECK_BLOCK_TIMEOUT = 3000;
const BLOCK_LIMIT = 1000;
const FIVE_MINUTES = 5 * 60 * 1000;
const ETHEREUM_CHAIN_IDS = [1, 5];
