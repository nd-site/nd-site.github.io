const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'eduspace', 'template.html');
const outputPath = path.join(__dirname, 'eduspace', 'taode', 'chay.html');
const indexTaodePath = path.join(__dirname, 'eduspace', 'taode', 'index.html');

let templateContent = fs.readFileSync(templatePath, 'utf8');

const uploadScreen = `
    <!-- Upload Screen -->
    <div id="upload-screen" class="max-w-3xl mx-auto px-4 py-4 pb-32 md:pb-16 flex flex-col items-center justify-center min-h-[85vh]">
        <div class="glass-card round-card p-6 md:p-8 w-full text-center relative overflow-hidden">
            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 leading-tight tracking-tight">
                Chạy Đề Tùy Chỉnh
            </h1>
            <p class="text-slate-500 text-sm mb-6 max-w-xl mx-auto leading-snug">
                Vui lòng tải lên file <b>data.js</b> bạn vừa xuất ra để bắt đầu làm bài.
            </p>
            
            <div id="file-drop-area" class="border-2 border-dashed border-blue-400 p-8 rounded-2xl bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors mb-6">
                <input type="file" id="data-file-input" accept=".js" class="hidden">
                <div class="text-blue-600 font-bold text-lg mb-2">📥 Nhấn hoặc kéo thả file data.js vào đây</div>
                <div class="text-slate-500 text-sm">Hỗ trợ file định dạng Javascript (.js)</div>
            </div>
        </div>
    </div>
`;

templateContent = templateContent.replace('<!-- Start Screen -->', uploadScreen + '\n    <!-- Start Screen -->');
templateContent = templateContent.replace('<div id="start-screen" class="max-w-3xl', '<div id="start-screen" class="hidden max-w-3xl');

const uploadScript = `
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const dropArea = document.getElementById('file-drop-area');
            const fileInput = document.getElementById('data-file-input');

            dropArea.addEventListener('click', () => fileInput.click());
            
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.classList.add('bg-blue-200');
            });
            
            dropArea.addEventListener('dragleave', () => {
                dropArea.classList.remove('bg-blue-200');
            });
            
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.classList.remove('bg-blue-200');
                if (e.dataTransfer.files.length) {
                    handleFileUpload(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handleFileUpload(e.target.files[0]);
                }
            });
        });

        function handleFileUpload(file) {
            if (!file.name.endsWith('.js')) {
                alert('Vui lòng chọn file .js');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const script = document.createElement('script');
                    script.textContent = e.target.result;
                    document.body.appendChild(script);
                    
                    setTimeout(() => {
                        if (typeof quizData !== 'undefined') {
                            document.getElementById('upload-screen').classList.add('hidden');
                            document.getElementById('start-screen').classList.remove('hidden');
                            
                            document.getElementById('quiz-title-display').innerText = quizData.title || "Bài kiểm tra tùy chỉnh";
                            document.getElementById('page-title').innerText = quizData.title || "Bài kiểm tra tùy chỉnh";
                            
                            adaptSchema();
                            
                            quizData.activeQuestions = [...(quizData.questions || [])];
                            document.getElementById('total-questions-stat').innerText = quizData.activeQuestions.length;
                            
                            let duration = 0;
                            if (quizData.config && quizData.config.testDuration) {
                                duration = quizData.config.testDuration;
                            }
                            document.getElementById('total-time-stat').innerText = Math.floor(duration / 60);
                        } else {
                            alert('File không hợp lệ hoặc không chứa biến quizData.');
                        }
                    }, 100);
                } catch (error) {
                    console.error("Error parsing file:", error);
                    alert("Có lỗi xảy ra khi đọc file.");
                }
            };
            reader.readAsText(file);
        }

        function adaptSchema() {
            if (!quizData || !quizData.questions) return;
            
            quizData.questions.forEach(q => {
                if (q.type === 'multiple-choice') {
                    q.type = 'multiple';
                    if (q.correctAnswer && typeof q.correctAnswer === 'string') {
                        q.correct = q.correctAnswer.charCodeAt(0) - 65;
                    }
                } else if (q.type === 'true-false') {
                    q.type = 'truefalse';
                    if (q.subQuestions) {
                        q.options = q.subQuestions.map(sq => sq.text);
                        q.correctAnswers = q.subQuestions.map(sq => sq.correctAnswer === "Đúng" || sq.correctAnswer === true);
                        q.correct = q.correctAnswers;
                    }
                }
            });
        }
    </script>
`;

