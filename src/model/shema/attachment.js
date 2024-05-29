const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const attatchSchema = new mongoose.Schema(
  {
    url: [],
    enable: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
    autoCreate: false,
  }
);

attatchSchema.plugin(Timezone);

module.exports = attatchSchema;
