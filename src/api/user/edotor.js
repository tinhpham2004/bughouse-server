const axios = require("axios");

// const getCity = async (nameCity) => {
//     let data;
//     await axios.get(`https://jsonmock.hackerrank.com/api/countries?name=${nameCity}`)
//         .then((response) => data = response.data)
//         .catch((error) => console.log(error));

//     if (data.data.length === 0) {
//         return '-1';
//     }
//     console.log("🚀 ~ file: edotor.js:5 ~ getCity ~ data:", data.data[0].capital)

//     return data.data[0].capital;
// }

// getCity("Afghanistan");

// const getDataByPage = async (page) => {
//     let data;

//     await axios.get(`https://jsonmock.hackerrank.com/api/tvseries?page=${page}`)
//         .then((response) => data = response.data)
//         .catch((error) => console.log(error));
//     return data;
// }
// const getGenreByData = async (genre) => {
//     let page = 1;
//     const listGenre = [];
//     while (true) {
//         const { data, total_pages } = await getDataByPage(page);

//         if (total_pages < page) {
//             break;
//         }

//         for (let i = 0; i < data.length; i++) {
//             const genres = data[i].genre.split(',');
//             if (genres.includes(genre))
//                 listGenre.push(data[i]);
//         }
//         page++;
//     }

//     return listGenre;
// }
// async function bestInGenre(genre) {
//     const genres = await getGenreByData(genre);
//     if (!genres || genres.length === 0)
//         return '';

//     const highestRate = genres.reduce((highest, current) => {
//         return highest.imdb_rating > current.imdb_rating ? highest : current;
//     });

//     console.log("🚀 ~ file: edotor.js:57 ~ bestInGenre ~ highestRate.name:", highestRate.name)
//     return highestRate.name;
// }

// bestInGenre('Comedy')

// const getDataByPage = async (page) => {
//     let data;

//     await axios.get(`https://jsonmock.hackerrank.com/api/universities?page=${page}`)
//         .then((response) => data = response.data)
//         .catch((error) => console.log(error));
//     return data;
// }

// async function highestInternationalStudents(firstCity, secondCity) {
//     let page = 1;
//     const listFirstCity = [];
//     const sercondCitys = [];
//     let highestInternationalStudent = null;
//     while (true) {
//         const { data, total_pages } = await getDataByPage(page);
//         if (total_pages < page) {
//             break;
//         }

//         for (let i = 0; i < data.length; i++) {
//             if (data[i].location.city === firstCity)
//                 listFirstCity.push(data[i])
//             else if (data[i].location.city === secondCity)
//                 sercondCitys.push(data[i]);
//         }
//         page++;
//     }
//     if (listFirstCity) {
//         highestInternationalStudent = listFirstCity.reduce((highest, current) => {
//             return highest.international_students > current.international_students ? highest : current;
//         });
//     }

//     if (highestInternationalStudent == null || !highestInternationalStudent)
//         highestInternationalStudent = sercondCitys.reduce((highest, current) => {
//             return highest.international_students > current.international_students ? highest : current;
//         });

//     console.log("🚀 ~ file: edotor.js:100 ~ highestInternationalStudents ~ highestInternationalStudent.university:", highestInternationalStudent.university)

//     return highestInternationalStudent.university;

// }
// highestInternationalStudents('Princeton', 'London');

// const crypto = require('../../utils/crypto.hepler');
// // Sample JSON object
// const json = {
//     name: 'John Doe',
//     age: 30,
//     email: 'johndoe@example.com'
// };

// // Convert JSON to string
// const jsonString = JSON.stringify(json);

// const hash = crypto.hash(jsonString);

// if (crypto.match(hash, jsonString))
//     console.log(' string is match')
// const fs = require('fs').promises;
// const sourceCode = fs.readFile('src/api/user/blockchain/contract/BHRentalContract.sol', 'utf8');

// console.log("🚀 ~ file: edotor.js:128 ~ sourceCode:", sourceCode)
// require("dotenv").config();
// const express = require("express");
// const engine = require("express-handlebars");
// const app = express();
// const hbs = engine.create({
//     extname: ".hbs",
// });

// // set up view engine
// app.engine("hbs", hbs.engine);
// app.set("view engine", "hbs");

// // 1. Set up PayPal API credentials
// const paypal = require("@paypal/checkout-server-sdk");
// const {PAYPAL_CLIENT_ID, PAYPAY_CLIENT_SERECTKEY} = process.env;
// const environment = new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAY_CLIENT_SERECTKEY);
// const client = new paypal.core.PayPalHttpClient(environment);

// const {vnp_TmnCode} = process.env;
// const {vnp_HashSecret} = process.env;
// let {vnp_Url} = process.env;
// const {vnp_ReturnUrl} = process.env;
// // 2. Create a PayPal payment button
// const createPayment = async (req, res) => {
//     try {
//         const amount = req.body.amount;
//         const returnUrl = req.body.returnUrl;
//         const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
//         const orderId = vnpay.generateOrderId();
//         const orderInfo = "Payment for order " + orderId;
//         const secureHash = vnp_HashSecret;

