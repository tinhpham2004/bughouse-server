const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
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
}, {
  versionKey: false,
});

const City = mongoose.model("City", citySchema);

module.exports = City;
