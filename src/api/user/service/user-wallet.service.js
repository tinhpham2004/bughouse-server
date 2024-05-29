const User = require("../../../model/user/user.model");
const {bugId} = require("../../../config/default");
const MyError = require("../../../exception/MyError");
const UserTransaction = require("../../../model/transaction/user-transaction");
const commonHelper = require("../../../utils/common.helper");
const {USER_TRANSACTION_ACTION, ACTION_FUNCTION} = require("../../../config/user-transaction");
const {compare} = require("../../../utils/object.helper");

const calculate = (action, num1, num2) => {
    if (ACTION_FUNCTION[action] === "plus") {
        return num1 + num2;
    } else {
        return num1 - num2;
    }
};
class UserWalletService {
    async getBalance(userId) {
        const {wallet} = await User.getById(userId);

        return wallet;
    }

    async changeBalance(userId, amount, data, action, transactionId = bugId, withHistory = true) {
        /**
         * get action amount
         * get user amount
         * calculate amout
         */
        const userBalance = await User.findOne({_id: userId}).select("wallet");
        if (!userBalance) throw new MyError("user not found");

        amount = commonHelper.convertToNumber(amount);
        let newAmount = commonHelper.convertToNumber(Math.abs(userBalance.wallet.balance));
        if (newAmount === Infinity) {
            newAmount = 0;
        }
        const oldBalance = newAmount;
        newAmount = calculate(action, oldBalance, amount);
        userBalance.wallet.balance = newAmount;
        await userBalance.save();

        if (withHistory) {
            const transaction = await UserTransaction.create({
                action,
                actionAmount: amount,
                transactionId,
                prevBalance: oldBalance || 0,
                balance: userBalance.wallet.balance,
                userId,
                data,
            });
        }
        return {
            userBalance,
        };
    }

    async getTransactionHistory(conditions = {}, pagination, projection = {}, populate = [], sort = {}) {
        const {limit, page, skip} = pagination;
        const {userId, actions} = conditions;

        const filter = {
            isDeleted: false,
        };
        userId && (filter.userId = userId);

        const [items, total] = await Promise.all([
            UserTransaction.find(filter, projection).populate(populate).sort(sort).skip(skip).limit(limit),
            UserTransaction.countDocuments(filter),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}

module.exports = new UserWalletService();
