// 2. Find duplicate lines
// a. Remove duplicate lines
// b. Remove duplicate lines and the original line

const input = `U123
U234
U452
U341
U123
U789
U1092
U109
U2342
U1092
U603
U745`;

// Method 1: use regex
// TODO

// ====================

// Method 2: use code

const lines = input.split(/\s+/);
let outputA = "";
let outputB = "";

const lineCount = new Map();
for (const line of lines) {
  const count = lineCount.get(line);

  if (!count) {
    lineCount.set(line, 1);
    outputA += line + "\n";
  } else {
    lineCount.set(line, count + 1);
  }
}

for (const [line, count] of lineCount.entries()) {
  if (count === 1) {
    outputB += line + "\n";
  }
}

console.log("Input");
console.log(input);

console.log("Remove duplicate lines");
console.log(outputA);
console.log();
console.log("Remove duplicate lines and original line");
console.log(outputB);
