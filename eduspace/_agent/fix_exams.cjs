const fs = require('fs');
const path = require('path');

const basePath = 'd:\\WebSite\\EduSpace - Đổi giao diện 150526\\eduspace';

const filesList = `
- \\congnghe-congnghiep\\10\\ck2-2526-v1\\data.js
- \\congnghe-congnghiep\\11\\ck2-2526-v1\\data.js
- \\congnghe-congnghiep\\12\\ck2-2526-v1\\data.js
- \\congnghe-nongnghiep\\10\\ck2-2526-v1\\data.js
- \\congnghe-nongnghiep\\11\\ck2-2526-v1\\data.js
- \\congnghe-nongnghiep\\12\\ck2-2526-v1\\data.js
- \\dialy\\10\\on-tap-hk1-2526-v1\\data.js
- \\gdqp\\10\\on-tap-hk1-2526-v1\\data.js
- \\hoahoc\\10\\ck2-2526-v1\\data.js
- \\hoahoc\\11\\ck2-2526-v1\\data.js
- \\hoahoc\\12\\ck2-2526-v1\\data.js
- \\hoahoc\\lop10\\ck2-2526-v1\\data.js
- \\ktpl\\10\\ck2-2526-v1\\data.js
- \\ktpl\\11\\ck2-2526-v1\\data.js
- \\ktpl\\12\\ck2-2526-v1\\data.js
- \\lichsu\\10\\bai7-kntt\\data.js
- \\lichsu\\10\\ck2-2526-v1\\data.js
- \\lichsu\\10\\on-tap-hk1-2526-v1\\data.js
- \\lichsu\\11\\ck2-2526-v1\\data.js
- \\lichsu\\12\\ck2-2526-v1\\data.js
- \\sinhhoc\\10\\ck2-2526-v1\\data.js
- \\sinhhoc\\10\\on-tap-hk1-2526-v1\\data.js
- \\sinhhoc\\11\\ck2-2526-v1\\data.js
- \\sinhhoc\\12\\ck2-2526-v1\\data.js
- \\tinhoc\\10\\ck2-2526-v1\\data.js
- \\tinhoc\\11\\ck2-2526-v1\\data.js
- \\tinhoc\\12\\ck2-2526-v1\\data.js
- \\toan\\10\\ck2-2526-v1\\data.js
- \\toan\\11\\ck2-2526-v1\\data.js
- \\toan\\12\\ck2-2526-v1\\data.js
- \\vatly\\10\\ck2-2526-v1\\data.js
- \\vatly\\10\\moment-luc\\data.js
- \\vatly\\10\\on-tap-gk2-v1\\data.js
- \\vatly\\10\\on-tap-hk1-2526-v1\\data.js
- \\vatly\\11\\ck2-2526-v1\\data.js
- \\vatly\\12\\ck2-2526-v1\\data.js
`;

const group1Subjects = ['dialy', 'hoahoc', 'sinhhoc', 'toan', 'vatly'];
const group2Subjects = ['congnghe-congnghiep', 'congnghe-nongnghiep', 'gdqp', 'ktpl', 'lichsu', 'tinhoc'];

function stringifyData(data) {
    let str = JSON.stringify(data, null, 4);
    // Remove quotes from keys
    str = str.replace(/"([^"]+)":/g, '$1:');
    return `window.quizData = ${str};\n`;
}

