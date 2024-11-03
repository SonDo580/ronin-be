// 1. Check if a string contains the word word in it (case insensitive):

const reg1 = /\bword\b/gi;

const test1Inputs = [
  "I'm a word", // word
  "I'm a WORD", // WORD
  "This is a wordy sentence", // no match
  "There are word and WoRd", // word, WoRd
];

console.log("Quiz 1");
for (const input of test1Inputs) {
  console.log(input.match(reg1));
}
console.log();

// ====================

// 3. With regex you can count the number of matches.
// Can you make it return the number of uppercase consonants
// (B,C,D,F,..,X,Y,Z) in a given string?
// E.g.: it should return 3 with the text ABcDeFO!.
// Note: Only ASCII. We consider Y to be a consonant!
// Example: the regex /./g will return 3 when run against the string abc.

// exclude A, E, I, O, U
const reg3 = /[B-DF-HJ-NP-TV-Z]/g;

const test3Inputs = [
  "ABcDeF!", // 3 (B, D, F)
  "HELLO WORLD", // 7 (H, L, L, W, R, L, D)
  "Why Not?", // 2 (W, H)
];

console.log("Quiz 3");
for (const input of test3Inputs) {
  const matches = input.match(reg3);
  const count = matches ? matches.length : 0;
  console.log(count);
}
console.log();

// ====================

// 6. Oh no! It seems my friends spilled beer all over my keyboard
// last night and my keys are super sticky now.
// Some of the time whennn I press a key, I get two duplicates.
// Can you ppplease help me fix thhhis?

const reg6 = /(.)\1\1/g;
const substitution6 = "$1";

const input6 = `Some of the time whennn I press a key, I get two duplicates.
Can you ppplease help me fix thhhis?`;
const output6 = input6.replace(reg6, substitution6);

console.log("Quiz 6");
console.log("Input:", input6);
console.log("Output:", output6);
console.log();

// ====================

// 12. Could you help me validate my input and only match
//     positive integers between the range of 0 and 100?

const reg12 = /(?<!-)\b\+?(?:\d{1,2}|100)\b/g;

const test12Inputs = [
  "Sam has 200 apples. He gives Todd 20 and Mary 125.", // 20
  "The weather is -5 C today, but will be +5 C tomorrow.", // 5
  "one two 500 four 10 and 20", // 10, 20
];

console.log("Quiz 12");
for (const input of test12Inputs) {
  console.log(input.match(reg12));
}
console.log();
