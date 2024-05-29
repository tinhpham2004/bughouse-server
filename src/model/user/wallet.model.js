const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const walletSchema = new mongoose.Schema(
  {
    walletPrivateKey: {
      type: String
    },
    walletAddress: String,
    balance: {
      type: Number,
      default: 0,
    },
    enable: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
    autoCreate: false,
  },
);

walletSchema.plugin(Timezone);

module.exports = walletSchema;
