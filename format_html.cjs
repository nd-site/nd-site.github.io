const fs = require('fs');

const inFile = 'eduspace/tailieu/DANANG- THI THU TN THPT 2026/danang_html.html';
const outFile = 'eduspace/tailieu/DANANG- THI THU TN THPT 2026/danang_html_formatted.html';

try {
    let content = fs.readFileSync(inFile, 'utf8');
    content = content.replace(/<p>/g, '\n<p>')
                     .replace(/<tr>/g, '\n<tr>')
                     .replace(/<br\s*\/?>/g, '\n<br>')
                     .replace(/<li>/g, '\n<li>')
                     .replace(/<\/tr>/g, '<\/tr>\n')
                     .replace(/<\/p>/g, '<\/p>\n');
    fs.writeFileSync(outFile, content, 'utf8');
    console.log('Formatted HTML successfully.');
} catch (e) {
    console.error(e);
}
