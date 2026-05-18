const fs = require('fs');

const rawData = fs.readFileSync('scratch_check.json', 'utf8');
const files = JSON.parse(rawData);

const incorrectExams = [];

for (const file of files) {
    const totalQ = file.mcq + file.tf + file.short + file.essay + file.fill + file.writing;
    if (totalQ === 0) continue; // Skip empty/uncreated exams

    // Extract subject and grade from path
    // Path example: \hoahoc\10\ck2-2526-v1\data.js or \congnghe-nongnghiep\12\thptqg-2026-v1\data.js
    const parts = file.path.split(/[\\/]/).filter(Boolean);
    if (parts.length < 3) continue;

    const subject = parts[0];
    let grade = parts[1];
    const examType = parts[2]; // e.g., ck2-2526-v1, thptqg-2026-v1

    // Sometimes grade is 'lop10'
    if (grade.includes('10')) grade = '10';
    else if (grade.includes('11')) grade = '11';
    else if (grade.includes('12')) grade = '12';

    let isCorrect = false;

    // Check structure based on rules
    if (subject === 'nguvan') {
        if (file.mcq === 0 && file.tf === 0 && file.short === 0) {
            isCorrect = true;
        }
    } else if (subject === 'tienganh') {
        if (grade === '12' && examType.includes('thptqg')) {
            if (file.mcq === 40 && file.tf === 0 && file.short === 0 && file.essay === 0) {
                isCorrect = true;
            }
        } else {
            // For grade 10, 11 it could be 70% MCQ + 30% Essay or something. We might just check if it has MCQ.
            // Wait, the prompt says "đúng cấu trúc, nội dung theo file chưa". The file specifies Tiếng Anh has "Trắc nghiệm nhiều lựa chọn (MCQ)".
            // Let's assume if it has TF or Short, it's wrong.
            if (file.tf === 0 && file.short === 0) {
                isCorrect = true; // allow mcq and essay/writing
            }
        }
    } else if (['toan', 'vatly', 'hoahoc', 'sinhhoc', 'diali'].includes(subject)) {
        if (grade === '12' && (examType.includes('thptqg') || examType.includes('ck2') || examType.includes('gk2'))) {
            // For grade 12, Tốt nghiệp or CK2
            if (subject === 'toan') {
                if (file.mcq === 12 && file.tf === 4 && file.short === 6 && file.essay === 0) isCorrect = true;
                // Wait, some schools might use TNKQ 70% + TL 30% for grade 12 regular exams, but the file says:
                // "Đối với khối lớp 12, để tiệm cận với định dạng đề thi tốt nghiệp, cấu trúc kiểm tra định kỳ tại nhiều trường THPT được điều chỉnh theo tỷ lệ Trắc nghiệm khách quan 100%"
                // Let's allow MCQ 12, TF 4, Short 6.
            } else {
                if (file.mcq === 18 && file.tf === 4 && file.short === 6 && file.essay === 0) isCorrect = true;
            }
        } else {
            // Grade 10, 11 (TNKQ 7.0 + TL 3.0) -> MCQ: 12, TF: 2, Short: 8, Essay: >0
            if (file.mcq === 12 && file.tf === 2 && file.short === 8 && file.essay > 0) {
                isCorrect = true;
            }
            // Wait, maybe some exams are 100% TNKQ for 10,11? The file says "cấu trúc gồm Trắc nghiệm khách quan 7.0đ và Tự luận 3.0đ".
        }
    } else if (['lichsu', 'ktpl', 'congnghe', 'congnghe-congnghiep', 'congnghe-nongnghiep', 'tinhoc', 'gdqp'].includes(subject)) {
        if (grade === '12' && (examType.includes('thptqg') || examType.includes('ck2') || examType.includes('gk2'))) {
            if (file.mcq === 24 && file.tf === 4 && file.short === 0 && file.essay === 0) isCorrect = true;
        } else {
            // Grade 10, 11 -> MCQ: 12, TF: 4, Short: 0, Essay: >0
            if (file.mcq === 12 && file.tf === 4 && file.short === 0 && file.essay > 0) {
                isCorrect = true;
            }
        }
    }

    if (!isCorrect) {
        incorrectExams.push(`- ${file.path} (Hiện tại: MCQ=${file.mcq}, TF=${file.tf}, Short=${file.short}, Essay=${file.essay})`);
    }
}

fs.writeFileSync('incorrect_exams.txt', incorrectExams.join('\n'));
console.log('Found', incorrectExams.length, 'incorrect exams.');
