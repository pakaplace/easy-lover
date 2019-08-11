const compareTwoResponses = (response, response1) => {
  console.log("Lengths", response.length, response1.length);
  if (response.length !== response1.length) {
    console.log(
      "Responses should contain same number of questions and answers"
    );
    return;
    throw Error(
      "Responses should contain same number of questions and answers."
    );
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

module.exports = compareTwoResponses;
