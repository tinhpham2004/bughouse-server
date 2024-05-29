const Room = require("../../../model/room.model");
const Contract = require("../../../model/transaction/contract.model");
const Invoice = require("../../../model/transaction/invoice.model");
const invoiceService = require("./invoice.service");
const roomService = require("./room.service");

const CronService = {};

CronService.autoCreateInvoice = async () => {
    try {
        const contracts = await Contract.find({})
            .populate([
                {
                    path: "room",
                    select: "_id demandAt",
                },
            ])
            .lean();
        for (let i = 0; i < contracts.length; i++) {
            await roomService.autoCreateInvoice(contracts[i]);
        }
    } catch (error) {
        console.log("🚀 ~ file: cron.service.js:10 ~ CronService.autoCreateInvoice= ~ error:", error);
    }
};

CronService.autoPayForInvoice = async () => {
    try {
        const updateDate = new Date();

        const invoices = await Invoice.find({
            status: "Pending",
            endDate: {$lte: updateDate},
        });

        for (let i = 0; i < invoices.length; i++) {
            const {renter} = await Contract.findById(invoices[i]?.contract, {renter: 1}).lean();
            await invoiceService.payForRentEachMonth(renter, invoices[i]?._id);
        }
    } catch (error) {
        console.log("🚀 ~ file: cron.service.js:40 ~ CronService.autoPayForInvoice= ~ error:", error);
    }
};

CronService.deleteRoomFail = async () => {
    try {
        const deleteRoom = await Room.deleteMany({roomUid: -1});
        return deleteRoom.deletedCount;
    } catch (error) {
        console.log(error);
    }
};
module.exports = CronService;
