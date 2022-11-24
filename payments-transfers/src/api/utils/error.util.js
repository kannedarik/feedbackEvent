exports.getErrorObject = async (errName, errMsg, errObject) => {
  let error = new Error();
  error.name = errName;
  error.message = errMsg;
  error.stack = errObject;
  return error;
}
