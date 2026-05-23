const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = 'd:/WebSite/EduSpace - Đổi giao diện 150526';
const listDataPath = path.join(rootDir, 'eduspace', 'list_data.js');

let content = fs.readFileSync(listDataPath, 'utf8');
// Trích xuất phần mảng của quizList
let startIndex = content.indexOf('const quizList = [');
if(startIndex === -1) {
    console.error("Không tìm thấy biến quizList");
    process.exit(1);
}
// Để eval được mảng này, ta cắt từ mảng đó cho tới hết
// Nó có thể chứa comment, v.v. Ta có thể dùng thủ thuật đơn giản: thay thế const quizList = thành module.exports =
let scriptContent = content.substring(startIndex).replace('const quizList = ', 'module.exports = ');
fs.writeFileSync(path.join(rootDir, 'temp_list_data.cjs'), scriptContent);

let quizList;
try {
    quizList = require(path.join(rootDir, 'temp_list_data.cjs'));
} catch (e) {
    console.error("Lỗi khi load quizList", e);
    process.exit(1);
}
fs.unlinkSync(path.join(rootDir, 'temp_list_data.cjs'));

let report = {
    totalItems: quizList.length,
    missingPaths: [],
    duplicateUrls: [],
    contentDuplicates: []
};

let urlMap = {};
let fileHashMap = {};

quizList.forEach((item, index) => {
    let url = item.url;
    if(!url) return;

    // 1. Kiểm tra lặp link
    if(urlMap[url]) {
        report.duplicateUrls.push({ url: url, indices: [urlMap[url], index], title: item.title });
    } else {
        urlMap[url] = index;
    }

    // Bỏ qua external links
    if(url.startsWith('http')) return;

    // 2. Kiểm tra link chết
    let localPath = path.join(rootDir, url);
    // Nếu path kết thúc bằng /, coi như là thư mục, bên trong phải có data.js hoặc index.html
    let dataJsPath = localPath;
    if(!localPath.endsWith('.html') && !localPath.endsWith('.js') && !localPath.endsWith('.txt')) {
        dataJsPath = path.join(localPath, 'data.js');
    }

    if (!fs.existsSync(localPath) && !fs.existsSync(dataJsPath)) {
        report.missingPaths.push({ title: item.title, url: url, localPath: localPath });
    } else {
        // 3. Kiểm tra trùng lặp nội dung
        let targetFile = fs.existsSync(dataJsPath) ? dataJsPath : (fs.existsSync(path.join(localPath, 'index.html')) ? path.join(localPath, 'index.html') : null);
        if(targetFile && fs.statSync(targetFile).isFile()) {
            let fileContent = fs.readFileSync(targetFile, 'utf8');
            // Remove some variable parts to compare structurally
            let hash = crypto.createHash('md5').update(fileContent).digest('hex');
            
            if(fileHashMap[hash]) {
                fileHashMap[hash].push({ title: item.title, file: targetFile });
            } else {
                fileHashMap[hash] = [{ title: item.title, file: targetFile }];
            }
        }
    }
});

for(let hash in fileHashMap) {
    if(fileHashMap[hash].length > 1) {
        report.contentDuplicates.push(fileHashMap[hash]);
    }
}

fs.writeFileSync(path.join(rootDir, 'analysis_report.json'), JSON.stringify(report, null, 2));
console.log("Analysis done!");
