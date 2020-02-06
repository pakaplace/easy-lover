const { isString } = require("lodash");
console.log("isString", isString);

const isUUID = id => {
  const UUIDRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return isString(id) && UUIDRegex.test(id);
};

const ignoreIfFailed = async (result, operation) => {
  const f = async () => {
    return result;
  };

  try {
    await f();
  } catch (e) {
    console.log(`Ignoring failure in operation: ${operationName}`, {
      error: e
    });
  }
};

const compareTwoResponses = (response, response1) => {
  if (response.length !== response1.length) {
    console.error(
      "Responses should contain same number of questions and answers"
    );
    return;
  }
  let score = 0;
  const sharedAnswers = [];
  if (response)
    // Refactor to just use object.keys and values outside the loop
    response.forEach((res, i) => {
      const otherResponse = response1.slice(0);
      const counterRes = otherResponse[i];
      if (
        Object.keys(res)[0] === Object.keys(counterRes)[0] &&
        Object.values(res)[0] === Object.values(counterRes)[0]
      ) {
        score++;
        sharedAnswers.push(res);
      }
    });
  //shared answers will be used to give a random ice breaker question
  return { score, sharedAnswers };
};

module.exports = {
  compareTwoResponses,
  isUUID,
  ignoreIfFailed
};
