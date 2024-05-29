const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    typename: {
      type: String,
    },
    parent_code: {
      type: ObjectId,
      required: true,
      ref: "City",
    },
  },
  {
    versionKey: false,
  }
);

const District = mongoose.model("dictricts", districtSchema);
module.exports = District;
