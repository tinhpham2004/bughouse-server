const USER_TRANSACTION_ACTION = {
    DEPOSIT: "deposit",
    REVERT_TRANSACTION: "revert_transaction",
    SIGN_CONTRACT: "sign_contract",
    WITHDRAW: "withdraw",
    PAYMENT: "payment",
    PENALTY: "penalty",
    PAY_FOR_RENT: "pay_for_rent",
    RECEIVE_INVOICE_PAYMENT: "receive_invoice_payment",
    CLAIM: "claim",
    CREATE_ROOM: "create_room",
};

const ACTION_FUNCTION = {
    [USER_TRANSACTION_ACTION.DEPOSIT]: "plus",
    [USER_TRANSACTION_ACTION.CLAIM]: "plus",
    [USER_TRANSACTION_ACTION.PAYMENT]: "plus",
    [USER_TRANSACTION_ACTION.REVERT_TRANSACTION]: "plus",
    [USER_TRANSACTION_ACTION.RECEIVE_INVOICE_PAYMENT]: "plus",
    [USER_TRANSACTION_ACTION.WITHDRAW]: "minus",
    [USER_TRANSACTION_ACTION.SIGN_CONTRACT]: "minus",
    [USER_TRANSACTION_ACTION.PENALTY]: "minus",
    [USER_TRANSACTION_ACTION.PAY_FOR_RENT]: "minus",
    [USER_TRANSACTION_ACTION.CREATE_ROOM]: "minus",
};

module.exports = {
    USER_TRANSACTION_ACTION,
    ACTION_FUNCTION,
};
