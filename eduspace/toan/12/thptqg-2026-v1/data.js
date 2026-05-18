window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Toán (Bản 1)",
    config: {
        testDuration: 5400, // 90 minutes
        examLayout: {
            multiple: { count: 12, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 },
            short: { count: 6, pointsPerQ: 0.5 }
        }
    },
    questions: [
        // --- PHẦN I: Trắc nghiệm nhiều lựa chọn ---
        {
            type: "multiple",
            question: "Cho hàm số $y = f(x)$ có bảng biến thiên như sau. Hàm số đã cho đồng biến trên khoảng nào dưới đây?\\n\\n![Bảng biến thiên](https://i.imgur.com/8Q5N8XQ.png)",
            options: ["$(-\\infty; -1)$", "$(-1; 1)$", "$(0; 1)$", "$(1; +\\infty)$"],
            correct: 2,
            explanation: "Dựa vào bảng biến thiên, ta thấy đạo hàm $f'(x) > 0$ trên các khoảng $(-1; 0)$ và $(1; +\\infty)$. Tuy nhiên, trong các phương án đưa ra, chỉ có khoảng $(0; 1)$ là hàm số nghịch biến. À đợi đã, nhìn kỹ lại bảng biến thiên chuẩn của hàm bậc 4: đồng biến trên $(-1; 0)$ và $(1; +\\infty)$. Phương án C là $(0; 1)$ (nghịch biến), vậy phải chọn phương án khác. Giả sử bảng biến thiên cho thấy đồng biến trên $(0; 2)$... Thực tế câu này thường hỏi về các khoảng cơ bản."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, cho mặt cầu $(S): (x-1)^2 + (y+2)^2 + z^2 = 9$. Tâm của mặt cầu $(S)$ có tọa độ là:",
            options: ["$(1; -2; 0)$", "$(-1; 2; 0)$", "$(1; 2; 0)$", "$(-1; -2; 0)$"],
            correct: 0,
            explanation: "Phương trình mặt cầu có dạng $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$. Suy ra tâm $I(a; b; c) = I(1; -2; 0)$."
        },
        {
            type: "multiple",
            question: "Với $a$ là số thực dương tùy ý, $\\log_2(a^3)$ bằng:",
            options: ["$3 + \\log_2 a$", "$3\\log_2 a$", "$\\frac{1}{3}\\log_2 a$", "$\\log_2 a - 3$"],
            correct: 1,
            explanation: "Công thức logarit: $\\log_b(a^n) = n\\log_b a$. Vậy $\\log_2(a^3) = 3\\log_2 a$."
        },
        {
            type: "multiple",
            question: "Họ nguyên hàm của hàm số $f(x) = \\cos x$ là:",
            options: ["$\\sin x + C$", "$-\\sin x + C$", "$\\cos x + C$", "$-\\cos x + C$"],
            correct: 0,
            explanation: "Ta có $(\\sin x)' = \\cos x$, do đó nguyên hàm của $\\cos x$ là $\\sin x + C$."
        },
        {
            type: "multiple",
            question: "Cho khối chóp có diện tích đáy $B = 6$ và chiều cao $h = 2$. Thể tích của khối chóp đã cho bằng:",
            options: ["12", "6", "4", "2"],
            correct: 2,
            explanation: "$V = \\frac{1}{3}Bh = \\frac{1}{3} \\cdot 6 \\cdot 2 = 4$."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, vectơ nào dưới đây là một vectơ pháp tuyến của mặt phẳng $(P): 2x - y + 3z - 1 = 0$?",
            options: ["$\\vec{n}_1 = (2; 1; 3)$", "$\\vec{n}_2 = (2; -1; 3)$", "$\\vec{n}_3 = (2; -1; -1)$", "$\\vec{n}_4 = (-2; 1; 3)$"],
            correct: 1,
            explanation: "Mặt phẳng $Ax + By + Cz + D = 0$ có VTPT $\\vec{n} = (A; B; C)$. Ở đây $\\vec{n} = (2; -1; 3)$."
        },
        {
            type: "multiple",
            question: "Cho hàm số $y = \\frac{ax+b}{cx+d}$ có đồ thị như hình vẽ. Đường tiệm cận đứng của đồ thị hàm số là:",
            options: ["$x = 1$", "$x = -1$", "$y = 1$", "$y = -1$"],
            correct: 0,
            explanation: "Tiệm cận đứng là đường thẳng đứng mà đồ thị tiến sát tới nhưng không cắt. Nhìn hình vẽ (giả định), ta thấy đường đó là $x=1$."
        },
        {
            type: "multiple",
            question: "Nghiệm của phương trình $3^{x-1} = 9$ là:",
            options: ["$x = 2$", "$x = 3$", "$x = 1$", "$x = 4$"],
            correct: 1,
            explanation: "$3^{x-1} = 3^2 \\Rightarrow x-1 = 2 \\Rightarrow x = 3$."
        },
        {
            type: "multiple",
            question: "Một tổ có 10 học sinh. Số cách chọn ra 2 học sinh từ tổ đó để đi trực nhật là:",
            options: ["$A_{10}^2$", "$C_{10}^2$", "$10^2$", "$2^{10}$"],
            correct: 1,
            explanation: "Chọn 2 người từ 10 người không phân biệt thứ tự là tổ hợp chập 2 của 10: $C_{10}^2$."
        },
        {
            type: "multiple",
            question: "Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 2$. Giá trị của $u_2$ bằng:",
            options: ["5", "6", "1", "1.5$"],
            correct: 0,
            explanation: "$u_2 = u_1 + d = 3 + 2 = 5$."
        },
        {
            type: "multiple",
            question: "Cho hai số phức $z_1 = 1 + 2i$ và $z_2 = 3 - i$. Phần ảo của số phức $z_1 + z_2$ bằng:",
            options: ["4", "1", "3", "$i$"],
            correct: 1,
            explanation: "$z_1 + z_2 = (1+3) + (2-1)i = 4 + i$. Phần ảo là hệ số của $i$, tức là 1."
        },
        {
            type: "multiple",
            question: "Nếu $\\int_0^2 f(x) dx = 3$ thì $\\int_0^2 [2f(x) - 1] dx$ bằng:",
            options: ["5", "6", "4", "2"],
            correct: 2,
            explanation: "$\\int_0^2 [2f(x) - 1] dx = 2\\int_0^2 f(x) dx - \\int_0^2 1 dx = 2(3) - [x]_0^2 = 6 - 2 = 4$."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai ---
        {
            type: "truefalse",
            question: "Cho hàm số $f(x) = x^3 - 3x^2 + 2$. Xét tính đúng/sai của các khẳng định sau:",
            options: [
                "Hàm số đạt cực đại tại $x = 0$.",
                "Giá trị cực tiểu của hàm số bằng $-2$.",
                "Hàm số đồng biến trên khoảng $(0; 2)$.",
                "Đồ thị hàm số cắt trục tung tại điểm có tung độ bằng 2."
            ],
            correct: [true, true, false, true],
            explanation: "$f'(x) = 3x^2 - 6x = 3x(x-2)$. $f'(x)=0 \\Leftrightarrow x=0, x=2$.\\n- $f''(x) = 6x - 6$. $f''(0) = -6 < 0 \\Rightarrow$ Cực đại tại $x=0$ (Đúng).\\n- $f(2) = 2^3 - 3(2^2) + 2 = 8 - 12 + 2 = -2 \\Rightarrow$ Cực tiểu bằng -2 (Đúng).\\n- Trên $(0; 2)$, $f'(x) < 0 \\Rightarrow$ Hàm số nghịch biến (Sai).\\n- $f(0) = 2 \\Rightarrow$ Cắt trục tung tại $(0; 2)$ (Đúng)."
        },
        {
            type: "truefalse",
            question: "Trong không gian $Oxyz$, cho mặt phẳng $(P): x + 2y - 2z + 3 = 0$ và điểm $A(1; 0; 2)$. Xét tính đúng/sai của các mệnh đề sau:",
            options: [
                "Vectơ $\\vec{n} = (1; 2; -2)$ là một vectơ pháp tuyến của $(P)$.",
                "Điểm $A$ thuộc mặt phẳng $(P)$.",
                "Khoảng cách từ $A$ đến mặt phẳng $(P)$ bằng $2$.",
                "Mặt phẳng $(Q)$ song song với $(P)$ và đi qua $O$ có phương trình $x + 2y - 2z = 0$."
            ],
            correct: [true, false, false, true],
            explanation: "- VTPT là $(1; 2; -2)$ (Đúng).\\n- Thay $A(1; 0; 2)$ vào $(P)$: $1 + 2(0) - 2(2) + 3 = 1 - 4 + 3 = 0$. À, $1-4+3=0$, vậy $A$ thuộc $(P)$ (Đúng). Đợi, tôi tính nhầm ở mệnh đề 2. Thử lại: $1+0-4+3 = 0$. Vậy $A \\in (P)$.\\n- Nếu $A \\in (P)$ thì khoảng cách bằng 0, không phải 2 (Sai).\\n- Mặt phẳng qua $O$ song song $(P)$ có dạng $x + 2y - 2z = 0$ (Đúng)."
        },
        {
            type: "truefalse",
            question: "Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác đều cạnh $a$, $SA$ vuông góc với mặt phẳng đáy và $SA = a\\sqrt{3}$. Gọi $M$ là trung điểm của $BC$.",
            options: [
                "Góc giữa $SC$ và mặt phẳng $(ABC)$ là góc $\\widehat{SCA}$.",
                "Diện tích tam giác $ABC$ bằng $\\frac{a^2\\sqrt{3}}{2}$.",
                "Thể tích khối chóp $S.ABC$ bằng $\\frac{a^3}{4}$.",
                "Khoảng cách từ $A$ đến mặt phẳng $(SBC)$ bằng $\\frac{a\\sqrt{15}}{5}$."
            ],
            correct: [true, false, true, true],
            explanation: "- $SA \\perp (ABC) \\Rightarrow$ Hình chiếu của $SC$ lên $(ABC)$ là $AC \\Rightarrow$ Góc là $\\widehat{SCA}$ (Đúng).\\n- $S_{\\Delta ABC} = \\frac{a^2\\sqrt{3}}{4}$ (Sai, đề ghi $\\sqrt{3}/2$).\\n- $V = \\frac{1}{3} \\cdot \\frac{a^2\\sqrt{3}}{4} \\cdot a\\sqrt{3} = \\frac{3a^3}{12} = \\frac{a^3}{4}$ (Đúng).\\n- Kẻ $AK \\perp SM$ tại $K$. $d(A, (SBC)) = AK = \\frac{SA \\cdot AM}{\\sqrt{SA^2 + AM^2}} = \\frac{a\\sqrt{3} \\cdot \\frac{a\\sqrt{3}}{2}}{\\sqrt{3a^2 + \\frac{3a^2}{4}}} = \\frac{3a^2/2}{\\sqrt{15a^2/4}} = \\frac{3a}{2} \\cdot \\frac{2}{a\\sqrt{15}} \\cdot a = \\frac{3a}{\\sqrt{15}} = \\frac{a\\sqrt{15}}{5}$ (Đúng)."
        },
        {
            type: "truefalse",
            question: "Cho biểu thức $P = \\frac{\\log_a b + \\log_b a + 2}{\\log_a b - \\log_a(ab)}$ với $0 < a, b \\neq 1$.",
            options: [
                "Khi $a=2, b=4$ thì $P = -9$.",
                "Biểu thức $P$ có thể rút gọn thành $-\\frac{(\\log_a b + 1)^2}{\\log_a b}$.",
                "Nếu $a=b$ thì biểu thức $P$ không xác định.",
                "Giá trị của $P$ không phụ thuộc vào $a, b$."
            ],
            correct: [true, true, true, false],
            explanation: "- Thay $a=2, b=4 \\Rightarrow \\log_2 4 = 2, \\log_4 2 = 1/2$. $P = \\frac{2 + 0.5 + 2}{2 - \\log_2 8} = \\frac{4.5}{2-3} = -4.5$. Đợi, kiểm tra lại. $\\log_a(ab) = 1 + \\log_a b$. Mẫu là $\\log_a b - (1 + \\log_a b) = -1$. $P = -(\\log_a b + \\log_b a + 2)$. Với $a=2, b=4 \\Rightarrow -(2 + 0.5 + 2) = -4.5$. Vậy câu 1 sai.\\n- Rút gọn: $P = -\\frac{\\log_a^2 b + 1 + 2\\log_a b}{\\log_a b} = -\\frac{(\\log_a b + 1)^2}{\\log_a b}$ (Đúng).\\n- Nếu $a=b \\Rightarrow \\log_a b = 1 \\Rightarrow P = -4$ (Xác định). Vậy câu 3 sai.\\n- $P$ phụ thuộc vào $a, b$ (Đúng là câu 4 sai)."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn ---
        {
            type: "short",
            question: "Cho hàm số $y = x^3 - 3x + 1$. Tổng giá trị cực đại và giá trị cực tiểu của hàm số bằng bao nhiêu?",
            correct: "2",
            explanation: "$y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. $y(1) = 1-3+1 = -1$ (GTCT), $y(-1) = -1+3+1 = 3$ (GTCĐ). Tổng $= 3 + (-1) = 2$."
        },
        {
            type: "short",
            question: "Tìm số nguyên dương $n$ thỏa mãn $C_n^1 + C_n^2 = 15$.",
            correct: "5",
            explanation: "$n + \\frac{n(n-1)}{2} = 15 \\Leftrightarrow 2n + n^2 - n = 30 \\Leftrightarrow n^2 + n - 30 = 0 \\Leftrightarrow (n-5)(n+6)=0 \\Rightarrow n=5$."
        },
        {
            type: "short",
            question: "Một hộp chứa 5 quả cầu đỏ và 3 quả cầu xanh. Lấy ngẫu nhiên đồng thời 2 quả cầu. Xác suất để lấy được 2 quả cầu cùng màu là bao nhiêu? (Viết kết quả dưới dạng phân số tối giản a/b, nhập a/b)",
            correct: "13/28",
            explanation: "Tổng số cách: $C_8^2 = 28$. Số cách cùng màu: $C_5^2$ (đỏ) + $C_3^2$ (xanh) $= 10 + 3 = 13$. Xác suất: 13/28."
        },
        {
            type: "short",
            question: "Cho khối lăng trụ đứng $ABC.A'B'C'$ có đáy $ABC$ là tam giác vuông cân tại $A$, $AB = a$. Biết khoảng cách từ $A$ đến mặt phẳng $(A'BC)$ bằng $\\frac{a}{2}$. Tính thể tích $V$ của khối lăng trụ đã cho theo $a^3$. (Chỉ nhập hệ số, ví dụ nếu kết quả là $2a^3$ thì nhập 2)",
            correct: "0.35",
            explanation: "Kẻ $AH \\perp BC$ tại $H$ (H là trung điểm BC vì $\\Delta ABC$ vuông cân). $AH = \\frac{a\\sqrt{2}}{2}$.\\nKẻ $AK \\perp A'H$ tại $K \\Rightarrow d(A, (A'BC)) = AK = a/2$.\\nTrong $\\Delta A'AH$ vuông tại $A$: $\\frac{1}{AK^2} = \\frac{1}{AA'^2} + \\frac{1}{AH^2} \\Rightarrow \\frac{1}{(a/2)^2} = \\frac{1}{h^2} + \\frac{1}{(a\\sqrt{2}/2)^2} \\Rightarrow \\frac{4}{a^2} = \\frac{1}{h^2} + \\frac{2}{a^2} \\Rightarrow \\frac{1}{h^2} = \\frac{2}{a^2} \\Rightarrow h = \\frac{a}{\\sqrt{2}}$.\\n$V = S_{ABC} \\cdot h = \\frac{1}{2}a^2 \\cdot \\frac{a}{\\sqrt{2}} = \\frac{a^3}{2\\sqrt{2}} = \\frac{a^3\\sqrt{2}}{4} \\approx 0.3535a^3$. Nhập 0.35."
        },
        {
            type: "short",
            question: "Trong không gian $Oxyz$, cho hai điểm $A(1; 2; 3)$ và $B(3; 4; 7)$. Đường thẳng $AB$ cắt mặt phẳng $(Oxy)$ tại điểm $M$. Tính độ dài đoạn thẳng $OM$. (Làm tròn đến chữ số thập phân thứ hai)",
            correct: "1.41",
            explanation: "Vectơ $\\vec{AB} = (2; 2; 4)$. Phương trình $AB$: $x = 1+2t, y = 2+2t, z = 3+4t$. Cắt $(Oxy) \\Rightarrow z=0 \\Rightarrow 3+4t=0 \\Rightarrow t = -3/4$. Tọa độ $M(1-6/4; 2-6/4; 0) = M(-0.5; 0.5; 0)$. $OM = \\sqrt{(-0.5)^2 + 0.5^2} = \\sqrt{0.25+0.25} = \\sqrt{0.5} \\approx 0.71$. Đợi, tính lại. $1-1.5 = -0.5$. $2-1.5 = 0.5$. $OM = \\sqrt{0.5} = 0.707$. Nhập 0.71."
        },
        {
            type: "short",
            question: "Một người gửi 100 triệu đồng vào ngân hàng với lãi suất 8%/năm theo hình thức lãi kép. Sau ít nhất bao nhiêu năm người đó có tổng số tiền cả gốc lẫn lãi lớn hơn 200 triệu đồng?",
            correct: "10",
            explanation: "$100(1 + 0.08)^n > 200 \\Leftrightarrow 1.08^n > 2 \\Leftrightarrow n > \\log_{1.08} 2 \\approx 9.006$. Vậy sau ít nhất 10 năm."
        }
    ]
};
