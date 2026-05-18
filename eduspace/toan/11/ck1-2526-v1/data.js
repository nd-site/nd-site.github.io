window.quizData = {
    "title": "Kiểm tra Cuối Học Kì I – Toán 11 (KNTT) – 2025-2026",
    "config": {
        "testDuration": 5400, // 90 phút
        "examLayout": {
            "multiple": { "count": 12, "pointsPerQ": 0.25 },
            "truefalse": { "count": 4, "pointsPerQ": 1.0, "partialScoring": [0.1, 0.25, 0.5, 1.0] },
            "short": { "count": 6, "pointsPerQ": 0.5 }
        }
    },
    "questions": [
        // --- PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN ---
        {
            "type": "multiple",
            "question": "Chu kì của hàm số $y = \\\\sin x$ là:",
            "options": ["$\\\\pi$", "$2\\\\pi$", "$\\\\pi/2$", "$3\\\\pi$"],
            "correct": 1,
            "explanation": "Hàm số $y = \\\\sin x$ tuần hoàn với chu kì cơ bản là $2\\\\pi$."
        },
        {
            "type": "multiple",
            "question": "Tìm tập nghiệm của phương trình $\\\\sin x = 1$.",
            "options": [
                "$x = \\\\pi/2 + k2\\\\pi, k \\\\in \\\\mathbb{Z}$",
                "$x = \\\\pi/2 + k\\\\pi, k \\\\in \\\\mathbb{Z}$",
                "$x = k2\\\\pi, k \\\\in \\\\mathbb{Z}$",
                "$x = \\\\pi + k2\\\\pi, k \\\\in \\\\mathbb{Z}$"
            ],
            "correct": 0,
            "explanation": "Đây là trường hợp đặc biệt của phương trình lượng giác cơ bản."
        },
        {
            "type": "multiple",
            "question": "Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 2$. Giá trị của $u_2$ là:",
            "options": ["1", "5", "6", "9"],
            "correct": 1,
            "explanation": "$u_2 = u_1 + d = 3 + 2 = 5$."
        },
        {
            "type": "multiple",
            "question": "Cho cấp số nhân $(u_n)$ có $u_1 = 2$ và công bội $q = 3$. Số hạng thứ ba $u_3$ bằng:",
            "options": ["6", "12", "18", "54"],
            "correct": 2,
            "explanation": "$u_3 = u_1 . q^2 = 2 . 3^2 = 18$."
        },
        {
            "type": "multiple",
            "question": "Giới hạn $\\\\lim_{n \\\\to +\\\\infty} \\\\frac{1}{n}$ bằng:",
            "options": ["0", "1", "$+\\\\infty$", "Không tồn tại"],
            "correct": 0,
            "explanation": "Dãy số có tử số cố định và mẫu số tăng vô hạn thì hội tụ về 0."
        },
        {
            "type": "multiple",
            "question": "Tính giới hạn $L = \\\\lim_{x \\\\to 1} (x^2 + 2x - 1)$.",
            "options": ["1", "2", "3", "4"],
            "correct": 1,
            "explanation": "Thay $x = 1$ vào đa thức: $1^2 + 2(1) - 1 = 2$."
        },
        {
            "type": "multiple",
            "question": "Trong không gian, hai đường thẳng không có điểm chung và không nằm trong cùng một mặt phẳng được gọi là:",
            "options": [
                "Hai đường thẳng cắt nhau.",
                "Hai đường thẳng song song.",
                "Hai đường thẳng chéo nhau.",
                "Hai đường thẳng trùng nhau."
            ],
            "correct": 2,
            "explanation": "Đây là định nghĩa hai đường thẳng chéo nhau trong hình học không gian."
        },
        {
            "type": "multiple",
            "question": "Cho mẫu số liệu ghép nhóm. Số trung vị $M_e$ thuộc nhóm $[a; b)$ là giá trị đại diện cho:",
            "options": [
                "Giá trị trung bình của mẫu.",
                "Giá trị xuất hiện nhiều nhất.",
                "Giá trị chia mẫu số liệu thành hai phần bằng nhau.",
                "Giá trị lớn nhất của mẫu."
            ],
            "correct": 2,
            "explanation": "Trung vị là chỉ số xu thế trung tâm chia đôi mẫu dữ liệu."
        },
        {
            "type": "multiple",
            "question": "Khẳng định nào sau đây là đúng về hàm số liên tục?",
            "options": [
                "Hàm số đa thức liên tục trên toàn bộ tập số thực $\\\\mathbb{R}$.",
                "Hàm số $y = \\\\tan x$ liên tục trên $\\\\mathbb{R}$.",
                "Hàm số liên tục tại một điểm thì phải có đạo hàm tại điểm đó.",
                "Hàm số có giới hạn tại $x_0$ thì liên tục tại $x_0$."
            ],
            "correct": 0,
            "explanation": "Mọi hàm đa thức đều liên tục trên $\\\\mathbb{R}$."
        },
        {
            "type": "multiple",
            "question": "Cho hình chóp S.ABCD có đáy ABCD là hình bình hành. Giao tuyến của hai mặt phẳng (SAB) và (SCD) là đường thẳng đi qua S và:",
            "options": [
                "Song song với AB.",
                "Song song với AD.",
                "Cắt BC.",
                "Trùng với AC."
            ],
            "correct": 0,
            "explanation": "Hai mặt phẳng chứa hai đường thẳng song song (AB // CD) thì giao tuyến của chúng song song với hai đường thẳng đó."
        },
        {
            "type": "multiple",
            "question": "Số các giá trị đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm thường gặp là:",
            "options": ["2", "3", "4", "5"],
            "correct": 2,
            "explanation": "Gồm: Số trung bình, Trung vị, Tứ phân vị và Mốt."
        },
        {
            "type": "multiple",
            "question": "Phương trình $\\\\tan x = \\\\sqrt{3}$ có một nghiệm là:",
            "options": ["$\\\\pi/6$", "$\\\\pi/4$", "$\\\\pi/3$", "$\\\\pi/2$"],
            "correct": 2,
            "explanation": "$\\\\tan(\\\\pi/3) = \\\\sqrt{3}$."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Cho cấp số cộng $(u_n)$ có $u_1 = 1$ và công sai $d = 3$:",
            "options": [
                "Số hạng tổng quát là $u_n = 3n - 2$.",
                "Số hạng thứ 10 của cấp số cộng là $u_{10} = 28$.",
                "Tổng 10 số hạng đầu tiên là $S_{10} = 145$.",
                "Dãy số $(u_n)$ là một dãy số tăng."
            ],
            "correct": [true, true, true, true],
            "explanation": "1. $u_n = 1 + (n-1)3 = 3n-2$. 2. $u_{10} = 3(10)-2 = 28$. 3. $S_{10} = 10(1+28)/2 = 145$. 4. $d = 3 > 0$ nên dãy tăng."
        },
        {
            "type": "truefalse",
            "question": "Xét tính liên tục của hàm số $f(x) = \\\\frac{x^2 - 1}{x - 1}$:",
            "options": [
                "Hàm số xác định với mọi $x \\\\in \\\\mathbb{R}$.",
                "Hàm số không liên tục tại $x = 1$.",
                "$\\\\lim_{x \\\\to 1} f(x) = 2$.",
                "Nếu bổ sung $f(1) = 2$ thì hàm số trở nên liên tục trên $\\\\mathbb{R}$."
            ],
            "correct": [false, true, true, true],
            "explanation": "Hàm số không xác định tại $x=1$ nên không thể liên tục tại đó nếu không có quy ước thêm."
        },
        {
            "type": "truefalse",
            "question": "Trong không gian, xét các quan hệ song song:",
            "options": [
                "Hai đường thẳng cùng song song với đường thẳng thứ ba thì song song với nhau.",
                "Đường thẳng d song song với mặt phẳng $(P)$ khi d không có điểm chung với $(P)$.",
                "Hai mặt phẳng phân biệt cùng song song với một đường thẳng thì song song với nhau.",
                "Nếu mặt phẳng $(P)$ chứa đường thẳng $a$ song song với mặt phẳng $(Q)$ thì $(P) // (Q)$."
            ],
            "correct": [true, true, false, false],
            "explanation": "Hai mặt phẳng có thể cắt nhau dù cùng song song với một đường thẳng. Để $(P) // (Q)$ cần $(P)$ chứa 2 đường thẳng cắt nhau cùng song song với $(Q)$."
        },
        {
            "type": "truefalse",
            "question": "Về giới hạn của dãy số và hàm số:",
            "options": [
                "Nếu $|q| < 1$ thì $\\\\lim q^n = 0$.",
                "$\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x} = 1$.",
                "Dãy số $(u_n)$ có giới hạn hữu hạn thì luôn luôn bị chặn.",
                "$\\\\lim_{x \\\\to 1^+} \\\\frac{1}{x-1} = -\\\\infty$."
            ],
            "correct": [true, true, true, false],
            "explanation": "Khi $x \\\\to 1^+$, $x-1$ là số dương tiến về 0 nên giới hạn là $+\\\\infty$."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Tìm số nghiệm của phương trình $\\\\sin x = 0$ trên đoạn $[0; 2\\\\pi]$. ",
            "correct": "3",
            "explanation": "Các nghiệm là $x = 0, x = \\\\pi, x = 2\\\\pi$."
        },
        {
            "type": "short",
            "question": "Cho cấp số nhân $(u_n)$ có $u_1 = 5$ và $u_2 = 10$. Tính tổng 5 số hạng đầu tiên $S_5$.",
            "correct": "155",
            "explanation": "$q = 10/5 = 2. S_5 = 5(2^5 - 1)/(2 - 1) = 5(31) = 155$."
        },
        {
            "type": "short",
            "question": "Tính giới hạn $L = \\\\lim_{x \\\\to 2} \\\\frac{x^2 - 4}{x - 2}$.",
            "correct": "4",
            "explanation": "$L = \\\\lim_{x \\\\to 2} (x+2) = 4$."
        },
        {
            "type": "short",
            "question": "Cho tứ diện ABCD. Gọi M, N lần lượt là trung điểm của AB và AC. Tính tỉ số $MN/BC$. (Nhập số thập phân)",
            "correct": "0,5",
            "explanation": "MN là đường trung bình của tam giác ABC nên $MN = 1/2 BC$."
        },
        {
            "type": "short",
            "question": "Tìm giá trị của tham số m để hàm số $f(x) = x + m$ khi $x < 1$ và $f(x) = 2$ khi $x \\\\ge 1$ liên tục tại $x = 1$.",
            "correct": "1",
            "explanation": "$\\\\lim_{x \\\\to 1^-} f(x) = 1 + m$. Cần $1 + m = 2 \\\\Rightarrow m = 1$."
        },
        {
            "type": "short",
            "question": "Trong mẫu số liệu ghép nhóm, nếu mốt thuộc nhóm $[10; 20)$ và các tần số là $f_{m-1}=5, f_m=10, f_{m+1}=7$. Tính giá trị của Mốt $M_o$. (Làm tròn đến 1 chữ số thập phân)",
            "correct": "16,3",
            "explanation": "$M_o = 10 + \\\\frac{10-5}{(10-5) + (10-7)} \\\\times 10 = 10 + 5/8 \\\\times 10 = 10 + 6,25 = 16,25 \\\\approx 16,3$."
        }
    ]
};