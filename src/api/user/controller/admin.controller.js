const User = require("../../../model/user/user.model");
const {getPagination} = require("../../../utils/common.helper");
const bhRentalContract = require("../blockchain/deploy/BHRentalContract");
const roomService = require("../service/room.service");

const AdminController = {};
AdminController.getAllRoom = async (req, res, next) => {
    try {
        const conditions = {
            ...req.query,
        };
        const sort = {
            createdAt: -1,
        };
        const projection = {};
        const populate = [
            {
                path: "owner",
                select: "_id username email phone identity name avatar",
            },
            {
                path: "services",
                select: "name basePrice",
            },
        ];

        const {items, total, page, limit, totalPages} = await roomService.getAllRoom(conditions, getPagination(req.query), projection, populate, sort);
        return res.status(200).json({
            data: {items, total, page, limit, totalPages},
            message: "success",
            errorCode: 200,
        });
    } catch (error) {
        next(error);
    }
};

AdminController.getAllUser = async (req, res, next) => {
    try {
        const {skip, limit, page} = getPagination(req.query);
        const projection = {
            username: 1,
            email: 1,
            phone: 1,
            identity: 1,
            name: 1,
            avatar: 1,
            address: 1,
            wallet: 1,
            enable: 1,
            createdAt: 1,
        };
        const [items, total] = await Promise.all([User.find({}, projection).sort({createdAt: -1}).skip(skip).limit(limit).lean(), User.countDocuments({})]);

        return res.status(200).json({
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = AdminController;
