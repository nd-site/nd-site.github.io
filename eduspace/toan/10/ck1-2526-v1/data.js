window.quizData = {
    "title": "Kiểm tra Cuối Học Kì I – Toán 10 (KNTT) – 2025-2026",
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
            "question": "Câu nào sau đây là một mệnh đề toán học?",
            "options": [
                "Hôm nay trời đẹp quá!",
                "Bạn có đi học không?",
                "$\\\\sqrt{2}$ là một số hữu tỉ.",
                "Hãy làm bài tập đi."
            ],
            "correct": 2,
            "explanation": "Mệnh đề toán học là một khẳng định có tính đúng hoặc sai về một đối tượng toán học."
        },
        {
            "type": "multiple",
            "question": "Cho tập hợp $A = \\\\{x \\\\in \\\\mathbb{R} | 1 \\\\le x < 5\\\\}$. Tập A viết dưới dạng khoảng, đoạn là:",
            "options": ["$[1; 5]$.", "$(1; 5)$.", "$[1; 5)$.", "$(1; 5]$."],
            "correct": 2,
            "explanation": "Dấu $\\\\le$ ứng với ngoặc vuông $[$, dấu $<$ ứng với ngoặc tròn $)$."
        },
        {
            "type": "multiple",
            "question": "Cặp số nào sau đây là một nghiệm của bất phương trình $x + 2y > 3$?",
            "options": ["(1; 1)", "(0; 0)", "(2; 2)", "(1; 0)"],
            "correct": 2,
            "explanation": "Thay (2; 2) vào: $2 + 2(2) = 6 > 3$ (đúng)."
        },
        {
            "type": "multiple",
            "question": "Cho tam giác ABC có $BC=a, AC=b, AB=c$. Định lí cosin được phát biểu là:",
            "options": [
                "$a^2 = b^2 + c^2 - 2bc\\\\cos A$",
                "$a^2 = b^2 + c^2 + 2bc\\\\cos A$",
                "$a^2 = b^2 + c^2 - bc\\\\cos A$",
                "$a^2 = b^2 + c^2 - 2bc\\\\sin A$"
            ],
            "correct": 0,
            "explanation": "Đây là hệ thức lượng cơ bản trong tam giác."
        },
        {
            "type": "multiple",
            "question": "Trong các đẳng thức sau đây, đẳng thức nào đúng?",
            "options": [
                "$\\\\sin 150^\\\\circ = -1/2$",
                "$\\\\cos 150^\\\\circ = \\\\sqrt{3}/2$",
                "$\\\\tan 150^\\\\circ = -\\\\sqrt{3}/3$",
                "$\\\\cot 150^\\\\circ = \\\\sqrt{3}$"
            ],
            "correct": 2,
            "explanation": "$\\\\tan 150^\\\\circ = \\\\tan(180^\\\\circ - 30^\\\\circ) = -\\\\tan 30^\\\\circ = -1/\\\\sqrt{3} = -\\\\sqrt{3}/3$."
        },
        {
            "type": "multiple",
            "question": "Cho hai vectơ $\\\\vec{a}$ và $\\\\vec{b}$ khác $\\\\vec{0}$. Khẳng định nào sau đây là định nghĩa tích vô hướng của hai vectơ?",
            "options": [
                "$\\\\vec{a}.\\\\vec{b} = |\\\\vec{a}|.|\\\\vec{b}|.\\\\sin(\\\\vec{a}, \\\\vec{b})$",
                "$\\\\vec{a}.\\\\vec{b} = |\\\\vec{a}|.|\\\\vec{b}|.\\\\cos(\\\\vec{a}, \\\\vec{b})$",
                "$\\\\vec{a}.\\\\vec{b} = |\\\\vec{a}|.|\\\\vec{b}|$",
                "$\\\\vec{a}.\\\\vec{b} = a_1b_1 - a_2b_2$"
            ],
            "correct": 1,
            "explanation": "Tích vô hướng bằng tích độ dài nhân với cosin của góc giữa hai vectơ."
        },
        {
            "type": "multiple",
            "question": "Cho ba điểm phân biệt A, B, C. Đẳng thức nào sau đây luôn đúng (quy tắc ba điểm)?",
            "options": [
                "$\\\\vec{AB} + \\\\vec{AC} = \\\\vec{BC}$",
                "$\\\\vec{AB} + \\\\vec{BC} = \\\\vec{AC}$",
                "$\\\\vec{BA} + \\\\vec{BC} = \\\\vec{AC}$",
                "$\\\\vec{AC} + \\\\vec{CB} = \\\\vec{BA}$"
            ],
            "correct": 1,
            "explanation": "Quy tắc cộng vectơ: Điểm cuối của vectơ này là điểm đầu của vectơ kia."
        },
        {
            "type": "multiple",
            "question": "Mẫu số liệu sau: 2, 5, 8, 9, 10. Số trung bình cộng của mẫu số liệu là:",
            "options": ["6,8", "7", "7,2", "8"],
            "correct": 0,
            "explanation": "$(2+5+8+9+10)/5 = 34/5 = 6,8$."
        },
        {
            "type": "multiple",
            "question": "Trong tam giác ABC, diện tích S được tính theo công thức nào (R là bán kính đường tròn ngoại tiếp)?",
            "options": [
                "$S = \\\\frac{abc}{4R}$",
                "$S = \\\\frac{abc}{2R}$",
                "$S = 2R \\\\sin A$",
                "$S = pr$"
            ],
            "correct": 0,
            "explanation": "Công thức diện tích tam giác liên quan đến bán kính đường tròn ngoại tiếp."
        },
        {
            "type": "multiple",
            "question": "Mệnh đề phủ định của mệnh đề '$P: \\\\forall x \\\\in \\\\mathbb{R}, x^2 + 1 > 0$' là:",
            "options": [
                "$\\\\bar{P}: \\\\forall x \\\\in \\\\mathbb{R}, x^2 + 1 \\\\le 0$",
                "$\\\\bar{P}: \\\\exists x \\\\in \\\\mathbb{R}, x^2 + 1 \\\\le 0$",
                "$\\\\bar{P}: \\\\exists x \\\\in \\\\mathbb{R}, x^2 + 1 < 0$",
                "$\\\\bar{P}: \\\\forall x \\\\in \\\\mathbb{R}, x^2 + 1 < 0$"
            ],
            "correct": 1,
            "explanation": "Phủ định của $\\\\forall$ là $\\\\exists$, phủ định của $>$ là $\\\\le$."
        },
        {
            "type": "multiple",
            "question": "Cho hình bình hành ABCD. Vectơ $\\\\vec{AB} + \\\\vec{AD}$ bằng vectơ nào?",
            "options": ["$\\\\vec{BD}$", "$\\\\vec{AC}$", "$\\\\vec{CA}$", "$\\\\vec{DB}$"],
            "correct": 1,
            "explanation": "Theo quy tắc hình bình hành, tổng hai vectơ chung gốc bằng vectơ đường chéo."
        },
        {
            "type": "multiple",
            "question": "Trung vị của mẫu số liệu: 3, 1, 4, 2, 5 là:",
            "options": ["4", "2", "3", "2,5"],
            "correct": 2,
            "explanation": "Sắp xếp mẫu: 1, 2, 3, 4, 5. Giá trị chính giữa là 3."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Cho hai tập hợp $A = \\\\{1; 2; 3; 4\\\\}$ và $B = \\\\{2; 4; 6\\\\}$:",
            "options": [
                "$A \\\\cup B = \\\\{1; 2; 3; 4; 6\\\\}$.",
                "$A \\\\cap B = \\\\{2; 4\\\\}$.",
                "Tập hợp $A \\\\setminus B = \\\\{1; 3\\\\}$.",
                "Số phần tử của tập hợp $A$ là 4."
            ],
            "correct": [true, true, true, true],
            "explanation": "Các phép toán tập hợp cơ bản: hợp (lấy tất cả), giao (lấy phần chung), hiệu (lấy thuộc A nhưng không thuộc B)."
        },
        {
            "type": "truefalse",
            "question": "Xét tam giác ABC có $a=6, b=8, c=10$:",
            "options": [
                "Tam giác ABC là tam giác vuông tại C.",
                "Diện tích tam giác ABC bằng 24 (đvdt).",
                "Bán kính đường tròn ngoại tiếp $R = 5$.",
                "$\\\\cos A = 0,8$."
            ],
            "correct": [true, true, true, true],
            "explanation": "1. $6^2+8^2=10^2$ nên vuông tại C. 2. $S = 1/2.6.8=24$. 3. $R = c/2 = 5$. 4. $\\\\cos A = b/c = 8/10 = 0,8$."
        },
        {
            "type": "truefalse",
            "question": "Về vectơ và các phép toán:",
            "options": [
                "Vectơ $\\\\vec{0}$ cùng phương với mọi vectơ.",
                "Nếu $I$ là trung điểm đoạn $AB$ thì $\\\\vec{IA} + \\\\vec{IB} = \\\\vec{0}$.",
                "Hai vectơ bằng nhau khi chúng có cùng hướng và cùng độ dài.",
                "$k\\\\vec{a}$ là một vectơ cùng hướng với $\\\\vec{a}$ khi $k < 0$."
            ],
            "correct": [true, true, true, false],
            "explanation": "Khi $k < 0$, $k\\\\vec{a}$ ngược hướng với $\\\\vec{a}$."
        },
        {
            "type": "truefalse",
            "question": "Về số đặc trưng của mẫu số liệu:",
            "options": [
                "Số trung bình cộng luôn luôn thuộc mẫu số liệu đã cho.",
                "Tứ phân vị thứ hai $Q_2$ chính là số trung vị $M_e$.",
                "Độ lệch chuẩn là căn bậc hai của phương sai.",
                "Khoảng biến thiên là hiệu giữa giá trị lớn nhất và giá trị nhỏ nhất của mẫu số liệu."
            ],
            "correct": [false, true, true, true],
            "explanation": "Số trung bình có thể là số không nằm trong mẫu (ví dụ trung bình của 1 và 2 là 1.5)."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Cho tập hợp $A = [1; 3]$ và $B = (2; 4)$. Tìm số nguyên thuộc tập $A \\\\cap B$.",
            "correct": "3",
            "explanation": "$A \\\\cap B = (2; 3]$. Số nguyên duy nhất là 3."
        },
        {
            "type": "short",
            "question": "Tính diện tích tam giác ABC biết $a=5, b=8$ và góc $C = 30^\\\\circ$.",
            "correct": "10",
            "explanation": "$S = 1/2 . a . b . \\\\sin C = 1/2 . 5 . 8 . 0,5 = 10$."
        },
        {
            "type": "short",
            "question": "Trong mặt phẳng tọa độ Oxy, cho $\\\\vec{a} = (2; 1)$ và $\\\\vec{b} = (3; 4)$. Tính tích vô hướng $\\\\vec{a}.\\\\vec{b}$.",
            "correct": "10",
            "explanation": "$\\\\vec{a}.\\\\vec{b} = 2.3 + 1.4 = 6 + 4 = 10$."
        },
        {
            "type": "short",
            "question": "Tìm giá trị lớn nhất của biểu thức $F(x, y) = x + y$ trên miền nghiệm của hệ bất phương trình: $x \\\\ge 0, y \\\\ge 0, x + y \\\\le 4$.",
            "correct": "4",
            "explanation": "Miền nghiệm là tam giác OAB với $O(0,0), A(4,0), B(0,4)$. F đạt cực đại tại A hoặc B là 4."
        },
        {
            "type": "short",
            "question": "Cho tam giác ABC đều cạnh bằng 2. Tính độ dài của vectơ $\\\\vec{AB} + \\\\vec{AC}$. (Lấy kết quả gần đúng đến 2 chữ số thập phân)",
            "correct": "3,46",
            "explanation": "$|\\\\vec{AB} + \\\\vec{AC}| = |2\\\\vec{AM}| = 2 . \\\\frac{2\\\\sqrt{3}}{2} = 2\\\\sqrt{3} \\\\approx 3,46$ (M là trung điểm BC)."
        },
        {
            "type": "short",
            "question": "Tính độ lệch chuẩn của mẫu số liệu: 4, 6, 8. (Lấy kết quả gần đúng đến 2 chữ số thập phân)",
            "correct": "1,63",
            "explanation": "Trung bình = 6. Phương sai $s^2 = [(4-6)^2 + (6-6)^2 + (8-6)^2]/3 = 8/3 \\\\approx 2,67$. Độ lệch chuẩn $\\\\sqrt{8/3} \\\\approx 1,63$."
        }
    ]
};