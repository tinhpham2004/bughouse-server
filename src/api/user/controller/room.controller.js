const {Contract} = require("ethers");
const commonHelper = require("../../../utils/common.helper");
const contractService = require("../service/contract.service");
const roomService = require("../service/room.service");
const userService = require("../service/user.service");

class RoomController {
    // [POST] bh/room/create-room
    async createRoomForRent(req, res, next) {
        try {
            const {userId} = req.auth;
            const {data} = await roomService.createRoom(userId, req.body);

            return res.status(200).json({
                errorCode: 200,
                messaage: "tạo thành công",
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] bh/room/re-open/:roomId
    async reOpenRoom(req, res, next) {
        try {
            const {userId} = req.auth;
            const roomId = req.params.roomId;
            const {basePrice, deposit, totalNbPeople, gender} = req.body;
            const {data} = await roomService.reOpenRoom(userId, {
                basePrice,
                deposit,
                totalNbPeople,
                gender,
                roomId,
            });

            return res.status(200).json({
                errorCode: 200,
                messaage: "tạo thành công",
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/room/
    async getAllRoom(req, res, next) {
        try {
            const conditions = {
                ...req.query,
                status: "available",
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
                    select: "-updateAt",
                },
            ];

            const {items, total, page, limit, totalPages} = await roomService.getAllRoom(
                conditions,
                commonHelper.getPagination(req.query),
                projection,
                populate,
                sort
            );
            return res.status(200).json({
                data: {items, total, page, limit, totalPages},
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/room/:roomId
    async getRoom(req, res, next) {
        try {
            const room = await roomService.getOneRoom(req.params.roomId);
            return res.status(200).json({
                data: room,
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/room/:roomId/feedback
    async getRoomFeedBack(req, res, next) {
        try {
            const conditions = {
                room: req.params.roomId,
            };
            const room = await roomService.getRoomFeedBack(conditions, commonHelper.getPagination(req.query));
            return res.status(200).json({
                data: room,
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/room/:roomId/report
    async getRoomReport(req, res, next) {
        try {
            const conditions = {
                room: req.params.roomId,
            };
            const room = await roomService.getRoomReport(conditions, commonHelper.getPagination(req.query));
            return res.status(200).json({
                data: room,
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/room/:userId
    async getOwnerRoom(req, res, next) {
        try {
            const userId = req.params.userId;
            const conditions = {
                ...req.query,
                owner: userId,
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
                    select: "-updateAt",
                },
            ];

            const {items, total, page, limit, totalPages} = await roomService.getAllRoom(
                conditions,
                commonHelper.getPagination(req.query),
                projection,
                populate,
                sort
            );
            return res.status(200).json({
                data: {items, total, page, limit, totalPages},
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/room/user/rented
    async getRentedRoom(req, res, next) {
        try {
            const {userId} = req.auth;
            const conditions = {
                ...req.query,
                renter: userId,
            };
            const sort = {createdAt: -1};
            const projection = {
                room: 1,
                dateRent: 1,
            };

            const {items, total, page, limit, totalPages} = await contractService.getAllRoomByRented(
                conditions,
                commonHelper.getPagination(req.query),
                projection,
                sort
            );
            return res.status(200).json({
                data: {items, total, page, limit, totalPages},
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    //[GET] bh/room/user/leased
    async getLeasedRoom(req, res, next) {
        try {
            const {userId} = req.auth;
            const conditions = {
                ...req.query,
                owner: userId,
            };
            const populate = [
                {
                    path: "owner",
                    select: "_id username name wallet avatar phone email",
                },
                {
                    path: "services",
                    select: "_id name description basePrice",
                },
            ];

            const {items, total, page, limit, totalPages} = await roomService.getAllRoom(
                conditions,
                commonHelper.getPagination(req.query),
                {},
                populate,
                {createdAt: -1}
            );

            return res.status(200).json({
                data: {items, total, page, limit, totalPages},
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    //[PUT] bh/room/:roomId
    async updateRoom(req, res, next) {
        try {
            const roomId = req.params.roomId;
            const data = await roomService.updateRoom(roomId, req.body);

            return res.status(200).json({
                data,
                message: "thành công",
                errorCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RoomController();
