const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const wallet = require("./wallet.model");
const {ObjectId} = mongoose.Types;
const authSchema = require("../shema/auth");
const MyError = require("../../exception/MyError");
const ArgumentError = require("../../exception/ArgumentError");

const UserSchema = new mongoose.Schema(
    {
        username: {type: String, unique: true, required: true},
        email: {type: String, unique: false},
        phone: {type: String, default: ""},
        identity: {type: String, default: ""},
        auth: authSchema,
        address: {
            city: {type: String, default: "Hồ Chí Minh"},
            district: {type: String, default: "Gò Vấp"},
            ward: {type: String, default: ""},
            street: {type: String, default: null},
        },
        name: {
            type: String,
            default: "",
        },
        gender: {
            type: String,
            enum: ["Man", "Female", "Other"],
            default: "Other",
        },
        dob: {
            type: Date,
            default: null,
        },
        avatar: {
            type: String,
            default: "https://d2rd596stqiu8q.cloudfront.net/75adabd1-40a3-472e-883c-d3b5f0f58ae41680602481296bee.png",
        },
        wallet,
        identityImg: [
            {
                url: String,
            },
        ],
        notifications: [
            {
                type: ObjectId,
                ref: "Notification",
            },
        ],
        enable: {
            type: Boolean,
            default: true,
        },
        otp: String,
        otpTime: Date,
        socketId: {
            type: String,
            default: "",
        },
        wishList: [],
    },
    {
        timestamps: true,
    }
);

UserSchema.statics.getById = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        throw new Error("user not found!");
    }

    const {_id, name, email, username, phone, identity, gender, dob, avatar, wallet, enable} = user;

    return {
        _id,
        name,
        email,
        username,
        phone,
        identity,
        gender,
        dob,
        wallet,
        avatar,
        enable,
    };
};

UserSchema.statics.getUserByWallet = async (walletAddress) => {
    if (!walletAddress) throw new ArgumentError("user wallet address ==>");

    const user = await User.findOne({"wallet.walletAddress": walletAddress});

    if (!user) {
        throw new Error("user not found!");
    }
    const {_id, name, email, username, phone, identity, gender, dob, avatar, wallet, enable} = user;

    return {
        _id,
        name,
        email,
        username,
        phone,
        identity,
        gender,
        dob,
        wallet,
        avatar,
        enable,
    };
};

// UserSchema.pre("save", function (next) {
//     if (this.gender === "Man" && !this.avatar)
//         this.avatar = "https://d2rd596stqiu8q.cloudfront.net/81df5229-72dc-4a24-8e56-2464e3b7c3b41680602368164man.png";
//     else if (this.gender === "Female" && !this.avatar)
//         this.avatar = "https://d2rd596stqiu8q.cloudfront.net/736993f4-36d1-42e3-8fe4-7d1d3b16c3281680602456890woman.png";
//     else {
//         if (!this.avatar) this.avatar = "https://d2rd596stqiu8q.cloudfront.net/75adabd1-40a3-472e-883c-d3b5f0f58ae41680602481296bee.png";
//     }
//     next();
// });

const User = mongoose.model("User", UserSchema);

module.exports = User;
