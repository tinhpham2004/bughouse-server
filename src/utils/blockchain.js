const axios = require("axios");
const _this = {};
const { BigNumber } = require("@ethersproject/bignumber");
const BN = require("bignumber.js");
const web3Utils = require("web3").utils;
// const calculateNumber = (number1, number2, method, resultType = "string") => {
//     const BN1 = BN(number1);
//     const BN2 = BN(number2);
//     if (method === "div" && BN2.isLessThan(0)) {
//       throw new Error("Supper math error div by zero");
//     }
//     if (resultType === "number") {
//       return BN1[method](BN2).toNumber();
//     }
//     return BN1[method](BN2).toFixed();
//   };

_this.getRate = async () => {
  const [usdRateResponse, ethRateResponse] = await Promise.all([
    axios.get("https://api.coinbase.com/v2/exchange-rates?currency=VND"),
    axios.get("https://api.coinbase.com/v2/exchange-rates?currency=ETH"),
  ]);

  const usdRate = 1;
  const ethRate = parseFloat(ethRateResponse.data.data.rates.USD);

  console.log(`USD Rate: ${usdRate}`);
  console.log(`ETH Rate: ${ethRate}`);

  return { usdRate, ethRate };
};

_this.vndToEth = async (vndAmount) => {
  const { usdRate, ethRate } = await _this.getRate();
  const vndToUsdRate = 1 / usdRate;
  const usdToEthRate = 1 / ethRate;
  const vndToEthRate = vndToUsdRate * usdToEthRate;

  console.log(`VND to USD Rate: ${vndToUsdRate}`);
  console.log(`USD to ETH Rate: ${usdToEthRate}`);
  console.log(`VND to ETH Rate: ${vndToEthRate}`);

  const ethAmount = (vndAmount / 100) * vndToEthRate;

  return ethAmount;
};

// convert from 100.000 vnd to 0.0010 ETH

const convertBalanceToWei = (amount) => {
  return web3.utils.toWei(amount.toString(), "ether");
};

_this.ethToVND = async (ethAmount) => {
  const { usdRate, ethRate } = await _this.getRate();
  const usdAmount = ethAmount * ethRate;
  const vndAmount = usdAmount / usdRate;
  return vndAmount;
};

_this.calculateNumber = (number1, number2, method, resultType = "string") => {
  const BN1 = BN(number1);
  const BN2 = BN(number2);
  if (method === "div" && BN2.isLessThan(0)) {
    throw new Error("Supper math error div by zero");
  }
  if (resultType === "number") {
    return BN1[method](BN2).toNumber();
  }
  return BN1[method](BN2).toFixed();
};

_this.convertBalanceToWei = (balance, decimals = 18) => {
  const wei = _this
    .calculateNumber(
      balance,
      _this.calculateNumber(10, decimals, "pow", "string"),
      "times",
      "string"
    )
    .split(".")[0];
  return parseFloat(wei);
};

_this.convertBalanceWeiToETH = (balance, decimals = 18) => {
  return _this.calculateNumber(
    balance,
    _this.calculateNumber(10, decimals, "pow", "string"),
    "div",
    "number"
  );
};
module.exports = _this;
