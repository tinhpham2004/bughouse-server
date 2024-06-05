const authService = require("../service/auth.service");

class AuthController {
  // [POST] bh/auth/registry
  async registry (req, res, next) {
    try {
      const { message, errorCode, data } = await authService.registry(req.body);

      return res.status(errorCode).json({
        errorCode,
        message,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // [POST] bh/auth/login
  async login (req, res, next) {
    try {
      const { message, data, errorCode } = await authService.login(req.body);

      return res.status(errorCode).json({
        message,
        data,
        errorCode,
      });
    } catch (error) {
      next(error);
    }
  }

  // [POST] bh/auth/confirm-account
  async confirmAccount (req, res, next) {
    const { username, otp } = req.body;

    try {
      const { message, errorCode, data } = await authService.confirmAccount(
        username,
        `${otp}`
      );

      return res.status(errorCode).json({
        message,
        data,
        errorCode,
      });
    } catch (err) {
      next(err);
    }
  }

  // [POST] bh/auth/reset-otp
  async resetOTP (req, res, next) {
    const { username } = req.body;
    try {
      const { message, data, errorCode } = await authService.resetOTP(username);

      res.status(errorCode).json({
        message,
        errorCode,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  // [POST] bh/auth/verify-email
  async verifyEmail (req, res, next) {
    try {
      const { token } = req.params;
      if (!token) {
        throw new Error("verify_email==> missing parameter");
      }

      await authService.verifyEmail(token);

      return res.status(200).json({
        message: "xác thực tài khoản thành công!",
        errorCode: 200,
        data: {},
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        errorCode: 400,
        data: {},
      });
    }
  }

  // [PUT] bh/auth/verify-info
  async verifyInfoUser (req, res, next) {
    const { userId, name, dob, sex, id, home, address_entities, identityImg } =
      req.body;
    try {
      const data = await authService.updateProfileByIndentity(userId, {
        ...identityImg,
        name,
        dob,
        sex,
        id,
        identityImg,
        home,
        address_entities,
      });

      res.status(200).json({
        message: "cập nhật thông tin user thành công.",
        errorCode: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
