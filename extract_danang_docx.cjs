const fs = require('fs');
const mammoth = require('mammoth');

const docxFile = 'eduspace/tailieu/DANANG- THI THU TN THPT 2026/DE-DA-DANANG25-26.docx';
const outFile = 'eduspace/tailieu/DANANG- THI THU TN THPT 2026/danang_html.html';

(async () => {
    try {
        const result = await mammoth.convertToHtml({ path: docxFile });
        fs.writeFileSync(outFile, result.value, 'utf8');
        console.log('Successfully converted to HTML. Chars:', result.value.length);
    } catch (e) {
        console.error('Error:', e);
    }
})();
