const fs = require('fs');
const path = require('path');

const rootDir = 'd:/WebSite/EduSpace - Đổi giao diện 150526/eduspace';

function crawl(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            crawl(fullPath, fileList);
        } else if (file === 'data.js' || file === 'data.json') {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allDataFiles = crawl(rootDir).filter(f => !f.includes('_agent') && !f.includes('node_modules') && !f.includes('assets') && !f.includes('.git'));

const results = [];

for (const file of allDataFiles) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        let layout = 'N/A';
        const examLayoutMatch = content.match(/examLayout:\s*({[^}]+})/);
        if (examLayoutMatch) {
            layout = examLayoutMatch[1].replace(/\s+/g, ' ');
        }
        
        const mcqMatches = content.match(/type:\s*['"]multiple['"]/g);
        const tfMatches = content.match(/type:\s*['"]truefalse['"]/g);
        const shortMatches = content.match(/type:\s*['"]short['"]/g);
        const essayMatches = content.match(/type:\s*['"]essay['"]/g);
        const fillMatches = content.match(/type:\s*['"]fill['"]/g);
        const writingMatches = content.match(/type:\s*['"]writing['"]/g);
        const tfItemMatches = content.match(/correct:\s*\[/g); // Since each TF has 4 items usually, but we count the questions.

        const mcqCount = mcqMatches ? mcqMatches.length : 0;
        const tfCount = tfMatches ? tfMatches.length : 0;
        const shortCount = shortMatches ? shortMatches.length : 0;
        const essayCount = essayMatches ? essayMatches.length : 0;
        const fillCount = fillMatches ? fillMatches.length : 0;
        const writingCount = writingMatches ? writingMatches.length : 0;
        
        results.push({
            path: file.replace(path.normalize(rootDir), ''),
            mcq: mcqCount,
            tf: tfCount,
            short: shortCount,
            essay: essayCount,
            fill: fillCount,
            writing: writingCount,
            layout: layout
        });
    } catch (e) {
        console.error('Error reading', file);
    }
}

fs.writeFileSync('d:/WebSite/EduSpace - Đổi giao diện 150526/eduspace/scratch_check.json', JSON.stringify(results, null, 2));
console.log('Done!');
