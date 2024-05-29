const datetimeHelper = require("../../../utils/datetime.helper");
const commonHelper = require("../../../utils/common.helper");

const InvoiceValidate = {
    /**
     * 
     * @param {date} dateRent date that renter rent house, define on contract
     * @param {date} dateCheck day at moment
     * @param {Number} period period of contract
     * @returns true if the contract has expire
     */
    checkDateRentExpired: (dateRent, dateCheck, period) => {
        const expiredDate = new Date(dateRent);
        expiredDate.setMonth(expiredDate.getMonth() + period);

        const rentalDate = new Date(dateCheck);
        if (rentalDate > expiredDate)
            return true;
        return false;
    },

    validateInvoiceInfo: async (invoiceInfo) => {

    }
};

module.exports = InvoiceValidate;