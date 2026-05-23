const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfs = [
    { file: 'eduspace/tailieu/CỤM 5 TRƯỜNG THPT - NINH BÌNH.pdf', out: 'NINH_BINH_DE.txt' },
    { file: 'eduspace/tailieu/CỤM 5 TRƯỜNG THPT - NINH BÌNH - ĐA.pdf', out: 'NINH_BINH_DA.txt' },
    { file: 'eduspace/tailieu/CUMDAKLAK-0501.pdf', out: 'DAKLAK_DE.txt' },
    { file: 'eduspace/tailieu/CAOBANG. Đề + Đáp án môn Tin học thi thử năm 2026 .pdf', out: 'CAOBANG.txt' },
    { file: 'eduspace/tailieu/CQT - THI THỬ THPTQG TIN.pdf', out: 'CQT.txt' },
];

(async () => {
    for (const { file, out } of pdfs) {
        try {
            const buf = fs.readFileSync(file);
            const instance = new pdfParse.PDFParse({ data: buf });
            const data = await instance.getText();
            fs.writeFileSync('eduspace/tailieu/' + out, data.text, 'utf8');
            console.log('OK:', out, '- chars:', data.text.length);
        } catch (e) {
            console.log('ERROR:', out, e.stack || e.message);
        }
    }
})();

