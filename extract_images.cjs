const fs = require('fs');

const htmlFile = 'eduspace/tailieu/DANANG- THI THU TN THPT 2026/danang_html.html';
const outDir = 'eduspace/tailieu/DANANG- THI THU TN THPT 2026/img/';

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

try {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const regex = /<img[^>]+src="data:image\/png;base64,([^"]+)"/g;
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null) {
        count++;
        const base64Data = match[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${outDir}code_image_${count}.png`;
        fs.writeFileSync(filename, buffer);
        console.log(`Saved image ${count} to ${filename} (${buffer.length} bytes)`);
    }
} catch (e) {
    console.error(e);
}
