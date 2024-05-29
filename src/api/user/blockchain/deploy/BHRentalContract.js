require("dotenv").config();
const { BigNumber } = require("@ethersproject/bignumber");
const BN = require("bignumber.js");
const web3 = require("../config/web3-init");
const fs = require("fs");
const smartHouseAbi = require("../../web3/smart-house-abi.json");
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ContractRentalHouse = new web3.eth.Contract(
  smartHouseAbi,
  CONTRACT_ADDRESS
);

const User = require("../../../../model/user/user.model");
const Room = require("../../../../model/room.model");
const Notification = require("../../../../model/user/notification.model");
const Invoice = require("../../../../model/transaction/invoice.model");
const Contract = require("../../../../model/transaction/contract.model");

const userWalletService = require("../../service/user-wallet.service");
const crypto = require("../../../../utils/crypto.hepler");

const {
  vndToEth,
  convertBalanceToWei,
} = require("../../../../utils/blockchain");
const { ACTION_TRANSFER, ADMIN } = require("../../../../config/default");
const Web3Services = require("../../web3/web3-caller");

const RentalContract = {};
RentalContract.reOpenRoomForRent = async (
  room,
  ownerAddress,
  amountRent,
  deposit
) => {
  const { wallet, _id } = await User.getUserByWallet(ownerAddress);

  amountRent = await vndToEth(amountRent / 1000);
  deposit = await vndToEth(deposit / 1000);
  const valueRent = new BN(convertBalanceToWei(amountRent / 1000)); // price of room is wei
  const valueDeposit = new BN(convertBalanceToWei(deposit));
  const renterAbi = ContractRentalHouse.methods
    .reOpenRoomForRent(room.roomUid, valueRent, valueDeposit)
    .encodeABI();

  const tx = {
    from: wallet.walletAddress,
    to: CONTRACT_ADDRESS,
    gasLimit: web3.utils.toHex(300000),
    data: renterAbi,
    value: 0,
  };
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    wallet.walletPrivateKey
  );
  const txReceipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );

  const transactionHash = txReceipt.transactionHash;
  const event = await RentalContract.getGetEventFromTransaction(
    transactionHash,
    ContractRentalHouse
  );
  console.log(
    "🚀 ~ file: BHRentalContract.js:166 ~ setRoomForRent: ~ event:",
    event
  );

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  if (event.length === 0) throw new Error("event not found");
  const { returnValues } = event[0];
  const [roomUpdate] = await Promise.all([
    Room.findOneAndUpdate(
      { _id: room._id },
      {
        lstTransaction: transactionHash,
        status: "available",
        roomUid: returnValues._roomId,
      }
    ),
  ]);

  const notification = await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id],
    content: `mở lại cho thuê phòng ${room.name} thành công`,
  });
  return {
    roomUpdate,
    notification,
  };
};

RentalContract.payForRentMonth = async (
  renterAddress,
  roomUid,
  invoice,
  invoiceAmount,
  rentAmount
) => {
  const { wallet, _id, username } = await User.getUserByWallet(renterAddress);
  // convert payment to ether
  const valueInvoiceFee = await vndToEth(invoiceAmount / 1000);
  const valuePay = await vndToEth(rentAmount / 1000);

  // check balance of renter
  const userBalance = await RentalContract.getUserBalance(renterAddress);
  const val = new BN(convertBalanceToWei(valueInvoiceFee));
  const invoiceHash = crypto.hash(invoice);
  const payRenter = ContractRentalHouse.methods
    .payForRentByMonth(roomUid, invoiceHash, val)
    .encodeABI();
  const value = convertBalanceToWei(valueInvoiceFee + valuePay);

  const tx = {
    from: renterAddress,
    to: CONTRACT_ADDRESS,
    gasLimit: 300000,
    value: BN(value).toNumber(),
    data: payRenter,
  };

  const signedTx = await web3.eth.accounts
    .signTransaction(tx, wallet.walletPrivateKey)
    .catch((error) => {
      throw new Error(error);
    });
  const txReceipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .catch((error) => {
      throw new Error(error);
    });
  const signTransactionHash = txReceipt.transactionHash;
  console.log(txReceipt);

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  const event = await RentalContract.getGetEventFromTransaction(
    signTransactionHash,
    ContractRentalHouse
  );
  if (event.length === 0) throw new Error("event not found");
  console.log(
    "🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:",
    event
  );
  // const { returnValues } = event[0];

  // create invoice
  const invoiceUpdate = await Invoice.findOneAndUpdate(
    { _id: invoice._id },
    {
      payStatus: "Complete",
      txhash: signTransactionHash,
      paymentDate: new Date(),
      hash: invoiceHash,
    }
  );
  // update user balance
  await userWalletService.changeBalance(
    _id,
    invoiceAmount + rentAmount,
    signTransactionHash,
    ACTION_TRANSFER.PAY_FOR_RENT
  );

  await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id],
    content: `bạn đã thanh toán hoá đơn với khoản ${
      invoiceAmount + rentAmount
    } thành công!`,
  });
  // // update owner balance
  await userWalletService.changeBalance(
    invoice.contract.lessor,
    invoiceAmount + rentAmount,
    signTransactionHash,
    ACTION_TRANSFER.RECEIVE_INVOICE_PAYMENT
  );

  await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [invoice.contract.lessor],
    content: `bạn nhận được từ ${username} khoản ${
      invoiceAmount + rentAmount
    } thanh toán tiền dịch vụ`,
  });

  const notification = await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id, invoice.contract.lessor],
    content: "thanh toán hoá đơn thành công",
  });

  return { invoiceUpdate, notification };
};

