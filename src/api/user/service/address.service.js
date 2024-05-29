require("dotenv").config();
const axios = require("axios");
const District = require("../../../model/ditrict.model");
const chain = require("../../../model/chain");

const { VIETNAM_DATASET_URL } = process.env;

class AddressService {
  fetchCityData() {
    try {
      const response = require("../../../../database-view/address.json");
      return response;
    } catch (error) {
      throw new Error("Failed to fetch city data");
    }
  }

  async getDistrictList() {
    const cityData = await this.fetchCityData();

    return cityData.district.map(({ name, pre }) => ({ name, pre }));
  }

  async getEntitiesByDistrict(districtName, entityType) {
    const cityData = this.fetchCityData();
    const groupedData = {};

    cityData.district.forEach((district) => {
      groupedData[district.name] = {
        wards: district.ward.map((ward) => ward.name),
        streets: district.street.map((street) => street),
      };
    });

    return groupedData;
  }

  async getWardsByDistrict(districtName) {
    return await this.getEntitiesByDistrict(districtName, "ward");
  }

  async getStreetsByDistrict(districtName) {
    return await this.getEntitiesByDistrict(districtName, "street");
  }

  async getDistrictsFromDatabase() {
    const districts = (await this.fetchCityData()).district.map((d) => d.name);
    return districts;
  }

  async getWardsFromDatabase(districtName) {
    return await this.getWardsByDistrict(districtName);
  }

  async getStreetsFromDatabase(districtName) {
    return await this.getStreetsByDistrict(districtName);
  }
}

module.exports = new AddressService();