function processFile(relPath) {
    const fullPath = path.join(basePath, relPath.trim());
    if (!fs.existsSync(fullPath)) {
        console.log("Not found:", fullPath);
        return;
    }
    
    const subject = relPath.split('\\')[1];
    const isGroup1 = group1Subjects.includes(subject);

    console.log(`Processing: ${relPath} (Group 1: ${isGroup1})`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Evaluate the JS content carefully
    let quizData = null;
    const globalContext = { window: {} };
    try {
        const sandbox = new Function('window', content + '; return window.quizData;');
        quizData = sandbox(globalContext.window);
    } catch(e) {
        console.error("Error parsing", relPath, e);
        return;
    }

    if (!quizData || !quizData.questions) {
        console.error("Invalid quizData in", relPath);
        return;
    }

    const originalMultiple = quizData.questions.filter(q => q.type === 'multiple');
    const originalEssay = quizData.questions.filter(q => q.type === 'essay');
    const originalTF = quizData.questions.filter(q => q.type === 'truefalse');
    const originalShort = quizData.questions.filter(q => q.type === 'short');
    
    const newQuestions = [];
    
    // 12 MCQ
    const mcqCount = 12;
    for (let i = 0; i < mcqCount && i < originalMultiple.length; i++) {
        newQuestions.push(originalMultiple[i]);
    }

    // 4 TF
    const tfCount = 4;
    let tfBaseIndex = mcqCount;
    for (let i = 0; i < tfCount; i++) {
        if (originalTF && originalTF[i]) {
            newQuestions.push(originalTF[i]);
            continue;
        }
        const baseIdx = tfBaseIndex + i;
        if (baseIdx < originalMultiple.length) {
            const mcq = originalMultiple[baseIdx];
            newQuestions.push({
                type: "truefalse",
                question: `Xét nhận định sau: ${mcq.question}. Các phát biểu dưới đây đúng hay sai?`,
                options: mcq.options,
                correct: mcq.options.map((_, idx) => idx === mcq.correct),
                explanation: mcq.explanation || ""
            });
        }
    }

    // 4 Short (if Group 1)
    if (isGroup1) {
        const shortCount = 4;
        let shortBaseIndex = tfBaseIndex + tfCount;
        for (let i = 0; i < shortCount; i++) {
            if (originalShort && originalShort[i]) {
                newQuestions.push(originalShort[i]);
                continue;
            }
            const baseIdx = shortBaseIndex + i;
            if (baseIdx < originalMultiple.length) {
                const mcq = originalMultiple[baseIdx];
                let ansText = mcq.options[mcq.correct];
                let numMatch = ansText ? ansText.replace(/[^0-9.,-]/g, '') : '';
                let correctVal = numMatch.length > 0 ? numMatch.substring(0, 4) : '1';
                if (correctVal.endsWith('.') || correctVal.endsWith(',')) {
                    correctVal = correctVal.substring(0, correctVal.length - 1);
                }
                newQuestions.push({
                    type: "short",
                    question: `${mcq.question} (Lưu ý: Đáp án đúng gốc là "${ansText}". Hãy nhập số hoặc giá trị thích hợp)`,
                    correct: correctVal,
                    explanation: mcq.explanation || `Đáp án gốc: ${ansText}`
                });
            }
        }
    }

    // Append all original essay questions
    newQuestions.push(...originalEssay);

    // Update config layout
    quizData.config.examLayout = {
        multiple: { count: 12, pointsPerQ: 0.25 },
        truefalse: { 
            count: 4, 
            pointsPerQ: isGroup1 ? 0.5 : 1.0,
            partialScoring: isGroup1 ? [0.05, 0.125, 0.25, 0.5] : [0.1, 0.25, 0.5, 1.0]
        }
    };
    if (isGroup1) {
        quizData.config.examLayout.short = { count: 4, pointsPerQ: 0.5 };
    }
    quizData.config.examLayout.essay = { count: originalEssay.length || 3, pointsPerQ: 1.0 };

    quizData.questions = newQuestions;

    const finalOutput = stringifyData(quizData);
    
    // Add some nice comments at the top just in case
    let comments = `// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)\n// Nhóm môn: ${isGroup1 ? "Có trả lời ngắn (MCQ, TF, Short, Essay)" : "Không có trả lời ngắn (MCQ, TF, Essay)"}\n\n`;

    fs.writeFileSync(fullPath, comments + finalOutput, 'utf8');
}

const lines = filesList.split('\n');
const files = lines.map(l => {
    let text = l.replace('- ', '').trim();
    if (!text) return '';
    // extract just the path, which stops before a space
    let pathPart = text.split(' ')[0].trim();
    return pathPart;
}).filter(Boolean);

files.forEach(f => processFile(f));
console.log("Done.");
