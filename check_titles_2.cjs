const fs = require('fs');
const dirs = ['ck1-2526-v1', 'ck2-2526-v1', 'gk1-2526-v1', 'gk2-2526-v1', 'thptqg-2026-v1', 'thptqg-2026-v2', 'thptqg-2026-v3', 'tx1-2526-v1', 'tx2-2526-v1'];
dirs.forEach(f => {
    try {
        const p = 'eduspace/tinhoc/12/' + f + '/data.js';
        const content = fs.readFileSync(p, 'utf8');
        const match = content.match(/title:\s*["'](.*?)["']/);
        console.log(f, ':', match ? match[1] : 'N/A');
    } catch(e) {
        console.log(f, 'Error');
    }
});
