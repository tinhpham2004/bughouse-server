const ArgumentError = require("../../../exception/ArgumentError");
const MyError = require("../../../exception/MyError");
const Contract = require("../../../model/transaction/contract.model");
const datetimeHelper = require("../../../utils/datetime.helper");
const serviceDemand = require("../service/demand.service");
const InvoiceValidate = require("../validate/invoice.validate");
const Invoice = require("../../../model/transaction/invoice.model");
const commonHelper = require("../../../utils/common.helper");
const contractService = require("./contract.service");
const User = require("../../../model/user/user.model");
const RentalContract = require("../blockchain/deploy/BHRentalContract");
const Room = require("../../../model/room.model");
const { toObjectId } = require("../../../utils/common.helper");
const Notification = require("../../../model/user/notification.model");
const Request = require("../../../model/user/request.model");
const ServiceDemand = require("../../../model/service/service-demand.model");
const { compare } = require("../../../utils/object.helper");
class InvoiceService {
  async createInvoice(userId, contractId, invoiceInfo) {
    if (!(contractId && invoiceInfo && userId))
      throw new ArgumentError("invoice service ==>");

    const contract = await Contract.getOne(contractId);

    const { period, payMode, dateRent, lessor, renter, payment } = contract;

    // if (userId !== lessor._id)
    //     throw new MyError('Unauthorize to create invoices');

    let paymentDay = this.checkDueInvoiceDay(dateRent, new Date(), period);
    let endDate = new Date(paymentDay.getTime() + 2 * 24 * 60 * 60 * 1000);

    const serviceDemands = invoiceInfo.listServiceDemands;
    if (!serviceDemands || !serviceDemands.length) {
      throw new MyError("invoice service ==> listServiceDemand ");
    }
    let amountDemand = 0;
    for (let i = 0; i < serviceDemands.length; i++) {
      const { amount } = await ServiceDemand.findById(serviceDemands[i]);
      amountDemand += amount;
    }
    console.log(
      "🚀 ~ file: invoice.service.js:37 ~ InvoiceService ~ createInvoice ~ amountDemand:",
      amountDemand
    );

    let invoice = await Invoice.create({
      contract: contract._id,
      creationDate: paymentDay,
      payStatus: "Pending",
      paymentMethod: payMode,
      startDate: paymentDay,
      endDate,
      enable: true,
      amount: amountDemand + payment,
      serviceDemands,
    });
    let notification = {};

    if (invoice) {
      notification = await Notification.create({
        userOwner: lessor._id,
        type: "INVOICE_TO_PAY",
        content: "bạn có hoá đơn cần thanh toán!",
        tag: [lessor._id, renter._id],
      });
    }

    return {
      invoice,
      notification,
    };
  }

  async getAll(conditions = {}, pagination, projection = {}) {
    let { payStatus, userId } = conditions;
    const { limit, page, skip } = pagination;
    const filter = {
      ...(payStatus && { payStatus }),
      ...(userId && { "contract.renter": toObjectId(userId) }),
    };

    let [items, total] = await Promise.all([
      Invoice.aggregate([
        {
          $lookup: {
            from: "contracts",
            let: { contractId: "$contract" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$contractId"] } } },
            ],
            as: "contract",
          },
        },
        { $match: filter },
      ]),
      Invoice.aggregate([
        {
          $lookup: {
            from: "contracts",
            let: { contractId: "$contract" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$contractId"] } } },
            ],
            as: "contract",
          },
        },
        { $match: { filter } },
        { $count: "totalValue" },
      ]),
    ]);

    total = total.length > 0 ? total[0].totalValue : 0;
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOne(conditions) {
    let { payStatus, invoiceId } = conditions;
    const filter = {
      ...(invoiceId && { _id: invoiceId }),
      ...(payStatus && { payStatus }),
    };

    const invoice = await Invoice.findOne(filter, projection).populate([
      {
        path: "contract",
        select: "-updatedAt",
        populate: [
          {
            path: "room",
            select: "-updatedAt",
          },
          {
            path: "renter",
            select: "_id username name avatar phone email",
          },
          {
            path: "renter",
            select: "_id username name avatar phone email",
          },
        ],
      },
    ]);

    if (!invoice) throw new MyError("invoice not found!");
    return invoice;
  }

  checkDueInvoiceDay(dateRent, paymentDay, period) {
    if (!(dateRent && paymentDay))
      throw new ArgumentError("invoice service ==> date rent, payment day ");

    if (InvoiceValidate.checkDateRentExpired(dateRent, paymentDay, period))
      throw new MyError("Period of contract has expired!");

    return paymentDay;
  }

  async payForRentEachMonth(renterId, invoiceId) {
    // get renter info
    const renter = await User.getById(renterId);
    // get invoice info { contract, amount, startDate, endDate }
    const invoice = await Invoice.getOne(invoiceId);

    const room = await Room.findOne({
      _id: invoice.contract.room,
      status: "already-rent",
    });

    if (compare(renter._id, room.owner))
      throw new MyError("chỉ có người thuê mới được thanh toán!");

    if (!room) throw new MyError("room not found");
    // check date to pay
    const datePay = new Date();
    let penaltyFee = 0;
    if (datePay > invoice.endDate) penaltyFee = invoice.amount * 0.05;

    const rentAmount = room.basePrice;
    const invoiceFee = invoice.amount + penaltyFee - rentAmount;
    
    if(renter.wallet.balance < invoice.amount)       
      throw new MyError("không đủ tiền thanh toán hóa đơn!");

    const data = await RentalContract.payForRentMonth(
      renter.wallet.walletAddress,
      room.roomUid,
      invoice,
      invoiceFee,
      rentAmount
    );

    return data;
  }

  async extendsPaymentDayInvoice(renterId, invoiceId) {
    // get renter info
    const renter = await User.getById(renterId);
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      status: "Pending",
    });
    const endDate = new Date(
      invoice.endDate.getTime() + 15 * 24 * 60 * 60 * 1000
    );
    invoice.endDate = endDate;
    invoice.isExtends = true;
    invoice.save({ new: true });

    const notification = await Notification.create([]);
    return {
      invoice,
    };
  }
}
module.exports = new InvoiceService();
