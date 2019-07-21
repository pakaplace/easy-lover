const compareTwoResponses = (response = [], response1 = []) => {
  if (response.length !== response1.length) {
    throw Error(
      "Responses should contain same number of questions and answers."
    );
  }
  let score = 0;
  let sharedAnswers = [];
  if (response)
    response.forEach((answer, i) => {
      const counterAnswer = response1[i];
      if (
        answer.question === counterAnswer.question &&
        answer.answer === counterAnswer.answer
      ) {
        score++;
        sharedAnswers.push(answer);
      }
    });
  return { score, sharedAnswers };
};

module.exports = compareTwoResponses;

// compareTwoResponses(response, response1);
// const surveyJson = {
//   surveyFields: {
//     name: "hello",
//     status: "Active",
//     questionsJson: {
//       data: [
//         {
//           question: "Would you rather become...?",
//           answers: [
//             "40% Robot",
//             "Live the rest of your life without technology",
//             "Technology? I can barely deal with my flip phone"
//           ]
//         },

//         {
//           question: "Your go-to Bodega order",
//           answers: [
//             "Bacon Egg and Cheese",
//             "Jamaican Patty",
//             "Smoothie",
//             "Deli Sandwich "
//           ]
//         },
//         {
//           question: "Which drink do you prefer",
//           answers: [
//             "Negroni",
//             "Margarita",
//             "A good old beer",
//             "Glass of wine",
//             "A joint"
//           ]
//         }
//       ]
//     }
//   }
// };

// // Assumes everyone has the same survey questions
// const response = [
//   {
//     question: "Would you rather become...?",
//     answer: "Technology? I can barely deal with my flip phone"
//   },

//   {
//     question: "Your go-to Bodega order",
//     answers: "Bacon Egg and Cheese"
//   },
//   {
//     question: "Which drink do you prefer",
//     answers: "Negroni"
//   }
// ];

// const response1 = [
//   {
//     question: "Would you rather become...?",
//     answer: "Technology? I can barely deal with my flip phone"
//   },

//   {
//     question: "Your go-to Bodega order",
//     answers: "Bacon Egg and Cheese"
//   },
//   {
//     question: "Which drink do you prefer",
//     answers: "Negroni"
//   }
// ];
