const MyError = require("../../../exception/MyError");
const User = require("../../../model/user/user.model");
const RentalContract = require("../blockchain/deploy/BHRentalContract");
const contractService = require("../service/contract.service");

class ContractController {
  //[POST] bh/contract/create-contract
  async createContract(req, res, next) {
    try {
      // owner id
      const { userId } = req.auth;
      const { period, room, dateRent, payTime, payMode, payment } = req.body;

      const data = await contractService.createContract(userId, {
        period,
        room,
        dateRent,
        payTime,
        payMode,
        payment,
      });

      return res.status(200).json({
        message: "tạo hợp đồng thành công",
        errorCode: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  //[POST] bh/contract/sign-by-renter
  async signByRenter(req, res, next) {
    try {
      const { userId } = req.auth;
      const { roomId, contractHash } = req.body;
      const data = await contractService.signByRenter(
        userId,
        roomId,
        contractHash
      );

      return res.status(200).json({
        message: "ký xác nhận hợp đồng thành công!",
        errorCode: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  // [GET] bh/contract/:renterId
  async getContractByRenter(req, res, next) {
    try {
      const { data } = await contractService.getContractByRenter(
        req.params.renterId
      );

      return res.status(200).json({
        message: "",
        errorCode: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContractController();
