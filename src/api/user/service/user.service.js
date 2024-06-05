/* eslint-disable no-multiple-empty-lines */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable semi */
require("dotenv").config();
const userService = require("../service/user.service");

// const multer = require("multer");
const User = require("../../../model/user/user.model");
// const awss3helper = require('../../../utils/awss3.helper');
const userValidate = require("../validate/user.validation");
const awsS3ServiceHelper = require("../../../utils/aws-s3-service.helper");
const MyError = require("../../../exception/MyError");
const City = require("../../../model/city.model");
const addressService = require("./address.service");
const Ward = require("../../../model/ward.model");
const Contract = require("../../../model/transaction/contract.model");
const Notification = require("../../../model/user/notification.model");
const Request = require("../../../model/user/request.model");
const RentalContract = require("../blockchain/deploy/BHRentalContract");
const contractService = require("./contract.service");
const { compare } = require("../../../utils/object.helper");
const {
  ACTION_FUNCTION,
  USER_TRANSACTION_ACTION,
} = require("../../../config/user-transaction");
const { ACTION_TRANSFER, ADMIN } = require("../../../config/default");
const userWalletService = require("./user-wallet.service");
const { toObjectId } = require("../../../utils/common.helper");
const Room = require("../../../model/room.model");
const FeedBack = require("../../../model/user/feedback.model");
const ReportRoom = require("../../../model/user/report.model");

