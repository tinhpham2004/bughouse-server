const invoiceService = require("../service/invoice.service");

class InvoiceController {
  // [POST] /invoice/create
  async createInvoice (req, res, next) {
    try {
      /**
             * from user lessor create invoice by contract
             */
      const { userId } = req.auth;

      const { contractId, invoiceInfo } = req.body;
      const data = await invoiceService.createInvoice(userId, contractId, invoiceInfo);

      return res.status(200).json({
        message: "tạo hoá đơn thành công!",
        data,
        errorCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  // [POST] bh/invoice/:invoiceId/payment
  async payForRentEachMonth (req, res, next) {
    try {
      const { userId } = req.auth;

      const invoiceId = req.params.invoiceId;
      const data = await invoiceService.payForRentEachMonth(userId, invoiceId);
      return res.status(200).json({
        message: "thành công",
        errorCode: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // [POST] bh/invoice/:invoiceId/extends
  async extendPaymentInvoice (req, res, next) {
    try {
      const { userId } = req.auth;

      const invoiceId = req.params.invoiceId;
      const data = await invoiceService.extendsPaymentDayInvoice(userId, invoiceId);

      return res.status(200).json({
        message: "thành công",
        errorCode: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