RentalContract.endRent = async (ownerAddress, room, renterAddress) => {
  if (!ownerAddress || !room) throw new Error("missing parameter");
  const { wallet, _id } = await User.getUserByWallet(ownerAddress);
  const renter = await User.getUserByWallet(renterAddress);

  const { roomUid, deposit } = room;
  const endRentTransaction = ContractRentalHouse.methods
    .endRent(roomUid)
    .encodeABI();
  const tx = {
    from: wallet.walletAddress,
    to: CONTRACT_ADDRESS,
    gasLimit: 300000,
    value: 0,
    data: endRentTransaction,
  };

  const signedTx = await web3.eth.accounts
    .signTransaction(tx, wallet.walletPrivateKey)
    .catch((error) => {
      throw new Error(error);
    });
  const txReceipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .catch((error) => {
      throw new Error(error);
    });
  const signTransactionHash = txReceipt.transactionHash;
  console.log(txReceipt);

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  const event = await RentalContract.getGetEventFromTransaction(
    signTransactionHash,
    ContractRentalHouse
  ).catch((error) => {
    throw new Error(error);
  });

  if (event.length === 0) throw new Error("event not found");

  const [updateRoom, updateContract] = await Promise.all([
    Room.updateOne(
      { _id: room._id },
      {
        status: "not-available",
        lstTransaction: signTransactionHash,
        $inc: { nbCurrentPeople: -1 },
      }
    ),
    Contract.updateOne(
      { room: room._id, renter: renter._id },
      {
        status: "not-available",
      }
    ),
  ]);

  if (updateRoom.modifiedCount < 1) throw new Error("update room fail!");
  if (updateContract.modifiedCount < 1)
    throw new Error("update contract fail!");

  const notification = await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id, renter._id],
    content: "kết thúc thuê thành công!",
  });

  // update user balance
  await userWalletService.changeBalance(
    renter._id,
    parseFloat(deposit),
    signTransactionHash,
    ACTION_TRANSFER.DEPOSIT
  );

  await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [renter._id],
    content: `bạn nhận lại tiền cọc ${deposit}`,
  });
  return { notification };
};

