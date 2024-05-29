const router = require("express").Router();
const UserController = require("../controller/user.controller");
const unauthorizeRouter = (io) => {
  const userController = new UserController(io);
  /**
 * @swagger
 *
 * /bh/payment-confirmation:
 *   get:
 *     summary: Confirm payment through VNPay.
 *     description: Confirm payment made through VNPay using the query parameters returned by VNPay.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: vnp_SecureHash
 *         type: string
 *         required: true
 *         description: Secure hash parameter returned by VNPay.
 *       - in: query
 *         name: vnp_SecureHashType
 *         type: string
 *         required: true
 *         description: Secure hash type returned by VNPay.
 *       - in: query
 *         name: vnp_ResponseCode
 *         type: string
 *         required: true
 *         description: Response code returned by VNPay.
 *       - in: query
 *         name: vnp_TxnRef
 *         type: string
 *         required: true
 *         description: Transaction reference number returned by VNPay.
 *       - in: query
 *         name: vnp_TransactionNo
 *         type: string
 *         required: true
 *         description: Transaction number returned by VNPay.
 *       - in: query
 *         name: vnp_Amount
 *         type: integer
 *         required: true
 *         description: Payment amount in VND.
 *       - in: query
 *         name: vnp_BankCode
 *         type: string
 *         required: true
 *         description: Bank code used for payment.
 *     responses:
 *       200:
 *         description: Payment confirmation successful.
 *         schema:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Response code returned by VNPay.
 *       400:
 *         description: Bad request, missing required query parameters.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message.
 *             errorCode:
 *               type: integer
 *               description: Error code.
 *             data:
 *               type: object
 *               description: Empty data object.
 */
  router.get("/payment-confirmation", userController.confirmPayment);

  return router;
};

module.exports = unauthorizeRouter;