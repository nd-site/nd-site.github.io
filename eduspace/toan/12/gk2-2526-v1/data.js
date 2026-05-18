window.quizData = {
    "title": "Kiểm tra Giữa Học Kì II – Toán 12 (KNTT) – 2025-2026",
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
            "question": "Họ tất cả các nguyên hàm của hàm số $f(x) = x^2$ là:",
            "options": [
                "$x^3 + C$",
                "$\\\\frac{1}{3}x^3 + C$",
                "$2x + C$",
                "$\\\\frac{1}{2}x^2 + C$"
            ],
            "correct": 1,
            "explanation": "Theo công thức nguyên hàm: $\\\\int x^n dx = \\\\frac{x^{n+1}}{n+1} + C$."
        },
        {
            "type": "multiple",
            "question": "Cho $\\\\int_1^2 f(x) dx = 3$ và $\\\\int_1^2 g(x) dx = -1$. Tính $I = \\\\int_1^2 [f(x) - g(x)] dx$.",
            "options": ["2", "4", "-4", "3"],
            "correct": 1,
            "explanation": "$I = 3 - (-1) = 4$."
        },
        {
            "type": "multiple",
            "question": "Trong không gian Oxyz, tọa độ của vectơ $\\\\vec{u} = 2\\\\vec{i} - 3\\\\vec{j} + \\\\vec{k}$ là:",
            "options": ["(2; -3; 0)", "(2; -3; 1)", "(2; 3; 1)", "(-2; 3; -1)"],
            "correct": 1,
            "explanation": "Tọa độ vectơ theo các vectơ đơn vị $\\\\vec{i}, \\\\vec{j}, \\\\vec{k}$ lần lượt là các thành phần x, y, z."
        },
        {
            "type": "multiple",
            "question": "Diện tích S của hình phẳng giới hạn bởi đồ thị hàm số $y = f(x)$, trục hoành và hai đường thẳng $x = a, x = b$ ($a < b$) là:",
            "options": [
                "$S = \\\\int_a^b f(x) dx$",
                "$S = |\\\\int_a^b f(x) dx|$",
                "$S = \\\\int_a^b |f(x)| dx$",
                "$S = \\\\pi \\\\int_a^b f^2(x) dx$"
            ],
            "correct": 2,
            "explanation": "Công thức tính diện tích hình phẳng là tích phân của trị tuyệt đối hàm số."
        },
        {
            "type": "multiple",
            "question": "Nguyên hàm của hàm số $f(x) = e^x + \\\\sin x$ là:",
            "options": [
                "$e^x + \\\\cos x + C$",
                "$e^x - \\\\cos x + C$",
                "$xe^{x-1} - \\\\cos x + C$",
                "$e^x + \\\\sin x + C$"
            ],
            "correct": 1,
            "explanation": "$\\\\int e^x dx = e^x + C$ và $\\\\int \\\\sin x dx = -\\\\cos x + C$."
        },
        {
            "type": "multiple",
            "question": "Trong không gian Oxyz, mặt phẳng $(P): 2x - y + 3z - 1 = 0$ có một vectơ pháp tuyến là:",
            "options": ["$\\\\vec{n} = (2; -1; 3)$", "$\\\\vec{n} = (2; 1; 3)$", "$\\\\vec{n} = (-2; 1; 3)$", "$\\\\vec{n} = (2; -1; -1)$"],
            "correct": 0,
            "explanation": "Vectơ pháp tuyến có tọa độ là các hệ số của x, y, z."
        },
        {
            "type": "multiple",
            "question": "Tích phân $I = \\\\int_0^1 e^{2x} dx$ bằng:",
            "options": [
                "$e^2 - 1$",
                "$\\\\frac{1}{2}(e^2 - 1)$",
                "$\\\\frac{1}{2}e^2$",
                "$2(e^2 - 1)$"
            ],
            "correct": 1,
            "explanation": "$I = [\\\\frac{1}{2} e^{2x}]_0^1 = \\\\frac{1}{2}(e^2 - e^0) = \\\\frac{1}{2}(e^2 - 1)$."
        },
        {
            "type": "multiple",
            "question": "Trong không gian Oxyz, cho điểm $A(1; 2; -3)$. Hình chiếu vuông góc của A trên mặt phẳng (Oxy) có tọa độ là:",
            "options": ["(1; 0; 0)", "(1; 2; 0)", "(0; 2; -3)", "(1; 0; -3)"],
            "correct": 1,
            "explanation": "Hình chiếu trên (Oxy) thì giữ nguyên x, y và cho $z = 0$."
        },
        {
            "type": "multiple",
            "question": "Cho $F(x)$ là một nguyên hàm của $f(x)$ trên K. Khẳng định nào sau đây **sai**?",
            "options": [
                "$\\\\int f(x) dx = F(x) + C$",
                "$(F(x))' = f(x)$",
                "$\\\\int f(x) dx = f'(x) + C$",
                "$\\\\int k.f(x) dx = k \\\\int f(x) dx$ ($k \\\\ne 0$)"
            ],
            "correct": 2,
            "explanation": "Nguyên hàm của f(x) là F(x) sao cho $F'(x) = f(x)$. Ý 3 sai."
        },
        {
            "type": "multiple",
            "question": "Trong không gian Oxyz, phương trình mặt phẳng đi qua điểm $M(1; -2; 3)$ và có vectơ pháp tuyến $\\\\vec{n} = (2; 3; 5)$ là:",
            "options": [
                "$2x + 3y + 5z + 11 = 0$",
                "$2x + 3y + 5z - 11 = 0$",
                "$2x - 3y + 5z - 11 = 0$",
                "$x + 2y - 3z - 11 = 0$"
            ],
            "correct": 1,
            "explanation": "$2(x-1) + 3(y+2) + 5(z-3) = 0 \\\\Leftrightarrow 2x + 3y + 5z - 11 = 0$."
        },
        {
            "type": "multiple",
            "question": "Thể tích V của khối tròn xoay được tạo ra khi quay hình phẳng giới hạn bởi đồ thị hàm số $y = f(x)$, trục hoành và hai đường thẳng $x=a, x=b$ ($a < b$) xung quanh trục Ox là:",
            "options": [
                "$V = \\\\int_a^b f^2(x) dx$",
                "$V = \\\\pi \\\\int_a^b f(x) dx$",
                "$V = \\\\pi \\\\int_a^b f^2(x) dx$",
                "$V = \\\\pi^2 \\\\int_a^b f^2(x) dx$"
            ],
            "correct": 2,
            "explanation": "Công thức tính thể tích vật thể tròn xoay có hệ số $\\\\pi$."
        },
        {
            "type": "multiple",
            "question": "Trong không gian Oxyz, khoảng cách từ điểm $M(1; 2; 3)$ đến mặt phẳng (Oxy) bằng:",
            "options": ["1", "2", "3", "$\\\\sqrt{14}$"],
            "correct": 2,
            "explanation": "Khoảng cách đến mặt phẳng (Oxy) chính là trị tuyệt đối của cao độ z: $|3| = 3$."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Cho hàm số $f(x) = 2x + 1$. Xét tính đúng sai của các khẳng định sau:",
            "options": [
                "$\\\\int f(x) dx = x^2 + x + C$.",
                "Tích phân $\\\\int_0^1 f(x) dx = 2$.",
                "Hàm số $F(x) = x^2 + x + 2024$ là một nguyên hàm của $f(x)$.",
                "Nếu $G(x)$ là một nguyên hàm khác của $f(x)$ thì $G(x) - F(x)$ là một hằng số."
            ],
            "correct": [true, true, true, true],
            "explanation": "1. $\\\\int (2x+1)dx = x^2+x+C$. 2. $[x^2+x]_0^1 = 2$. 3 & 4 là tính chất cơ bản của nguyên hàm."
        },
        {
            "type": "truefalse",
            "question": "Trong không gian Oxyz, cho ba điểm $A(2; 0; 0), B(0; -3; 0), C(0; 0; 4)$:",
            "options": [
                "Mặt phẳng (ABC) có phương trình theo đoạn chắn là $\\\\frac{x}{2} + \\\\frac{y}{-3} + \\\\frac{z}{4} = 1$.",
                "Điểm O(0; 0; 0) nằm trên mặt phẳng (ABC).",
                "Vectơ pháp tuyến của mặt phẳng (ABC) là $\\\\vec{n} = (6; -4; 3)$.",
                "Diện tích tam giác OAB bằng 3 (đvdt)."
            ],
            "correct": [true, false, true, true],
            "explanation": "3. $\\\\vec{n}$ có tọa độ tỉ lệ với $(1/2, -1/3, 1/4)$, nhân với 12 được $(6, -4, 3)$. 4. $S = 1/2 . |2| . |-3| = 3$."
        },
        {
            "type": "truefalse",
            "question": "Xét các tính chất của tích phân và tọa độ:",
            "options": [
                "Tích phân không phụ thuộc vào biến số, tức là $\\\\int_a^b f(x) dx = \\\\int_a^b f(t) dt$.",
                "$\\\\int_a^b f(x) dx = -\\\\int_b^a f(x) dx$.",
                "Vectơ $\\\\vec{a} = (1; 2; 3)$ và $\\\\vec{b} = (-2; -4; -6)$ là hai vectơ cùng phương.",
                "Tích vô hướng của hai vectơ $\\\\vec{u}(x; y; z)$ và $\\\\vec{v}(x'; y'; z')$ là $xx' + yy' + zz'$."
            ],
            "correct": [true, true, true, true],
            "explanation": "Đây là các định nghĩa và tính chất cơ bản của tích phân và hình học Oxyz."
        },
        {
            "type": "truefalse",
            "question": "Cho hình phẳng (H) giới hạn bởi đồ thị $y = \\\\sqrt{x}$, trục hoành và đường thẳng $x = 4$:",
            "options": [
                "Diện tích của (H) là $\\\\int_0^4 \\\\sqrt{x} dx$.",
                "Giá trị diện tích của (H) bằng $16/3$.",
                "Thể tích khối tròn xoay khi quay (H) quanh trục Ox là $V = \\\\pi \\\\int_0^4 x dx$.",
                "Giá trị thể tích V bằng $8\\\\pi$."
            ],
            "correct": [true, true, true, true],
            "explanation": "1. $S = [\\\\frac{2}{3}x^{3/2}]_0^4 = 16/3$. 2. $V = \\\\pi [\\\\frac{1}{2}x^2]_0^4 = 8\\\\pi$."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Tính tích phân $I = \\\\int_0^1 (3x^2 - 2x + 1) dx$.",
            "correct": "1",
            "explanation": "$I = [x^3 - x^2 + x]_0^1 = 1 - 1 + 1 = 1$."
        },
        {
            "type": "short",
            "question": "Trong không gian Oxyz, cho hai điểm $A(1; 1; 1)$ và $B(3; 5; 7)$. Tìm tọa độ trung điểm I của đoạn thẳng AB. (Nhập tổng các tọa độ $x_I + y_I + z_I$)",
            "correct": "9",
            "explanation": "$I = (2; 3; 4)$. Tổng: $2 + 3 + 4 = 9$."
        },
        {
            "type": "short",
            "question": "Tính diện tích hình phẳng giới hạn bởi đồ thị hàm số $y = x^2 - 2x$ và trục hoành Ox.",
            "correct": "1,33",
            "explanation": "Nghiệm: $x=0, x=2$. $S = \\\\int_0^2 |x^2-2x| dx = \\\\int_0^2 (2x-x^2) dx = [x^2 - x^3/3]_0^2 = 4 - 8/3 = 4/3 \\\\approx 1,33$."
        },
        {
            "type": "short",
            "question": "Trong không gian Oxyz, tính độ dài của vectơ $\\\\vec{a} = (3; 0; 4)$.",
            "correct": "5",
            "explanation": "$|\\\\vec{a}| = \\\\sqrt{3^2 + 0^2 + 4^2} = \\\\sqrt{25} = 5$."
        },
        {
            "type": "short",
            "question": "Tìm một nguyên hàm $F(x)$ của hàm số $f(x) = 2x$ thỏa mãn $F(0) = 3$. Tính giá trị của $F(2)$.",
            "correct": "7",
            "explanation": "$F(x) = x^2 + C$. $F(0)=3 \\\\Rightarrow C=3$. Vậy $F(x) = x^2 + 3$. $F(2) = 2^2 + 3 = 7$."
        },
        {
            "type": "short",
            "question": "Trong không gian Oxyz, tính khoảng cách từ điểm $A(1; 2; 3)$ đến mặt phẳng $(P): 2x - 2y + z + 5 = 0$.",
            "correct": "2",
            "explanation": "$d = \\\\frac{|2.1 - 2.2 + 3 + 5|}{\\\\sqrt{2^2 + (-2)^2 + 1^2}} = \\\\frac{|2 - 4 + 3 + 5|}{3} = \\\\frac{6}{3} = 2$."
        }
    ]
};