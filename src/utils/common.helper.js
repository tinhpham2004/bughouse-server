const bcrypt = require("bcryptjs");
const MyError = require("../exception/MyError");
const ArgumentError = require("../exception/ArgumentError");
const ObjectId = require('mongoose').Types.ObjectId;
const commonHelper = {
  isEmpty: (obj) => {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  },

  getRandomInt: (min, max) => {
    const minRan = Math.ceil(min);
    const maxRan = Math.floor(max);
    return Math.floor(Math.random() * (maxRan - minRan + 1)) + minRan;
  },

  getRandomOTP() {
    return this.getRandomInt(100000, 999999);
  },

  hashPassword: (value) => {
    if (!value) return null;

    return bcrypt.hash(value, 8);
  },

  getPagination: (query, defaultLimit = 50) => {
    if (!query) {
      return {
        limit: defaultLimit,
        page: 1,
        skip: 0,
      };
    }
    const { page } = query;
    const limit = parseInt(query.limit);
    const paginationInfo = {
      limit: Number.isInteger(limit) ? limit : defaultLimit,
      page: page ? parseInt(page) : 1,
    };

    paginationInfo.skip = paginationInfo.limit * (paginationInfo.page - 1);
    return paginationInfo;
  },
  convertToNumber: (value) => {
    value = Number(value);

    if (value === undefined || value === null)
      throw new MyError('missing value');

    if (isNaN(value))
      throw new MyError('Value must be number');

    if (value < 0) {
      throw new Error("Number of floor cannot be negative");
    }
    return value;
  },

  convertUpperStringToNFD: (value) => {
    // normalize() function takes a form argument that specifies the Unicode normalization form to use. In this case
    // expression /[\u0300-\u036f]/g matches all Unicode characters in the "Mn" category, which includes most diacritical marks used in Latin scripts.
    const normalizedStr = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const result = normalizedStr.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    // const formattedStr = normalizedStr.charAt(0).toUpperCase() + normalizedStr.slice(1).toLowerCase();
    return result;
  },

  validateGender: (value) => {
    if (!value)
      throw new ArgumentError('valid gender ==> ');

    const gender = ['Male', 'Female', 'All'];

    return gender.includes(value);
  },

  deepCopy: (obj) => {
    if (typeof (obj) === 'object') {
      if (Array.isArray(obj))
        return obj.map(this.deepCopy);
      else {
        const copy = {};
        for (const value in obj)
          copy[value] = this.deepCopy(obj[value]);

        return copy;
      }
    }
    return obj;
  },
  toObjectId: (string) => {
    if (!string)
      throw new ArgumentError('to objectIb ==> ');

    return new ObjectId(string);
  }
};

module.exports = commonHelper;
