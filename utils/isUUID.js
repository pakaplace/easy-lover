const { isString } = require("lodash");
console.log("isString", isString);
module.exports = isUUID = id => {
  const UUIDRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return isString(id) && UUIDRegex.test(id);
};
