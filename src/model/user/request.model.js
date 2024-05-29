const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Timezone = require("mongoose-timezone");

const RequestSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['CANCEL_RENTAL', 'CONTINUE_RENTAL'],
            required: true,
            default: 'CANCEL_RENTAL'
        },
        data: {},
        from: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        startDate: { type: Date, default: new Date() },
        endDate: { type: Date },
        enable: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

RequestSchema.plugin(Timezone);
RequestSchema.pre("save", function (next) {
    let endDate = new Date((this.startDate).getTime() + 15 * 24 * 60 * 60 * 1000);
    this.endDate = endDate;
    next();
});
const Request = mongoose.model('Request', RequestSchema);
module.exports = Request;