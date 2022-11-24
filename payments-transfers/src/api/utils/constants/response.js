var httpConstant = require('http-status');
module.exports = {
  errorCodes: {
    Exception: -101,
    BadParams: -102,
    LenderNotFound: -103,
    InvalidDateRange: -104,
    VanAccountNotFound: -105,
    TransferCreationError: -106,
    EmailFailed: -107,
    OrderIdNotFound: -108,
  },
  error: {
    Exception: "E_Server_Exception",
    BadParams: "Bad_Params",
    LenderNotFound: "Lender_Not_Found",
    InvalidDateRange: "Invalid_Date_Range",
    VanAccountNotFound: "Vanaccount_Not_Found",
    TransferCreationError: "Transfers_Not_Created",
    EmailFailed: "E_Mail_Sent_Failed",
    OrderIdNotFound: "Order_id_not_found"
  },
  errorMsg: {
    Exception: 'Something Unexpected Happened',
    BadParams: "Request recieved with invalid parameters. Please check and try again",
    LenderNotFound: "No lender was found",
    InvalidDateRange: "Start date cannot be greater than end date",
    VanAccountNotFound: "No vanaccount was found",
    TransferCreationError: "Transfer couldn't be created",
    EmailFailed: 'Mail was failed to sent',
    OrderIdNotFound: 'Order id was not found'
  },
  errorToHttpStatusMap: {
    Exception: httpConstant.INTERNAL_SERVER_ERROR,
    BadParams: httpConstant.BAD_REQUEST,
    LenderNotFound: httpConstant.BAD_REQUEST,
    InvalidDateRange: httpConstant.BAD_REQUEST,
    VanAccountNotFound: httpConstant.BAD_REQUEST,
    TransferCreationError: httpConstant.INTERNAL_SERVER_ERROR,
    EmailFailed: httpConstant.BAD_REQUEST,
    OrderIdNotFound: httpConstant.BAD_REQUEST,
  },
  success: {
    Default: "Success",
    LenderCreated: "Lender created successfully",
    VanAccountCreated: "Van account created successfully",
    VanAccountUpdated: "Van account updated successfully",
    VanAccountDeleted: "Van account deleted successfully",
    EmailSent: "Email sent successfully"
  },
  successCodes: {
    Default: 200,
    LenderCreated: 201,
    LenderDeleted: 202,
    VanAccountCreated: 203,
    VanAccountUpdated: 204,
    VanAccountDeleted: 205,
    EmailSent: 206
  },
  successToHttpStatusMap: {
    Default: 200,
    LenderCreated: 201,
    LenderDeleted: 204,
    VanAccountCreated: 201,
    VanAccountUpdated: 200,
    VanAccountDeleted: 204,
    EmailSent: 200
  }
}
