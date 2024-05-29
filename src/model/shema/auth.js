const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const authSchema = new mongoose.Schema(
    {
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
            required: true,
        },
        isAuthorize: {
            type: Boolean,
            default: false,
        },
        remainingTime: {
            type: Date,
            default: undefined,
        },
    },
    {
        _id: false,
    }
);
module.exports = authSchema;
