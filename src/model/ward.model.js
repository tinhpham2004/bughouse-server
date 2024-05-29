const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema;

const wardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    typename: {
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
    timestamps: true,
  }
);

wardSchema.plugin(Timezone);

const Ward = mongoose.model("wards", wardSchema);
module.exports = Ward;
