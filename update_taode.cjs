const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'eduspace', 'taode', 'index.html');
let content = fs.readFileSync(p, 'utf8');

// 1. Remove apiKey input
content = content.replace(/<div class="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<div class="space-y-2">\s*<label class="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Tên bài kiểm\s*tra:<\/label>[\s\S]*?<\/div>\s*<\/div>/, '<div class="grid grid-cols-1 gap-6">\n                    <div class="space-y-2">\n                        <label class="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Tên bài kiểm tra:</label>\n                        <input type="text" id="testTitle"\n                            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all shadow-sm"\n                            placeholder="Tên bài (Để trống AI tự đặt)...">\n                    </div>\n                </div>');

// 2. Change generateQuiz to use eduspaceAI.call
content = content.replace(/const apiKey = document\.getElementById\('apiKey'\)\.value\.trim\(\);\n\s*const manualTitle = document\.getElementById\('testTitle'\)\.value\.trim\(\);\n\s*if \(!apiKey\) return alert\("Vui lòng nhập API Key!"\);/, 'const manualTitle = document.getElementById(\'testTitle\').value.trim();');

const oldFetch = /const response = await fetch\([\s\S]*?\n\s*const data = await response\.json\(\);\n\n\s*if \(data\.error\) throw new Error\(data\.error\.message\);\n\n\s*let jsCode = data\.candidates\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text \|\| "";/;

const newFetch = `
                let jsCode = await window.eduspaceAI.call({
                    contents: [{
                        role: 'user',
                        parts: [{ text: systemPrompt + '\\n\\nNội dung đề bài (toàn bộ):\\n\\n' + extractedText }]
                    }]
                });
                if (!jsCode) throw new Error("AI không trả về dữ liệu. Có thể do tệp quá lớn vượt quá giới hạn của AI.");
`;

content = content.replace(oldFetch, newFetch);
content = content.replace('if (!jsCode) throw new Error("AI không trả về dữ liệu. Có thể do tệp quá lớn vượt quá giới hạn của AI.");\n\n                if (!jsCode) throw new Error("AI không trả về dữ liệu. Có thể do tệp quá lớn vượt quá giới hạn của AI.");', 'if (!jsCode) throw new Error("AI không trả về dữ liệu. Có thể do tệp quá lớn vượt quá giới hạn của AI.");');

// 3. Add scripts to head
if (!content.includes('data_modal.js')) {
    content = content.replace('</head>', '    <script src="/assets/js/data_modal.js"></script>\n    <script src="/assets/js/ai.js"></script>\n</head>');
}

fs.writeFileSync(p, content, 'utf8');
console.log('done');
