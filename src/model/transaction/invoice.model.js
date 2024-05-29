const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const MyError = require("../../exception/MyError");

const ObjectId = mongoose.Types.ObjectId;

const invoiceSchema = new mongoose.Schema(
  {
    contract: {
      type: ObjectId,
      ref: 'Contract'
    },
    vat: {
      type: Number,
      default: 0.1
    },
    amount: {
      type: Number,
      default: 0,
    },
    payStatus: {
      type: String,
      enum: ["Pending", "Complete", "Failed", "Declined", "Cancelled", "Refunsed"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["VNPay", "Momo", "Bank", "Cash"],
      default: "",
    },
    serviceDemands: [
      {
        type: ObjectId,
        ref: "ServiceDemand",
      },
    ],
    paymentDate: { type: Date, default: null },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date, },
    enable: { type: Boolean, default: true },
    hash: { type: String },
    txhash: { type: String },
    isExtends: { type: Boolean, default: false }
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

invoiceSchema.plugin(Timezone);
invoiceSchema.statics.getOne = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId)
    .populate([
      {
        path: 'contract',
        select: '-updatedAt'
      },
      {
        path: 'serviceDemands',
        select: '-updatedAt'
      }
    ])
  if (!invoice)
    throw new MyError('invoice not found');
  return invoice;
}
const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
