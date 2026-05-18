// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Toán 10 (Kết nối tri thức) 2025-2026",
    config: {
        testDuration: 5400,
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
            question: "Bất phương trình 2x − 3 > 5 có tập nghiệm là:",
            options: [
                "x > 4",
                "x < 4",
                "x > −1",
                "x < −1"
            ],
            correct: 0,
            explanation: "2x > 8 → x > 4."
        },
        {
            type: "multiple",
            question: "Bất phương trình x² − 5x + 6 < 0 có tập nghiệm là:",
            options: [
                "(−∞; 2) ∪ (3; +∞)",
                "(2; 3)",
                "(−∞; 2)",
                "(3; +∞)"
            ],
            correct: 1,
            explanation: "x² − 5x + 6 = (x−2)(x−3) < 0 khi 2 < x < 3."
        },
        {
            type: "multiple",
            question: "Bất phương trình −x² + 4x − 3 ≥ 0 có nghiệm khi:",
            options: [
                "x ≤ 1 hoặc x ≥ 3",
                "1 ≤ x ≤ 3",
                "x = 1 hoặc x = 3",
                "Không có nghiệm"
            ],
            correct: 1,
            explanation: "−x² + 4x − 3 = −(x−1)(x−3) ≥ 0 ↔ (x−1)(x−3) ≤ 0 ↔ 1 ≤ x ≤ 3."
        },
        {
            type: "multiple",
            question: "Hệ bất phương trình: {2x + 1 > 0; x − 3 < 0} có nghiệm là:",
            options: [
                "$$x > -\\frac{1}{2}$$",
                "$$-\\frac{1}{2} < x < 3$$",
                "x < 3",
                "Không có nghiệm"
            ],
            correct: 1,
            explanation: "x > −1/2 và x < 3 → −1/2 < x < 3."
        },
        {
            type: "multiple",
            question: "Parabol y = x² − 4x + 3 có đỉnh tại:",
            options: [
                "(2; −1)",
                "(−2; 1)",
                "(2; 1)",
                "(−2; −1)"
            ],
            correct: 0,
            explanation: "x_đỉnh = −b/(2a) = 4/2 = 2; y_đỉnh = 4 − 8 + 3 = −1. Đỉnh: (2; −1)."
        },
        {
            type: "multiple",
            question: "Hàm số y = −2x² + 8x − 5 đạt giá trị lớn nhất là:",
            options: [
                "3",
                "8",
                "−5",
                "5"
            ],
            correct: 0,
            explanation: "a = −2 < 0 → parabol hướng xuống. y_max = c − b²/(4a) = −5 − 64/(−8) = −5 + 8 = 3."
        },
        {
            type: "multiple",
            question: "Parabol y = ax² + bx + c (a ≠ 0) đi qua gốc tọa độ O(0;0) khi:",
            options: [
                "a = 0",
                "b = 0",
                "c = 0",
                "a + b + c = 0"
            ],
            correct: 2,
            explanation: "y(0) = c = 0."
        },
        {
            type: "multiple",
            question: "Phương trình 2x² − 5x + 3 = 0 có hai nghiệm x₁, x₂. Theo định lý Viète:",
            options: [
                "x₁ + x₂ = 5/2; x₁.x₂ = 3/2",
                "x₁ + x₂ = −5/2; x₁.x₂ = 3/2",
                "x₁ + x₂ = 5; x₁.x₂ = 3",
                "x₁ + x₂ = 5/2; x₁.x₂ = −3/2"
            ],
            correct: 0,
            explanation: "Viète: x₁+x₂ = −b/a = 5/2; x₁.x₂ = c/a = 3/2."
        },
        {
            type: "multiple",
            question: "Phương trình x² + bx + 5 = 0 có hai nghiệm trái dấu khi:",
            options: [
                "b < 0",
                "b > 0",
                "5 < 0 (không thỏa)",
                "Mọi giá trị b"
            ],
            correct: 2,
            explanation: "Hai nghiệm trái dấu ↔ x₁.x₂ < 0 ↔ c/a = 5/1 = 5 < 0. Điều này không thỏa → không có giá trị b nào thỏa mãn."
        },
        {
            type: "multiple",
            question: "Biệt thức Δ = b² − 4ac của phương trình ax² + bx + c = 0. Phương trình có hai nghiệm phân biệt khi:",
            options: [
                "Δ = 0",
                "Δ < 0",
                "Δ > 0",
                "a > 0"
            ],
            correct: 2,
            explanation: "Δ > 0 → hai nghiệm phân biệt; Δ = 0 → nghiệm kép; Δ < 0 → vô nghiệm thực."
        },
        {
            type: "multiple",
            question: "Cho $$\\vec{a} = (3; 4)$$. Độ dài $$|\\vec{a}|$$ là:",
            options: [
                "7",
                "5",
                "1",
                "12"
            ],
            correct: 1,
            explanation: "|a| = √(3² + 4²) = √25 = 5."
        },
        {
            type: "multiple",
            question: "Tích vô hướng $$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta$$. Hai vectơ vuông góc khi:",
            options: [
                "θ = 0°",
                "θ = 180°",
                "θ = 90°",
                "θ = 45°"
            ],
            correct: 2,
            explanation: "cos90° = 0 nên $$\\vec{a}\\cdot\\vec{b} = 0$$ khi hai vectơ vuông góc."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Cho $$\\vec{a} = (2; 1)$$ và $$\\vec{b} = (−1; 2)$$. Tích vô hướng $$\\vec{a}\\cdot\\vec{b}$$ bằng:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "5",
                "0",
                "−5",
                "4"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "$$\\vec{a}\\cdot\\vec{b} = 2×(−1) + 1×2 = −2 + 2 = 0$$. Hai vectơ vuông góc nhau."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Vectơ $$\\vec{AB}$$ với A(1; 2) và B(4; 6) có tọa độ là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "(3; 4)",
                "(5; 8)",
                "(−3; −4)",
                "(4; 6)"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "$$\\vec{AB} = (4−1; 6−2) = (3; 4)$$."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Phương trình tổng quát đường thẳng qua A(1; 2) có vectơ pháp tuyến n = (3; −1) là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "3(x−1) − (y−2) = 0",
                "3x − y = 0",
                "x + 2y = 0",
                "3x + y = 5"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "ax(x−x₀) + b(y−y₀) = 0 → 3(x−1) − 1(y−2) = 0 → 3x − y − 1 = 0."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Khoảng cách từ điểm M(2; 3) đến đường thẳng d: 3x − 4y + 5 = 0 là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "1",
                "2",
                "3/5",
                "1/5"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "d = |3×2 − 4×3 + 5|/√(9+16) = |6−12+5|/5 = |−1|/5 = 1/5. Đáp án đúng là 1/5."
        },
        {
            type: "short",
            question: "Hai đường thẳng 2x − y + 3 = 0 và 4x − 2y + 1 = 0 có vị trí tương đối là: (Lưu ý: Đáp án đúng gốc là \"Song song\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Tỉ lệ hệ số: 2/4 = −1/(−2) = 1/2, nhưng 3/1 ≠ 1/2 → song song."
        },
        {
            type: "short",
            question: "Đường thẳng y = 2x − 3 có hệ số góc là: (Lưu ý: Đáp án đúng gốc là \"2\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "2",
            explanation: "Phương trình y = mx + b → hệ số góc m = 2."
        },
        {
            type: "short",
            question: "Đường tròn (x−2)² + (y+1)² = 9 có tâm và bán kính là: (Lưu ý: Đáp án đúng gốc là \"I(2; −1), R = 3\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "21,3",
            explanation: "Dạng (x−a)² + (y−b)² = R² → tâm I(2; −1), R = √9 = 3."
        },
        {
            type: "short",
            question: "Phương trình đường tròn tâm O(0;0) bán kính R = 5 là: (Lưu ý: Đáp án đúng gốc là \"x² + y² = 25\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "25",
            explanation: "x² + y² = R² = 25."
        },
        {
            type: "essay",
            question: "Giải bất phương trình: x² − 3x − 4 ≤ 0\n\na) Tìm nghiệm của phương trình x² − 3x − 4 = 0.\nb) Biểu diễn tập nghiệm trên trục số và viết dưới dạng khoảng.",
            suggested: "a) x² − 3x − 4 = 0\nΔ = 9 + 16 = 25 → √Δ = 5.\nx₁ = (3−5)/2 = −1; x₂ = (3+5)/2 = 4.\n\nb) Vì a = 1 > 0, parabol mở lên:\nf(x) ≤ 0 giữa hai nghiệm: −1 ≤ x ≤ 4.\nTập nghiệm: [−1; 4].",
            points: 25,
            explanation: "AI chấm: nghiệm x₁ = −1, x₂ = 4; tập nghiệm [−1; 4]."
        },
        {
            type: "essay",
            question: "Trong mặt phẳng tọa độ Oxy, cho đường thẳng d: 3x − 4y + 12 = 0 và điểm A(1; 1).\n\na) Tìm khoảng cách từ A đến d.\nb) Viết phương trình đường thẳng qua A(1; 1) song song với d.\nc) Viết phương trình đường thẳng qua A(1; 1) vuông góc với d.",
            suggested: "a) d(A, d) = |3×1 − 4×1 + 12|/√(9+16) = |11|/5 = 11/5.\n\nb) Song song với d có dạng 3x − 4y + c = 0 (c ≠ 12).\nQua A(1;1): 3 − 4 + c = 0 → c = 1.\nPTĐT: 3x − 4y + 1 = 0.\n\nc) Vuông góc với d có vectơ pháp tuyến = vectơ chỉ phương của d = (4; 3).\nPTĐT qua A: 4(x−1) + 3(y−1) = 0 → 4x + 3y − 7 = 0.",
            points: 25,
            explanation: "AI chấm: d = 11/5; song song: 3x−4y+1=0; vuông góc: 4x+3y−7=0."
        },
        {
            type: "essay",
            question: "Một hộp có 5 bi xanh, 3 bi đỏ, 2 bi vàng. Rút ngẫu nhiên 1 bi.\n\na) Tính xác suất rút được bi xanh.\nb) Tính xác suất rút được bi không phải màu vàng.\nc) Tính xác suất rút được bi có màu xanh HOẶC đỏ.",
            suggested: "Tổng số bi: 5 + 3 + 2 = 10.\n\na) P(xanh) = 5/10 = 1/2.\n\nb) P(không vàng) = 1 − P(vàng) = 1 − 2/10 = 8/10 = 4/5.\n\nc) P(xanh hoặc đỏ) = P(xanh) + P(đỏ) = 5/10 + 3/10 = 8/10 = 4/5.\n(Hai biến cố xung khắc nên cộng xác suất.)",
            points: 25,
            explanation: "AI chấm: P(xanh)=1/2; P(không vàng)=4/5; P(xanh hoặc đỏ)=4/5."
        }
    ]
};
