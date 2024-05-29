const router = require('express').Router();
const serviceApartmentController = require('../controller/service.controller');

router.post('/unit/create-unit', serviceApartmentController.createUnit);
router.put('/service-demand', serviceApartmentController.updateServiceDemand);
/**
 * @swagger
 * /bh/service/unit:
 *   get:
 *     summary: Get a list of rooms
 *     description: Returns a list of all rooms in the database
 *     responses:
 *       200:
 *         description: A list of rooms
 */
router.get('/unit', serviceApartmentController.getAllUnit);
router.get('/:roomId/service-demand', serviceApartmentController.getServiceDemand)
module.exports = router;