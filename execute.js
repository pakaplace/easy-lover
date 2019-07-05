// Require the lib, get a working terminal
var term = require("terminal-kit").terminal;

var robot = `
           .aAHHHAAUUAAHHHAn.
    .   .AHF                YHA.   .
    |  .AHHb.              .dHHA.  |
    |  HHAUAAHAbn      adAHAAUAHA  |
    I  HF~"_____        ____ ]HHH  I
   HHI HAPK""~^YUHb  dAHHHHHHHHHH IHH
   HHI HHHD> .andHH  HHUUP^~YHHHH IHH
   YUI ]HHP     "~Y  P~"     THH[ IUP
    "  'HK                   ]HH'  "
        ]HHHHAAUP" ~~ "YUAAHHHH[
        'HHP^~"  .annn.  "~^YHH'
         YHb    ~" "" "~    dHF
          "YAb..abdHHbndbndAP"
           THHAAb.  .adAHHF
              ]HHUUHHHHHH[
            .adHHb "HHHHHbn.
     ..andAAHHHHHHb.AHHHHHHHAAbnn.`;
const names = [
  { person1: "Mailiis", person2: "Tomas" },
  { person1: "Parker", person2: "Robot Lover" },
  { person1: "George", person2: "Georgie" },
  { person1: "Ilham", person2: "Sean" },
  { person1: "George", person2: "Georgie" },
  { person1: "Ilham", person2: "Sean" },
  { person1: "George", person2: "Georgie" },
  { person1: "Ilham", person2: "Sean" }
];

const prompts = [
  robot,
  "The Year is 2040",
  "Amazon Corp® Robots make ~optimal~ decisions on our behalf",
  "Find your lover",
  "░░░░░         23%",
  "░░░░░░░░░░░   82%",
  "░░░░░░░░░░░░░ 100%",
  "\n",
  "( ͡° ͜ʖ ͡°)",
  "Let the festivities begin!",
  "May 17th 2018",
  "Robot selects... ",
  "...",
  "...",
  "..."
];

let printPrompts = function() {
  let i = 0;
  setInterval(function() {
    console.log(prompts[i]);
    i++;
    if (i == prompts.length) process.exit();
  }, 2000);
};

let printNames = function() {
  let i = 0;
  setInterval(function() {
    console.log(
      `Robot selects ${names[i].person1} and ${
        names[i].person2
      } XOXOXO <3 ( ͡° ͜ʖ ͡°)`
    );
    i++;
    if (i == names.length) process.exit();
  }, 2000);
};

// printNames();

// Get some user input
var menuItems = ["Snowcrash", "Launch Codes", "Robot Wedding"];
term
  .magenta("Pick your destiny: ")
  .singleColumnMenu(menuItems, {}, printPrompts);
// process.exit();
