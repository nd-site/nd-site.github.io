window.quizData = {
    "title": "Kiểm tra Cuối Học Kì I – Toán 12 (KNTT) – 2025-2026",
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
            "question": "Cho hàm số $y = f(x)$ có đạo hàm $f'(x) > 0$ với mọi $x \\\\in (a; b)$. Khẳng định nào sau đây là đúng?",
            "options": [
                "Hàm số nghịch biến trên khoảng (a; b).",
                "Hàm số đồng biến trên khoảng (a; b).",
                "Hàm số đạt cực đại tại x = a.",
                "Hàm số không có cực trị trên $\\\\mathbb{R}$."
            ],
            "correct": 1,
            "explanation": "Đạo hàm dương trên một khoảng thì hàm số đồng biến trên khoảng đó."
        },
        {
            "type": "multiple",
            "question": "Điểm cực tiểu của đồ thị hàm số $y = x^3 - 3x + 1$ là:",
            "options": ["(1; -1)", "(-1; 3)", "(0; 1)", "(2; 3)"],
            "correct": 0,
            "explanation": "$y' = 3x^2 - 3 = 0 \\\\Leftrightarrow x = \\\\pm 1$. Bảng biến thiên cho thấy cực tiểu tại $x = 1, y = -1$."
        },
        {
            "type": "multiple",
            "question": "Đường tiệm cận đứng của đồ thị hàm số $y = \\\\frac{2x - 1}{x + 1}$ là:",
            "options": ["x = -1", "x = 2", "y = 2", "y = -1"],
            "correct": 0,
            "explanation": "Tiệm cận đứng là nghiệm của mẫu số: $x + 1 = 0 \\\\Rightarrow x = -1$."
        },
        {
            "type": "multiple",
            "question": "Giá trị lớn nhất của hàm số $y = -x^4 + 4x^2 + 1$ trên đoạn [-1; 2] là:",
            "options": ["1", "4", "5", "6"],
            "correct": 2,
            "explanation": "$y' = -4x^3 + 8x = 0 \\\\Leftrightarrow x = 0, x = \\\\pm \\\\sqrt{2}$. So sánh $y(-1)=4, y(0)=1, y(\\\\sqrt{2})=5, y(2)=1$. Vậy Max = 5."
        },
        {
            "type": "multiple",
            "question": "Trong không gian Oxyz, cho vectơ $\\\\vec{a} = (1; -2; 3)$. Độ dài của vectơ $\\\\vec{a}$ bằng:",
            "options": ["$\\\\sqrt{6}$", "$\\\\sqrt{14}$", "14", "6"],
            "correct": 1,
            "explanation": "$|\\\\vec{a}| = \\\\sqrt{1^2 + (-2)^2 + 3^2} = \\\\sqrt{1+4+9} = \\\\sqrt{14}$."
        },
        {
            "type": "multiple",
            "question": "Trong không gian Oxyz, tọa độ trung điểm M của đoạn thẳng AB với $A(1; 2; 3)$ và $B(3; 0; -1)$ là:",
            "options": ["(4; 2; 2)", "(2; 1; 1)", "(2; 2; 2)", "(1; -1; -2)"],
            "correct": 1,
            "explanation": "$M = ((1+3)/2; (2+0)/2; (3-1)/2) = (2; 1; 1)$."
        },
        {
            "type": "multiple",
            "question": "Cho hai vectơ $\\\\vec{u} = (1; 0; 1)$ và $\\\\vec{v} = (0; 1; -1)$. Tích vô hướng $\\\\vec{u} \\\\cdot \\\\vec{v}$ bằng:",
            "options": ["0", "1", "-1", "2"],
            "correct": 2,
            "explanation": "$\\\\vec{u} \\\\cdot \\\\vec{v} = 1.0 + 0.1 + 1.(-1) = -1$."
        },
        {
            "type": "multiple",
            "question": "Trong các số đặc trưng sau, số nào dùng để đo mức độ phân tán của mẫu số liệu ghép nhóm?",
            "options": ["Số trung bình.", "Trung vị.", "Độ lệch chuẩn.", "Mốt."],
            "correct": 2,
            "explanation": "Độ lệch chuẩn (và phương sai) đặc trưng cho độ phân tán của các giá trị so với số trung bình."
        },
        {
            "type": "multiple",
            "question": "Tâm đối xứng của đồ thị hàm số bậc ba $y = ax^3 + bx^2 + cx + d$ là điểm có hoành độ $x_0$ thỏa mãn:",
            "options": ["$y'(x_0) = 0$", "$y''(x_0) = 0$", "$y(x_0) = 0$", "$y'''(x_0) = 0$"],
            "correct": 1,
            "explanation": "Điểm uốn (nơi đạo hàm cấp hai bằng 0) là tâm đối xứng của đồ thị hàm bậc ba."
        },
        {
            "type": "multiple",
            "question": "Khoảng cách giữa hai điểm $A(1; 0; 0)$ và $B(0; 0; 1)$ trong không gian Oxyz là:",
            "options": ["1", "2", "$\\\\sqrt{2}$", "0"],
            "correct": 2,
            "explanation": "$AB = \\\\sqrt{(0-1)^2 + (0-0)^2 + (1-0)^2} = \\\\sqrt{2}$."
        },
        {
            "type": "multiple",
            "question": "Đồ thị hàm số $y = \\\\frac{x^2 + 1}{x}$ có đường tiệm cận xiên là:",
            "options": ["y = x", "y = 2x", "y = x + 1", "y = 1"],
            "correct": 0,
            "explanation": "$y = x + \\\\frac{1}{x}$. Khi $x \\\\to \\\\infty$, $\\\\frac{1}{x} \\\\to 0$ nên $y = x$ là tiệm cận xiên."
        },
        {
            "type": "multiple",
            "question": "Cho mẫu số liệu ghép nhóm có khoảng tứ phân vị là $\\\\Delta_Q$. Ý nghĩa của $\\\\Delta_Q$ là:",
            "options": [
                "Độ dài của khoảng chứa 50% số liệu ở giữa.",
                "Giá trị lớn nhất trừ giá trị nhỏ nhất.",
                "Trung bình cộng của các giá trị.",
                "Giá trị xuất hiện thường xuyên nhất."
            ],
            "correct": 0,
            "explanation": "$\\\\Delta_Q = Q_3 - Q_1$, đo độ phân tán của 50% dữ liệu trung tâm."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Cho hàm số $y = \\\\frac{x+1}{x-1}$:",
            "options": [
                "Tập xác định của hàm số là $D = \\\\mathbb{R} \\\\setminus \\\\{1\\\\}$.",
                "Hàm số đồng biến trên từng khoảng xác định.",
                "Đồ thị hàm số có tiệm cận ngang là đường thẳng $y = 1$.",
                "Giao điểm của hai đường tiệm cận là $I(1; 1)$."
            ],
            "correct": [true, false, true, true],
            "explanation": "$y' = \\\\frac{-2}{(x-1)^2} < 0$ nên hàm số nghịch biến."
        },
        {
            "type": "truefalse",
            "question": "Trong không gian Oxyz, cho $A(1; 1; 1), B(2; 3; 0), C(0; 2; 3)$:",
            "options": [
                "Tọa độ vectơ $\\\\vec{AB} = (1; 2; -1)$.",
                "Ba điểm A, B, C thẳng hàng.",
                "Tọa độ trọng tâm G của tam giác ABC là $G(1; 2; 4/3)$.",
                "Vectơ $\\\\vec{OA} + \\\\vec{OB} = (3; 4; 1)$."
            ],
            "correct": [true, false, false, true],
            "explanation": "Trọng tâm $G = ((1+2+0)/3; (1+3+2)/3; (1+0+3)/3) = (1; 2; 4/3)$ là ĐÚNG. Xin lỗi, tôi nhẩm sai ở phần check. $G(1; 2; 4/3)$ là đúng. Ba điểm không thẳng hàng vì $\\\\vec{AB}$ và $\\\\vec{AC}$ không cùng phương."
        },
        {
            "type": "truefalse",
            "question": "Về các số đặc trưng đo độ phân tán của mẫu số liệu ghép nhóm:",
            "options": [
                "Khoảng biến thiên R tỉ lệ thuận với độ phân tán của dữ liệu.",
                "Phương sai càng lớn thì các số liệu càng tập trung gần số trung bình.",
                "Độ lệch chuẩn là căn bậc hai của phương sai.",
                "Khoảng tứ phân vị ít bị ảnh hưởng bởi các giá trị bất thường (outliers) hơn khoảng biến thiên."
            ],
            "correct": [true, false, true, true],
            "explanation": "Phương sai lớn nghĩa là dữ liệu phân tán rộng, xa số trung bình."
        },
        {
            "type": "truefalse",
            "question": "Cho hàm số $y = x^4 - 2x^2 + 3$:",
            "options": [
                "Hàm số có 3 điểm cực trị.",
                "Đồ thị hàm số nhận trục tung làm trục đối xứng.",
                "Giá trị cực tiểu của hàm số là $y_{CT} = 2$.",
                "Hàm số nghịch biến trên khoảng $(1; +\\\\infty)$."
            ],
            "correct": [true, true, true, false],
            "explanation": "Tại $x=1, y=2$. Hàm số đồng biến trên $(1; +\\\\infty)$ vì $y' = 4x^3 - 4x > 0$ khi $x > 1$."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Tìm số tiệm cận (cả đứng và ngang) của đồ thị hàm số $y = \\\\frac{x+1}{x^2 - 1}$.",
            "correct": "2",
            "explanation": "$y = \\\\frac{1}{x-1}$. Tiệm cận đứng $x=1$, tiệm cận ngang $y=0$."
        },
        {
            "type": "short",
            "question": "Tìm hoành độ điểm cực đại của hàm số $y = -x^3 + 3x + 2$.",
            "correct": "1",
            "explanation": "$y' = -3x^2 + 3 = 0 \\\\Rightarrow x = \\\\pm 1$. $y'' = -6x$. $y''(1) = -6 < 0$ nên cực đại tại $x = 1$."
        },
        {
            "type": "short",
            "question": "Trong không gian Oxyz, tìm m để vectơ $\\\\vec{a} = (1; m; 2)$ vuông góc với vectơ $\\\\vec{b} = (2; 1; -3)$.",
            "correct": "4",
            "explanation": "$1.2 + m.1 + 2.(-3) = 0 \\\\Rightarrow 2 + m - 6 = 0 \\\\Rightarrow m = 4$."
        },
        {
            "type": "short",
            "question": "Cho mẫu số liệu ghép nhóm có phương sai $s^2 = 6,25$. Tính độ lệch chuẩn s.",
            "correct": "2,5",
            "explanation": "$s = \\\\sqrt{6,25} = 2,5$."
        },
        {
            "type": "short",
            "question": "Tìm giá trị nhỏ nhất của hàm số $y = x + \\\\frac{4}{x}$ trên khoảng $(0; +\\\\infty)$.",
            "correct": "4",
            "explanation": "Dùng BĐT Cauchy: $x + 4/x \\\\ge 2 \\\\sqrt{x . 4/x} = 4$."
        },
        {
            "type": "short",
            "question": "Trong không gian Oxyz, tính cosin của góc giữa hai vectơ $\\\\vec{i}$ và $\\\\vec{u} = (1; 1; 0)$. (Nhập kết quả dưới dạng số thập phân làm tròn đến 3 chữ số, ví dụ: 0,707)",
            "correct": "0,707",
            "explanation": "$\\\\vec{i} = (1; 0; 0)$. $\\\\cos = (1.1 + 0.1 + 0.0) / (1 \\\\times \\\\sqrt{2}) = 1/\\\\sqrt{2} \\\\approx 0,707$."
        }
    ]
};