RentalContract.endRentInDue = async (
  ownerAddress,
  room,
  renterAddress,
  penaltyFee = 0
) => {
  if (!ownerAddress || !room) throw new Error("missing parameter");
  const { wallet, _id } = await User.getUserByWallet(ownerAddress);
  const renter = await User.getUserByWallet(renterAddress);
  const valuePay = await vndToEth(penaltyFee);

  const val = new BN(convertBalanceToWei(valuePay));

  const { roomUid, deposit } = room;
  const endRentTransaction = ContractRentalHouse.methods
    .endRentWithPenalty(roomUid, val)
    .encodeABI();
  const tx = {
    from: wallet.walletAddress,
    to: CONTRACT_ADDRESS,
    gasLimit: 300000,
    value: val,
    data: endRentTransaction,
  };

  const signedTx = await web3.eth.accounts
    .signTransaction(tx, renter.wallet.walletPrivateKey)
    .catch((error) => {
      throw new Error(error);
    });
  const txReceipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .catch((error) => {
      throw new Error(error);
    });
  const signTransactionHash = txReceipt.transactionHash;
  console.log(txReceipt);

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  const event = await RentalContract.getGetEventFromTransaction(
    signTransactionHash,
    ContractRentalHouse
  ).catch((error) => {
    throw new Error(error);
  });

  if (event.length === 0) throw new Error("event not found");

  const [updateRoom, updateContract] = await Promise.all([
    Room.updateOne(
      { _id: room._id },
      {
        status: "not-available",
        lstTransaction: signTransactionHash,
        $inc: { nbCurrentPeople: -1 },
      }
    ),
    Contract.updateOne(
      { room: room._id, renter: renter._id },
      {
        status: "not-available",
      }
    ),
  ]);

  if (updateRoom.modifiedCount < 1) throw new Error("update room fail!");
  if (updateContract.modifiedCount < 1)
    throw new Error("update contract fail!");

  const notification = await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id, renter._id],
    content: "kết thúc thuê thành công!",
  });

  // lessor receive the deposit of renter
  await userWalletService.changeBalance(
    _id,
    parseFloat(deposit),
    signTransactionHash,
    ACTION_TRANSFER.DEPOSIT
  );

  await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id],
    content: `bạn nhận được khoản tiền cọc từ phòng ${room.name}: ${deposit}`,
  });
  return { notification };
};

// RentalContract.getUserBalance = async (address) => {
//   const balanceWei = await web3.eth.getBalance(address);
//   return web3.utils.fromWei(balanceWei, "ether");
// };

// Hàm ước tính phí gas
const estimateGas = async (fromAddress, toAddress, amount, action) => {
  const { wallet } = await User.getUserByWallet(fromAddress);

  amount = await vndToEth(amount);
  const value = new BN(convertBalanceToWei(amount));

  const pay = ContractRentalHouse.methods
    .transferBalance(wallet.walletAddress, toAddress, value, action)
    .encodeABI();

  const tx = {
    from: wallet.walletAddress,
    to: CONTRACT_ADDRESS,
    data: pay,
  };

  const gasEstimate = await web3.eth.estimateGas(tx);
  console.log(`Estimated Gas: ${gasEstimate}`);
  return gasEstimate;
};

RentalContract.transferBalance = async (
  fromAddress,
  toAddress,
  amount,
  action = "transfer"
) => {
  try {
    const { wallet } = await User.getUserByWallet(fromAddress);
    console.log("🚀 ~ from:", fromAddress, toAddress, wallet);

    // Chuyển đổi số tiền từ VND sang ETH
    const ethAmount = await vndToEth(amount);
    const value = await convertBalanceToWei(ethAmount, 6);
    console.log("🚀 ~ value:", value);

    const pay = ContractRentalHouse.methods
      .transferBalance(wallet.walletAddress, toAddress, value, action)
      .encodeABI();

    const tx = {
      from: wallet.walletAddress,
      to: CONTRACT_ADDRESS,
      data: pay,
      value: value, // Giá trị được chuyển đi
      gas: 300000,
    };
    // Ký giao dịch
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      wallet.walletPrivateKey
    );

    // Gửi giao dịch và nhận biên nhận
    const txReceipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log("Transaction successful with hash:", txReceipt.transactionHash);
    return txReceipt;
  } catch (error) {
    console.error("Error in transferBalance:", error);
    throw new Error(
      `Transaction has been reverted by the EVM: ${error.message}`
    );
  }
};

RentalContract.extendsContract = async (
  ownerAddress,
  roomUid,
  contractHash
) => {
  if (!ownerAddress || !roomUid || !contractHash)
    throw new Error("missing parameter");
  const { wallet, _id } = await User.getUserByWallet(ownerAddress);
  const signOwner = wallet;

  const extendRent = ContractRentalHouse.methods
    .extendRentalRoom(roomUid, contractHash)
    .encodeABI();
  const tx = {
    from: signOwner.walletAddress,
    to: CONTRACT_ADDRESS,
    gasLimit: 300000,
    value: 0,
    data: extendRent,
  };

  const signedTx = await web3.eth.accounts
    .signTransaction(tx, wallet.walletPrivateKey)
    .catch((error) => {
      throw new Error(error);
    });
  const txReceipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .catch((error) => {
      throw new Error(error);
    });
  const signTransactionHash = txReceipt.transactionHash;
  console.log(txReceipt);

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  const event = await RentalContract.getGetEventFromTransaction(
    signTransactionHash,
    ContractRentalHouse
  ).catch((error) => {
    throw new Error(error);
  });
  return { txHash: signTransactionHash, roomUid, contractHash };
};

