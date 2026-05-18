window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Vật Lý (Bản 1)",
    config: {
        testDuration: 3000, // 50 minutes
        examLayout: {
            multiple: { count: 18, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 },
            short: { count: 6, pointsPerQ: 0.25 }
        }
    },
    questions: [
        // --- PHẦN I: Trắc nghiệm nhiều lựa chọn ---
        {
            type: "multiple",
            question: "Đơn vị của nhiệt dung riêng là:",
            options: ["J/kg", "J/K", "J/(kg.K)", "J"],
            correct: 2,
            explanation: "Nhiệt dung riêng $c$ được định nghĩa từ công thức $Q = mc\Delta T$, suy ra $c = Q/(m\Delta T)$, đơn vị là J/(kg.K)."
        },
        {
            type: "multiple",
            question: "Trong quá trình đẳng nhiệt của một lượng khí lí tưởng nhất định, áp suất của khí:",
            options: ["tỉ lệ thuận với thể tích.", "tỉ lệ nghịch với thể tích.", "tỉ lệ thuận với bình phương thể tích.", "không đổi."],
            correct: 1,
            explanation: "Định luật Boyle-Mariotte: $pV = \text{const} \Rightarrow p \sim 1/V$."
        },
        {
            type: "multiple",
            question: "Nội năng của một vật là:",
            options: ["tổng động năng và thế năng của vật.", "tổng động năng và thế năng của các phân tử cấu tạo nên vật.", "động năng của các phân tử cấu tạo nên vật.", "thế năng của các phân tử cấu tạo nên vật."],
            correct: 1,
            explanation: "Nội năng là tổng động năng chuyển động hỗn loạn và thế năng tương tác của các phân tử."
        },
        {
            type: "multiple",
            question: "Câu nào sau đây nói về lực tương tác phân tử là KHÔNG đúng?",
            options: ["Lực phân tử chỉ là lực hút.", "Lực phân tử bao gồm cả lực hút và lực đẩy.", "Lực phân tử có tác dụng đáng kể khi các phân tử ở gần nhau.", "Lực phân tử giữ cho các phân tử không rời xa nhau quá."],
            correct: 0,
            explanation: "Lực tương tác phân tử bao gồm cả lực hút và lực đẩy."
        },
        {
            type: "multiple",
            question: "Chuyển động của các phân tử khí là:",
            options: ["chuyển động thẳng đều.", "chuyển động rơi tự do.", "chuyển động hỗn loạn.", "chuyển động tròn đều."],
            correct: 2,
            explanation: "Các phân tử khí chuyển động hỗn loạn không ngừng."
        },
        {
            type: "multiple",
            question: "Khi nung nóng một lượng khí trong bình kín thì:",
            options: ["nội năng của khí giảm.", "nội năng của khí tăng.", "áp suất khí giảm.", "thể tích khí tăng."],
            correct: 1,
            explanation: "Bình kín nên $V$ không đổi. Nung nóng $\Rightarrow T$ tăng $\Rightarrow$ Động năng phân tử tăng $\Rightarrow$ Nội năng tăng."
        },
        {
            type: "multiple",
            question: "Độ tuyệt đối $T$ liên hệ với nhiệt độ Celsius $t$ theo công thức:",
            options: ["$T = t + 273$", "$T = t - 273$", "$t = T + 273$", "$T = 273 - t$"],
            correct: 0,
            explanation: "$T(K) = t(^\circ C) + 273,15$."
        },
        {
            type: "multiple",
            question: "Một lượng khí ở nhiệt độ $27^\circ C$. Để áp suất tăng gấp đôi mà thể tích không đổi thì nhiệt độ phải là:",
            options: ["$54^\circ C$", "$327^\circ C$", "$300^\circ C$", "$600^\circ C$"],
            correct: 1,
            explanation: "Đẳng tích: $p_1/T_1 = p_2/T_2$. $T_1 = 27 + 273 = 300K$. $p_2 = 2p_1 \Rightarrow T_2 = 2T_1 = 600K = 327^\circ C$."
        },
        {
            type: "multiple",
            question: "Công thức tính nhiệt lượng cần thiết để làm nóng chảy hoàn toàn một khối lượng $m$ chất rắn ở nhiệt độ nóng chảy là:",
            options: ["$Q = mc\Delta t$", "$Q = Lm$", "$Q = \lambda m$", "$Q = r m$"],
            correct: 2,
            explanation: "$Q = \lambda m$, trong đó $\lambda$ là nhiệt nóng chảy riêng."
        },
        {
            type: "multiple",
            question: "Trong hệ tọa độ $(p, T)$, đường đẳng tích có dạng là:",
            options: ["đường thẳng song song trục $p$.", "đường thẳng song song trục $T$.", "đường thẳng đi qua gốc tọa độ.", "đường hypebol."],
            correct: 2,
            explanation: "$p/T = \text{const} \Rightarrow p = k T$, là đường thẳng đi qua gốc tọa độ."
        },
        {
            type: "multiple",
            question: "Theo thuyết động học phân tử, các phân tử khí va chạm với thành bình gây nên:",
            options: ["nhiệt độ của khí.", "áp suất của khí.", "thể tích của khí.", "khối lượng của khí."],
            correct: 1,
            explanation: "Va chạm của các phân tử khí lên thành bình tạo ra áp suất."
        },
        {
            type: "multiple",
            question: "Đặc điểm của các phân tử cấu tạo nên chất khí là:",
            options: ["ở rất gần nhau.", "ở rất xa nhau.", "luôn đứng yên.", "có kích thước rất lớn."],
            correct: 1,
            explanation: "Ở chất khí, khoảng cách giữa các phân tử rất lớn so với kích thước của chúng."
        },
        {
            type: "multiple",
            question: "Điều nào sau đây là đúng khi nói về sự chuyển thể từ lỏng sang khí?",
            options: ["Chỉ xảy ra ở nhiệt độ xác định.", "Chỉ xảy ra trên bề mặt chất lỏng.", "Bao gồm sự bay hơi và sự sôi.", "Không cần cung cấp nhiệt lượng."],
            correct: 2,
            explanation: "Sự hóa hơi bao gồm sự bay hơi (mọi nhiệt độ) và sự sôi (nhiệt độ xác định)."
        },
        {
            type: "multiple",
            question: "Vật ở thể rắn có hình dạng xác định vì:",
            options: ["lực tương tác phân tử rất yếu.", "khoảng cách giữa các phân tử rất lớn.", "lực tương tác phân tử rất mạnh.", "các phân tử chuyển động tự do."],
            correct: 2,
            explanation: "Lực tương tác mạnh giữ các phân tử ở các vị trí xác định."
        },
        {
            type: "multiple",
            question: "Quá trình một khối khí nhận nhiệt và sinh công thì độ biến thiên nội năng $\Delta U$ được tính bằng:",
            options: ["$\Delta U = Q + A$", "$\Delta U = Q - A$", "$\Delta U = A - Q$", "$\Delta U = -Q - A$"],
            correct: 1,
            explanation: "Theo nguyên lí I: $\Delta U = Q + A$. Nhận nhiệt $Q > 0$, sinh công $A < 0 \Rightarrow \Delta U = Q - |A|$."
        },
        {
            type: "multiple",
            question: "Độ ẩm tỉ đối của không khí là:",
            options: ["tỉ số giữa khối lượng riêng hơi nước và khối lượng riêng không khí.", "tỉ số giữa áp suất riêng phần của hơi nước và áp suất hơi nước bão hòa ở cùng nhiệt độ.", "lượng hơi nước có trong 1m3 không khí.", "áp suất của hơi nước trong không khí."],
            correct: 1,
            explanation: "$f = p/p_{bh} \cdot 100\%$."
        },
        {
            type: "multiple",
            question: "Khi nhiệt độ của chất lỏng tăng thì tốc độ bay hơi:",
            options: ["giảm đi.", "tăng lên.", "không đổi.", "lúc tăng lúc giảm."],
            correct: 1,
            explanation: "Nhiệt độ tăng $\Rightarrow$ Động năng phân tử tăng $\Rightarrow$ Dễ thoát khỏi bề mặt hơn."
        },
        {
            type: "multiple",
            question: "Trong không gian tự do, một chất điểm có thể chuyển động:",
            options: ["với vận tốc bất kì.", "với vận tốc không vượt quá tốc độ ánh sáng.", "với vận tốc tỉ lệ thuận với thời gian.", "luôn luôn thẳng đều."],
            correct: 1,
            explanation: "Theo thuyết tương đối, vận tốc ánh sáng $c$ là giới hạn tốc độ."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai ---
        {
            type: "truefalse",
            question: "Cho 2kg nước đá ở $-10^\circ C$. Biết nhiệt dung riêng của nước đá là $2100 J/(kg.K)$, nhiệt nóng chảy riêng của nước đá là $3,4.10^5 J/kg$. Xét tính đúng/sai:",
            options: [
                "Nhiệt lượng cần cung cấp để nước đá tăng lên $0^\circ C$ là $42000 J$.",
                "Nhiệt lượng cần cung cấp để nước đá nóng chảy hoàn toàn ở $0^\circ C$ là $6,8.10^5 J$.",
                "Tổng nhiệt lượng để biến 2kg nước đá ở $-10^\circ C$ thành nước ở $0^\circ C$ là $7,22.10^5 J$.",
                "Nếu cung cấp nhiệt lượng $5.10^5 J$ thì nước đá sẽ nóng chảy hoàn toàn."
            ],
            correct: [true, true, true, false],
            explanation: "- $Q_1 = mc\Delta t = 2 \cdot 2100 \cdot 10 = 42000 J$ (Đúng).\n- $Q_2 = \lambda m = 3,4.10^5 \cdot 2 = 6,8.10^5 J$ (Đúng).\n- $Q = Q_1 + Q_2 = 7,22.10^5 J$ (Đúng).\n- Cần tận $7,22.10^5 J$ mới tan hết, $5.10^5 J$ chưa đủ (Sai)."
        },
        {
            type: "truefalse",
            question: "Một lượng khí lí tưởng thực hiện một chu trình như hình vẽ (giả sử đường 1-2 là đẳng nhiệt, 2-3 là đẳng áp, 3-1 là đẳng tích).",
            options: [
                "Trong quá trình 1-2, nội năng của khí không đổi.",
                "Trong quá trình 2-3, thể tích khí tỉ lệ thuận với nhiệt độ tuyệt đối.",
                "Trong quá trình 3-1, áp suất khí không đổi.",
                "Công mà khí thực hiện trong cả chu trình bằng diện tích hình giới hạn bởi chu trình trên đồ thị $(p, V)$."
            ],
            correct: [true, true, false, true],
            explanation: "- Đẳng nhiệt $\Rightarrow T$ không đổi $\Rightarrow U$ không đổi (Đúng).\n- Đẳng áp: $V/T = \text{const}$ (Đúng).\n- 3-1 là đẳng tích, nên áp suất thay đổi (Sai).\n- Công chu trình bằng diện tích đồ thị (Đúng)."
        },
        {
            type: "truefalse",
            question: "Xét một lượng khí lí tưởng biến đổi trạng thái từ $(p_1, V_1, T_1)$ sang $(p_2, V_2, T_2)$.",
            options: [
                "Phương trình trạng thái là $pV/T = \text{const}$.",
                "Hằng số Boltzmann $k$ có giá trị $1,38.10^{-23} J/K$.",
                "Số phân tử trong 1 mol chất bất kì là $6,02.10^{23}$.",
                "Nhiệt độ $0K$ ứng với $-273^\circ C$."
            ],
            correct: [true, true, true, true],
            explanation: "Tất cả các mệnh đề trên đều là các hằng số và định luật cơ bản của nhiệt học (Đúng hết)."
        },
        {
            type: "truefalse",
            question: "Khi nói về các định luật nhiệt động lực học:",
            options: [
                "Nhiệt lượng không thể tự truyền từ vật lạnh sang vật nóng hơn.",
                "Động cơ nhiệt không thể chuyển hóa hoàn toàn nhiệt lượng nhận được thành công.",
                "Nguyên lí I là sự vận dụng định luật bảo toàn và chuyển hóa năng lượng.",
                "Hiệu suất của động cơ nhiệt có thể đạt tới 100%."
            ],
            correct: [true, true, true, false],
            explanation: "- Theo Clausius: Nhiệt không tự truyền từ lạnh sang nóng (Đúng).\n- Theo Kelvin: Không thể biến hoàn toàn nhiệt thành công (Đúng).\n- Nguyên lí I là bảo toàn năng lượng (Đúng).\n- Hiệu suất luôn nhỏ hơn 1 (Sai)."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn ---
        {
            type: "short",
            question: "Một lượng khí ở $27^\circ C$ có áp suất $10^5 Pa$. Nén đẳng nhiệt khí đến áp suất $2.10^5 Pa$. Thể tích lúc sau bằng bao nhiêu phần trăm thể tích lúc đầu?",
            correct: "50",
            explanation: "$p_1V_1 = p_2V_2 \Rightarrow V_2/V_1 = p_1/p_2 = 1/2 = 50\%$."
        },
        {
            type: "short",
            question: "Tính nhiệt lượng cần cung cấp để làm 500g nước từ $20^\circ C$ sôi ở $100^\circ C$ (đơn vị kJ). Biết nhiệt dung riêng của nước là $4180 J/(kg.K)$.",
            correct: "167.2",
            explanation: "$Q = mc\Delta t = 0.5 \cdot 4180 \cdot (100 - 20) = 167200 J = 167.2 kJ$."
        },
        {
            type: "short",
            question: "Một bình kín dung tích 10 lít chứa khí ở $27^\circ C$ và áp suất 2 atm. Nếu tăng nhiệt độ lên $127^\circ C$ thì áp suất trong bình là bao nhiêu atm? (Làm tròn đến 2 chữ số thập phân)",
            correct: "2.67",
            explanation: "Đẳng tích: $p_1/T_1 = p_2/T_2 \Rightarrow 2/300 = p_2/400 \Rightarrow p_2 = 8/3 \approx 2.67 atm$."
        },
        {
            type: "short",
            question: "Biết nhiệt hóa hơi riêng của nước là $2,3.10^6 J/kg$. Tính nhiệt lượng cần thiết để hóa hơi hoàn toàn 100g nước ở $100^\circ C$ (đơn vị kJ).",
            correct: "230",
            explanation: "$Q = Lm = 2.3.10^6 \cdot 0.1 = 230000 J = 230 kJ$."
        },
        {
            type: "short",
            question: "Công của một lượng khí thực hiện khi giãn nở đẳng áp từ 2 lít đến 5 lít dưới áp suất $2.10^5 Pa$ là bao nhiêu Jun?",
            correct: "600",
            explanation: "$A = p\Delta V = 2.10^5 \cdot (5-2) \cdot 10^{-3} = 2.10^5 \cdot 3.10^{-3} = 600 J$."
        },
        {
            type: "short",
            question: "Tính độ biến thiên nội năng của một vật khi nó nhận một công 100J và tỏa ra nhiệt lượng 40J.",
            correct: "60",
            explanation: "$\Delta U = Q + A$. Nhận công $A = 100J$, tỏa nhiệt $Q = -40J \Rightarrow \Delta U = 100 - 40 = 60J$."
        }
    ]
};
