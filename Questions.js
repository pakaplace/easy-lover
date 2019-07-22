const fs = require("fs");
const _ = require("lodash");
var data = JSON.parse(fs.readFileSync("parsedData.json", "utf8"));

const straightGirls = [];
const straightGuys = [];
const gayGuys = [];
const gayGirls = [];

data.forEach((person, i) => {
  // console.log("PERSON~~~~", person, "\n");
  switch (person[2]) {
    case "m 4 w":
      straightGuys.push(person);
      break;
    case "w 4 m":
      straightGirls.push(person);
      break;
    case "m 4 m":
      gayGuys.push(person);
      break;
    // case "w 4 w":
    //   gayGirls.push(person);
    //   break;
  }
});
// console.log("Straight Guys", straightGuys);
let allStraightMatches = [];
let allGayMatches = [];
let allLesbianMatches = [];
straightGuys.forEach((guy, i) => {
  let score = 0;
  let matches;
  let guyName = guy[0];
  // delete guy["0"];
  // console.log("GUYS~~~~~", guy);
  straightGirls.forEach((girl, i) => {
    let girlName = girl[0];
    // delete girl["0"];
    console.log("Reached");
    for (key in girl) {
      console.log("reached", key);
      if (guy[key] === girl[key]) {
        if (key == "0") return;
        score++;
      }
    }
    allStraightMatches.push({
      person0: { name: guyName, ...guy },
      person1: { name: girlName, ...girl },
      score
    });
  });
});
console.log("AllStraigjtMathces", allStraightMatches);

gayGuys.forEach((guy, i) => {
  let score = 0;
  let guyName = guy[0];
  // delete guy["0"];
  gayGuys.forEach((guy1, j) => {
    let guy1Name = guy[0];
    // delete gayGuys["0"];
    console.log("Reached6");
    if (i === j + 1) return;
    console.log("asdasdasdasdasdasdasdasdasd");
    for (key in guy1) {
      if (guy[key] === guy1[key]) {
        if (key == "0") return;
        score++;
      }
    }
    allGayMatches.push({
      person0: { name: guyName, ...guy },
      person1: { name: guy1Name, ...guy1 },
      score
    });
  });
});
console.log("ALLl GAY MATCHES", allGayMatches);
// gayGirls.forEach((girl, i) => {
//   let score = 0;
//   let girlName = girl[0];
//   delete girl["0"];
//   gayGirls.forEach((girl1, j) => {
//     let girl1Name = girl1[0];
//     delete gayGirls["0"];
//     if (i === j) return;
//     for (key in girl1) {
//       if (key == "0") return;

//       if (girl[key] === girl1[key]) {

//         score++;
//       }
//     }
//     allLesbianMatches.push({
//       person0: { ...girl },
//       person1: { ...girl1 },
//       score
//     });
//   });
// });

allStraightMatches = _.sortBy(allStraightMatches, ["score"]).reverse();
allGayMatches = _.sortBy(allGayMatches, ["score"]).reverse();
console.log("All straight matches", allStraightMatches);
allLesbianMatches = _.sortBy(allLesbianMatches, ["score"]).reverse();

const straightMatchesArray = [];
const gayMatchesArray = [];
const lesbianMatchesArray = [];
allStraightMatches.forEach((match, i) => {
  // console.log("MAtch~~", match);
  console.log("A1234567890", match.person0["0"]);
  let guyIndex = _.findIndex(straightGuys, { "0": match.person0["0"] });
  let girlIndex = _.findIndex(straightGirls, { "0": match.person1["0"] });
  console.log("asdasd", guyIndex, girlIndex);
  if (guyIndex > -1 && girlIndex > -1) {
    straightGuys.splice(guyIndex, 1);
    straightGirls.splice(girlIndex, 1);
    straightMatchesArray.push(match);
  }
});
allGayMatches.forEach((match, i) => {
  let guyIndex = _.findIndex(gayGuys, { "0": match.person0[0] });
  let guy1Index = _.findIndex(gayGuys, { "0": match.person1[0] });
  if (guyIndex > -1 && guy1Index > -1) {
    gayGuys.splice(guyIndex, 1);
    gayGuys.splice(guy1Index, 1);
    gayMatchesArray.push(match);
  }
});

// allLesbianMatches.forEach((match, i) => {
//   let girlIndex = _.findIndex(gayGirls, { name: match.person0.name });
//   let girl1Index = _.findIndex(gayGirls, { name: match.person1.name });
//   console.log(girlIndex, girl1Index);
//   if (girlIndex > -1 && girl1Index > -1) {
//     console.log("finishing8=D~~~~~~");
//     gayGirls.splice(girlIndex, 1);
//     gayGirls.splice(girl1Index, 1);
//     lesbianMatchesArray.push(match);
//   }
//   console.log("Lesbian matches array", lesbianMatchesArray);
// });
// console.log("straightMatchesArray", straightMatchesArray);
console.log("ASDASDASD1231231", straightMatchesArray);
let results = {
  allMatches: straightMatchesArray.concat(gayMatchesArray)
};

console.log("RESUTLS", results);
fs.writeFile("./matchesYay.json", JSON.stringify(results), err => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Results JSON File has been created");
});
