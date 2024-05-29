const router = require("express").Router();
const authController = require("../controller/auth.controller");

/**
 * @swagger
 * /bh/auth/login:
 *   post:
 *     summary: Login to user account
 *     description: Login user and retrieve access token and refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               username: canhcutcon
 *               password: 123456
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login success
 *                 errorCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: sdadds
 *                     refreshToken:
 *                       type: string
 *                       example: sadfasds
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 640374297ecb0c7ed28ed914
 *                         username:
 *                           type: string
 *                           example: canhcutcon
 *                         name:
 *                           type: string
 *                           example: Võ Thị Trà Giang
 *                         avatar:
 *                           type: string
 *                           example: ""
 *                         wishList:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: ""
 *                           example: []
 *                         wallet:
 *                           type: object
 *                           properties:
 *                             walletPrivateKey:
 *                               type: string
 *                               example: 0x4866c25eb5f214484003d8c1862cbded1bab6a1dc6b800623c746aa74c171504
 *                             walletAddress:
 *                               type: string
 *                               example: 0x177a2D7180a2b902fD213e6a66b80DeDF8340424
 *                             balance:
 *                               type: number
 *                               example: 0
 *                             enable:
 *                               type: boolean
 *                               example: true
 */
router.post("/login", authController.login);
/**
 * @swagger
 * /bh/auth/registry:
 *   post:
 *     summary: Register a new user account
 *     description: Register a new user account and return the user information, access token and refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               email: 
 *                  type: string
 *             example:
 *               username: canhcutcon
 *               password: 123456
 *               name: Võ Thị Trà Giang
 *               contactInfo: 84972347165
 *               email: giangvo@gmail.com
 *     responses:
 *       200:
 *         description: User registration success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account is create succesful"
 *                 errorCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   example: {}
 */
router.post("/registry", authController.registry);
/**
 * @swagger
 * /bh/auth/reset-otp:
 *   post:
 *     summary: Reset OTP for user account
 *     description: Reset OTP for user account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user to reset OTP for.
 *             example:
 *               username: canhcutcon
 *     responses:
 *       200:
 *         description: OTP reset successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message confirming the successful OTP reset.
 *                   example: "OTP already send!"
 *                 errorCode:
 *                   type: number
 *                   description: The status code of the response.
 *                   example: 200
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                 errorCode:
 *                   type: number
 *                   description: The status code of the response.
 *                   example: 400
 *       404:
 *         description: User not found error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                 errorCode:
 *                   type: number
 *                   description: The status code of the response.
 *                   example: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                 errorCode:
 *                   type: number
 *                   description: The status code of the response.
 *                   example: 500
 */

router.post("/reset-otp", authController.resetOTP);
/**
 * @swagger
 * /bh/auth/confirm-account:
 *   post:
 *     summary: Confirm user account with OTP code
 *     description: Confirm user account with OTP code
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user to confirm.
 *               otp:
 *                 type: string
 *                 description: The OTP code sent to the user's email or phone.
 *             example:
 *               username: canhcutcon
 *               otp: 123456
 *     responses:
 *       200:
 *         description: Account confirmation successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "Account confirm successful"
 *                 errorCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   example: {}
*/
router.post("/confirm-account", authController.confirmAccount);
/**
 * @swagger
 * /bh/auth/verify-email/{token}:
 *   post:
 *     summary: Verify email for user account
 *     description: Verify email for user account
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token sent to user's email for verification
 *     responses:
 *       200:
 *         description: Email verification success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the success of the operation
 *                   example: Verify account success!
 *                 errorCode:
 *                   type: integer
 *                   description: The error code of the response
 *                   example: 200
 *                 data:
 *                   type: object
 *                   description: Additional data returned from the API
 *                   example: {}
 *       400:
 *         description: Error occurred during email verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error that occurred
 *                   example: Missing token parameter
 *                 errorCode:
 *                   type: integer
 *                   description: The error code of the response
 *                   example: 400
 *                 data:
 *                   type: object
 *                   description: Additional data returned from the API
 *                   example: {}
 */
router.get("/verify-email/:token", authController.verifyEmail);

/**
 * @swagger
 * /bh/auth/verify-info:
 *   put:
 *     summary: Verify user information
 *     description: Updates the user profile with identity information to verify user information
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User information to be verified
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user whose information is being verified
 *               name:
 *                 type: string
 *                 description: The user's name
 *               dob:
 *                 type: string
 *                 description: The user's date of birth
 *               sex:
 *                 type: string
 *                 description: The user's gender
 *               id:
 *                 type: string
 *                 description: The user's identification number
 *               home:
 *                 type: string
 *                 description: The user's home address
 *               address_entities:
 *                 type: object
 *               identityImg:
 *                 type: array
 *             example:
 *               userId: "example_user_id"
 *               name: "Example User"
 *               dob: "1990-01-01"
 *               sex: "male"
 *               id: "example_id"
 *               home: "123 Example St."
 *               address_entities: "{}"
 *               identityImg: []
 *     responses:
 *       200:
 *         description: The user's profile has been updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the success of the operation
 *                   example: "Update user profile success"
 *                 errorCode:
 *                   type: integer
 *                   description: The error code of the response
 *                   example: 200
 *                 data:
 *                   type: object
 *                   description: Additional data returned from the API
 *                   example: {}
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error that occurred
 *                   example: "Invalid request data"
 *                 errorCode:
 *                   type: integer
 *                   description: The error code of the response
 *                   example: 400
 */
router.put("/verify-info", authController.verifyInfoUser);

module.exports = router;


