window.quizData = {
    "title": "Kiểm tra Giữa Học Kì II – Toán 10 (KNTT) – 2025-2026",
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
            "question": "Có bao nhiêu cách chọn ra một quả cầu từ một hộp chứa 5 quả cầu xanh và 7 quả cầu đỏ (các quả cầu đôi một khác nhau)?",
            "options": ["5", "7", "12", "35"],
            "correct": 2,
            "explanation": "Theo quy tắc cộng: 5 + 7 = 12 cách."
        },
        {
            "type": "multiple",
            "question": "Số cách sắp xếp 5 học sinh thành một hàng dọc là:",
            "options": ["5", "25", "120", "10"],
            "correct": 2,
            "explanation": "Số hoán vị của 5 phần tử là $P_5 = 5! = 120$."
        },
        {
            "type": "multiple",
            "question": "Công thức tính số tổ hợp chập k của n phần tử ($0 \\\\le k \\\\le n$) là:",
            "options": [
                "$C_n^k = \\\\frac{n!}{(n-k)!}$",
                "$C_n^k = \\\\frac{n!}{k!(n-k)!}$",
                "$C_n^k = \\\\frac{n!}{k!}$",
                "$C_n^k = n^k$"
            ],
            "correct": 1,
            "explanation": "Công thức đúng của tổ hợp là $C_n^k = \\\\frac{n!}{k!(n-k)!}$."
        },
        {
            "type": "multiple",
            "question": "Trong mặt phẳng Oxy, vectơ pháp tuyến của đường thẳng $d: 2x - 3y + 5 = 0$ là:",
            "options": [
                "$\\\\vec{n} = (2; 3)$",
                "$\\\\vec{n} = (2; -3)$",
                "$\\\\vec{n} = (3; 2)$",
                "$\\\\vec{n} = (-3; 2)$"
            ],
            "correct": 1,
            "explanation": "Vectơ pháp tuyến có tọa độ là các hệ số của x và y: $\\\\vec{n} = (2; -3)$."
        },
        {
            "type": "multiple",
            "question": "Khai triển Nhị thức Newton của $(x + 1)^4$ có bao nhiêu số hạng?",
            "options": ["4", "5", "3", "6"],
            "correct": 1,
            "explanation": "Khai triển $(a+b)^n$ có $n+1$ số hạng. Ở đây $4+1 = 5$."
        },
        {
            "type": "multiple",
            "question": "Đường tròn $(C): (x-1)^2 + (y+2)^2 = 9$ có tâm I và bán kính R lần lượt là:",
            "options": [
                "$I(1; -2), R=9$",
                "$I(-1; 2), R=3$",
                "$I(1; -2), R=3$",
                "$I(-1; 2), R=9$"
            ],
            "correct": 2,
            "explanation": "Tâm $I(1; -2)$, bán kính $R = \\\\sqrt{9} = 3$."
        },
        {
            "type": "multiple",
            "question": "Số cách chọn một ban cán sự gồm 3 người từ một lớp có 30 học sinh là:",
            "options": ["$C_{30}^3$", "$A_{30}^3$", "$P_3$", "$30^3$"],
            "correct": 0,
            "explanation": "Vì không phân biệt chức vụ nên ta dùng tổ hợp: $C_{30}^3$."
        },
        {
            "type": "multiple",
            "question": "Hệ số của $x^2$ trong khai triển $(x+2)^3$ là:",
            "options": ["1", "6", "12", "8"],
            "correct": 1,
            "explanation": "$(x+2)^3 = x^3 + 3x^2.2 + 3x.2^2 + 2^3 = x^3 + 6x^2 + 12x + 8$. Hệ số của $x^2$ là 6."
        },
        {
            "type": "multiple",
            "question": "Phương trình tham số của đường thẳng đi qua $M(1; 2)$ và có vectơ chỉ phương $\\\\vec{u} = (3; 4)$ là:",
            "options": [
                "$\\\\begin{cases} x = 1 + 3t \\\\ y = 2 + 4t \\\\end{cases}$",
                "$\\\\begin{cases} x = 3 + t \\\\ y = 4 + 2t \\\\end{cases}$",
                "$\\\\begin{cases} x = 1 + 4t \\\\ y = 2 + 3t \\\\end{cases}$",
                "$\\\\begin{cases} x = 3 + 2t \\\\ y = 4 + t \\\\end{cases}$"
            ],
            "correct": 0,
            "explanation": "Công thức: $x = x_0 + at, y = y_0 + bt$."
        },
        {
            "type": "multiple",
            "question": "Khoảng cách từ điểm $O(0; 0)$ đến đường thẳng $3x + 4y - 10 = 0$ bằng:",
            "options": ["2", "10", "5", "0"],
            "correct": 0,
            "explanation": "$d = \\\\frac{|3.0 + 4.0 - 10|}{\\\\sqrt{3^2 + 4^2}} = \\\\frac{10}{5} = 2$."
        },
        {
            "type": "multiple",
            "question": "Có bao nhiêu số tự nhiên có hai chữ số khác nhau lập được từ các chữ số $\\\\{1, 2, 3, 4, 5\\\\}$?",
            "options": ["25", "20", "10", "5"],
            "correct": 1,
            "explanation": "Số chỉnh hợp chập 2 của 5 phần tử: $A_5^2 = 5 \\\\times 4 = 20$."
        },
        {
            "type": "multiple",
            "question": "Góc giữa hai đường thẳng $d_1: x + y - 1 = 0$ và $d_2: x - y + 2 = 0$ là:",
            "options": ["$30^\\\\circ$", "$45^\\\\circ$", "$90^\\\\circ$", "$60^\\\\circ$"],
            "correct": 2,
            "explanation": "Vectơ pháp tuyến $\\\\vec{n_1} = (1; 1), \\\\vec{n_2} = (1; -1)$. Tích vô hướng $\\\\vec{n_1}.\\\\vec{n_2} = 1 - 1 = 0$. Hai đường thẳng vuông góc."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Cho khai triển Nhị thức Newton: $P(x) = (2x - 1)^4$. Xét tính đúng sai của các khẳng định sau:",
            "options": [
                "Số hạng đầu tiên trong khai triển (theo số mũ giảm dần của x) là $16x^4$.",
                "Tổng các hệ số trong khai triển bằng 1.",
                "Hệ số của số hạng chứa $x^3$ là -8.",
                "Khai triển có tất cả 4 số hạng."
            ],
            "correct": [true, true, false, false],
            "explanation": "3. Hệ số $x^3$ là $C_4^1 . (2x)^3 . (-1)^1 = 4 . 8 . (-1) = -32$. 4. Khai triển có 5 số hạng."
        },
        {
            "type": "truefalse",
            "question": "Trong mặt phẳng Oxy, cho đường tròn $(C): x^2 + y^2 - 4x + 6y - 3 = 0$:",
            "options": [
                "Tâm của đường tròn là $I(2; -3)$.",
                "Bán kính của đường tròn là $R = 4$.",
                "Điểm $A(2; 1)$ nằm trên đường tròn.",
                "Đường thẳng $x = 2$ đi qua tâm I."
            ],
            "correct": [true, true, true, true],
            "explanation": "$a=2, b=-3, c=-3 \\\\Rightarrow R = \\\\sqrt{2^2 + (-3)^2 - (-3)} = \\\\sqrt{4+9+3} = 4$. Thay A(2,1): $4+1-8+6-3 = 0$ (Đúng)."
        },
        {
            "type": "truefalse",
            "question": "Một tổ có 6 học sinh nam và 4 học sinh nữ. Chọn ngẫu nhiên 3 học sinh:",
            "options": [
                "Số cách chọn 3 học sinh bất kì là $C_{10}^3 = 120$.",
                "Số cách chọn 3 học sinh toàn là nam là $C_6^3 = 20$.",
                "Số cách chọn 3 học sinh có ít nhất một nữ là 100.",
                "Số cách chọn 3 học sinh có 2 nam và 1 nữ là $C_6^2 + C_4^1 = 19$."
            ],
            "correct": [true, true, true, false],
            "explanation": "4. Phải dùng quy tắc nhân: $C_6^2 \\\\times C_4^1 = 15 \\\\times 4 = 60$."
        },
        {
            "type": "truefalse",
            "question": "Cho đường thẳng $\\\\Delta: x - 2y + 3 = 0$ và điểm $A(1; 2)$:",
            "options": [
                "Vectơ chỉ phương của $\\\\Delta$ là $\\\\vec{u} = (2; 1)$.",
                "Khoảng cách từ A đến $\\\\Delta$ bằng 0.",
                "Đường thẳng đi qua A và song song với $\\\\Delta$ có phương trình $x - 2y + 3 = 0$.",
                "Đường thẳng đi qua A và vuông góc với $\\\\Delta$ có vectơ pháp tuyến là $\\\\vec{n'} = (2; 1)$."
            ],
            "correct": [true, true, false, true],
            "explanation": "Thay A(1,2): $1 - 2(2) + 3 = 0 \\\\Rightarrow A \\\\in \\\\Delta$. Đường thẳng song song không thể trùng $\\\\Delta$."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Tính số cách xếp 3 quyển sách Toán khác nhau và 2 quyển sách Văn khác nhau lên một kệ sách dài sao cho các quyển sách cùng môn xếp kề nhau.",
            "correct": "24",
            "explanation": "Coi nhóm Toán là 1 vật, Văn là 1 vật $\\\\Rightarrow 2!$ cách hoán đổi nhóm. Trong nhóm Toán có $3!$, Văn có $2!$. Tổng: $2! \\\\times 3! \\\\times 2! = 2 \\\\times 6 \\\\times 2 = 24$."
        },
        {
            "type": "short",
            "question": "Tìm hệ số của $x^3$ trong khai triển $(x + 2)^5$.",
            "correct": "40",
            "explanation": "Số hạng tổng quát: $C_5^k . x^{5-k} . 2^k$. Để có $x^3$ thì $5-k=3 \\\\Rightarrow k=2$. Hệ số: $C_5^2 . 2^2 = 10 . 4 = 40$."
        },
        {
            "type": "short",
            "question": "Tính bán kính của đường tròn đi qua ba điểm $A(0; 4), B(3; 0), O(0; 0)$.",
            "correct": "2,5",
            "explanation": "Tam giác OAB vuông tại O. Bán kính đường tròn ngoại tiếp bằng nửa cạnh huyền AB. $AB = \\\\sqrt{3^2 + 4^2} = 5 \\\\Rightarrow R = 2,5$."
        },
        {
            "type": "short",
            "question": "Có bao nhiêu số tự nhiên chẵn có 3 chữ số khác nhau lập từ các chữ số $\\\\{1, 2, 3, 4, 5, 6\\\\}$?",
            "correct": "60",
            "explanation": "Chữ số cuối có 3 cách chọn (2, 4, 6). Hai chữ số đầu có $A_5^2 = 20$ cách. Tổng: $3 \\\\times 20 = 60$."
        },
        {
            "type": "short",
            "question": "Tính khoảng cách giữa hai đường thẳng song song $d_1: 3x - 4y + 1 = 0$ và $d_2: 3x - 4y - 9 = 0$.",
            "correct": "2",
            "explanation": "$d = \\\\frac{|1 - (-9)|}{\\\\sqrt{3^2 + 4^2}} = \\\\frac{10}{5} = 2$."
        },
        {
            "type": "short",
            "question": "Một tổ có 10 người. Cần chọn ra một nhóm gồm 1 tổ trưởng, 1 tổ phó và 2 ủy viên. Hỏi có bao nhiêu cách chọn? (Các ủy viên có vai trò như nhau)",
            "correct": "2520",
            "explanation": "Chọn tổ trưởng: 10 cách. Tổ phó: 9 cách. 2 ủy viên: $C_8^2 = 28$ cách. Tổng: $10 \\\\times 9 \\\\times 28 = 2520$."
        }
    ]
};