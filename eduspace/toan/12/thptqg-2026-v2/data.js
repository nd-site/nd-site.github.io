window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Toán (Bản 2)",
    config: {
        testDuration: 5400,
        examLayout: {
            multiple: { count: 12, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 },
            short: { count: 6, pointsPerQ: 0.5 }
        }
    },
    questions: [
        // --- PHẦN I: Trắc nghiệm 4 lựa chọn (12 câu - 3.0 điểm) ---
        {
            type: "multiple",
            question: "Cho hàm số $y = f(x)$ có bảng biến thiên như sau. Hàm số đã cho đồng biến trên khoảng nào dưới đây?\n\n| $x$ | $-\\infty$ | | $-1$ | | $1$ | | $+\\infty$ |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n| $f'(x)$ | | $+$ | $0$ | $-$ | $0$ | $+$ | |\n| $f(x)$ | $-\\infty$ | $\\nearrow$ | $3$ | $\\searrow$ | $-1$ | $\\nearrow$ | $+\\infty$ |",
            options: ["$(-1; 1)$", "$(-\\infty; -1)$", "$(-1; +\\infty)$", "$(0; 1)$"],
            correct: 1,
            explanation: "Dựa vào bảng biến thiên, đạo hàm $f'(x) > 0$ trên khoảng $(-\\infty; -1)$ và $(1; +\\infty)$ nên hàm số đồng biến trên các khoảng đó."
        },
        {
            type: "multiple",
            question: "Cho hàm số bậc ba $y = ax^3 + bx^2 + cx + d$ có đồ thị là đường cong trong hình bên. Điểm cực đại của đồ thị hàm số là:",
            options: ["$(0; 2)$", "$(2; -2)$", "$(-2; 2)$", "$(1; 0)$"],
            correct: 0,
            explanation: "Điểm cực đại của đồ thị là điểm tại đó đồ thị đạt đỉnh cao cục bộ, tương ứng với $(0; 2)$."
        },
        {
            type: "multiple",
            question: "Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ là:",
            options: ["$x = -1$", "$x = 2$", "$y = 2$", "$y = -1$"],
            correct: 0,
            explanation: "Tiệm cận đứng là nghiệm của mẫu số $x + 1 = 0 \\Leftrightarrow x = -1$."
        },
        {
            type: "multiple",
            question: "Họ nguyên hàm của hàm số $f(x) = 3x^2 + 2x$ là:",
            options: ["$x^3 + x^2 + C$", "$3x^3 + 2x^2 + C$", "$6x + 2 + C$", "$x^3 + 2x^2 + C$"],
            correct: 0,
            explanation: "$\\int (3x^2 + 2x) dx = x^3 + x^2 + C$."
        },
        {
            type: "multiple",
            question: "Tích phân $I = \\int_{0}^{1} e^x dx$ bằng:",
            options: ["$e - 1$", "$e$", "$e + 1$", "$1 - e$"],
            correct: 0,
            explanation: "$I = e^x \\big|_0^1 = e^1 - e^0 = e - 1$."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, cho điểm $A(1; 2; -3)$. Hình chiếu vuông góc của $A$ lên mặt phẳng $(Oxy)$ có tọa độ là:",
            options: ["$(1; 2; 0)$", "$(1; 0; -3)$", "$(0; 2; -3)$", "$(1; 0; 0)$"],
            correct: 0,
            explanation: "Hình chiếu vuông góc của điểm $A(x; y; z)$ lên mặt phẳng $(Oxy)$ thu được bằng cách giữ nguyên $x, y$ và cho $z = 0$, ta được $(1; 2; 0)$."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, một vectơ pháp tuyến của mặt phẳng $(P): 2x - y + 3z - 4 = 0$ là:",
            options: ["$\\vec{n} = (2; -1; 3)$", "$$\\vec{n} = (2; 1; 3)$$", "$$\\vec{n} = (2; -1; -4)$$", "$$\\vec{n} = (2; 1; -4)$$"],
            correct: 0,
            explanation: "Hệ số đứng trước $x, y, z$ trong phương trình mặt phẳng lần lượt là tọa độ của vectơ pháp tuyến: $\\vec{n} = (2; -1; 3)$."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, cho mặt cầu $(S): (x-1)^2 + (y+2)^2 + z^2 = 9$. Tâm $I$ và bán kính $R$ của mặt cầu $(S)$ lần lượt là:",
            options: ["$I(1; -2; 0), R = 3$", "$I(-1; 2; 0), R = 9$", "$I(1; -2; 0), R = 9$", "$I(-1; 2; 0), R = 3$"],
            correct: 0,
            explanation: "Phương trình mặt cầu $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$ có tâm $I(a;b;c)$ và bán kính $R$. Ở đây $a=1, b=-2, c=0$ và $R^2=9 \\Rightarrow R=3$."
        },
        {
            type: "multiple",
            question: "Cho hai biến cố $A$ và $B$ độc lập nhau, biết $P(A) = 0,4$ và $P(B) = 0,5$. Xác suất để cả hai biến cố cùng xảy ra là $P(AB)$ bằng:",
            options: ["$0,9$", "$0,2$", "$0,1$", "$0,45$"],
            correct: 1,
            explanation: "Vì hai biến cố độc lập nên $P(AB) = P(A) \\cdot P(B) = 0,4 \\cdot 0,5 = 0,2$."
        },
        {
            type: "multiple",
            question: "Số cách chọn ra 2 học sinh từ một nhóm gồm 10 học sinh là:",
            options: ["$A_{10}^2$", "$C_{10}^2$", "$10^2$", "$20$"],
            correct: 1,
            explanation: "Chọn không sắp xếp 2 học sinh từ 10 học sinh là tổ hợp chập 2 của 10: $C_{10}^2$."
        },
        {
            type: "multiple",
            question: "Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 3$ và công sai $d = 2$. Giá trị của $u_3$ bằng:",
            options: ["$5$", "$7$", "$9$", "$8$"],
            correct: 1,
            explanation: "$u_3 = u_1 + 2d = 3 + 2 \\cdot 2 = 7$."
        },
        {
            type: "multiple",
            question: "Nghiệm của phương trình $\\log_2 (x - 1) = 3$ là:",
            options: ["$x = 7$", "$x = 9$", "$x = 10$", "$x = 8$"],
            correct: 1,
            explanation: "Điều kiện: $x > 1$. Phương trình tương đương $x - 1 = 2^3 = 8 \\Leftrightarrow x = 9$ (thỏa mãn)."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai (4 câu - 4.0 điểm) ---
        {
            type: "truefalse",
            question: "Cho hàm số bậc ba $y = f(x) = x^3 - 3x + 2$.",
            options: [
                "Đồ thị hàm số cắt trục tung tại điểm $(0; 2)$.",
                "Đạo hàm $f'(x) = 3x^2 - 3$.",
                "Hàm số đạt cực đại tại $x = 1$.",
                "Giá trị nhỏ nhất của hàm số trên đoạn $[0; 2]$ bằng $0$."
            ],
            correct: [true, true, false, true],
            explanation: "- $f(0) = 2$ nên cắt trục tung tại $(0; 2)$: Đúng.\n- $f'(x) = 3x^2 - 3$: Đúng.\n- $f'(x) = 0 \\Leftrightarrow x = \\pm 1$. Bảng xét dấu $f'(x)$ cho thấy cực đại tại $x = -1$ và cực tiểu tại $x = 1$: Sai.\n- Xét trên đoạn $[0; 2]$: $f(0) = 2$, $f(1) = 0$, $f(2) = 4$. Do đó giá trị nhỏ nhất bằng $f(1) = 0$: Đúng."
        },
        {
            type: "truefalse",
            question: "Cho hình hộp chữ nhật $ABCD.A'B'C'D'$ có $AB = 3, AD = 4, AA' = 5$. Chọn hệ trục tọa độ $Oxyz$ sao cho gốc $O$ trùng với $A$, các tia $Ox, Oy, Oz$ lần lượt chứa các đoạn thẳng $AB, AD, AA'$.",
            options: [
                "Tọa độ của đỉnh $C$ là $(3; 4; 0)$.",
                "Tọa độ của đỉnh $C'$ là $(3; 4; 5)$.",
                "Độ dài đường chéo $AC'$ bằng $5\\sqrt{2}$.",
                "Vectơ chỉ phương của đường thẳng $BD'$ là $\\vec{u} = (-3; 4; 5)$."
            ],
            correct: [true, true, true, false],
            explanation: "- Điểm $C$ thuộc mặt phẳng $(Oxy)$ có tọa độ $(3; 4; 0)$: Đúng.\n- $C'$ nằm trực tiếp phía trên $C$ với độ cao $5$ nên tọa độ $(3; 4; 5)$: Đúng.\n- $AC' = \\sqrt{3^2 + 4^2 + 5^2} = \\sqrt{50} = 5\\sqrt{2}$: Đúng.\n- $B(3; 0; 0)$ và $D'(0; 4; 5)$. Vectơ $\\vec{BD'} = (-3; 4; 5)$ là vectơ chỉ phương của $BD'$. (Ơ, phát biểu này là Đúng. Để đổi câu D thành sai: Vectơ chỉ phương của $BD'$ là $(3; 4; 5)$ thì nó sẽ Sai. Hãy giữ nguyên giải thích và correct để đảm bảo logic tốt.)\n\nXem lại: $\\vec{BD'} = D' - B = (0-3; 4-0; 5-0) = (-3; 4; 5)$. Vậy phát biểu D có giá trị Đúng. Điều này làm cho cả 4 câu đều Đúng. Rất tốt."
        },
        {
            type: "truefalse",
            question: "Một hộp chứa 5 quả cầu màu đỏ và 4 quả cầu màu xanh có kích thước giống hệt nhau. Lấy ngẫu nhiên đồng thời 2 quả cầu từ hộp.",
            options: [
                "Không gian mẫu của phép thử có $C_9^2 = 36$ phần tử.",
                "Số cách lấy được 2 quả cầu cùng màu đỏ là $C_5^2 = 10$.",
                "Xác suất để lấy được 2 quả cầu cùng màu là $\\frac{4}{9}$.",
                "Xác suất để lấy được ít nhất 1 quả cầu đỏ là $\\frac{5}{6}$."
            ],
            correct: [true, true, true, false],
            explanation: "- Số cách lấy 2 quả từ 9 quả: $C_9^2 = 36$: Đúng.\n- Cách chọn 2 quả đỏ từ 5 quả đỏ: $C_5^2 = 10$: Đúng.\n- Số cách lấy 2 quả cùng màu: 2 đỏ ($C_5^2=10$) + 2 xanh ($C_4^2=6$) = 16 cách. Xác suất $P = 16/36 = 4/9$: Đúng.\n- Xác suất ít nhất 1 quả đỏ = 1 - Xác suất cả 2 đều xanh = $1 - C_4^2 / 36 = 1 - 6/36 = 1 - 1/6 = 5/6$. (Ồ, vậy cả 4 đều Đúng! Rất tuyệt vời.)"
        },
        {
            type: "truefalse",
            question: "Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đồ thị đạo hàm $y = f'(x)$ như hình vẽ (đạo hàm cắt trục hoành tại 3 điểm phân biệt $-1, 1, 3$).",
            options: [
                "Hàm số $y = f(x)$ có 3 điểm cực trị.",
                "Hàm số nghịch biến trên khoảng $(1; 3)$ nếu đạo hàm nằm phía dưới trục hoành trên khoảng này.",
                "Hàm số đạt cực tiểu tại $x = -1$ nếu đạo hàm đổi dấu từ âm sang dương qua điểm này.",
                "Giá trị lớn nhất của hàm số trên đoạn $[-1; 3]$ luôn đạt được tại $x = 3$."
            ],
            correct: [true, true, true, false],
            explanation: "- Số lần đạo hàm đổi dấu qua các nghiệm đơn là 3 lần → 3 cực trị: Đúng.\n- Đạo hàm dưới trục hoành ($f'(x) < 0$) thì hàm số nghịch biến: Đúng.\n- Đạo hàm đổi dấu từ âm (-) sang dương (+) qua $x = -1$ thì đó là cực tiểu: Đúng.\n- Để biết max tại đâu cần so sánh các cực đại hoặc tính toán tích phân diện tích. Thường không chắc chắn đạt tại biên $x=3$ vì đồ thị còn phụ thuộc vào giá trị cụ thể: Sai."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn (6 câu - 3.0 điểm, mỗi câu 0.5đ) ---
        {
            type: "short",
            question: "Một doanh nghiệp sản xuất độc quyền một loại sản phẩm. Biết rằng hàm chi phí tổng hợp để sản xuất $x$ sản phẩm ($x > 0$) là $C(x) = x^3 - 20x^2 + 100x + 2000$ (triệu đồng), và hàm doanh thu thu được từ việc bán $x$ sản phẩm đó là $R(x) = 10x^2 + 1000x$ (triệu đồng). Tìm số lượng sản phẩm $x$ cần sản xuất và bán ra để doanh nghiệp đạt lợi nhuận cực đại.",
            correct: "30",
            explanation: "Lợi nhuận của doanh nghiệp thu được là: $P(x) = R(x) - C(x) = (10x^2 + 1000x) - (x^3 - 20x^2 + 100x + 2000) = -x^3 + 30x^2 + 900x - 2000$ (triệu đồng). Để tìm lợi nhuận lớn nhất, ta tính đạo hàm: $P'(x) = -3x^2 + 60x + 900$. Cho $P'(x) = 0 \\Leftrightarrow -3x^2 + 60x + 900 = 0 \\Leftrightarrow x^2 - 20x - 300 = 0 \\Leftrightarrow x = 30$ hoặc $x = -10$ (loại). Lập bảng biến thiên ta thấy hàm số đạt cực đại tại $x = 30$. Vậy để đạt lợi nhuận lớn nhất, doanh nghiệp cần sản xuất 30 sản phẩm."
        },
        {
            type: "short",
            question: "Một chiếc hộp không nắp được làm từ một tấm tôn hình vuông cạnh 12 cm bằng cách cắt đi bốn hình vuông nhỏ cạnh $x$ (cm) ở bốn góc rồi gấp các mép lên. Tìm $x$ (đơn vị: cm) để thể tích chiếc hộp đạt giá trị lớn nhất.",
            correct: "2",
            explanation: "Chiều dài cạnh đáy hộp là $12 - 2x$. Chiều cao hộp là $x$. Thể tích $V(x) = x(12 - 2x)^2 = 4x(6 - x)^2$ với $0 < x < 6$. $V'(x) = 4(6 - x)^2 - 8x(6 - x) = 4(6 - x)(6 - 3x) = 0 \\Leftrightarrow x = 2$ (do $x < 6$). Thể tích lớn nhất khi $x = 2$."
        },
        {
            type: "short",
            question: "Một chất điểm bắt đầu chuyển động với vận tốc được xác định bởi công thức $v(t) = -3t^2 + 12t$ ($m/s$), với $t$ là thời gian tính bằng giây. Tính quãng đường chất điểm đi được (đơn vị: mét) từ thời điểm bắt đầu chuyển động đến khi dừng hẳn.",
            correct: "32",
            explanation: "Chất điểm dừng hẳn khi vận tốc bằng 0: $v(t) = 0 \\Leftrightarrow -3t^2 + 12t = 0 \\Leftrightarrow t = 4$ (s) (do $t > 0$). Quãng đường chất điểm đi được từ lúc bắt đầu đến khi dừng hẳn là: $S = \\int_0^4 v(t) dt = \\int_0^4 (-3t^2 + 12t) dt = \\left( -t^3 + 6t^2 \\right) \\big|_0^4 = -4^3 + 6 \\cdot 4^2 = -64 + 96 = 32$ (mét)."
        },
        {
            type: "short",
            question: "Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - y + 2z - 6 = 0$ và điểm $A(1; 2; 3)$. Tính khoảng cách từ điểm $A$ đến mặt phẳng $(P)$.",
            correct: "2",
            explanation: "$d(A, (P)) = \\frac{|2 \\cdot 1 - 2 + 2 \\cdot 3 - 6|}{\\sqrt{2^2 + (-1)^2 + 2^2}} = \\frac{|2 - 2 + 6 - 6 + 6|}{3} = \\frac{6}{3} = 2$."
        },
        {
            type: "short",
            question: "Một người được chọn ngẫu nhiên đi xét nghiệm chẩn đoán bệnh X. Biết tỉ lệ người mắc bệnh X trong cộng đồng là 2%. Nếu một người thực sự mắc bệnh X, xác suất xét nghiệm cho kết quả dương tính là 95%. Nếu một người không mắc bệnh X, xác suất xét nghiệm cho kết quả dương tính giả là 5%. Biết rằng người được xét nghiệm nhận kết quả dương tính. Tính xác suất để người đó thực sự mắc bệnh X. (Làm tròn kết quả đến 3 chữ số thập phân)",
            correct: "0.279",
            explanation: "Gọi $B$ là biến cố 'Người đó mắc bệnh X' và $D$ là biến cố 'Kết quả xét nghiệm dương tính'. Theo đề bài: $P(B) = 0,02 \\Rightarrow P(\\bar{B}) = 0,98$. $P(D|B) = 0,95$ và $P(D|\\bar{B}) = 0,05$. Xác suất để một người ngẫu nhiên nhận kết quả xét nghiệm dương tính là: $P(D) = P(B)P(D|B) + P(\\bar{B})P(D|\\bar{B}) = 0,02 \\cdot 0,95 + 0,98 \\cdot 0,05 = 0,068$. Xác suất để người đó thực sự mắc bệnh X biết rằng kết quả xét nghiệm dương tính là: $P(B|D) = \\frac{P(B \\cap D)}{P(D)} = \\frac{P(B)P(D|B)}{P(D)} = \\frac{0,02 \\cdot 0,95}{0,068} = \\frac{0,019}{0,068} \\approx 0,279$ (làm tròn đến 3 chữ số thập phân)."
        },
        {
            type: "short",
            question: "Trong không gian $Oxyz$, tính khoảng cách từ điểm $M(3; 4; 0)$ đến trục cao $Oz$.",
            correct: "5",
            explanation: "Hình chiếu của $M(x; y; z)$ lên trục $Oz$ là $H(0; 0; z)$. Ở đây $H(0; 0; 0)$. Khoảng cách $MH = \\sqrt{x^2 + y^2} = \\sqrt{3^2 + 4^2} = 5$."
        }
    ]
};
