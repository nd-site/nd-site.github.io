// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Toán 12 (Kết nối tri thức) 2025-2026",
    config: {
        testDuration: 5400,
        examLayout: {
            multiple: {
                count: 12,
                pointsPerQ: 0.25
            },
            truefalse: {
                count: 4,
                pointsPerQ: 0.5,
                partialScoring: [
                    0.05,
                    0.125,
                    0.25,
                    0.5
                ]
            },
            short: {
                count: 4,
                pointsPerQ: 0.5
            },
            essay: {
                count: 3,
                pointsPerQ: 1
            }
        }
    },
    questions: [
        {
            type: "multiple",
            question: "Họ nguyên hàm của hàm số f(x) = 3x² + 2x là:",
            options: [
                "x³ + x² + C",
                "6x + 2 + C",
                "3x³ + 2x² + C",
                "x³ + x + C"
            ],
            correct: 0,
            explanation: "∫(3x² + 2x)dx = 3(x³/3) + 2(x²/2) + C = x³ + x² + C."
        },
        {
            type: "multiple",
            question: "Nguyên hàm của hàm số f(x) = e^x + 1/x (với x > 0) là:",
            options: [
                "e^x + ln x + C",
                "e^x − 1/x² + C",
                "e^x + ln|x| + C",
                "e^x + x + C"
            ],
            correct: 2,
            explanation: "∫(e^x + 1/x)dx = e^x + ln|x| + C."
        },
        {
            type: "multiple",
            question: "Biết ∫(0→2) f(x)dx = 5 và ∫(0→2) g(x)dx = 3. Giá trị của ∫(0→2) [f(x) − 2g(x)]dx là:",
            options: [
                "−1",
                "2",
                "−11",
                "11"
            ],
            correct: 0,
            explanation: "I = 5 − 2×3 = 5 − 6 = −1."
        },
        {
            type: "multiple",
            question: "Tích phân ∫(1→e) (1/x)dx bằng:",
            options: [
                "1",
                "e",
                "e−1",
                "0"
            ],
            correct: 0,
            explanation: "∫(1→e) dx/x = ln|x| (từ 1 đến e) = ln e − ln 1 = 1 − 0 = 1."
        },
        {
            type: "multiple",
            question: "Diện tích S của hình phẳng giới hạn bởi đồ thị hàm số y = f(x) liên tục, trục hoành và hai đường thẳng x=a, x=b (a<b) được tính bằng:",
            options: [
                "$$S = \\int_a^b |f(x)|dx$$",
                "$$S = \\left| \\int_a^b f(x)dx \\right|$$",
                "$$S = \\pi \\int_a^b f^2(x)dx$$",
                "$$S = \\int_a^b f(x)dx$$"
            ],
            correct: 0,
            explanation: "Diện tích: S = ∫ |f(x)| dx."
        },
        {
            type: "multiple",
            question: "Thể tích khối tròn xoay tạo thành khi quay hình phẳng giới hạn bởi y = f(x), y=0, x=a, x=b quanh trục Ox là:",
            options: [
                "$$V = \\pi \\int_a^b f^2(x)dx$$",
                "$$V = \\int_a^b f^2(x)dx$$",
                "$$V = \\pi \\int_a^b |f(x)|dx$$",
                "$$V = \\pi \\left( \\int_a^b f(x)dx \\right)^2$$"
            ],
            correct: 0,
            explanation: "Thể tích: V = π.∫ f²(x)dx."
        },
        {
            type: "multiple",
            question: "Tính tích phân I = ∫(0→π/2) cos(x)dx:",
            options: [
                "1",
                "0",
                "−1",
                "π/2"
            ],
            correct: 0,
            explanation: "∫cos(x)dx = sin(x). Tại π/2: sin(π/2) = 1; tại 0: sin(0) = 0. I = 1 − 0 = 1."
        },
        {
            type: "multiple",
            question: "Trong không gian Oxyz, khoảng cách từ điểm M(1; −2; 3) đến gốc tọa độ O là:",
            options: [
                "$$\\sqrt{14}$$",
                "14",
                "6",
                "$$\\sqrt{6}$$"
            ],
            correct: 0,
            explanation: "OM = √(1² + (−2)² + 3²) = √(1+4+9) = √14."
        },
        {
            type: "multiple",
            question: "Trung điểm của đoạn thẳng AB với A(1; 3; 5) và B(3; −1; 1) có tọa độ là:",
            options: [
                "(2; 1; 3)",
                "(4; 2; 6)",
                "(1; −2; −2)",
                "(2; 2; 3)"
            ],
            correct: 0,
            explanation: "I = ((1+3)/2 ; (3−1)/2 ; (5+1)/2) = (2; 1; 3)."
        },
        {
            type: "multiple",
            question: "Mặt phẳng (P): 2x − y + 3z + 5 = 0 có một vectơ pháp tuyến là:",
            options: [
                "n = (2; −1; 3)",
                "n = (2; 1; 3)",
                "n = (−1; 3; 5)",
                "n = (2; −1; 5)"
            ],
            correct: 0,
            explanation: "Vectơ pháp tuyến n = (A; B; C) = (2; −1; 3)."
        },
        {
            type: "multiple",
            question: "Phương trình mặt cầu tâm I(1; −2; 0) bán kính R = 4 là:",
            options: [
                "(x−1)² + (y+2)² + z² = 16",
                "(x+1)² + (y−2)² + z² = 16",
                "(x−1)² + (y+2)² + z² = 4",
                "(x−1)² + (y−2)² + z² = 16"
            ],
            correct: 0,
            explanation: "(x−1)² + (y+2)² + (z−0)² = R² = 16."
        },
        {
            type: "multiple",
            question: "Đường thẳng d đi qua M(1; 2; −3) và có vectơ chỉ phương u = (2; −1; 4) có phương trình tham số là:",
            options: [
                "x = 1+2t; y = 2−t; z = −3+4t",
                "x = 2+t; y = −1+2t; z = 4−3t",
                "x = 1+t; y = 2+t; z = −3+t",
                "x = 2t; y = −t; z = 4t"
            ],
            correct: 0,
            explanation: "x = x₀+at; y = y₀+bt; z = z₀+ct."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Khoảng cách từ điểm M(1; 1; 1) đến mặt phẳng (P): 2x + 2y − z + 3 = 0 là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "2",
                "6",
                "1",
                "3"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "d = |2×1 + 2×1 − 1 + 3| / √(2² + 2² + (−1)²) = |6| / √9 = 6/3 = 2."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Tích có hướng của hai vectơ a=(1; 0; 2) và b=(−1; 1; 3) là vectơ:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "(−2; −5; 1)",
                "(−2; 5; 1)",
                "(2; 5; 1)",
                "(−2; −5; −1)"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "[a,b] = (0×3 − 2×1; 2×(−1) − 1×3; 1×1 − 0×(−1)) = (−2; −5; 1)."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Cho A và B là 2 biến cố. Xác suất có điều kiện P(A|B) được định nghĩa là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "P(A ∩ B) / P(B)",
                "P(A ∩ B) / P(A)",
                "P(A) / P(B)",
                "P(A ∪ B) / P(B)"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Công thức P(A|B) = P(A∩B)/P(B)."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Nếu A và B là 2 biến cố độc lập thì P(A|B) bằng:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "P(A)",
                "P(B)",
                "P(A).P(B)",
                "0"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Nếu A, B độc lập thì biến cố B xảy ra không ảnh hưởng tới A, P(A|B) = P(A)."
        },
        {
            type: "short",
            question: "Biết P(A) = 0,5; P(B) = 0,4; P(A ∩ B) = 0,2. Tính P(B|A): (Lưu ý: Đáp án đúng gốc là \"0,4\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "0,4",
            explanation: "P(B|A) = P(B∩A)/P(A) = 0,2 / 0,5 = 0,4."
        },
        {
            type: "short",
            question: "Công thức Bayes cho 2 biến cố A và B là: (Lưu ý: Đáp án đúng gốc là \"$$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Bayes: P(A|B) = P(B|A)P(A)/P(B)."
        },
        {
            type: "short",
            question: "Tính I = ∫(1→2) x.e^x dx (Sử dụng tích phân từng phần): (Lưu ý: Đáp án đúng gốc là \"e²\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "u=x, dv=e^x dx → du=dx, v=e^x. I = x.e^x (1→2) − ∫(1→2) e^x dx = 2e² − e − (e² − e) = e²."
        },
        {
            type: "short",
            question: "Mặt cầu (S): x² + y² + z² − 2x + 4y − 6z − 2 = 0 có bán kính bằng: (Lưu ý: Đáp án đúng gốc là \"4\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "4",
            explanation: "Tâm I(1; −2; 3). R = √(1² + (−2)² + 3² − (−2)) = √(1+4+9+2) = √16 = 4."
        },
        {
            type: "essay",
            question: "Tính các tích phân sau:\n\na) I = ∫(0→1) (2x + e^x) dx\nb) K = ∫(0→π/2) x.sin(x) dx (Gợi ý: Tích phân từng phần)",
            suggested: "a) I = (x² + e^x) (từ 0→1) = (1² + e¹) − (0 + e⁰) = 1 + e − 1 = e.\n\nb) Đặt u = x → du = dx; dv = sin(x)dx → v = −cos(x).\nK = −x.cos(x) (0→π/2) − ∫(0→π/2) (−cos(x))dx\n= (0 − 0) + ∫(0→π/2) cos(x)dx = sin(x) (0→π/2) = 1 − 0 = 1.",
            points: 25,
            explanation: "AI chấm: I = e; K = 1."
        },
        {
            type: "essay",
            question: "Trong không gian Oxyz, cho 3 điểm A(1; 0; −1), B(2; 1; 1), C(0; −1; 2).\n\na) Viết phương trình tham số của đường thẳng AB.\nb) Viết phương trình tổng quát của mặt phẳng (ABC).\nc) Tính diện tích tam giác ABC.",
            suggested: "a) Vectơ chỉ phương AB = (1; 1; 2).\nPTTS của AB: x = 1 + t; y = t; z = −1 + 2t.\n\nb) Vectơ AC = (−1; −1; 3).\nVectơ pháp tuyến n = [AB, AC] = (1×3 − 2×(−1); 2×(−1) − 1×3; 1×(−1) − 1×(−1))\n= (3+2; −2−3; −1+1) = (5; −5; 0).\nChọn n = (1; −1; 0).\nPT mặt phẳng: 1(x−1) − 1(y−0) + 0 = 0 → x − y − 1 = 0.\n\nc) Diện tích tam giác S = ½|[AB, AC]| = ½√(5² + (−5)² + 0²) = ½√50 = 5√2 / 2.",
            points: 25,
            explanation: "AI chấm: PTAB: x=1+t, y=t, z=−1+2t; PT(ABC): x−y−1=0; S = (5√2)/2."
        },
        {
            type: "essay",
            question: "Một bài thi trắc nghiệm có 10 câu, mỗi câu có 4 đáp án (chỉ 1 đúng). Học sinh A làm đúng chắc chắn 7 câu, 3 câu còn lại chọn bừa.\n\na) Tính xác suất để A chọn đúng cả 3 câu làm bừa.\nb) Tính xác suất để A đạt điểm tuyệt đối 10/10.",
            suggested: "a) Mỗi câu chọn bừa có xác suất đúng là 1/4.\nXác suất đúng cả 3 câu là: P = (1/4) × (1/4) × (1/4) = 1/64 ≈ 0,0156.\n\nb) Để đạt 10/10, A phải đúng 7 câu (chắc chắn đúng, P=1) và đúng cả 3 câu chọn bừa.\nXác suất đạt 10/10 chính là xác suất đúng 3 câu bừa.\nP(10 điểm) = 1 × (1/64) = 1/64.",
            points: 25,
            explanation: "AI chấm: P(3 câu bừa đúng) = 1/64; P(10 điểm) = 1/64."
        }
    ]
};
