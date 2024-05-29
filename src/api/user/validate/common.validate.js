const ArgumentError = require('../../../exception/ArgumentError');
const dateTimeUtils = require('../../../utils/datetime.helper');


const commonValidate = {

    validatePayMode: (value) => {
        if (!value)
            throw new ArgumentError('validate paymode ==> ');

        const payMode = ["VNPay", "MoMo", "Bank", "Cash"];

        return payMode.includes(value);
    },

}

module.exports = commonValidate;