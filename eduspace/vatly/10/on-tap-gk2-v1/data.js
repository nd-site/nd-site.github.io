// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Ôn tập Giữa Học Kì II – Vật Lý 10 (Kết nối tri thức) 2025-2026",
    config: {
        testDuration: 2700,
        examLayout: {
            multiple: {
                count: 12,
                pointsPerQ: 0.25
            },
            truefalse: {
                count: 4,
                pointsPerQ: 0.5,
                partialScoring: [
                    0.05,
                    0.125,
                    0.25,
                    0.5
                ]
            },
            short: {
                count: 4,
                pointsPerQ: 0.5
            },
            essay: {
                count: 6,
                pointsPerQ: 1
            }
        }
    },
    questions: [
        {
            type: "multiple",
            question: "Moment lực đối với một trục quay là đại lượng đặc trưng cho tác dụng nào của lực?",
            options: [
                "Làm vật chuyển động thẳng đều.",
                "Làm vật biến dạng đàn hồi.",
                "Làm vật quay quanh trục.",
                "Làm vật thay đổi khối lượng."
            ],
            correct: 2,
            points: 5,
            explanation: "Moment lực đặc trưng cho tác dụng làm quay của lực đối với một trục quay cố định."
        },
        {
            type: "multiple",
            question: "Trong hệ đơn vị SI, đơn vị của moment lực là:",
            options: [
                "N/m.",
                "N.m.",
                "J/s.",
                "kg.m/s."
            ],
            correct: 1,
            points: 5,
            explanation: "Đơn vị của moment lực là tích của đơn vị lực (N) và khoảng cách (m), tức là N.m."
        },
        {
            type: "multiple",
            question: "Công thức xác định moment lực M đối với một trục quay là:",
            options: [
                "M = F/d.",
                "M = F.d².",
                "M = F.d.",
                "M = F².d."
            ],
            correct: 2,
            points: 5,
            explanation: "Công thức định nghĩa moment lực là M = F.d, với d là cánh tay đòn."
        },
        {
            type: "multiple",
            question: "Cánh tay đòn của lực (d) được xác định chính xác là:",
            options: [
                "Khoảng cách từ trục quay đến điểm đặt của lực trên vật.",
                "Khoảng cách hạ vuông góc từ trục quay đến giá của lực.",
                "Độ dài từ trục quay đến trọng tâm của vật rắn.",
                "Khoảng cách giữa hai điểm đầu và cuối của vật."
            ],
            correct: 1,
            points: 5,
            explanation: "Cánh tay đòn d là đoạn thẳng ngắn nhất từ trục quay đến giá của lực, tức là đường vuông góc hạ từ trục quay đến giá lực."
        },
        {
            type: "multiple",
            question: "Trong trường hợp nào sau đây, lực tác dụng vào vật quay quanh một trục cố định nhưng KHÔNG làm vật quay?",
            options: [
                "Lực có phương vuông góc với trục quay.",
                "Lực có giá đi qua trục quay.",
                "Lực có điểm đặt ở xa trục quay.",
                "Lực có độ lớn rất lớn."
            ],
            correct: 1,
            points: 5,
            explanation: "Khi giá của lực đi qua trục quay, cánh tay đòn d = 0 nên M = F.d = 0, lực không gây tác dụng quay."
        },
        {
            type: "multiple",
            question: "Để tăng tác dụng làm quay của lực lên một chiếc cờ lê mà không cần tăng độ lớn của lực, người thợ nên:",
            options: [
                "Cầm tay vào vị trí sát đầu cờ lê.",
                "Cầm tay vào vị trí xa nhất của cán cờ lê.",
                "Đặt lực song song với cán cờ lê.",
                "Giảm chiều dài của cán cờ lê."
            ],
            correct: 1,
            points: 5,
            explanation: "Tăng cánh tay đòn d bằng cách cầm tay xa trục quay giúp tăng moment lực M = F.d."
        },
        {
            type: "multiple",
            question: "Một vật rắn có trục quay cố định chịu tác dụng của nhiều moment lực. Vật sẽ ở trạng thái cân bằng khi:",
            options: [
                "Tổng các moment lực làm vật quay cùng chiều kim đồng hồ bằng tổng các moment lực làm vật quay ngược chiều kim đồng hồ.",
                "Hai lực tác dụng vào vật phải là hai lực cân bằng.",
                "Hợp lực của tất cả các lực tác dụng lên vật bằng không.",
                "Giá của các lực tác dụng phải cùng nằm trên một đường thẳng."
            ],
            correct: 0,
            points: 5,
            explanation: "Đây là nội dung của quy tắc moment lực: vật đứng yên khi tổng moment thuận chiều bằng tổng moment ngược chiều."
        },
        {
            type: "multiple",
            question: "Khi một người đẩy cửa, tác dụng làm quay của lực đẩy sẽ lớn nhất nếu người đó:",
            options: [
                "Đẩy vào vị trí sát bản lề của cửa.",
                "Đẩy vuông góc với bề mặt cửa tại mép ngoài.",
                "Đẩy song song với bề mặt của cánh cửa.",
                "Đẩy với một góc rất nhỏ so với phương của bản lề."
            ],
            correct: 1,
            points: 5,
            explanation: "Đẩy vuông góc ở mép ngoài giúp cánh tay đòn d đạt giá trị lớn nhất, tối ưu hóa moment lực."
        },
        {
            type: "multiple",
            question: "Moment lực tác dụng lên một vật có trục quay cố định sẽ thay đổi như thế nào nếu giá của lực dịch chuyển lại gần trục quay?",
            options: [
                "Moment lực tăng lên.",
                "Moment lực giảm xuống do cánh tay đòn giảm.",
                "Moment lực không thay đổi vì lực không đổi.",
                "Moment lực bằng không ngay lập tức."
            ],
            correct: 1,
            points: 5,
            explanation: "Khi giá của lực tiến gần trục quay, d giảm dẫn đến moment lực M = F.d giảm."
        },
        {
            type: "multiple",
            question: "Một vật rắn đang quay quanh một trục cố định. Nếu tăng độ lớn của lực lên 3 lần và giảm khoảng cách từ trục quay đến giá của lực đi 3 lần thì moment lực sẽ:",
            options: [
                "Tăng 9 lần.",
                "Giảm 9 lần.",
                "Không thay đổi giá trị.",
                "Tăng 3 lần."
            ],
            correct: 2,
            points: 5,
            explanation: "M' = (3F).(d/3) = F.d, do đó moment lực không thay đổi giá trị."
        },
        {
            type: "multiple",
            question: "Ngẫu lực là hệ gồm hai lực có đặc điểm:",
            options: [
                "Song song, cùng chiều và cùng độ lớn.",
                "Song song, ngược chiều, cùng độ lớn và cùng tác dụng vào một vật.",
                "Cùng giá, ngược chiều và cùng độ lớn.",
                "Song song, ngược chiều và khác nhau về độ lớn."
            ],
            correct: 1,
            points: 5,
            explanation: "Ngẫu lực là hệ hai lực song song, ngược chiều, độ lớn bằng nhau cùng tác dụng lên một vật."
        },
        {
            type: "multiple",
            question: "Biểu thức tính moment của ngẫu lực là:",
            options: [
                "M = F.d (với d là khoảng cách giữa hai giá của hai lực).",
                "M = F.d (với d là khoảng cách từ trục quay đến điểm đặt lực).",
                "M = F/d.",
                "M = 2.F.d."
            ],
            correct: 0,
            points: 5,
            explanation: "Công thức moment ngẫu lực M = F.d, trong đó d là khoảng cách giữa hai giá của lực."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Trường hợp nào sau đây là ứng dụng của ngẫu lực trong thực tế?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Một người dùng tay đẩy một chiếc xe lăn.",
                "Người lái xe dùng hai tay vặn vô lăng ô tô.",
                "Một vận động viên đang kéo cung.",
                "Một vật rơi tự do trong trọng trường."
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Dùng hai tay vặn vô lăng tạo ra hai lực song song ngược chiều lên vô lăng – đây là ví dụ điển hình về ngẫu lực."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Moment của ngẫu lực có tính chất đặc biệt nào sau đây?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Phụ thuộc vào vị trí của trục quay được chọn.",
                "Không phụ thuộc vào vị trí của trục quay đối với vật.",
                "Luôn làm vật chuyển động tịnh tiến.",
                "Chỉ xuất hiện khi vật có trục quay cố định nằm ở giữa hai lực."
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Đặc điểm của ngẫu lực là moment của nó không phụ thuộc vào vị trí chọn trục quay trên vật."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Tác dụng của ngẫu lực lên một vật rắn chỉ làm vật:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Chuyển động tịnh tiến.",
                "Chuyển động quay.",
                "Vừa quay vừa chuyển động tịnh tiến.",
                "Đứng yên tuyệt đối."
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Ngẫu lực làm vật quay quanh trục nhưng hợp lực bằng 0 nên không gây chuyển động tịnh tiến."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Nếu đồng thời tăng độ lớn của mỗi lực trong ngẫu lực lên 2 lần và giảm khoảng cách giữa hai giá của hai lực đi 2 lần thì moment ngẫu lực:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Tăng 4 lần.",
                "Giảm 4 lần.",
                "Không thay đổi.",
                "Tăng 2 lần."
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "M' = (2F).(d/2) = F.d, moment ngẫu lực không đổi."
        },
        {
            type: "short",
            question: "Một vật không có trục quay cố định, khi chịu tác dụng của một ngẫu lực, vật sẽ quay quanh: (Lưu ý: Đáp án đúng gốc là \"Trọng tâm của vật.\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "",
            explanation: "Vật tự do khi chịu tác dụng của ngẫu lực sẽ quay quanh trục đi qua trọng tâm của vật."
        },
        {
            type: "short",
            question: "Moment ngẫu lực được đo bằng đơn vị nào? (Lưu ý: Đáp án đúng gốc là \"Newton mét (N.m).\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: ".",
            explanation: "Đơn vị đo moment lực và moment ngẫu lực đều là Newton mét (N.m)."
        },
        {
            type: "short",
            question: "Một ngẫu lực gồm hai lực có độ lớn F = 10 N, khoảng cách giữa hai giá của lực là d = 30 cm. Moment ngẫu lực là: (Lưu ý: Đáp án đúng gốc là \"3 N.m.\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "3.",
            explanation: "Đổi 30 cm = 0,3 m. M = F.d = 10 × 0,3 = 3 N.m."
        },
        {
            type: "short",
            question: "Nhận định nào sau đây về ngẫu lực là ĐÚNG? (Lưu ý: Đáp án đúng gốc là \"Hai lực của ngẫu lực không thể thay thế bằng một lực duy nhất.\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "",
            explanation: "Hai lực của ngẫu lực không cùng giá nên không thể là lực cân bằng và không có hợp lực đơn nhất thay thế được."
        },
        {
            type: "essay",
            question: "Một người tác dụng lực F = 40 N vuông góc vào tay nắm cửa để mở cửa. Khoảng cách từ tay nắm đến bản lề (trục quay) là d = 0,75 m. Khi cửa quay được một góc 90°, điểm đặt lực di chuyển theo một cung tròn. Tính moment lực và công thực hiện bởi người đó.",
            suggested: "1. Moment lực tác dụng:\nM = F.d = 40 × 0,75 = 30 (N.m).\n\n2. Quãng đường điểm đặt lực đi được (1/4 chu vi đường tròn bán kính d):\ns = (1/4) × 2πd = (1/2) × π × 0,75 ≈ 1,178 (m).\n\n3. Vì lực luôn vuông góc với cánh cửa, phương lực trùng hướng dịch chuyển tức thời → α = 0° → cos0° = 1.\n\n4. Công thực hiện:\nA = F.s = 40 × 1,178 ≈ 47,1 (J).",
            points: 25,
            explanation: "AI chấm dựa trên: M = F.d = 30 N.m; s = πd/2 ≈ 1,178 m; A = F.s ≈ 47,1 J."
        },
        {
            type: "essay",
            question: "Một ô tô khối lượng 1 200 kg đang chạy với vận tốc 15 m/s thì tài xế hãm phanh. Xe trượt một đoạn s trên đường ngang rồi dừng lại. Hệ số ma sát trượt giữa lốp và đường là μ = 0,5. Lấy g = 10 m/s². Tính quãng đường xe trượt trước khi dừng hẳn.",
            suggested: "1. Áp dụng định lý biến thiên động năng: ΔWd = Ams.\n\n2. Động năng ban đầu:\nWd1 = ½mv² = ½ × 1200 × 15² = 135 000 (J).\nWd2 = 0 (xe dừng lại).\n\n3. Lực ma sát trượt:\nFms = μ.m.g = 0,5 × 1200 × 10 = 6 000 (N).\n\n4. Công của lực ma sát (công cản):\nAms = −Fms.s = −6 000.s.\n\n5. Từ ΔWd = Ams:\n0 − 135 000 = −6 000.s\n⟹ s = 135 000 / 6 000 = 22,5 (m).",
            points: 25,
            explanation: "AI chấm dựa trên: Fms = μmg = 6 000 N; định lý biến thiên động năng; kết quả s = 22,5 m."
        },
        {
            type: "essay",
            question: "Một vật được thả rơi tự do từ độ cao h = 20 m. Chọn gốc thế năng tại đất. Tìm độ cao z mà tại đó thế năng bằng 1/3 lần động năng.",
            suggested: "1. Cơ năng tại vị trí thả:\nW1 = mgh.\n\n2. Tại vị trí có độ cao z, điều kiện:\nWt2 = (1/3)Wd2 ⟹ Wd2 = 3Wt2.\n\n3. Cơ năng tại vị trí 2:\nW2 = Wd2 + Wt2 = 3Wt2 + Wt2 = 4Wt2 = 4mgz.\n\n4. Bảo toàn cơ năng (W1 = W2):\nmgh = 4mgz ⟹ z = h/4 = 20/4 = 5 (m).",
            points: 25,
            explanation: "AI chấm dựa trên: lập điều kiện Wt = Wd/3; áp dụng bảo toàn cơ năng; kết quả z = h/4 = 5 m."
        },
        {
            type: "essay",
            question: "Một ô tô khối lượng 1,5 tấn lên một dốc dài l = 100 m, cao h = 10 m với vận tốc không đổi v = 54 km/h. Hệ số ma sát là μ = 0,02. Tính công suất của động cơ. (g = 10 m/s²)",
            suggested: "1. Đổi: 1,5 tấn = 1500 kg; v = 54 km/h = 15 m/s.\n\n2. Góc nghiêng: sinα = h/l = 10/100 = 0,1; cosα ≈ 0,995.\n\n3. Lực kéo cân bằng:\nFk = mg.sinα + μ.mg.cosα\n   = 1500×10×0,1 + 0,02×1500×10×0,995\n   = 1500 + 298,5 = 1798,5 (N).\n\n4. Công suất:\nP = Fk.v = 1798,5 × 15 ≈ 26 978 (W) ≈ 27 kW.",
            points: 25,
            explanation: "AI chấm dựa trên: phân tích lực trên dốc (Fk = mg.sinα + μ.mg.cosα); tính P = Fk.v ≈ 27 kW."
        },
        {
            type: "essay",
            question: "Một máy nâng có công suất 1,5 kW nâng vật nặng 150 kg lên cao 10 m trong 12 s. Tính hiệu suất máy. (g = 10 m/s²)",
            suggested: "1. Công toàn phần máy thực hiện:\nAtp = P.t = 1500 × 12 = 18 000 (J).\n\n2. Công có ích (nâng vật):\nAich = mgh = 150 × 10 × 10 = 15 000 (J).\n\n3. Hiệu suất:\nH = (Aich / Atp) × 100% = (15 000 / 18 000) × 100% ≈ 83,3%.",
            points: 25,
            explanation: "AI chấm dựa trên: Atp = P.t = 18 000 J; Aich = mgh = 15 000 J; H ≈ 83,3%."
        },
        {
            type: "essay",
            question: "Một vật nhỏ được ném ngang từ độ cao 45 m với vận tốc đầu v₀ = 20 m/s. Bỏ qua lực cản không khí. Sử dụng định luật bảo toàn cơ năng tính vận tốc của vật khi chạm đất. (g = 10 m/s²)",
            suggested: "1. Chọn gốc thế năng tại mặt đất.\n\n2. Cơ năng tại điểm ném:\nW1 = ½mv₀² + mgh.\n\n3. Cơ năng tại mặt đất:\nW2 = ½mv² + 0.\n\n4. Bảo toàn cơ năng (W1 = W2):\n½mv₀² + mgh = ½mv²\n⟹ v² = v₀² + 2gh = 20² + 2 × 10 × 45 = 400 + 900 = 1300.\n\n5. Vận tốc khi chạm đất:\nv = √1300 ≈ 36,1 (m/s).",
            points: 25,
            explanation: "AI chấm dựa trên: áp dụng bảo toàn cơ năng W1 = W2; công thức v² = v₀² + 2gh; kết quả v ≈ 36,1 m/s."
        }
    ]
};
