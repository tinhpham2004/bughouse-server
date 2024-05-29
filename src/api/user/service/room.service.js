const ArgumentError = require("../../../exception/ArgumentError");
const MyError = require("../../../exception/MyError");
const Room = require("../../../model/room.model");
const roomValidate = require("../validate/room.validaste");
const serviceApartment = require("../service/service.service");
const validateAddress = require("../validate/address.validate");
const User = require("../../../model/user/user.model");
const NotFoundError = require("../../../exception/NotFoundError");
const rentalContract = require("../blockchain/deploy/BHRentalContract");
const {compare} = require("../../../utils/object.helper");
const FeedBack = require("../../../model/user/feedback.model");
const ReportRoom = require("../../../model/user/report.model");
const Contract = require("../../../model/transaction/contract.model");
const demandService = require("./demand.service");
const invoiceService = require("./invoice.service");
const CREATE_ROOM_FEE = 5000;
class RoomService {
  async createRoom(_id, roomInfo) {
    // set owner
    const userOwner = await User.getById(_id);
    if (!userOwner) throw new NotFoundError("room servce=> not found user");
    if (userOwner?.wallet.balance < CREATE_ROOM_FEE)
      throw new MyError("bạn không đủ tiền để tạo phòng!");

    let room = await roomValidate.validCreateRoom(_id, roomInfo);
    const {
      amentilities,
      services,
      cityName,
      ditrictName,
      streetName,
      wardName,
      addressDetail,
      period,
    } = roomInfo;

    const address = await validateAddress.validAddress({
      cityName,
      ditrictName,
      streetName,
      wardName,
      addressDetail,
    });

    if (!room) throw new MyError("room service ==> room underfine!");

    if (!address) throw new MyError("room service ==>  address invalid!");

    if (!amentilities || !services)
      throw new ArgumentError("room service ==> missing parameter");

    room.owner = userOwner._id;
    // //set unity
    room.amentilities = amentilities;

    room.address = {};
    room.address = address;
    await room.save();
    // // set sevrice
    room.services = {};
    await serviceApartment.createRoomService(room._id, services);

    const roomTransaction = await rentalContract.setRoomForRent(
      room._id,
      userOwner.wallet.walletAddress,
      room.basePrice,
      room.deposit
    );

    return {
      data: {
        room,
        roomTransaction,
      },
    };
  }

  async reOpenRoom(ownerId, roomInfo) {
    const user = await User.getById(ownerId);

    if (!roomInfo) throw new MyError("missing parameter => re-openRoom");
    const { roomId, basePrice, deposit, totalNbPeople, gender } = roomInfo;
    const room = await Room.findById(roomId);

    if (!compare(room.owner, user._id)) throw new MyError("not you room");

    const data = await rentalContract.reOpenRoomForRent(
      room,
      user?.wallet?.walletAddress,
      basePrice,
      deposit
    );

    if (data) {
      room.basePrice = basePrice;
      room.deposit = deposit;
      room.totalNbPeople = totalNbPeople;
      room.gender = gender;
      await room.save();
    }
    return {
      room,
      data,
    };
  }

  async getAllRoom(
    conditions = {},
    pagination,
    projection,
    populate = [],
    sort = {}
  ) {
    const { key, owner, district } = conditions;
    const filter = {
      ...(key && { key }),
      ...(owner && { owner }),
      ...(district && { "address.district": district }),
    };
    const { limit, page, skip } = pagination;
    delete filter.limit;
    delete filter.page;
    if (key) {
      const words = key
        .replace(/　/g, " ")
        .replace(/、/g, ",")
        .replace(/,/g, " ")
        .split(" ");
      filter.$or = [
        {
          $and: words.map((word) => ({
            textSearch: new RegExp(word.replace(/\W/g, "\\$&"), "i"),
          })),
        },
      ];
    }
    if (!owner) filter.status = "available";
    const [items, total] = await Promise.all([
      Room.find(filter, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .lean(),
      Room.countDocuments(filter),
    ]);
    const array = items.map((val) => ({ room: val }));
    return {
      items: array,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOneRoom(roomId) {
    const roomPineline = [
      {
        path: "owner",
        select: "_id username email phone identity name avatar wallet",
      },
      {
        path: "services",
        select: "-updatedAt",
      },
    ];
    const room = await Room.findById(roomId).populate(roomPineline);

    if (!room) throw new MyError("room not found");
    return room;
  }

  async getRoomFeedBack(conditions = {}, pagination) {
    const { limit, page, skip } = pagination;
    const [items, total] = await Promise.all([
      FeedBack.find(conditions)
        .populate([
          {
            path: "user",
            select: "avatar name username phone email",
          },
          {
            path: "room",
            select: "name",
          },
        ])
        .skip(skip)
        .limit(limit)
        .lean(),
      FeedBack.countDocuments(conditions),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRoomReport(conditions = {}, pagination) {
    const { limit, page, skip } = pagination;
    const [items, total] = await Promise.all([
      ReportRoom.find(conditions)
        .populate([
          {
            path: "user",
            select: "avatar name username phone email",
          },
          {
            path: "room",
            select: "name",
          },
        ])
        .skip(skip)
        .limit(limit)
        .lean(),
      ReportRoom.countDocuments(conditions),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateRoom(roomId, data) {
    const { status } = Room.findById(roomId).projection({ status: 1 });
    if (status === "already-rent")
      throw new MyError(
        "the room is still rented, can not edit the information"
      );
    return Room.findByIdAndUpdate(roomId, data, { new: true });
  }

  async checkUpdateServiceDemand(roomId) {
    if (!roomId) throw new MyError("missing parameter!");
    const date = new Date();
    const { demandAt } = await Room.findById(roomId, { demandAt: 1 }).lean();
    if (demandAt === 0 || demandAt < date.getMonth() + 1) return false;
    return true;
  }

  async autoCreateInvoice(contract) {
    const updateDemand = await this.checkUpdateServiceDemand(
      contract?.room._id
    );
    if (!updateDemand) {
      const date = new Date();
      const oldDemands = await demandService.getListServiceDemandRoomAtMonth(
        contract?.room._id,
        date.getMonth()
      );
      const demands = await demandService.getListServiceDemandRoomAtMonth(
        contract?.room._id,
        date.getMonth() + 1
      );
      let datas = [];

      if (oldDemands) {
        datas = demands.map((val, index) => {
          return {
            newIndicator: oldDemands[index]?.newIndicator,
            serviceId: val?.service?._id,
            quality: oldDemands[index]?.quality,
          };
        });
      }
      datas = demands.map((val) => {
        return {
          newIndicator: 0,
          serviceId: val?.service?._id,
          quality: 0,
        };
      });

      const { listServiceDemands } =
        await demandService.updateServiceDemandInvoice(contract?.room._id, {
          atMonth: date.getMonth() + 1,
          demands: datas,
        });

      const invoice = await invoiceService.createInvoice(
        contract?.lessor,
        (contract?._id).toString(),
        {
          listServiceDemands: listServiceDemands.map((val) => val.toString()),
        }
      );
    }
  }

  // Helper method to verify user and balance
  async verifyUserAndBalance(userId) {
    const user = await User.getById(userId);
    if (!user) throw new NotFoundError("User not found");
    if (user?.wallet.balance < CREATE_ROOM_FEE)
      throw new MyError("Insufficient balance to create room");
    return user;
  }

  // Helper method to validate and create a room
  async validateAndCreateRoom(_id, roomInfo, userOwner) {
    // ... validateAndCreateRoom implementation ...
  }
}

module.exports = new RoomService();
