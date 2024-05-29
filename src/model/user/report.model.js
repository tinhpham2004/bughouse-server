const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoomModel = require('../room.model');

const reportSchema = new mongoose.Schema(
    {
        user: {
            type: Object,
            require: true,
            ref: 'User'
        },
        content: {
            type: String,
            default: "",
        },
        room: {
            type: Schema.Types.ObjectId,
            ref: "Room",
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

reportSchema.pre("save", async function (next) {
    await RoomModel.updateOne(
        { _id: this.room },
        { $inc: { totalReport: 1 } }
    );
    next();
});

const ReportRoom = mongoose.model("ReportRoom", reportSchema);
module.exports = ReportRoom;
