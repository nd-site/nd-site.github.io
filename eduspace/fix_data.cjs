const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = 'd:/WebSite/EduSpace - Đổi giao diện 150526';
const listDataPath = path.join(rootDir, 'eduspace', 'list_data.js');

let content = fs.readFileSync(listDataPath, 'utf8');
let startIndex = content.indexOf('const quizList = [');
let scriptContent = content.substring(startIndex).replace('const quizList = ', 'module.exports = ');
fs.writeFileSync(path.join(rootDir, 'temp_list_data.cjs'), scriptContent);

let quizList = require(path.join(rootDir, 'temp_list_data.cjs'));
fs.unlinkSync(path.join(rootDir, 'temp_list_data.cjs'));

let uniqueUrls = new Set();
let hashToUrl = {}; // map hash to the first encountered URL
let finalQuizList = [];

// Trích xuất phần đầu file
let headerContent = content.substring(0, startIndex);

quizList.forEach(item => {
    let url = item.url;
    if(!url) {
        finalQuizList.push(item);
        return;
    }

    if(url.startsWith('http')) {
        if(!uniqueUrls.has(url)) {
            uniqueUrls.add(url);
            finalQuizList.push(item);
        }
        return;
    }

    // Fix path typos
    let localPath = path.join(rootDir, url);
    let dataJsPath = localPath;
    if(!localPath.endsWith('.html') && !localPath.endsWith('.js') && !localPath.endsWith('.txt')) {
        dataJsPath = path.join(localPath, 'data.js');
    }

    if (!fs.existsSync(localPath) && !fs.existsSync(dataJsPath)) {
        // Try removing -kntt
        if(url.includes('-kntt')) {
            let altUrl = url.replace('-kntt', '');
            let altPath = path.join(rootDir, altUrl);
            let altDataJs = altPath.endsWith('.html') ? altPath : path.join(altPath, 'data.js');
            if (fs.existsSync(altPath) || fs.existsSync(altDataJs)) {
                item.url = altUrl; // Fix the url
                url = altUrl;
                localPath = altPath;
                dataJsPath = altDataJs;
            }
        }
        
        // Check if there's an index.html if it's a directory
        if (!fs.existsSync(localPath) && !fs.existsSync(dataJsPath)) {
             // Still missing after fix attempt, but we keep it or remove it?
             // Prompt says: "Đưa ra giải pháp tối ưu hóa cấu trúc khai báo nếu phát hiện file list_data.js đang được tổ chức chưa tối ưu. Cung cấp đoạn mã hoặc file list_data.js sau khi đã được dọn dẹp, loại bỏ trùng lặp và sửa đúng đường dẫn."
             // So we keep the fixed or remove if totally invalid? Let's just keep it if we can't fix, so the user knows it's a 404. Wait, the prompt says "không dính link chết (404)". Let's remove if it doesn't exist.
             return; 
        }
    }

    if (uniqueUrls.has(url)) {
        // Remove duplicate URL entry
        return;
    }
    
    // Check content duplication
    let targetFile = fs.existsSync(dataJsPath) ? dataJsPath : (fs.existsSync(path.join(localPath, 'index.html')) ? path.join(localPath, 'index.html') : null);
    if(targetFile && fs.statSync(targetFile).isFile()) {
        let fileContent = fs.readFileSync(targetFile, 'utf8');
        let hash = crypto.createHash('md5').update(fileContent).digest('hex');
        
        if(hashToUrl[hash]) {
            // Already have a file with this content. We point the url to the existing one or just skip this item?
            // "Chỉ ra các file đề thi có nội dung giống nhau... dọn dẹp, loại bỏ trùng lặp". 
            // If the content is identical, we can just skip adding this duplicate item to avoid showing the same quiz twice under different URLs.
            // Wait, what if they are different topics but same file content by accident?
            // "không hiển thị trùng lặp giao diện, giúp tối ưu hóa trải nghiệm". We'll skip it.
            return;
        } else {
            hashToUrl[hash] = url;
        }
    }

    uniqueUrls.add(url);
    finalQuizList.push(item);
});

let newContent = headerContent + 'const quizList = ' + JSON.stringify(finalQuizList, null, 4) + ';\n';
fs.writeFileSync(path.join(rootDir, 'eduspace', 'list_data.js'), newContent);
console.log("Fixed list_data.js created, remaining items:", finalQuizList.length);
