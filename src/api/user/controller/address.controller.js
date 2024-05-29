const addressService = require("../service/address.service");

class AddressController {
  // [GET] bh/address/ditricts
  async getDistrict(req, res, next) {
    try {
      const listDistrict = await addressService.getDistrictsFromDatabase();
      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: { listDistrict },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDistrictDetail(req, res, next) {
    try {
      const districtName = req.params.districtName;
      const data = addressService.getEntitiesByDistrict(districtName);
      console.log("🚀 ~ AddressController ~ getDistrictDetail ~ data:", data);
      const { wards, streets } = data[districtName];
      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: {
          wards: wards || [],
          streets: streets || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] bh/address/wards/:districtName
  async getWard(req, res, next) {
    try {
      const districtName = req.params.districtName;
      const groupedData = await addressService.getEntitiesByDistrict(
        districtName
      );

      if (!groupedData || !groupedData[districtName]) {
        return res.status(200).json({
          message: "success",
          errorCode: 400,
          data: {},
        });
      }

      const { wards } = groupedData[districtName];

      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: { wards },
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] bh/address/streets/:districtName
  async getStreet(req, res, next) {
    try {
      const districtName = req.params.districtName;
      const groupedData = await addressService.getEntitiesByDistrict(
        districtName
      );

      if (!groupedData || !groupedData[districtName]) {
        return res.status(200).json({
          message: "success",
          errorCode: 400,
          data: {},
        });
      }

      const { streets } = groupedData[districtName];

      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: { streets },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
