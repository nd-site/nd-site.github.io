const fs = require('fs');
const text = fs.readFileSync('d:\\WebSite\\EduSpace - Đổi giao diện 150526\\eduspace\\tailieu\\DANANG- THI THU TN THPT 2026\\extracted_danang.txt', 'utf8');

// A very simple heuristic parser
let dataJs = `window.quizData = {
    title: "ĐỀ THI THỬ SỞ GĐ-ĐT ĐÀ NẴNG (TẶNG 04 25-26)",
    subject: "tinhoc",
    grade: "12",
    time: 50,
    examType: "Thử sức",
    questions: [
`;

// Part 1
const p1Match = text.match(/PHẦN I\..*?PHẦN II\./s);
if (p1Match) {
    const p1Text = p1Match[0];
    const qMatches = p1Text.split(/Câu \d+\./g).slice(1);
    
    qMatches.forEach((qText, idx) => {
        const lines = qText.split(/(?=[*]?[A-D]\.)/);
        let questionTitle = lines[0].trim();
        let options = [];
        let correctOption = '';
        for (let i = 1; i < lines.length; i++) {
            let opt = lines[i].trim();
            if (opt.startsWith('*')) {
                correctOption = opt.substring(1, 2); // 'A', 'B', 'C', 'D'
                opt = opt.substring(1);
            }
            options.push(opt.substring(2).trim());
        }
        
        dataJs += `        {
            id: "p1_q${idx + 1}",
            type: "multiple-choice",
            question: ${JSON.stringify(questionTitle)},
            options: ${JSON.stringify(options)},
            correctAnswer: "${correctOption}",
            explanation: "Chưa có giải thích chi tiết."
        },
`;
    });
}

// Part 2
const p2Match = text.match(/PHẦN II\..*?PHẦN III\./s) || text.match(/PHẦN II\..*?(?:---HẾT---|$)/s);
if (p2Match) {
    const p2Text = p2Match[0];
    const qMatches = p2Text.split(/Câu \d+\./g).slice(1);
    
    qMatches.forEach((qText, idx) => {
        // split by a), b), c), d)
        const parts = qText.split(/(?=[*]?[abcd]\))/);
        let questionTitle = parts[0].trim();
        let subQuestions = [];
        
        for (let i = 1; i < parts.length; i++) {
            let opt = parts[i].trim();
            let isTrue = false;
            if (opt.startsWith('*')) {
                isTrue = true;
                opt = opt.substring(1);
            }
            subQuestions.push({
                statement: opt.substring(2).trim(),
                correctAnswer: isTrue ? "Đúng" : "Sai"
            });
        }
        
        if (subQuestions.length > 0) {
            dataJs += `        {
            id: "p2_q${idx + 1}",
            type: "true-false",
            question: ${JSON.stringify(questionTitle)},
            subQuestions: ${JSON.stringify(subQuestions)},
            explanation: "Chưa có giải thích chi tiết."
        },
`;
        }
    });
}

dataJs += `    ]
};
`;

const outDir = 'd:\\WebSite\\EduSpace - Đổi giao diện 150526\\eduspace\\tinhoc\\12\\danang-2526-v1';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(outDir + '\\data.js', dataJs, 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ĐỀ THI THỬ SỞ GĐ-ĐT ĐÀ NẴNG (TẶNG 04 25-26) - EduSpace</title>
    <!-- Use standard template -->
</head>
<body>
    <script src="data.js"></script>
</body>
</html>
`;
fs.writeFileSync(outDir + '\\index.html', htmlContent, 'utf8');
console.log('Done!');
