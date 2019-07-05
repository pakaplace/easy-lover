var fs = require("fs");
var data = fs.readFileSync("data.csv", "utf8");
// console.log(data);
let arr = data.split("\n");
// console.log("ARARARAR", arr);
arr.shift();
// console.log("New ARR", arr);
// console.log(newArr);
// let newArr = [
//   "A. Aries,A. become 40% robot,B. Jamican Patty,B. m 4 m,B. Narragansett,A. Moodring,B. or in your preferred method but lose autonomy over the selection,C. Goat farm in upstate New York,C. Words of Affirmation,,Name,5/18/2019 2:07:38,c319f9122c58e909c82c9593e1f9ac12"
// ];
let finalAnswers = [];
arr.forEach((resp, i) => {
  finalAnswers[i] = resp.split(",");
});
let finalArr = [];
// console.log("HERE", finalAnswers);
// console.log("final answers", finalAnswers);
finalAnswers.forEach((resp, i) => {
  let result = resp.splice(0, 10);
  console.log("~~~~~", result);
  let obj = Object.assign({}, result);
  finalArr.push(obj);
});
console.log(finalArr);
fs.writeFile("./parsedData.json", JSON.stringify(finalArr), err => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Parsed Data has been created");
});
