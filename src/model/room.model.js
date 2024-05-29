const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;
const Timezone = require("mongoose-timezone");
const attachment = require("./shema/attachment");
const NotFoundError = require("../exception/NotFoundError");
const roomSchema = new mongoose.Schema(
    {
        name: {type: String},
        acreage: {type: Number, require: true},
        period: {type: Number, default: 6},
        owner: {
            type: ObjectId,
            require: true,
            ref: "User",
        },
        nbCurrentPeople: {
            type: Number,
            default: 0,
        },
        totalNbPeople: {
            type: Number,
            default: 0,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "All"],
            default: "All",
        },
        typeRoom: {
            type: String,
            enum: ["DORMITORY", "ROOM_FOR_RENT", "ROOM_FOR_SHARE", "HOUSE", "APARTMENT"],
            default: "ROOM_FOR_RENT",
        },
        deposit: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            default: "",
        },
        amentilities: [],
        basePrice: {
            type: Number,
            default: 0,
        },
        address: {
            city: {type: String, default: "Hồ Chí Minh"},
            district: {type: String, default: ""},
            ward: {type: String, default: ""},
            street: {type: String, default: ""},
            addressDetail: {type: String, default: ""},
            fullText: {type: String, default: ""},
        },
        roomAttachment: attachment,
        services: [
            {
                type: ObjectId,
                ref: "Service",
            },
        ],
        enable: {type: Boolean, default: true},
        lstTransaction: {type: String, default: ""},
        status: {type: String, enum: ["available", "already-rent", "not-available"], default: "available"},
        roomUid: {type: Number, default: -1},
        textSearch: {type: String, default: ""},
        totalStars: {type: Number, default: 0},
        totalReport: {type: Number, default: 0},
        demandAt: {type: Number, default: 0},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

roomSchema.plugin(Timezone);

roomSchema.statics.getById = async (_id) => {
    const roomPineline = [
        {
            path: "owner",
            select: "username email phone identity name avatar wallet",
        },
        {
            path: "services",
            select: "-updatedAt",
        },
    ];
    const room = await Room.findById(_id).select("-updatedAt").populate(roomPineline).lean();

    if (!room) throw new NotFoundError("room not found!");

    return room;
};

roomSchema.pre("save", async function (next) {
    const accentRegex = /[\u00C0-\u017F]/;
    const textSearch = `${this.name} ${this.gender} ${this.address.fullText} ${this.amentilities.join(" ")}`;
    let textWithoutAccent = "";
    if (accentRegex.test(textSearch)) {
        textWithoutAccent = textSearch
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\W/g, " ");
    }
    this.textSearch = `${textSearch.toLowerCase()} ${textWithoutAccent.toLowerCase()}`;

    next();
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
