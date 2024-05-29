const MyError = require("../../../exception/MyError");
const User = require("../../../model/user/user.model");
const { isEmpty } = require("../../../utils/common.helper");
const commonHelper = require("../../../utils/common.helper");
const dateHelper = require("../../../utils/datetime.helper");

const NAME_INVALID = "Name invalid";
const USERNAME_INVALID = "Username invalid";
const USERNAME_EXISTS_INVALID = "Accoount already exist";
const PASSWORD_INVALID = "Password invalid more than 8 letter";
const CONTACT_INVALID = "Contact info invalid";
const DATE_INVALID = "Date of birth invalid";
const GENDER_INVALID = "Gender invalid";
const NAME_REGEX = /\w{1,50}/;

const userValidate = {
  validateEmail: (email) => {
    if (!email) return false;

    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
  },
  validatePhone: (phone) => {
    if (!phone) return false;
    const regex = /(84|0[3|5|7|8|9])+([0-9]{9})\b/g;

    return regex.test(phone);
  },

  validateUsername(username) {
    if (!username) { return false; }
    return true;
  },
  // not empty, minimun 8
  validatePassword: (password) => {
    if (!password) return false;
    if (password.length < 8) return false;

    return true;
  },

  validateDateOfBirth: (date) => {
    if (!date) return false;

    const { day, month, year } = date;

    if (!day || !month || !year) return false;

    if (year < 1900) return false;

    // check date
    const dateTempt = new Date(`${year}-${month}-${day}`);
    if (dateTempt.toDateString() === "Invalid Date") return false;

    // ages of user more than 18
    const fullyear = dateTempt.getFullYear();
    dateTempt.setFullYear(fullyear + 18);

    if (dateTempt > new Date()) return false;

    return true;
  },
  // must be int and have 6 digit
  validateOTP: (otp) => {
    if (!otp) return false;
    const regex = /^[0-9]{6}$/g;

    return regex.test(otp);
  },

  validateLogin: (username, password) => {
    if (!(this.validateEmail(username) || this.validateUsername(username) || this.validatePhone(username)) || !this.validatePassword(password)) throw new MyError("Info Login invalid");
  },

  // validate username and otp to corfirm account
  validateConfirmAccount(username, otpPhone) {
    if (!this.validateUsername(username) || !this.validateOTP(otpPhone)) { throw new MyError("Info confirm account invalid"); }
  },

  validateResetPassword(username, otpPhone, password) {
    if (
      !this.validateUsername(username)
      || !this.validateOTP(otpPhone)
      || !this.validatePassword(password)
    ) { throw new Error("Info reset password invalid"); }
  },

  validatePhonesList(phones) {
    if (!phones || !Array.isArray(phones)) { throw new MyError("Phones invalid"); }

    phones.forEach((phoneEle) => {
      const { phone, name } = phoneEle;
      if (!name || !phone || !this.validatePhone(phone)) { throw new MyError("Phones invalid"); }
    });
  },

  async checkRegistryInfo(userInfo) {
    const {
      username, password, contactInfo, email
    } = userInfo;
    const error = {};

    // check validate username
    if (!this.validateUsername(username)) error.username = USERNAME_INVALID;
    else if (await User.findOne({ username })) { error.username = USERNAME_EXISTS_INVALID; }

    // check contact info email or phone
    if (!contactInfo || !(this.validateEmail(email) || this.validatePhone(contactInfo))) error.contact = CONTACT_INVALID;

    // else if (await User.findOne({
    //     $or: [{ email: contactInfo }, { phone: contactInfo }]
    // }))
    //     error.contact = CONTACT_EXIST_INVALID;
    // $or: [{ email: contactInfo }, { phone: contactInfo }]
    // check validate password
    if (!this.validatePassword(password)) error.password = PASSWORD_INVALID;

    if (!isEmpty(error)) error.toString();

    return {
      username, password, contactInfo, error, email
    };
  },

  validateProfile: async (profile) => {
    const { name, dob, gender } = profile;

    const error = {};

    if (!name || !NAME_REGEX.test(name)) { error.name = NAME_INVALID; }

    if (!(gender === "Orther" || gender === "Female" || gender === "Man")) { error.gender = GENDER_INVALID; }

    if (!dob) { error.dob = DATE_INVALID; }

    if (commonHelper.isEmpty(error)) {
      console.log("🚀 ~ file: user.validation.js:147 ~ validateProfile: ~ error", error);
      return false;
    }
    return {
      name,
      dob: dateHelper.toObject(dob),
      gender,
    };
  },
};

module.exports = userValidate;
