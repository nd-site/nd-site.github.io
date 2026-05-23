const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const files = [
    {
        input: path.join(__dirname, 'eduspace/tailieu/Tin lan 2 - Tuyen Quang/De goc so 02 - CT.docx'),
        output: path.join(__dirname, 'TUYENQUANG_L2_DE02.txt')
    },
    {
        input: path.join(__dirname, 'eduspace/tailieu/De thi lan 3 (Lan 2 So)/Tin hoc/Ca 1/KSCL12.2_2026_TI_0924.docx'),
        output: path.join(__dirname, 'THANHHOA_0924.txt')
    }
];

async function extractAll() {
    for (const f of files) {
        try {
            console.log(`\nExtract: ${path.basename(f.input)}`);
            const result = await mammoth.extractRawText({ path: f.input });
            fs.writeFileSync(f.output, result.value, 'utf8');
            console.log(`=> Saved ${result.value.length} chars to ${path.basename(f.output)}`);
            // Print first 2000 chars
            console.log('--- PREVIEW ---');
            console.log(result.value.substring(0, 2000));
            console.log('--- END PREVIEW ---');
        } catch (err) {
            console.error(`ERROR: ${err.message}`);
        }
    }
}

extractAll();
