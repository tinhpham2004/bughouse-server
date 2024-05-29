const router = require('express').Router();
const InvoiceController = require('../controller/invoice.controller');

/**
 * @swagger
 * /bh/invoice/create:
 *   post:
 *     summary: Create an invoice
 *     description: Create an invoice for a given contract with the provided information
 *     tags:
 *       - Invoice
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Access token to authorize the request
 *         required: true
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractId:
 *                 type: string
 *                 description: The ID of the contract for which the invoice is create
 *                 example: "63f4e7307fd8693b8edd5300"
 *               invoiceInfo:
 *                 type: object
 *                 properties:
 *                   listServiceDemands:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The ID of the service demand
 *                           example: "63f4e7327fd8693b8edd5312"
 *                         oldIndicator:
 *                           type: number
 *                           description: The old indicator for the service demand
 *                           example: 0
 *                         newIndicator:
 *                           type: number
 *                           description: The new indicator for the service demand
 *                           example: 30
 *                         service:
 *                           type: string
 *                           description: The ID of the service
 *                           example: "63f4e24968bdefc296884ff9"
 *                         quality:
 *                           type: number
 *                           description: The quality of the service
 *                           example: 3
 *                         amount:
 *                           type: number
 *                           description: The amount of the service
 *                           example: 5000
 *                         atMonth:
 *                           type: number
 *                           description: The month of the service demand
 *                           example: 3
 *                         atYear:
 *                           type: number
 *                           description: The year of the service demand
 *                           example: 2023
 *                         type:
 *                           type: number
 *                           description: The type of the service demand, type_quality = 0, type_indicator = 1
 *                           example: 0
 *                         enable:
 *                           type: boolean
 *                           description: The status of the service demand
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           description: The creation date of the service demand
 *                         updatedAt:
 *                           type: string
 *                           description: The last update date of the service demand
 *     responses:
 *       200:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: success message
 *                   example: create success
 *                 errorCode:
 *                   type: integer
 *                   description: error code
 *                   example: 200
 *                 data:
 *                    type: object
 *                    properties:
 *                      vat: 
 *                        type: number
 *                        example: 0.1
 *                      payStatus: 
 *                        type: string
 *                        description: status of paymont contain "Unpaid", "Pending", "Complete", "Failed", "Declined", "Cancelled", "Abandoned", "Refunsed"
 *                        example: "Pending"
 *                      amount: 
 *                        type: number
 *                        example: 20000000000
 *                      paymentMethod: 
 *                        type: string
 *                        example: "VNPay"
 *                      enable: 
 *                        type: boolean
 *                        example: true
 *                      _id:
 *                        type: string
 *                        example: "63f7ac1e0d28c2627cb22a47"
 *                      serviceDemands:
 *                        type: array
 *                        items:
 *                         type: string
 *                         description: street name
 *                         example: "63f4e7327fd8693b8edd5312"
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Internal server error
 */
router.post('/create', InvoiceController.createInvoice);
router.post('/:invoiceId/payment', InvoiceController.payForRentEachMonth);
router.post('/:invoiceId/extends', InvoiceController.extendPaymentInvoice);
module.exports = router;