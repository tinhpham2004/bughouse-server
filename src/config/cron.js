const cron = require("node-cron");
const CronService = require("../api/user/service/cron.service");
const RequestService = require("../api/user/service/request.service");
const demandTime = "*/360 * * * *";
const invoiceTime = "*/360 * * * *";
const deleteTime = "*/3 * * * *";
// // 8AM on thr 15th day every month
// cron.schedule('0 8 15 * *', () => {
//     console.log('This cron job runs on the 15th day of every month at 8:00 AM');
// });

cron.schedule("*/180 * * * *", async () => {
    console.log("AUTO REQUEST ===> START");
    await RequestService.executeRequestInDue();
    console.log("AUTO REQUEST ===> END");
});

cron.schedule(demandTime, async () => {
    console.log("AUTO SERVICE DEMANDS ===> START");
    await CronService.autoCreateInvoice();
    console.log("AUTO SERVICE DEMANDS ===> END");
});

cron.schedule(invoiceTime, async () => {
    console.log("AUTO INVOICE PAYMENT ===> START");
    await CronService.autoPayForInvoice();
    console.log("AUTO INVOICE PAYMENT ===> END");
});

cron.schedule(deleteTime, async () => {
    console.log("AUTO DELETE ROOM FAIL===> START");
    await CronService.deleteRoomFail();
    console.log("AUTO DELETE ROOM FAIL ===> END");
});

module.exports = cron;
