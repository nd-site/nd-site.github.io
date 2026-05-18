// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Vật Lý 11 (Kết nối tri thức) 2025-2026",
    config: {
        testDuration: 3000,
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
                count: 3,
                pointsPerQ: 1
            }
        }
    },
    questions: [
        {
            type: "multiple",
            question: "Cường độ điện trường E tại một điểm được xác định bằng:",
            options: [
                "Lực điện tác dụng lên điện tích thử q đặt tại điểm đó",
                "$$E = F/q$$, tỉ số lực điện trên điện tích thử dương q",
                "Điện tích của nguồn gây ra điện trường",
                "Điện thế tại điểm đó"
            ],
            correct: 1,
            explanation: "E = F/q; đơn vị V/m. E đặc trưng cho điện trường, không phụ thuộc q thử."
        },
        {
            type: "multiple",
            question: "Điện trường đều là điện trường mà cường độ điện trường:",
            options: [
                "Tăng dần theo khoảng cách",
                "Bằng 0 tại mọi điểm",
                "Có độ lớn và hướng như nhau tại mọi điểm",
                "Chỉ xuất hiện trong chân không"
            ],
            correct: 2,
            explanation: "Điện trường đều: E = const (độ lớn và hướng không đổi), ví dụ giữa hai bản tụ phẳng."
        },
        {
            type: "multiple",
            question: "Công của lực điện trường khi dịch chuyển điện tích q qua hiệu điện thế U là:",
            options: [
                "A = U/q",
                "A = q.U",
                "A = q/U",
                "A = q².U"
            ],
            correct: 1,
            explanation: "Công lực điện: A = q.U = q(V₁ − V₂)."
        },
        {
            type: "multiple",
            question: "Tụ điện phẳng có điện dung C. Khi tích điện đến hiệu điện thế U, năng lượng tích trữ là:",
            options: [
                "$$W = CU$$",
                "$$W = \\frac{1}{2}CU^2$$",
                "$$W = \\frac{CU^2}{4}$$",
                "$$W = C^2U$$"
            ],
            correct: 1,
            explanation: "Năng lượng tụ: W = ½CU²."
        },
        {
            type: "multiple",
            question: "Điện dung của tụ điện phẳng phụ thuộc vào:",
            options: [
                "Điện tích và hiệu điện thế",
                "Diện tích bản tụ, khoảng cách giữa hai bản và hằng số điện môi",
                "Chỉ vật liệu điện cực",
                "Nhiệt độ môi trường"
            ],
            correct: 1,
            explanation: "C = ε₀εS/d; phụ thuộc S, d và ε của điện môi."
        },
        {
            type: "multiple",
            question: "Đường sức điện có đặc điểm nào sau đây?",
            options: [
                "Là đường cong khép kín",
                "Không bao giờ cắt nhau",
                "Chiều từ âm sang dương",
                "Mật độ giảm chỗ điện trường mạnh"
            ],
            correct: 1,
            explanation: "Đường sức không cắt nhau; xuất phát từ điện tích dương, tận cùng ở âm."
        },
        {
            type: "multiple",
            question: "Hai điện tích q₁ = q₂ = 2×10⁻⁶ C đặt cách nhau 0,1 m trong chân không. Lực Cu-lông giữa chúng (k = 9×10⁹ N.m²/C²) là:",
            options: [
                "3,6 N",
                "36 N",
                "0,36 N",
                "0,036 N"
            ],
            correct: 0,
            explanation: "F = kq₁q₂/r² = 9×10⁹×(2×10⁻⁶)²/0,01 = 9×10⁹×4×10⁻¹²/10⁻² = 3,6 N."
        },
        {
            type: "multiple",
            question: "Định luật Ôm cho đoạn mạch: cường độ dòng điện I qua đoạn mạch tỉ lệ thuận với:",
            options: [
                "Điện trở R",
                "Hiệu điện thế U giữa hai đầu đoạn mạch",
                "Bình phương điện áp",
                "Nghịch đảo điện áp"
            ],
            correct: 1,
            explanation: "I = U/R; I tỉ lệ thuận với U và tỉ lệ nghịch với R."
        },
        {
            type: "multiple",
            question: "Điện trở của dây dẫn phụ thuộc vào:",
            options: [
                "Cường độ dòng điện qua dây",
                "Chiều dài, tiết diện và điện trở suất của vật liệu",
                "Chỉ nhiệt độ môi trường",
                "Màu sắc và hình dạng bên ngoài"
            ],
            correct: 1,
            explanation: "R = ρL/S; phụ thuộc điện trở suất ρ, chiều dài L và tiết diện S."
        },
        {
            type: "multiple",
            question: "Công suất điện tiêu thụ trên điện trở R khi có dòng I chạy qua là:",
            options: [
                "P = I/R",
                "P = I²R",
                "P = IR",
                "P = R/I²"
            ],
            correct: 1,
            explanation: "P = I²R = U²/R = UI."
        },
        {
            type: "multiple",
            question: "Định luật Ôm cho toàn mạch với nguồn EMF ξ, điện trở trong r và ngoài R là:",
            options: [
                "I = ξ/(R + r)",
                "I = ξ/R",
                "I = ξ.r/R",
                "I = ξ/(R − r)"
            ],
            correct: 0,
            explanation: "I = ξ/(R + r): suất điện động chia tổng điện trở."
        },
        {
            type: "multiple",
            question: "Nguồn điện có ξ = 12 V, r = 1 Ω, mắc với R = 5 Ω. Cường độ dòng điện mạch chính là:",
            options: [
                "2 A",
                "12 A",
                "2,4 A",
                "10 A"
            ],
            correct: 0,
            explanation: "I = ξ/(R+r) = 12/6 = 2 A."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Nhiệt lượng tỏa ra trên điện trở R khi dòng I chạy qua trong thời gian t là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Q = I²Rt",
                "Q = IRt",
                "Q = I²R/t",
                "Q = IR²t"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Định luật Jun-Lenxơ: Q = I²Rt."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Mắc song song hai điện trở R₁ = 6 Ω và R₂ = 3 Ω. Điện trở tương đương là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "9 Ω",
                "2 Ω",
                "4,5 Ω",
                "18 Ω"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "1/R = 1/6 + 1/3 = 1/2 → R = 2 Ω."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Lực từ tác dụng lên đoạn dây dẫn mang dòng điện trong từ trường đều được tính theo công thức:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "F = qvB",
                "F = BIl.sinα",
                "F = BIl.cosα",
                "F = B²Il"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Lực Am-pe: F = BIl.sinα, α là góc giữa dây và véctơ B."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Quy tắc xác định chiều lực từ tác dụng lên dây dẫn mang dòng điện là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Quy tắc vặn nút chai",
                "Quy tắc bàn tay trái",
                "Quy tắc bàn tay phải",
                "Quy tắc đinh ốc"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Quy tắc bàn tay trái: đặt bàn tay trái sao cho B xuyên lòng bàn tay, 4 ngón theo chiều I → ngón cái chỉ chiều F."
        },
        {
            type: "short",
            question: "Cảm ứng từ B tại tâm vòng dây tròn bán kính R, mang dòng I là: (Lưu ý: Đáp án đúng gốc là \"$$B = \\frac{\\mu_0 I}{2R}$$\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "02",
            explanation: "Cảm ứng từ tại tâm vòng dây: B = μ₀I/(2R)."
        },
        {
            type: "short",
            question: "Lực Lo-ren-xơ tác dụng lên điện tích q chuyển động với vận tốc v trong từ trường B là: (Lưu ý: Đáp án đúng gốc là \"F = qvBsinα\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Lực Lorentz: f = qvBsinα, vuông góc với v và B."
        },
        {
            type: "short",
            question: "Cảm ứng từ B trong lòng ống dây (solenoid) có n vòng/m, mang dòng I là: (Lưu ý: Đáp án đúng gốc là \"B = μ₀nI\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Solenoid: B = μ₀nI, phân bố đều trong lòng ống."
        },
        {
            type: "short",
            question: "Từ thông Φ qua diện tích S trong từ trường đều B là: (Lưu ý: Đáp án đúng gốc là \"Φ = B.S.cosα\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: ".",
            explanation: "Φ = B.S.cosα, α là góc giữa véctơ B và pháp tuyến mặt S."
        },
        {
            type: "essay",
            question: "Nguồn điện có suất điện động ξ = 12 V, điện trở trong r = 2 Ω mắc với điện trở ngoài R = 10 Ω.\n\na) Tính cường độ dòng điện trong mạch.\nb) Tính hiệu điện thế hai đầu nguồn (điện áp đầu cực).\nc) Tính công suất tỏa nhiệt trên R.",
            suggested: "a) I = ξ/(R+r) = 12/(10+2) = 1 A.\n\nb) U = ξ − I.r = 12 − 1×2 = 10 V.\n\nc) P = I²R = 1²×10 = 10 W.",
            points: 25,
            explanation: "AI chấm: I = 1 A; U = 10 V; P_R = 10 W."
        },
        {
            type: "essay",
            question: "Một cuộn dây (L = 0,5 H) nối tiếp điện trở R = 100 Ω. Dòng điện giảm từ I₁ = 3 A xuống I₂ = 1 A trong Δt = 0,05 s.\n\na) Tính suất điện động tự cảm.\nb) Tính điện áp rơi trên R khi dòng điện I₂ = 1 A.\nc) Năng lượng ban đầu tích trữ trong cuộn cảm (khi I₁ = 3 A) là bao nhiêu?",
            suggested: "a) |e_tc| = L|ΔI/Δt| = 0,5×(3−1)/0,05 = 0,5×40 = 20 V.\n\nb) U_R = I₂×R = 1×100 = 100 V.\n\nc) W = ½LI₁² = ½×0,5×9 = 2,25 J.",
            points: 25,
            explanation: "AI chấm: e_tc = 20 V; U_R = 100 V; W = 2,25 J."
        },
        {
            type: "essay",
            question: "Một khung dây phẳng diện tích S = 200 cm² đặt trong từ trường đều B = 0,5 T, pháp tuyến của khung hợp với B một góc 30°.\n\na) Tính từ thông qua khung dây.\nb) Nếu B tăng đều đến 0,8 T trong 0,2 s (hướng không đổi, góc không đổi), tính suất điện động cảm ứng trong khung.",
            suggested: "a) S = 200 cm² = 200×10⁻⁴ m² = 0,02 m².\nΦ₁ = B.S.cosα = 0,5×0,02×cos30° = 0,01×(√3/2) ≈ 0,00866 Wb.\n\nb) Φ₂ = 0,8×0,02×cos30° ≈ 0,01386 Wb.\n|e| = |ΔΦ/Δt| = (0,01386−0,00866)/0,2 = 0,0052/0,2 = 0,026 V.",
            points: 25,
            explanation: "AI chấm: Φ₁ ≈ 8,66×10⁻³ Wb; |e| ≈ 0,026 V."
        }
    ]
};