RentalContract.signByRenter = async (
  renterAddress,
  contractHash,
  roomUid,
  rentAmount,
  depositAmount
) => {
  const { wallet, _id } = await User.getUserByWallet(renterAddress);
  let userPay = await vndToEth((rentAmount + depositAmount + 1000) / 100);
  console.log("🚀 ~ userPay:", userPay);
  const value = convertBalanceToWei(userPay);
  console.log("🚀 ~ value:", value);

  const userBalance = await RentalContract.getUserBalance(wallet.walletAddress);
  if (userBalance < userPay) throw new Error("Insufficient funds!");

  const signRenterAbi = ContractRentalHouse.methods
    .signByRenter(roomUid, contractHash)
    .encodeABI();
  const tx = {
    from: wallet.walletAddress,
    to: CONTRACT_ADDRESS,
    gasLimit: web3.utils.toHex(300000),
    value: value,
    data: signRenterAbi,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    wallet.walletPrivateKey
  );
  const txReceipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );
  const signTransactionHash = txReceipt.transactionHash;

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const event = await RentalContract.getGetEventFromTransaction(
    signTransactionHash,
    ContractRentalHouse
  );
  if (event.length === 0) throw new Error("Event not found");

  const { returnValues } = event[0];

  const room = await Room.findOneAndUpdate(
    { roomUid: returnValues._roomId, status: "available" },
    {
      status: "already-rent",
      lstTransaction: signTransactionHash,
    }
  );

  await userWalletService.changeBalance(
    _id,
    rentAmount + depositAmount,
    signTransactionHash,
    ACTION_TRANSFER.SIGN_CONTRACT
  );

  const notification = await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id],
    content: `You have paid the fee for signing the contract with the amount of ${
      rentAmount + depositAmount
    }`,
  });
  return { room, notification };
};

RentalContract.setRoomForRent = async (
  roomId,
  ownerAddress,
  amountRent,
  deposit
) => {
  const { wallet, _id } = await User.getUserByWallet(ownerAddress);
  const from = wallet;
  console.log("🚀 ~ ownerAddress:", ownerAddress);
  amountRent = await vndToEth(amountRent / 100);
  console.log("🚀 ~ amountRent:", amountRent / 100);
  deposit = await vndToEth(deposit / 100);
  console.log("🚀 ~ deposit:", deposit / 100);
  const valueRent = new BN(await convertBalanceToWei(amountRent));
  const valueDeposit = new BN(await convertBalanceToWei(deposit));
  const renterAbi = ContractRentalHouse.methods
    .setRoomForRent(valueRent, valueDeposit)
    .encodeABI();

  const tx = {
    from: from.walletAddress,
    to: CONTRACT_ADDRESS,
    gasLimit: 300000,
    data: renterAbi,
    value: "0x0",
  };
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    wallet.walletPrivateKey
  );
  const txReceipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );

  const transactionHash = txReceipt.transactionHash;
  const event = await RentalContract.getGetEventFromTransaction(
    transactionHash,
    ContractRentalHouse
  );

  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (event.length === 0) throw new Error("Event not found");
  const { returnValues } = event[0];
  const roomUpdate = await Room.findOneAndUpdate(
    { _id: roomId },
    {
      lstTransaction: transactionHash,
      status: "available",
      roomUid: returnValues._roomId,
    }
  );

  await userWalletService.changeBalance(
    _id,
    5000,
    null,
    ACTION_TRANSFER.CREATE_ROOM
  );

  await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id],
    content: `You have paid 5000 VND for creating a rental room!`,
  });

  const notification = await Notification.create({
    userOwner: ADMIN._id,
    type: "NOTIFICATION",
    tag: [_id],
    content: "Room for rent created successfully!",
  });
  return { roomUpdate, notification };
};

RentalContract.getGetEventFromTransaction = async (txHash, contract) => {
  try {
    const transaction = await web3.eth.getTransaction(txHash);
    const blockNumber = transaction?.blockNumber;
    if (!blockNumber) return [];
    const events = await contract.getPastEvents("allEvents", {
      fromBlock: blockNumber,
      toBlock: blockNumber,
    });
    return events;
  } catch (error) {
    throw new Error(error);
  }
};

RentalContract.getUserBalance = async (address) => {
  const balanceWei = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balanceWei, "ether");
};

module.exports = RentalContract;
