const router = require('express').Router();
const RoomController = require('../controller/room.controller');

/**
 * @swagger
 * /bh/room/create-room:
 *   post:
 *     summary: Create a new room for rent
 *     tags:
 *       - Room
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: New room data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       '200':
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateRoomResponse'
 *       '400':
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create-room', RoomController.createRoomForRent);
router.post('/re-open/:roomId', RoomController.reOpenRoom);

router.put('/:roomId', RoomController.updateRoom);
router.get('/', RoomController.getAllRoom);
router.get('/:roomId', RoomController.getRoom);
router.get('/:roomId/feedback', RoomController.getRoomFeedBack);
router.get('/:roomId/report', RoomController.getRoomReport);
router.get('/:userId', RoomController.getOwnerRoom);
router.get('/user/rented', RoomController.getRentedRoom);
router.get('/user/leased', RoomController.getLeasedRoom);
module.exports = router;