//         const data = qs.stringify({
//             vnp_Version: "2.0.0",
//             vnp_Command: "pay",
//             vnp_TmnCode: "YOUR_TMNCODE",
//             vnp_Amount: amount,
//             vnp_CurrCode: "VND",
//             vnp_BankCode: "NCB",
//             vnp_TxnRef: orderId,
//             vnp_OrderInfo: orderInfo,
//             vnp_OrderType: "other",
//             vnp_Locale: "vn",
//             vnp_ReturnUrl: returnUrl,
//             vnp_IpAddr: ipAddr,
//             vnp_CreateDate: new Date().toISOString().slice(0, 19).replace("T", " "),
//             vnp_SecureHashType: "SHA256",
//             vnp_SecureHash: secureHash,
//         });

//         const response = await axios.post("http://sandbox.vnpayment.vn/paymentv2/vpcpay.html", data);

//         res.status(200).json({
//             message: "Payment request successfully created",
//             redirectUrl: response.data,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "An error occurred while creating payment request",
//             error,
//         });
//     }
// const { amount } = req.body;
// const request = new paypal.orders.OrdersCreateRequest();
// request.prefer("return=representation");
// request.requestBody({
//   intent: "CAPTURE",
//   purchase_units: [{
//     amount: {
//       currency_code: "USD",
//       value: amount
//     }
//   }],
//   application_context: {
//     return_url: "http://localhost:3000/success",
//     cancel_url: "http://localhost:3000/cancel"
//   }
// });

// try {
//   const response = await client.execute(request);
//   return res.render(response.result.links.find(link => link.rel === 'approve').href);
// } catch (error) {
//   console.error(error);
//   return res.status(500).send('Something went wrong');
// }
// };

// // 3. Verify the payment information and retrieve the payment amount
// const capturePayment = async (req, res) => {
//     const {orderID, payerID} = req.query;
//     const request = new paypal.orders.OrdersCaptureRequest(orderID);
//     request.requestBody({payer_id: payerID});

//     try {
//         const response = await client.execute(request);
//         const amount = response.result.purchase_units[0].amount.value;
//         // 4. Use Web3.js to add the payment amount to the user's Metamask wallet
//         // Example code:
//         // const Web3 = require('web3');
//         // const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//         // const address = '0x123456789abcdef';
//         // const value = web3.utils.toWei(amount, 'ether');
//         // const transactionHash = await web3.eth.sendTransaction({to: address, value: value});
//         return res.send("Payment successful");
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send("Something went wrong");
//     }
// };

// // 5. Return a response to the PayPal API to confirm the payment
// const success = (req, res) => {
//     return res.send("Payment successful");
// };
// module.exports = {
//     createPayment,
//     capturePayment,
// };
// // const cancel = (req, res)

// // const ExchangeNftService = require("./ExchangeNftService");
// // const {BadRequest} = require("../exceptions");

// handler.createExchangeNft = async (req) => {
//     const {packageId} = req.params;
//     const {nft, address, metadataURL} = req.payload;

//     // Retrieve the package with the given ID that is still active
//     const foundPackage = await ExchangeNftService.getOneOrFailPackage({
//         _id: packageId,
//         status: PackageStatus.ACTIVE,
//     });

//     // Check for duplicate NFT IDs
//     const nftIds = new Set(nft.map((item) => item.id));
//     if (nftIds.size !== nft.length) {
//         throw new BadRequest("Duplicate NFT IDs");
//     }

//     // Create exchange NFT items for each NFT in the request payload
//     const exchangeNfts = await Promise.all(
//         nft.map(async (item) => {
//             const metadataUrl = `${metadataURL}/${item.id}`;
//             return ExchangeNftService.createExchangeNFTItem({
//                 id: item.id,
//                 address,
//                 chainId: foundPackage.chainIds[0],
//                 packageId,
//                 price: item.price,
//                 metadataURL: metadataUrl,
//             });
//         })
//     );

//     return exchangeNfts;
// };

// // const ExchangeItem = require("./ExchangeItem");
// // const {BadRequest} = require("../exceptions");
// // const {convertBalanceToWei} = require("../utils");

// const createExchangeNFTItem = async ({id, address, chainId, packageId, price, metadataURL}) => {
//     const existItem = await ExchangeItem.findOneAndDelete({
//         id,
//         address,
//         packageId: ObjectId(packageId),
//     });
//     const {data} = await axios.get(metadataURL);
//     if (!data || !data.image || !data.name) {
//         throw new BadRequest("Invalid metadata URL");
//     }
//     const dataItem = await ExchangeItem.findOneAndUpdate(
//         {status: 0, chainId},
//         {
//             $set: {
//                 status: 1,
//                 image: data.image,
//                 name: data.name,
//                 id,
//                 address,
//                 price,
//                 chainId,
//                 priceWei: convertBalanceToWei(price),
//                 packageId: ObjectId(packageId),
//             },
//         },
//         {new: true, upsert: true}
//     );
//     return dataItem;
// };

// module.exports = {
//     createExchangeNFTItem,
// };
