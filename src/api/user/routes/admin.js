const router = require("express").Router();
const AdminController = require("../controller/admin.controller");

router.get("/users", AdminController.getAllUser);
router.get("/rooms", AdminController.getAllRoom);

module.exports = router;
