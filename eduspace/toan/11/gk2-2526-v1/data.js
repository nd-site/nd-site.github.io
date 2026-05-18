window.quizData = {
    "title": "Kiểm tra Giữa Học Kì II – Toán 11 (KNTT) – 2025-2026",
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
            "question": "Cho $a > 0, a \\\\ne 1$. Giá trị của biểu thức $\\\\log_a a^3$ là:",
            "options": ["1", "3", "$a^3$", "0"],
            "correct": 1,
            "explanation": "Theo tính chất lôgarit: $\\\\log_a a^n = n$."
        },
        {
            "type": "multiple",
            "question": "Tập xác định của hàm số $y = \\\\log_2 (x - 3)$ là:",
            "options": ["$D = (3; +\\\\infty)$", "$D = [3; +\\\\infty)$", "$D = \\\\mathbb{R} \\\\setminus \\\\{3\\\\}$", "$D = (0; +\\\\infty)$"],
            "correct": 0,
            "explanation": "Điều kiện xác định: $x - 3 > 0 \\\\Leftrightarrow x > 3$."
        },
        {
            "type": "multiple",
            "question": "Hàm số nào sau đây nghịch biến trên $\\\\mathbb{R}$?",
            "options": ["$y = 2^x$", "$y = (e/2)^x$", "$y = (0,5)^x$", "$y = 3^x$"],
            "correct": 2,
            "explanation": "Hàm số $y = a^x$ nghịch biến khi $0 < a < 1$. Ở đây $0,5 < 1$."
        },
        {
            "type": "multiple",
            "question": "Đạo hàm của hàm số $y = e^{2x}$ là:",
            "options": ["$y' = e^{2x}$", "$y' = 2e^{2x}$", "$y' = 2x e^{2x-1}$", "$y' = \\\\frac{1}{2} e^{2x}$"],
            "correct": 1,
            "explanation": "Công thức $(e^u)' = u' e^u \\\\Rightarrow (e^{2x})' = 2 e^{2x}$."
        },
        {
            "type": "multiple",
            "question": "Cho hai đường thẳng a và b vuông góc với nhau. Góc giữa a và b bằng:",
            "options": ["$0^\\\\circ$", "$45^\\\\circ$", "$90^\\\\circ$", "$180^\\\\circ$"],
            "correct": 2,
            "explanation": "Định nghĩa hai đường thẳng vuông góc là hai đường thẳng có góc giữa chúng bằng 90 độ."
        },
        {
            "type": "multiple",
            "question": "Trong không gian, cho đường thẳng d vuông góc với mặt phẳng (P). Khi đó, d vuông góc với:",
            "options": [
                "Mọi đường thẳng nằm trong (P).",
                "Duy nhất một đường thẳng nằm trong (P).",
                "Chỉ các đường thẳng đi qua giao điểm của d và (P).",
                "Mọi đường thẳng song song với (P)."
            ],
            "correct": 0,
            "explanation": "Định lí: Nếu một đường thẳng vuông góc với một mặt phẳng thì nó vuông góc với mọi đường thẳng nằm trong mặt phẳng đó."
        },
        {
            "type": "multiple",
            "question": "Nghiệm của phương trình $3^{x-1} = 27$ là:",
            "options": ["$x=3$", "$x=4$", "$x=2$", "$x=28$"],
            "correct": 1,
            "explanation": "$3^{x-1} = 3^3 \\\\Rightarrow x-1 = 3 \\\\Rightarrow x = 4$."
        },
        {
            "type": "multiple",
            "question": "Cho khối chóp có diện tích đáy B và chiều cao h. Thể tích V của khối chóp được tính theo công thức:",
            "options": ["$V = Bh$", "$V = \\\\frac{1}{2}Bh$", "$V = \\\\frac{1}{3}Bh$", "$V = \\\\frac{4}{3}Bh$"],
            "correct": 2,
            "explanation": "Thể tích khối chóp bằng 1/3 diện tích đáy nhân chiều cao."
        },
        {
            "type": "multiple",
            "question": "Giá trị của $\\\\log_{10} 100$ là:",
            "options": ["1", "10", "2", "100"],
            "correct": 2,
            "explanation": "$\\\\log_{10} 10^2 = 2$."
        },
        {
            "type": "multiple",
            "question": "Cho hình lập phương $ABCD.A'B'C'D'$. Góc giữa hai đường thẳng $AB$ và $B'C'$ bằng:",
            "options": ["$0^\\\\circ$", "$45^\\\\circ$", "$90^\\\\circ$", "$60^\\\\circ$"],
            "correct": 2,
            "explanation": "$B'C' // BC$. Góc giữa AB và B'C' bằng góc giữa AB và BC, bằng 90 độ."
        },
        {
            "type": "multiple",
            "question": "Tập nghiệm của bất phương trình $\\\\log_2 x < 3$ là:",
            "options": ["$(-\\\\infty; 8)$", "$(0; 8)$", "$(0; 9)$", "$(3; +\\\\infty)$"],
            "correct": 1,
            "explanation": "Điều kiện $x > 0$. $\\\\log_2 x < 3 \\\\Leftrightarrow x < 2^3 = 8$. Vậy $D = (0; 8)$."
        },
        {
            "type": "multiple",
            "question": "Cho hình chóp $S.ABC$ có $SA \\\\perp (ABC)$. Khi đó, hình chiếu của S trên mặt phẳng (ABC) là điểm:",
            "options": ["A", "B", "C", "Trọng tâm tam giác ABC"],
            "correct": 0,
            "explanation": "Vì $SA \\\\perp (ABC)$ nên hình chiếu vuông góc của S lên (ABC) là chân đường vuông góc A."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Xét các khẳng định sau về hàm số mũ và lôgarit:",
            "options": [
                "Hàm số $y = a^x$ ($a > 0, a \\\\ne 1$) có tập giá trị là $\\\\mathbb{R}$.",
                "Đồ thị hàm số $y = \\\\log_a x$ luôn đi qua điểm $(1; 0)$.",
                "$\\\\log_a (x+y) = \\\\log_a x + \\\\log_a y$ với mọi $x, y > 0$.",
                "Hàm số $y = (\\\\sqrt{2})^x$ là hàm số đồng biến trên $\\\\mathbb{R}$."
            ],
            "correct": [false, true, false, true],
            "explanation": "1. Tập giá trị của $a^x$ là $(0; +\\\\infty)$. 3. Công thức đúng là $\\\\log_a (xy) = \\\\log_a x + \\\\log_a y$."
        },
        {
            "type": "truefalse",
            "question": "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông tâm O và $SO \\\\perp (ABCD)$:",
            "options": [
                "$AC \\\\perp BD$.",
                "$BD \\\\perp (SAC)$.",
                "Hình chiếu của SC trên (ABCD) là đoạn OC.",
                "Góc giữa đường thẳng SA và (ABCD) là góc $\\\\widehat{SAO}$."
            ],
            "correct": [true, true, true, true],
            "explanation": "Vì đáy là hình vuông nên $AC \\\\perp BD$. Vì $SO \\\\perp BD$ và $AC \\\\perp BD$ nên $BD \\\\perp (SAC)$."
        },
        {
            "type": "truefalse",
            "question": "Xét các tính chất về quan hệ vuông góc trong không gian:",
            "options": [
                "Hai đường thẳng cùng vuông góc với một đường thẳng thứ ba thì song song với nhau.",
                "Hai mặt phẳng phân biệt cùng vuông góc với một đường thẳng thì song song với nhau.",
                "Đường thẳng vuông góc với hai đường thẳng cắt nhau nằm trong mặt phẳng (P) thì nó vuông góc với (P).",
                "Khoảng cách giữa hai đường thẳng chéo nhau là độ dài đoạn vuông góc chung của chúng."
            ],
            "correct": [false, true, true, true],
            "explanation": "1. Sai (có thể chéo nhau hoặc cắt nhau). Các ý còn lại là các định lí cơ bản."
        },
        {
            "type": "truefalse",
            "question": "Về nghiệm của phương trình và bất phương trình:",
            "options": [
                "Phương trình $2^x = -1$ có một nghiệm duy nhất.",
                "Nghiệm của phương trình $\\\\log_3 x = 2$ là $x = 9$.",
                "Bất phương trình $(1/2)^x > 4$ tương đương với $x < -2$.",
                "Hàm số $y = \\\\ln x$ có đạo hàm $y' = 1/x$ trên $(0; +\\\\infty)$."
            ],
            "correct": [false, true, true, true],
            "explanation": "1. $2^x$ luôn dương nên phương trình vô nghiệm. 3. $(1/2)^x > (1/2)^{-2} \\\\Rightarrow x < -2$ (vì cơ số < 1)."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Tìm tập nghiệm của phương trình $\\\\log_2(x^2 - x) = 1$. (Viết các nghiệm cách nhau bởi dấu phẩy, ví dụ: 1, 2)",
            "correct": "-1, 2",
            "explanation": "$x^2 - x = 2^1 \\\\Rightarrow x^2 - x - 2 = 0 \\\\Rightarrow x = -1, x = 2$ (đều thỏa mãn điều kiện $x^2-x > 0$)."
        },
        {
            "type": "short",
            "question": "Cho hình chóp tam giác đều $S.ABC$ có cạnh đáy bằng a, chiều cao bằng $a\\\\sqrt{2}$. Tính thể tích khối chóp theo $a^3$. (Nhập hệ số của $a^3$ dưới dạng phân số tối giản hoặc số thập phân)",
            "correct": "0,408", // S_day = a^2*sqrt(3)/4. V = 1/3 * a^2*sqrt(3)/4 * a*sqrt(2) = a^3 * sqrt(6)/12 approx 0.204. Wait.
            "explanation": "Diện tích đáy $S = a^2\\\\sqrt{3}/4$. $V = 1/3 . S . h = 1/3 . a^2\\\\sqrt{3}/4 . a\\\\sqrt{2} = a^3\\\\sqrt{6}/12 \\\\approx 0,204$." ,
            "correct": "0,204"
        },
        {
            "type": "short",
            "question": "Tính đạo hàm của hàm số $y = \\\\ln(x^2 + 1)$ tại điểm $x = 1$.",
            "correct": "1",
            "explanation": "$y' = (2x)/(x^2 + 1)$. Tại $x=1$, $y' = 2/2 = 1$."
        },
        {
            "type": "short",
            "question": "Cho hình lập phương cạnh a. Tính khoảng cách giữa hai mặt phẳng song song $(ABCD)$ và $(A'B'C'D')$ theo a.",
            "correct": "1",
            "explanation": "Khoảng cách giữa hai mặt đáy chính bằng cạnh bên của hình lập phương (hệ số 1)."
        },
        {
            "type": "short",
            "question": "Giải bất phương trình $5^{2x-1} \\\\ge 125$. Tìm giá trị nhỏ nhất của x.",
            "correct": "2",
            "explanation": "$5^{2x-1} \\\\ge 5^3 \\\\Rightarrow 2x - 1 \\\\ge 3 \\\\Rightarrow 2x \\\\ge 4 \\\\Rightarrow x \\\\ge 2$."
        },
        {
            "type": "short",
            "question": "Tính giá trị biểu thức $A = 2^{\\\\log_2 5} + \\\\log_3 1$.",
            "correct": "5",
            "explanation": "$A = 5 + 0 = 5$."
        }
    ]
};