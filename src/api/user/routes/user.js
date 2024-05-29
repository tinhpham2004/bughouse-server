const router = require("express").Router();
const UserController = require("../controller/user.controller");
const swaggerJSDoc = require("swagger-jsdoc");
const test = require("../edotor");
const userRouter = (io) => {
    const userController = new UserController(io);
    // userController.connectVNpaytoWallet
    /**
     * @swagger
     * /users/wallet-connect:
     *   post:
     *     summary: Connects VNpay to a user wallet and creates a new transaction for payment.
     *     tags: [User]
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               walletAddress:
     *                 type: string
     *                 description: The user's wallet address.
     *                 example: "0x7b54ea3b6f9Ed4D80925D7d6C7E820C4e245818d"
     *               amount:
     *                 type: number
     *                 description: The amount of payment in VND.
     *                 example: 100000
     *             required:
     *               - walletAddress
     *               - amount
     *     responses:
     *       200:
     *         description: Payment URL for the VNpay transaction.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 paymentUrl:
     *                   type: string
     *                   description: The VNpay payment URL for the transaction.
     *                   example: "https://sandbox.vnpayment.vn/...&vnp_SecureHash=..."
     *       400:
     *         description: Invalid or incomplete request body.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Request body is incomplete."
     *                 errorCode:
     *                   type: number
     *                   example: 400
     *                 data:
     *                   type: object
     *                   example: {}
     */
    router.post("/wallet-connect", userController.connectVNpaytoWallet);
    router.post("/wallet-withdraw", userController.withdrawMoney);
    router.get("/me/transaction-history", userController.getTransactionHistory);
    router.get("/me/wallet", userController.getWallet);

    router.get("/notifications", userController.getNotification);
    router.put("/notifications/:notificationId", userController.checkNotification);
    router.get("/requests", userController.getUserRequest);

    router.get("/invoices/rented", userController.getAllInvoiceRenter);
    router.get("/invoices/leased", userController.getAllInvoiceOwner);
    router.get("/invoices/:invoiceId", userController.getInvoiceById);

    router.post("/contract/:contractId/cancel-by-renter", userController.cancelByRenter);
    router.post("/contract/:contractId/cancel-by-lessor", userController.cancelContractByLessor);
    router.post("/contract/:contractId/extend-by-renter", userController.sendRequestToExtend);
    router.post("/contract/accept/:requestId", userController.acceptRequest);
    router.post("/contract/accept-extend/:requestId", userController.acceptRequestExtendContract);
    router.post("/payment-test", userController.testPayment);
    router.get("/contract/:roomId", userController.getContractOfRoom);

    router.post("/room/:roomId/feedback", userController.feedBackRoom);
    router.post("/room/:roomId/report", userController.reportRoom);

    router.get("/me/profile", userController.getProfile); // not yet
    router.patch("/me/avatar", userController.changeAvatar); // not yet
    return router;
};

module.exports = userRouter;
