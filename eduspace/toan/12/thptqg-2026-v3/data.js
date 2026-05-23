window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Toán (Bản 3)",
    pageTitle: "",
    examInfo: {
        department: "",
        school: "",
        province: "",
        examName: "",
        attempt: "",
        date: "",
        subject: "",
        grade: ""
    },
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
            question: "Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm $f'(x)$ như sau:\n\n| $x$ | $-\\infty$ | | $-2$ | | $1$ | | $3$ | | $+\\infty$ |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n| $f'(x)$ | | $-$ | $0$ | $+$ | $0$ | $-$ | $0$ | $+$ | |\n\nHàm số đã cho đạt cực tiểu tại điểm nào dưới đây?",
            options: ["$x = 1$", "$x = 3$", "$x = -2$", "$x = -2$ và $x = 3$"],
            correct: 3,
            explanation: "Dựa vào bảng xét dấu đạo hàm, đạo hàm $f'(x)$ đổi dấu từ âm sang dương khi đi qua $x = -2$ và $x = 3$. Do đó, hàm số đạt cực tiểu tại hai điểm $x = -2$ và $x = 3$."
        },
        {
            type: "multiple",
            question: "Đường tiệm cận ngang của đồ thị hàm số $y = \\frac{3x - 2}{x + 2}$ là đường thẳng:",
            options: ["$y = 3$", "$y = -2$", "$x = -2$", "$y = \\frac{3}{2}$"],
            correct: 0,
            explanation: "Ta có $\\lim_{x \\to \\pm\\infty} y = \\lim_{x \\to \\pm\\infty} \\frac{3 - \\frac{2}{x}}{1 + \\frac{2}{x}} = 3$. Do đó, tiệm cận ngang là đường thẳng $y = 3$."
        },
        {
            type: "multiple",
            question: "Điểm cực đại của đồ thị hàm số bậc bốn trùng phương $y = -x^4 + 2x^2 + 3$ là:",
            options: ["$(0; 3)$", "$(1; 4)$", "$(-1; 4)$", "$(1; 4)$ và $(-1; 4)$"],
            correct: 3,
            explanation: "Ta có $y' = -4x^3 + 4x = -4x(x^2 - 1)$. $y' = 0 \\Leftrightarrow x = 0$ hoặc $x = \\pm 1$. \nLập bảng biến thiên ta thấy $y'$ đổi dấu từ dương sang âm khi qua $x = \\pm 1$. Tại $x = \\pm 1$, ta có $y = 4$. Do đó, các điểm cực đại của đồ thị hàm số là $(1; 4)$ và $(-1; 4)$."
        },
        {
            type: "multiple",
            question: "Họ tất cả các nguyên hàm của hàm số $f(x) = \\cos x - 3x^2$ là:",
            options: ["$\\sin x - x^3 + C$", "$-\\sin x - x^3 + C$", "$\\sin x - 6x + C$", "$-\\sin x - 6x + C$"],
            correct: 0,
            explanation: "Ta có $\\int (\\cos x - 3x^2) dx = \\sin x - x^3 + C$."
        },
        {
            type: "multiple",
            question: "Giá trị của tích phân $I = \\int_{1}^{2} (2x - 1) dx$ bằng:",
            options: ["$2$", "$3$", "$4$", "$1$"],
            correct: 0,
            explanation: "$I = (x^2 - x) \\big|_1^2 = (2^2 - 2) - (1^2 - 1) = 2 - 0 = 2$."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, cho điểm $A(2; -1; 5)$. Hình chiếu vuông góc của điểm $A$ lên mặt phẳng tọa độ $(Oyz)$ có tọa độ là:",
            options: ["$(0; -1; 5)$", "$(2; 0; 5)$", "$(2; -1; 0)$", "$(0; 0; 5)$"],
            correct: 0,
            explanation: "Hình chiếu của điểm $A(x; y; z)$ lên mặt phẳng $(Oyz)$ có tọa độ là $(0; y; z)$. Áp dụng cho điểm $A(2; -1; 5)$, ta được tọa độ hình chiếu là $(0; -1; 5)$."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, một vectơ pháp tuyến của mặt phẳng $(P): x - 2y + 4z - 3 = 0$ là:",
            options: ["$\\vec{n} = (1; -2; 4)$", "$\\vec{n} = (1; 2; 4)$", "$\\vec{n} = (1; -2; -3)$", "$\\vec{n} = (-1; 2; 4)$"],
            correct: 0,
            explanation: "Hệ số của $x, y, z$ trong phương trình mặt phẳng là tọa độ của vectơ pháp tuyến: $\\vec{n} = (1; -2; 4)$."
        },
        {
            type: "multiple",
            question: "Trong không gian $Oxyz$, tìm tọa độ tâm $I$ và bán kính $R$ của mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 2 = 0$.",
            options: ["$I(1; -2; 3), R = 4$", "$I(-1; 2; -3), R = 4$", "$I(1; -2; 3), R = 16$", "$I(-1; 2; -3), R = \\sqrt{12}$"],
            correct: 0,
            explanation: "Phương trình mặt cầu có các hệ số $a = 1, b = -2, c = 3$. Tâm là $I(1; -2; 3)$. Bán kính $R = \\sqrt{a^2 + b^2 + c^2 - d} = \\sqrt{1^2 + (-2)^2 + 3^2 - (-2)} = \\sqrt{1 + 4 + 9 + 2} = \\sqrt{16} = 4$."
        },
        {
            type: "multiple",
            question: "Cho hai biến cố độc lập $A$ và $B$ biết xác suất $P(A) = 0,3$ và $P(B) = 0,6$. Xác suất xảy ra ít nhất một trong hai biến cố $P(A \\cup B)$ là:",
            options: ["$0,72$", "$0,9$", "$0,18$", "$0,48$"],
            correct: 0,
            explanation: "Vì $A$ và $B$ độc lập nên $P(AB) = P(A) \\cdot P(B) = 0,3 \\cdot 0,6 = 0,18$. \nXác suất xảy ra ít nhất một trong hai biến cố là: $P(A \\cup B) = P(A) + P(B) - P(AB) = 0,3 + 0,6 - 0,18 = 0,72$."
        },
        {
            type: "multiple",
            question: "Cho 6 điểm phân biệt trong không gian. Có bao nhiêu vectơ khác vectơ-không có điểm đầu và điểm cuối được chọn từ 6 điểm đã cho?",
            options: ["$30$", "$15$", "$36$", "$12$"],
            options: ["$30$", "$15$", "$36$", "$12$"],
            correct: 0,
            explanation: "Mỗi vectơ khác vectơ-không được xác định bởi 1 điểm đầu và 1 điểm cuối phân biệt. Số cách chọn là chỉnh hợp chập 2 của 6 phần tử: $A_6^2 = 6 \\cdot 5 = 30$."
        },
        {
            type: "multiple",
            question: "Cho cấp số nhân $(u_n)$ có số hạng đầu $u_1 = 2$ và công bội $q = 3$. Giá trị của số hạng thứ tư $u_4$ bằng:",
            options: ["$54$", "$18$", "$24$", "$162$"],
            correct: 0,
            explanation: "Công thức số hạng tổng quát của cấp số nhân: $u_n = u_1 \\cdot q^{n-1}$. \nThay số vào ta được: $u_4 = u_1 \\cdot q^3 = 2 \\cdot 3^3 = 2 \\cdot 27 = 54$."
        },
        {
            type: "multiple",
            question: "Tập nghiệm của phương trình logarit $\\log_3(x^2 - x + 3) = 2$ là:",
            options: ["$\\{3; -2\\}$", "$\\{2; -3\\}$", "$\\{3\\}$", "$\\{-2\\}$"],
            correct: 0,
            explanation: "Điều kiện: $x^2 - x + 3 > 0$ (luôn đúng với mọi $x$ vì $\\Delta < 0$). \nPhương trình tương đương: $x^2 - x + 3 = 3^2 = 9 \\Leftrightarrow x^2 - x - 6 = 0 \\Leftrightarrow x = 3$ hoặc $x = -2$. \nVậy tập nghiệm là $\\{3; -2\\}$."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai (4 câu - 4.0 điểm) ---
        {
            type: "truefalse",
            question: "Cho hàm số phân thức bậc hai trên bậc nhất $y = f(x) = \\frac{x^2 - x + 4}{x - 1}$.",
            options: [
                "Đồ thị hàm số có tiệm cận đứng là đường thẳng $x = 1$.",
                "Đạo hàm của hàm số là $f'(x) = \\frac{x^2 - 2x - 3}{(x - 1)^2}$.",
                "Hàm số đồng biến trên các khoảng $(-\\infty; -1)$ và $(3; +\\infty)$.",
                "Giá trị cực tiểu của hàm số bằng $5$."
            ],
            correct: [true, true, true, true],
            explanation: "- Ta có nghiệm mẫu số là $x = 1$ và tử số không triệt tiêu tại $x = 1$. Tiệm cận đứng $x = 1$: Đúng.\n- Đạo hàm $f'(x) = \\frac{(2x-1)(x-1) - (x^2-x+4)}{(x-1)^2} = \\frac{2x^2-3x+1-x^2+x-4}{(x-1)^2} = \\frac{x^2-2x-3}{(x-1)^2}$: Đúng.\n- $f'(x) = 0 \\Leftrightarrow x^2-2x-3 = 0 \\Leftrightarrow x = -1$ hoặc $x = 3$. Lập bảng xét dấu $f'(x)$ ta thấy hàm số đồng biến trên khoảng $(-\\infty; -1)$ và $(3; +\\infty)$: Đúng.\n- Hàm số đạt cực tiểu tại điểm cực tiểu $x = 3$. Giá trị cực tiểu tương ứng là $f(3) = \\frac{3^2 - 3 + 4}{3 - 1} = \\frac{10}{2} = 5$: Đúng."
        },
        {
            type: "truefalse",
            question: "Trong không gian $Oxyz$, cho điểm $A(1; 2; -3)$ và mặt phẳng $(P): 2x - y + z - 4 = 0$.",
            options: [
                "Một vectơ pháp tuyến của mặt phẳng $(P)$ là $\\vec{n} = (2; -1; 1)$.",
                "Đường thẳng $d$ đi qua $A$ và vuông góc với mặt phẳng $(P)$ có phương trình tham số là: $\\begin{cases} x = 1 + 2t \\\\ y = 2 - t \\\\ z = -3 + t \\end{cases}$ ($t \\in \\mathbb{R}$).",
                "Khoảng cách từ điểm $A$ đến mặt phẳng $(P)$ bằng $\\sqrt{6}$.",
                "Mặt cầu $(S)$ có tâm $A$ và tiếp xúc với mặt phẳng $(P)$ có bán kính $R = \\frac{7\\sqrt{6}}{6}$."
            ],
            correct: [true, true, false, true],
            explanation: "- Hệ số đứng trước $x,y,z$ là $2, -1, 1$ nên vectơ pháp tuyến $\\vec{n} = (2; -1; 1)$: Đúng.\n- Đường thẳng $d \\perp (P)$ nên nhận vectơ pháp tuyến của $(P)$ làm vectơ chỉ phương $\\vec{u}_d = (2; -1; 1)$. Phương trình tham số qua $A(1;2;-3)$ là đúng: Đúng.\n- Khoảng cách $d(A, (P)) = \\frac{|2 \\cdot 1 - 2 + (-3) - 4|}{\\sqrt{2^2 + (-1)^2 + 1^2}} = \\frac{|2 - 2 - 3 - 4|}{\\sqrt{6}} = \\frac{7}{\\sqrt{6}} = \\frac{7\\sqrt{6}}{6} \\neq \\sqrt{6}$: Sai.\n- Mặt cầu $(S)$ tâm $A$ tiếp xúc với mặt phẳng $(P)$ có bán kính chính bằng khoảng cách từ $A$ đến $(P)$. Vậy $R = \\frac{7\\sqrt{6}}{6}$: Đúng."
        },
        {
            type: "truefalse",
            question: "Tại một trường THPT, tỉ lệ học sinh nữ là 60%. Thống kê cho thấy có 10% học sinh nữ tham gia câu lạc bộ bóng rổ của trường, trong khi tỉ lệ này ở học sinh nam là 20%. Chọn ngẫu nhiên một học sinh của trường.",
            options: [
                "Xác suất để học sinh được chọn là nữ và tham gia câu lạc bộ bóng rổ bằng $0,06$.",
                "Xác suất để học sinh được chọn có tham gia câu lạc bộ bóng rổ bằng $0,14$.",
                "Biết học sinh được chọn tham gia câu lạc bộ bóng rổ, xác suất để học sinh đó là nam bằng $\\frac{4}{7}$.",
                "Xác suất để học sinh được chọn là nam hoặc không tham gia câu lạc bộ bóng rổ bằng $0,86$."
            ],
            correct: [true, true, true, false],
            explanation: "Gọi $F$ là biến cố học sinh nữ, $M$ là học sinh nam ($M = \\bar{F}$). Gọi $B$ là biến cố tham gia bóng rổ. \nTheo đề bài: $P(F) = 0,6 \\Rightarrow P(M) = 0,4$. $P(B|F) = 0,1$; $P(B|M) = 0,2$.\n- Xác suất học sinh chọn là nữ và chơi bóng rổ: $P(F \\cap B) = P(F) \\cdot P(B|F) = 0,6 \\cdot 0,1 = 0,06$: Đúng.\n- Xác suất chọn được học sinh chơi bóng rổ (Xác suất đầy đủ): $P(B) = P(F)P(B|F) + P(M)P(B|M) = 0,6 \\cdot 0,1 + 0,4 \\cdot 0,2 = 0,06 + 0,08 = 0,14$: Đúng.\n- Công thức Bayes: Xác suất chọn được nam biết học sinh chơi bóng rổ: $P(M|B) = \\frac{P(M \\cap B)}{P(B)} = \\frac{0,08}{0,14} = \\frac{4}{7}$: Đúng.\n- Xác suất chọn được nam hoặc không chơi bóng rổ: $P(M \\cup \\bar{B}) = P(M) + P(\\bar{B}) - P(M \\cap \\bar{B}) = 0,4 + (1 - 0,14) - 0,4 \\cdot (1 - 0,2) = 0,4 + 0,86 - 0,32 = 0,94 \\neq 0,86$: Sai."
        },
        {
            type: "truefalse",
            question: "Cho hàm số $y = f(x) = x \\ln x$ xác định trên khoảng $(0; +\\infty)$.",
            options: [
                "Đạo hàm của hàm số trên khoảng đã cho là $f'(x) = \\ln x + 1$.",
                "Hàm số nghịch biến trên khoảng $(0; \\frac{1}{e})$.",
                "Giá trị cực tiểu của hàm số bằng $-e$.",
                "Đồ thị hàm số không cắt trục hoành."
            ],
            correct: [true, true, false, false],
            explanation: "- Ta có đạo hàm tích: $f'(x) = (x)' \\ln x + x (\\ln x)' = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1$: Đúng.\n- Xét $f'(x) < 0 \\Leftrightarrow \\ln x + 1 < 0 \\Leftrightarrow \\ln x < -1 \\Leftrightarrow x < \\frac{1}{e}$. Do đó, hàm số nghịch biến trên khoảng $(0; \\frac{1}{e})$: Đúng.\n- Hàm số đạt cực tiểu tại điểm $x = \\frac{1}{e}$. Giá trị cực tiểu tương ứng là $f(\\frac{1}{e}) = \\frac{1}{e} \\ln(\\frac{1}{e}) = -\\frac{1}{e} \\neq -e$: Sai.\n- Đồ thị hàm số cắt trục hoành tại các điểm có hoành độ thỏa mãn: $x \\ln x = 0 \\Leftrightarrow \\ln x = 0 \\Leftrightarrow x = 1$ (do $x > 0$). Vậy đồ thị cắt trục hoành tại $(1; 0)$: Sai."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn (6 câu - 3.0 điểm, mỗi câu 0.5đ) ---
        {
            type: "short",
            question: "Một doanh nghiệp dự kiến thiết kế vỏ hộp sữa dạng hình trụ không có nắp bằng kim loại tấm mỏng với thể tích yêu cầu là $1000\\pi \\text{ cm}^3$. Tính bán kính đáy $R$ (đơn vị: cm) của vỏ hộp sữa sao cho tổng diện tích tấm kim loại mỏng cần dùng để làm vỏ hộp là nhỏ nhất (làm tròn kết quả đến hàng đơn vị).",
            correct: "10",
            explanation: "Thể tích hình trụ: $V = \\pi R^2 h = 1000\\pi \\Rightarrow h = \\frac{1000}{R^2}$. \nDiện tích bề mặt không nắp (đáy + thân trụ): $S = \\pi R^2 + 2\\pi R h = \\pi R^2 + 2\\pi R \\left( \\frac{1000}{R^2} \\right) = \\pi R^2 + \\frac{2000\\pi}{R}$. \nĐạo hàm theo bán kính đáy: $S'(R) = 2\\pi R - \\frac{2000\\pi}{R^2}$. \nCho $S'(R) = 0 \\Leftrightarrow 2\\pi R^3 = 2000\\pi \\Leftrightarrow R^3 = 1000 \\Leftrightarrow R = 10$ (cm). \nLập bảng biến thiên ta thấy $S(R)$ đạt cực tiểu toàn cục tại $R = 10$ cm. Vậy bán kính cần tìm là 10 cm."
        },
        {
            type: "short",
            question: "Một chiếc xe ô tô đang chạy với vận tốc $10\\text{ m/s}$ thì người lái đạp phanh. Kể từ thời điểm đó, xe chuyển động chậm dần đều với vận tốc $v(t) = -2t + 10$ (m/s), trong đó $t$ là khoảng thời gian tính bằng giây kể từ lúc bắt đầu đạp phanh. Tính quãng đường (đơn vị: mét) mà xe ô tô đi được kể từ thời điểm đạp phanh đến khi dừng hẳn.",
            correct: "25",
            explanation: "Xe dừng hẳn khi vận tốc bằng $0 \\Leftrightarrow v(t) = 0 \\Leftrightarrow -2t + 10 = 0 \\Leftrightarrow t = 5$ (giây). \nQuãng đường xe đi được là tích phân vận tốc từ lúc đạp phanh đến khi dừng hẳn: \n$S = \\int_{0}^{5} (-2t + 10) dt = \\left( -t^2 + 10t \\right) \\big|_0^5 = (-5^2 + 10 \\cdot 5) - 0 = -25 + 50 = 25$ (mét)."
        },
        {
            type: "short",
            question: "Một lô sản phẩm gồm 10 thiết bị cao cấp, trong đó có 2 thiết bị bị lỗi kỹ thuật. Người ta lấy ngẫu nhiên lần lượt 2 thiết bị từ lô hàng này (lấy không hoàn lại). Tính xác suất để thiết bị thứ hai lấy ra là thiết bị bị lỗi kỹ thuật (làm tròn kết quả đến 1 chữ số thập phân).",
            correct: "0.2",
            explanation: "Gọi $A_1$ là biến cố 'Thiết bị thứ nhất lấy ra bị lỗi', $A_2$ là biến cố 'Thiết bị thứ hai lấy ra bị lỗi'. \nTa có các trường hợp xảy ra đối với $A_2$:\n- Trường hợp 1: Lần một lấy được sản phẩm lỗi, lần hai lấy được sản phẩm lỗi: \n  $P(A_1 \\cap A_2) = P(A_1) \\cdot P(A_2|A_1) = \\frac{2}{10} \\cdot \\frac{1}{9} = \\frac{2}{90}$.\n- Trường hợp 2: Lần một lấy được sản phẩm tốt, lần hai lấy được sản phẩm lỗi: \n  $P(\\bar{A}_1 \\cap A_2) = P(\\bar{A}_1) \\cdot P(A_2|\\bar{A}_1) = \\frac{8}{10} \\cdot \\frac{2}{9} = \\frac{16}{90}$.\nTheo công thức xác suất đầy đủ: \n$P(A_2) = P(A_1 \\cap A_2) + P(\\bar{A}_1 \\cap A_2) = \\frac{2}{90} + \\frac{16}{90} = \\frac{18}{90} = \\frac{1}{5} = 0,2$."
        },
        {
            type: "short",
            question: "Trong không gian $Oxyz$, một chiếc máy bay cất cánh từ điểm $A(1; 2; 3)$ theo một đường thẳng có vectơ chỉ phương $\\vec{u} = (2; 2; 1)$. Khoảng cách từ máy bay đến tháp radar đo lường đặt tại gốc tọa độ $O(0;0;0)$ đạt giá trị nhỏ nhất khi máy bay bay đến vị trí $H$. Tính khoảng cách ngắn nhất $OH$ này từ máy bay đến tháp radar (làm tròn kết quả đến hai chữ số thập phân).",
            correct: "2.24",
            explanation: "Đường thẳng quỹ đạo bay $d$ đi qua $A(1;2;3)$ có VCP $\\vec{u} = (2;2;1)$ có phương trình tham số: $\\begin{cases} x = 1 + 2t \\\\ y = 2 + 2t \\\\ z = 3 + t \\end{cases}$. \nHình chiếu $H$ của gốc tọa độ $O$ lên đường thẳng $d$ thỏa mãn $H \\in d \\Rightarrow H(1+2t; 2+2t; 3+t)$. \nVectơ $\\vec{OH} = (1+2t; 2+2t; 3+t)$. \nVì $OH \\perp d \\Rightarrow \\vec{OH} \\cdot \\vec{u} = 0 \\Leftrightarrow 2(1+2t) + 2(2+2t) + 1(3+t) = 0$ \n$\\Leftrightarrow 2 + 4t + 4 + 4t + 3 + t = 0 \\Leftrightarrow 9t + 9 = 0 \\Leftrightarrow t = -1$. \nThay $t = -1$ vào tọa độ $H$ ta được $H(-1; 0; 2)$. \nĐộ dài khoảng cách $OH = \\sqrt{(-1)^2 + 0^2 + 2^2} = \\sqrt{5} \\approx 2,24$."
        },
        {
            type: "short",
            question: "Số lượng dân cư của một khu đô thị thông minh sau $t$ năm kể từ năm 2025 được dự báo theo mô hình tăng trưởng lũy thừa: $S(t) = S_0 \\cdot e^{r \\cdot t}$, trong đó $S_0$ là số lượng dân cư tại năm mốc 2025, $r$ là tỉ lệ tăng trưởng dân số hàng năm. Biết rằng tại năm 2025 khu đô thị có $1$ triệu dân và tỉ lệ tăng trưởng dự kiến ổn định là $1,5\\%$ mỗi năm. Hỏi sau ít nhất bao nhiêu năm (kể từ năm 2025) thì dân số khu đô thị này đạt ngưỡng $1,5$ triệu dân? (Kết quả làm tròn đến hàng đơn vị).",
            correct: "27",
            explanation: "Ta có phương trình dân số: $S(t) = 1 \\cdot e^{0,015 \\cdot t}$. \nYêu cầu đạt ngưỡng $1,5$ triệu dân: $e^{0,015 \\cdot t} \\ge 1,5$ \n$\\Leftrightarrow 0,015 \\cdot t \\ge \\ln(1,5) \\approx 0,405465$ \n$\\Leftrightarrow t \\ge \\frac{0,405465}{0,015} \\approx 27,03$ (năm). \nVậy sau ít nhất 27 năm (vào khoảng năm 2052) dân số sẽ đạt ngưỡng 1,5 triệu dân."
        },
        {
            type: "short",
            question: "Trong không gian $Oxyz$, cho mặt phẳng $(P): x + y + z - 3 = 0$ và mặt cầu $(S): x^2 + y^2 + z^2 - 2x - 2y - 2z - 9 = 0$. Một đường thẳng $d$ đi qua tâm $I$ của mặt cầu $(S)$ và vuông góc với mặt phẳng $(P)$, cắt mặt cầu $(S)$ tại hai điểm phân biệt $A, B$ ($A$ có tung độ lớn hơn $B$). Tìm cao độ $z$ của điểm $A$.",
            correct: "3",
            explanation: "- Xác định tâm và bán kính mặt cầu $(S)$: Tâm $I(1; 1; 1)$, bán kính $R = \\sqrt{1^2 + 1^2 + 1^2 - (-9)} = \\sqrt{12} = 2\\sqrt{3}$.\n- Đường thẳng $d$ đi qua $I(1;1;1)$ và vuông góc với $(P)$ nên nhận vectơ pháp tuyến $\\vec{n}_P = (1; 1; 1)$ làm vectơ chỉ phương. Phương trình tham số của $d$: $x = 1 + t, y = 1 + t, z = 1 + t$.\n- Tọa độ giao điểm $A, B$ của $d$ và mặt cầu $(S)$ thỏa mãn phương trình: \n  $(1+t-1)^2 + (1+t-1)^2 + (1+t-1)^2 = 12 \\Leftrightarrow 3t^2 = 12 \\Leftrightarrow t^2 = 4 \\Leftrightarrow t = \\pm 2$.\n  + Với $t = 2 \\Rightarrow$ Tọa độ giao điểm là $(3; 3; 3)$.\n  + Với $t = -2 \\Rightarrow$ Tọa độ giao điểm là $(-1; -1; -1)$.\n- Vì điểm $A$ có tung độ lớn hơn điểm $B$ ($3 > -1$), nên tọa độ điểm $A$ là $(3; 3; 3)$.\n- Vậy cao độ $z$ của điểm $A$ bằng 3."
        }
    ]
};
