const { toObjectId } = require("../utils/common.helper");

dotenv = require("dotenv").config();
const _this = {};
_this.ADMIN = {
  _id: toObjectId("64531367c302b42965d7285e"),
  username: "BUGHOUSE",
  name: "BUG HOUSE",
  address: "0xA3b2973d8b81cF77fB7bfa0F21302aDc3B553CF3",
  private_key:
    "44e0bc583096183d9ae18fa199fa7e6083843179e73d937c345dfb0a16d1e29a",
};
_this.bugId = "64183444b98701f5a86b9296";

_this.ACTION_TRANSFER = {
  TOP_UP: "top_up",
  WITHDRAW: "withdraw",
  TRANSFER: "transfer",
  CLAIM: "claim",
  SIGN_CONTRACT: "sign_contract",
  CREATE_ROOM: "create_room",
  PAY_FOR_RENT: "pay_for_rent",
  RECEIVE_INVOICE_PAYMENT: "pay_invoice_payment",
  DEPOSIT: "deposit",
};
module.exports = _this;
