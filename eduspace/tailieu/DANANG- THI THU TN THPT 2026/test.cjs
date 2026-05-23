const fs = require('fs');
const text = fs.readFileSync('d:\\WebSite\\EduSpace - Đổi giao diện 150526\\eduspace\\tailieu\\DANANG- THI THU TN THPT 2026\\extracted_danang.txt', 'utf8');

const p1Match = text.match(/PHẦN I\..*?PHẦN II\./s);
const p1Text = p1Match[0];
const qMatches = p1Text.split(/Câu \d+\./g).slice(1);

let qText = qMatches[0];
let lines = qText.split(/(?<!\*)(?=\*?[A-D]\.)/);
console.log("Lines:");
console.log(lines);

let correctOption = '';
let options = [];
for (let i = 1; i < lines.length; i++) {
    let opt = lines[i].trim();
    console.log("Processing opt:", opt);
    let isCorrect = false;
    if (opt.startsWith('*')) {
        isCorrect = true;
        opt = opt.substring(1).trim();
    }
    let letterMatch = opt.match(/^([A-D])\./);
    if (letterMatch) {
        let letter = letterMatch[1];
        if (isCorrect) correctOption = letter;
        options.push(opt.substring(2).trim());
    }
}

console.log("Correct Option:", correctOption);
