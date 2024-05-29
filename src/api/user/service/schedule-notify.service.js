const contractService = require("../service/contract.service");
const User = require("../../../model/user/user.model");
const MyError = require("../../../exception/MyError");
const { sendNotify } = require("../../../utils/nodemailer.helper");

const scheduleNotifyService = {
  createNotifyToLessor: async () => {
    // get all contract that 2 day the patment is due
    const contracts = await contractService.getContractsDueIn(2);

    const lessorIds = contracts.map((contract) => contract.lessor);
    const today = new Date();
    // for each lessor create a nofity
    if (!lessorIds || lessorIds.length === 0)
      throw new MyError("lessorId invalid");

    for (let i = 0; i < lessorIds.length; i++) {
      const user = await User.getById(lessorIds[i]);

      if (!user) throw new Error("User not found");

      await sendNotify({
        to: user.email,
        inMonth: today.getMonth() + 1,
        inYear: today.getFullYear(),
        name: user.name,
      });
    }
  },
};

module.exports = scheduleNotifyService;
