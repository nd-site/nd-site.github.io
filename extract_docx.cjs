const mammoth = require('mammoth');
const path = require('path');

const files = [
    'eduspace/tailieu/CỤM TRƯỜNG HẢI PHÒNG - LẦN 2.docx',
    'eduspace/tailieu/CỤM TRƯỜNG HẢI PHÒNG - LẦN 2 - ĐA.docx'
];

(async () => {
    for (const f of files) {
        const result = await mammoth.extractRawText({ path: f });
        const outFile = path.basename(f, '.docx').replace(/\s/g, '_') + '.txt';
        require('fs').writeFileSync('eduspace/tailieu/' + outFile, result.value, 'utf8');
        console.log('Extracted:', outFile, '- chars:', result.value.length);
    }
})();
