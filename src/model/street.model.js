const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const streetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parent_code: {
      type: ObjectId,
      required: true,
      ref: "Dictrict",
    },
    parent_code_city: {
      type: ObjectId,
      required: true,
      ref: "City",
    },
  },
  {
    versionKey: false,
  }
);

const Street = mongoose.model("streets", streetSchema);
module.exports = Street;
