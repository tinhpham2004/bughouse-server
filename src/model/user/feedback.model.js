const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedBackSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User'
    },
    content: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    images: [],
    totalLikes: { type: Number, default: 0 },
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

const FeedBack = mongoose.model("FeedBack", feedBackSchema);
module.exports = FeedBack;
