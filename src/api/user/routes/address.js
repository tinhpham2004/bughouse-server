const router = require("express").Router();
const addressController = require("../controller/address.controller");

router.get("/district", addressController.getDistrict);
router.get("/district/:districtName", addressController.getDistrictDetail);
router.get("/wards/:districtName", addressController.getWard);
router.get("/streets/:districtName", addressController.getStreet);

module.exports = router;
