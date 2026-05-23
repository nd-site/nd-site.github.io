const fs = require('fs');
['danang-2526-v1', 'thptqg-nghean-lan1-2026', 'thptqg-nghean-lan1-2026-de2'].forEach(f => {
    try {
        const p = 'eduspace/tinhoc/12/' + f + '/data.js';
        const content = fs.readFileSync(p, 'utf8');
        const match = content.match(/title:\s*["'](.*?)["']/);
        console.log(f, ':', match ? match[1] : 'N/A');
    } catch(e) {
        console.log(f, 'Error');
    }
});
