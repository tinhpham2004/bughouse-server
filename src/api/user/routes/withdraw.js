// const express = require("express");
// const router = express.Router();
// const paypal = require("paypal-rest-sdk");

// // Configure PayPal REST SDK with your API credentials
// paypal.configure({
//     mode: "sandbox", // Change to 'live' for production
//     client_id: "Acy4eV81L3T1V5i2Umqvq-AXQMhcNZxIfcAPxjHxg3tKVGhSf71lefkaWntsTUk-gowkX_vXtUxhO6SR",
//     client_secret: "EG-NDtKeISOmmtydSYQO2l9xN2kcLIhGJW2N0TNyT2JFooelE2BX4ZhaCninJ8BG-NJn_y5KWgvLSFMl",
// });

// // API endpoint for initiating the withdrawal
// router.post("/withdraw", async (req, res) => {
//     const {paypalEmail, amount} = req.body; // assuming request body contains PayPal email and amount

//     try {
//         // Create PayPal payout item object
//         const payoutItem = {
//             recipient_type: "EMAIL",
//             receiver: paypalEmail,
//             amount: {
//                 value: amount,
//                 currency: "USD",
//             },
//         };

//         // Create PayPal payout batch
//         const payout = await createPayout([payoutItem]);

//         // Check if payout was successful
//         if (payout.batch_header.batch_status === "SUCCESS") {
//             console.log("Payout successful:", payout);
//             res.status(200).json({success: true, message: "Payout successful"});
//         } else {
//             console.error("Payout failed:", payout);
//             res.status(500).json({success: false, message: "Payout failed"});
//         }
//     } catch (error) {
//         console.error("Error occurred:", error);
//         res.status(500).json({success: false, message: "Error occurred"});
//     }
// });

// // Function to create PayPal payout batch
// const createPayout = async (payoutItems) => {
//     return new Promise((resolve, reject) => {
//         paypal.payout.create(
//             {
//                 sender_batch_header: {
//                     sender_batch_id: "<your-sender-batch-id>",
//                     email_subject: "You have a payout!",
//                 },
//                 items: payoutItems,
//             },
//             (error, payout) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(payout);
//                 }
//             }
//         );
//     });
// };
// module.exports = router;