templateContent = templateContent.replace('<!-- Scripts -->', uploadScript + '\n    <!-- Scripts -->');
templateContent = templateContent.replace(/if \(typeof quizData === 'undefined'\) \{[\s\S]*?\}\n        \}/, '');

fs.writeFileSync(outputPath, templateContent, 'utf8');

let indexContent = fs.readFileSync(indexTaodePath, 'utf8');

const chayButton = `
            <a href="/eduspace/taode/chay.html"
                class="flex items-center gap-2 bg-emerald-600 px-5 py-2.5 rounded-2xl shadow-sm text-white font-bold hover:bg-emerald-700 transition-all active:scale-95 ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chạy đề tùy chỉnh
            </a>
`;
indexContent = indexContent.replace(/<a href="javascript:location\.reload\(\)".*?<\/a>/s, match => match + chayButton);

const oldPromptRegex = /const systemPrompt = \`Bạn là một chuyên gia định dạng dữ liệu cho EduSpace\.[\s\S]*?YÊU CẦU: Trả về duy nhất mã Javascript gán cho biến quizData\.\`;/s;
const newPrompt = "const systemPrompt = `Bạn là chuyên gia phân tích và trích xuất dữ liệu đề thi trắc nghiệm.\\n" +
"Nhiệm vụ: Chuyển đổi TOÀN BỘ nội dung văn bản/HTML sau đây thành biến 'quizData' trong Javascript. KHÔNG ĐƯỢC BỎ SÓT CÂU HỎI NÀO.\\n\\n" +
"CẤU TRÚC JSON YÊU CẦU:\\n" +
"const quizData = {\\n" +
"  title: \"${manualTitle || 'Đề thi tổng hợp'}\",\\n" +
"  config: { testDuration: 3000 },\\n" +
"  questions: [\\n" +
"    {\\n" +
"      id: \"q1\",\\n" +
"      type: \"multiple-choice\",\\n" +
"      question: \"Nội dung câu hỏi phần 1\",\\n" +
"      options: [\"Lựa chọn A\", \"Lựa chọn B\", \"Lựa chọn C\", \"Lựa chọn D\"],\\n" +
"      correctAnswer: \"A\"\\n" +
"    },\\n" +
"    {\\n" +
"      id: \"q2\",\\n" +
"      type: \"true-false\",\\n" +
"      question: \"Nội dung câu hỏi phần 2\",\\n" +
"      subQuestions: [\\n" +
"        { text: \"Phát biểu a\", correctAnswer: \"Đúng\" },\\n" +
"        { text: \"Phát biểu b\", correctAnswer: \"Sai\" }\\n" +
"      ]\\n" +
"    }\\n" +
"  ]\\n" +
"};\\n\\n" +
"QUY TẮC:\\n" +
"1. Xác định đáp án đúng dựa vào dấu * (nếu có) hoặc tự suy luận.\\n" +
"2. KHÔNG GIỚI HẠN: Xử lý tất cả các câu hỏi có trong văn bản được cung cấp.\\n" +
"3. Trả về duy nhất mã Javascript hợp lệ gán cho biến quizData.`;";

indexContent = indexContent.replace(oldPromptRegex, newPrompt);

fs.writeFileSync(indexTaodePath, indexContent, 'utf8');

console.log("Done updating taode and creating chay.html");
