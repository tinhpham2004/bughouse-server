"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Model = new Schema(
  {
    chainId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    explorers: { type: [String] },
    rpcs: { type: [String] },
    logo: { type: String },
    currentBlock: Number,
    minBlock: Number,
    isProcessedLog: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    lastUpdateBlockAt: Date,
    pos: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("chain", Model);
