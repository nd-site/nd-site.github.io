const xlsx = require('xlsx');
const path = require('path');

const f = path.join(__dirname, 'eduspace/tailieu/Tin lan 2 - Tuyen Quang/Tin hoc - Dap an  - Lan 2.xlsx');
try {
    const wb = xlsx.readFile(f);
    wb.SheetNames.forEach(name => {
        console.log('=== Sheet:', name, '===');
        const ws = wb.Sheets[name];
        const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
        data.forEach((row, i) => {
            if (row.some(c => c !== null && c !== undefined && c !== '')) {
                console.log(`Row ${i}:`, row);
            }
        });
    });
} catch(e) {
    console.error('ERROR:', e.message);
    console.log('Trying mammoth on xlsx...');
}
