const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const {ObjectId} = mongoose.Types;

const NotificationSchema = new mongoose.Schema(
    {
        userOwner: {
            type: ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            default: "NOTIFICATION",
        },
        isChecked: {
            type: Boolean,
            default: false,
        },
        tag: [
            {
                type: ObjectId,
                ref: "User",
            },
        ],
        enable: {
            type: Boolean,
            default: true,
        },
        content: {type: String, default: ""},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
