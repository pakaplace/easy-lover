var fs = require("fs");
var matches = JSON.parse(fs.readFileSync("matchesYay.json", "utf8"));
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

let printPrompts = function() {
  let i = 0;
  setInterval(function() {
    console.log(prompts[i]);
    i++;
    if (i == prompts.length) process.exit();
  }, 2000);
};

let printMatches = function() {
  let i = 0;
  setInterval(function() {
    console.log(
      `AI selects ${matches.allMatches[i].person0.name} and ${
        matches.allMatches[i].person1.name
      } XOXOXO <3 ( ͡° ͜ʖ ͡°)\n `
    );
    i++;
    if (i == matches.allMatches.length - 1) i = 0;
  }, 10000);
};

var menuItems = ["Wed Party Guests", "Clone Party Guests", "Pleasure Guests"];
term
  .magenta("Choose your destiny: ")
  .singleColumnMenu(menuItems, {}, printMatches);
// process.exit();
