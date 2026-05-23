const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'eduspace', 'taode', 'index.html');
let content = fs.readFileSync(p, 'utf8');

const regex = /const apiKey = document\.getElementById\('apiKey'\)\.value\.trim\(\);\s*const manualTitle = document\.getElementById\('testTitle'\)\.value\.trim\(\);\s*if \(!apiKey\) return alert\("Vui lòng nhập API Key!"\);\s*if \(!extractedText\) return alert\("Vui lòng tải tệp đề bài lên!"\);/;

const replacement = `const manualTitle = document.getElementById('testTitle').value.trim();
            if (!extractedText) return alert("Vui lòng tải tệp đề bài lên!");`;

content = content.replace(regex, replacement);

const regexFetch = /const response = await fetch\([\s\S]*?body: JSON\.stringify\([\s\S]*?\)\s*}\);\s*const data = await response\.json\(\);\s*if \(data\.error\) throw new Error\(data\.error\.message\);\s*let jsCode = data\.candidates\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text \|\| "";/g;

const fetchReplacement = `let jsCode = await window.eduspaceAI.call({
                    contents: [{
                        role: 'user',
                        parts: [{ text: systemPrompt + '\\n\\nNội dung đề bài (toàn bộ):\\n\\n' + extractedText }]
                    }]
                });`;

content = content.replace(regexFetch, fetchReplacement);

fs.writeFileSync(p, content, 'utf8');
console.log('done');
