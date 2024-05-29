require("dotenv").config();
const SHA256 = require("crypto-js/sha256");

const sailMessage = process.env.MESSAGE;

const crypto = {
  hash: (password) => SHA256(sailMessage + password).toString(),
  match: (hashedPassword, url8Password) => hashedPassword === crypto.hash(url8Password),
};

module.exports = crypto;
