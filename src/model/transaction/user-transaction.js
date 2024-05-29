const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema.Types;

const userTransaction = new mongoose.Schema(
  {
    userId: { type: ObjectId, required: true, ref: 'User' },
    transactionId: { type: String, required: true, unique: false },
    action: { type: String, required: true },
    data: { type: Object, default: null },
    prevBalance: { type: Number, default: 0, min: 0 },
    actionAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0, min: 0 },
    isReverted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

userTransaction.plugin(Timezone);

const UserTransaction = mongoose.model("user_transaction", userTransaction);
module.exports = UserTransaction;