class UserService {
  checkImage(file) {
    const { mimetype } = file;

    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      throw new MyError("Image invalid");
    }
  }

  async cityData() {
    const listDitrict = await addressService.getDitrictsFromDatabase();
    const city = await City.findOne({ _id: "6415ee77cc372ede59b64c1a" });

    for (const element of listDitrict) {
      const list = await addressService.getWardByDitrict(element.name);
      for (let j = 0; j < list.length; j++) {
        const ward = new Ward({
          name: list[j].name,
          type: list[j].pre,
          typename: `${list[j].pre} ${list[j].name}`,
          parent_code: element._id,
          parent_code_city: city._id,
        });
        await ward.save();
      }
    }
  }

  // [GET] /bh/user/me/profile
  async getProfile(_id) {
    // eslint-disable-next-line no-undef
    await tokens.save();
    const user = await User.findById(_id, { auth: 0 })
      .select("-updateAt")
      .lean()
      .then((data) => data)
      .catch((err) => err);

    if (!user) {
      throw new Error("User ==> not found user!");
    }
    return user;
  }

  async updateProfile(_id, profile) {
    if (!profile) {
      throw new Error("Profile in valid!");
    }

    const validProfile = await userValidate.validateProfile(_id, profile);
    const modifieUser = await User.updateOne({ _id }, { ...validProfile });

    if (modifieUser.modifiedCount < 1) {
      throw new Error("Update user data fail!");
    }
  }

  async changeAvatar(_id, file) {
    this.checkImage(file);

    const user = User.getById(_id);
    if (!user) {
      throw new Error("Not found user");
    }

    const { avatar } = user;
    if (avatar) {
      awsS3ServiceHelper.deleteFile(avatar);
    }

    const avatarUrl = await awsS3ServiceHelper.uploadFile(file);
    const updateUser = await User.updateOne(
      { _id },
      {
        avatar: avatarUrl,
      },
    );
    if (updateUser.modifiedCount < 1) throw new Error("Update data fail!");
    return user;
  }

  async cancelRentalByRenter(renterId, contractId) {
    const renter = await User.getById(renterId);

    const contract = await Contract.findOne({
      _id: contractId,
    });

    if (!contract) throw new MyError("Contract not found");

    const notification = await Notification.create({
      user: renter._id,
      type: "CANCEL_CONTRACT",
      content: "huỷ hợp đồng thuê phòng!",
      tag: [renter._id, contract.lessor],
    });

    const request = await Request.create({
      from: renter._id,
      to: contract.lessor,
      type: "CANCEL_RENTAL",
      data: contract,
    });
    return {
      notification,
      request,
    };
  }

  async extendRentalByRenter(renterId, contractId, newPeriod) {
    const renter = await User.getById(renterId);

    const contract = await Contract.findOne({
      _id: contractId,
    });

    if (!contract) throw new MyError("Contract not found");

    const notification = await Notification.create({
      user: ADMIN._id,
      type: "CONTINUE_RENTAL",
      content: "extend rent room",
      tag: [renter._id, contract.lessor],
    });

    let request = await Request.findOne({
      type: "CONTINUE_RENTAL",
      from: renter._id,
      "data.contract.room": contract.room,
    });

    if (!request) {
      request = await Request.create({
        from: renter._id,
        to: contract.lessor,
        type: "CONTINUE_RENTAL",
        data: { contract, newPeriod },
      });
    }

    return {
      requestId: request._id,
      roomId: contract.room,
    };
  }

  async extendContract(requestId) {
    const request = await Request.findOne({
      _id: requestId,
    });

    const { data } = request;

    if (!request) throw new MyError("request not found");

    const result = await contractService.continueContract(
      data.contract?.renter?._id,
      data?.contract?._id,
      data?.newPeriod,
    );

    await Request.deleteOne({ _id: requestId });
    return result;
  }

  async acceptCancelRentalRoom(ownerId, requestId) {
    const request = await Request.findOne({
      _id: requestId,
    });

    const { data } = request;

    if (!request) throw new MyError("request not found");
    // check contract due
    const dateEnd = new Date();
    // in due
    const inDue = await contractService.checkContractStatus(dateEnd, data._id);
    let result;

    if (!inDue) {
      result = await RentalContract.endRent(
        data?.lessor?.wallet.walletAddress,
        data.room,
        data?.renter?.wallet.walletAddress,
      );
    }
    // const penaltyFee = (data.payment * 50) / 100;
    result = await RentalContract.endRentInDue(
      data?.lessor?.wallet.walletAddress,
      data.room,
      data?.renter?.wallet.walletAddress,
    );
    await Request.deleteOne({ _id: requestId });
    return result;
  }

  async cancelContractByLessor(ownerId, contractId) {
    const contract = await Contract.findOne({
      _id: contractId,
      status: "available",
    }).populate([
      {
        path: "renter",
        select: "_id wallet",
      },
      {
        path: "lessor",
        select: "_id wallet",
      },
      {
        path: "room",
        select: "-updatedAt",
      },
    ]);

    // Querry request cancel contract by renter if exist then delete it
    const requests = await Request.find({
      type: "CANCEL_RENTAL",
      "data.renter._id": contract.renter._id,
      "data.room._id": contract.room._id,
      "data.lessor._id": contract.lessor._id,
      to: contract.lessor._id,
    });

    if (requests.length > 0) {
      // Remove all request cancel contract by renter if exist to make sure only when lessor cancel contract then cannot use request cancel contract by renter
      await Request.deleteMany({
        type: "CANCEL_RENTAL",
        "data.renter._id": contract.renter._id,
        "data.room._id": contract.room._id,
        "data.lessor._id": contract.lessor._id,
        to: contract.lessor._id,
      });
    }
    // eslint-disable-next-line no-multiple-empty-lines

    if (!contract) throw new MyError("contract not found");

    const { renter, lessor, room, penaltyFeeEndRent } = contract;

    // check contract due
    const dateEnd = new Date();
    // in due
    const inDue = await contractService.checkContractStatus(
      dateEnd,
      contractId,
    );

    const result = await RentalContract.endRent(
      lessor?.wallet.walletAddress,
      room,
      renter?.wallet?.walletAddress,
    );

    if (inDue) {
      const data = this.transferBalance(
        lessor._id,
        renter._id,
        penaltyFeeEndRent,
        ACTION_TRANSFER.TRANSFER,
      );
      await userWalletService.changeBalance(
        renter._id,
        penaltyFeeEndRent,
        data,
        USER_TRANSACTION_ACTION.PAYMENT,
      );
      // eslint-disable-next-line no-unused-vars
      const notification = Notification.create({
        userOwner: ADMIN._id,
        tag: [renter._id],
        content: `bạn nhận được khoản tiền đền bù từ phòng ${room.name} cho việc huỷ hợp đồng trước hạn!`,
      });
    }
    return {
      result,
    };
  }

  async transferBalance(fromUserId, toUserId, amount, action) {
    const from = await User.getById(fromUserId);
    const to = await User.getById(toUserId);
    console.log("🚀 ~ UserService ~ transferBalance ~ to:", to);

    if (amount < 0) throw new MyError("amount not invalid!");

    if (compare(from._id, to._id)) {
      throw new MyError("can not transfer for self");
    }
    const result = await RentalContract.transferBalance(
      from?.wallet?.walletAddress,
      to?.wallet?.walletAddress,
      amount,
      action,
    );
    return result;
  }

  async withdrawMoney(userId, amount) {
    if (!userId || amount < 0) throw new MyError("missing parameter");

    const { _id, wallet } = await User.findOne({ _id: toObjectId(userId) });
    if (wallet?.balance < amount) throw new MyError("not enough balance!");

    await userWalletService.changeBalance(
      _id,
      amount,
      {},
      // eslint-disable-next-line comma-dangle
      USER_TRANSACTION_ACTION.WITHDRAW,
    );

    const notification = await Notification.create({
      user: ADMIN._id,
      type: "NOTIFICATION",
      content: `bạn rút: ${amount} thành công`,
      tag: [_id],
    });

    return { notification };
  }

  async feedBackRoom(roomId, userId, data) {
    /**
     * Flow:
     * 1. check user has rented room
     * 2.
     */
    if (!roomId || !userId) throw new MyError("missing parameter");

    let [roomFind, feedBack] = await Promise.all([
      Room.findOne({ _id: roomId }),
      FeedBack.findOne({ room: roomId, user: userId }),
    ]);

    if (feedBack) return { message: "bạn đã đánh giá phòng này rồi!" };

    const { content, rating, images } = data;

    feedBack = await FeedBack.create({
      user: userId,
      content,
      rating,
      room: roomFind._id,
      images,
    });

    await Notification.create({
      user: ADMIN._id,
      type: "NOTIFICATION",
      content: ` phòng ${roomFind.name} vừa nhận một đánh giá!`,
      tag: [roomFind.owner],
    });

    await Notification.create({
      user: ADMIN._id,
      type: "NOTIFICATION",
      content: `cám ơn về đánh giá của bạn cho phòng: ${roomFind.name}`,
      tag: [userId],
    });

    return {
      feedBack,
    };
  }

  async reportRoom(roomId, userId, data) {
    /**
     * Flow:
     * 1. check user has rented room
     * 2.
     */
    if (!roomId || !userId) throw new MyError("missing parameter");
    const report = await ReportRoom.create({
      user: userId,
      room: roomId,
      ...data,
    });
    return {
      report,
    };
  }
}

module.exports = new UserService();
