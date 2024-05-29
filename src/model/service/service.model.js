const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const ObjectId = mongoose.Schema.ObjectId;
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: " ",
    },
    description: {
      type: String,
      default: " ",
    },
    basePrice: {
      type: Number,
      default: " ",
    },
    unit: {
      type: ObjectId,
      ref: 'Unit'
    },
    enable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

serviceSchema.plugin(Timezone);
const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
