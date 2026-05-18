// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Toán 11 (Kết nối tri thức) 2025-2026",
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
            question: "Đạo hàm của hàm số y = x³ − 3x² + 2x − 1 là:",
            options: [
                "y' = 3x² − 6x + 2",
                "y' = x² − x + 2",
                "y' = 3x² − 3x + 2",
                "y' = 3x² − 6x − 1"
            ],
            correct: 0,
            explanation: "y' = (x³)' − (3x²)' + (2x)' − (1)' = 3x² − 6x + 2."
        },
        {
            type: "multiple",
            question: "Đạo hàm của hàm số y = sin x là:",
            options: [
                "y' = cos x",
                "y' = −cos x",
                "y' = sin x",
                "y' = −sin x"
            ],
            correct: 0,
            explanation: "(sin x)' = cos x."
        },
        {
            type: "multiple",
            question: "Đạo hàm của hàm số y = √(2x + 1) là:",
            options: [
                "$$y' = \\frac{1}{\\sqrt{2x+1}}$$",
                "$$y' = \\frac{1}{2\\sqrt{2x+1}}$$",
                "$$y' = \\frac{2}{\\sqrt{2x+1}}$$",
                "$$y' = \\frac{x}{\\sqrt{2x+1}}$$"
            ],
            correct: 0,
            explanation: "y' = (2x+1)' / (2√(2x+1)) = 2 / (2√(2x+1)) = 1/√(2x+1)."
        },
        {
            type: "multiple",
            question: "Cho hàm số f(x) = x² − 4x. Phương trình tiếp tuyến của đồ thị hàm số tại điểm có hoành độ x₀ = 3 là:",
            options: [
                "y = 2x − 9",
                "y = 2x − 3",
                "y = x − 3",
                "y = 2x + 3"
            ],
            correct: 0,
            explanation: "x₀=3 → y₀=9−12=−3. f'(x)=2x−4 → f'(3)=2. PT: y = 2(x−3) − 3 = 2x − 9."
        },
        {
            type: "multiple",
            question: "Đạo hàm của hàm số $$y = \\frac{x+1}{x-1}$$ là:",
            options: [
                "$$y' = \\frac{-2}{(x-1)^2}$$",
                "$$y' = \\frac{2}{(x-1)^2}$$",
                "$$y' = \\frac{1}{(x-1)^2}$$",
                "$$y' = \\frac{-1}{(x-1)^2}$$"
            ],
            correct: 0,
            explanation: "y' = [1.(−1) − 1.1]/(x−1)² = −2/(x−1)²."
        },
        {
            type: "multiple",
            question: "Ý nghĩa hình học của đạo hàm: Đạo hàm f'(x₀) là:",
            options: [
                "Hệ số góc của tiếp tuyến với đồ thị (C) tại điểm M₀(x₀; f(x₀))",
                "Tung độ của điểm M₀",
                "Khoảng cách từ gốc tọa độ đến tiếp tuyến",
                "Hoành độ của đỉnh đồ thị"
            ],
            correct: 0,
            explanation: "Đạo hàm tại 1 điểm là hệ số góc của tiếp tuyến tại điểm đó."
        },
        {
            type: "multiple",
            question: "Đạo hàm cấp hai của hàm số y = x⁴ − 2x² là:",
            options: [
                "y'' = 12x² − 4",
                "y'' = 4x³ − 4x",
                "y'' = 12x² + 4",
                "y'' = 4x³ + 4x"
            ],
            correct: 0,
            explanation: "y' = 4x³ − 4x; y'' = 12x² − 4."
        },
        {
            type: "multiple",
            question: "Đường thẳng d vuông góc với mặt phẳng (P) khi:",
            options: [
                "d vuông góc với hai đường thẳng cắt nhau nằm trong (P)",
                "d vuông góc với một đường thẳng nằm trong (P)",
                "d vuông góc với hai đường thẳng song song nằm trong (P)",
                "d song song với một đường thẳng vuông góc với (P) hoặc d vuông góc với 2 đường thẳng bất kì"
            ],
            correct: 0,
            explanation: "Điều kiện cần và đủ: vuông góc với 2 đường thẳng cắt nhau trong (P)."
        },
        {
            type: "multiple",
            question: "Cho hình chóp S.ABCD có đáy ABCD là hình vuông, SA ⊥ (ABCD). Khẳng định nào sau đây SAI?",
            options: [
                "SA ⊥ BC",
                "BC ⊥ (SAB)",
                "SB ⊥ CD",
                "AC ⊥ BD"
            ],
            correct: 2,
            explanation: "CD ⊥ AD, CD ⊥ SA → CD ⊥ (SAD) → CD ⊥ SD. SB không vuông góc với CD."
        },
        {
            type: "multiple",
            question: "Góc giữa đường thẳng d và mặt phẳng (P) (d không vuông góc (P)) là:",
            options: [
                "Góc giữa d và hình chiếu vuông góc của nó trên (P)",
                "Góc giữa d và một đường thẳng bất kì trong (P)",
                "Góc giữa d và đường thẳng vuông góc với (P)",
                "90 độ"
            ],
            correct: 0,
            explanation: "Định nghĩa góc giữa đường thẳng và mặt phẳng."
        },
        {
            type: "multiple",
            question: "Cho hình lập phương ABCD.A'B'C'D'. Góc giữa hai đường thẳng AB và B'C' là:",
            options: [
                "90°",
                "0°",
                "45°",
                "60°"
            ],
            correct: 0,
            explanation: "B'C' // BC. Góc giữa AB và B'C' bằng góc giữa AB và BC. Vì ABCD là hình vuông nên góc bằng 90°."
        },
        {
            type: "multiple",
            question: "Hai mặt phẳng (P) và (Q) vuông góc với nhau khi:",
            options: [
                "Góc giữa chúng bằng 90°",
                "Một mặt phẳng chứa đường thẳng vuông góc với mặt phẳng kia",
                "Góc giữa hai đường thẳng bất kì thuộc hai mp đó bằng 90°",
                "Cả A và B đều đúng"
            ],
            correct: 3,
            explanation: "(P) ⊥ (Q) khi góc bằng 90°, tương đương mp này chứa 1 đường thẳng vuông góc với mp kia."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Cho hình chóp S.ABC có SA ⊥ (ABC), tam giác ABC vuông tại B. Khẳng định nào ĐÚNG?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "(SBC) ⊥ (SAB)",
                "(SBC) ⊥ (SAC)",
                "(SAB) ⊥ (SAC)",
                "(ABC) ⊥ (SBC)"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "BC ⊥ AB, BC ⊥ SA → BC ⊥ (SAB). Mà BC ⊂ (SBC) → (SBC) ⊥ (SAB)."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Khoảng cách giữa hai đường thẳng chéo nhau a và b là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Độ dài đoạn vuông góc chung của a và b",
                "Khoảng cách từ một điểm trên a đến b",
                "Khoảng cách từ a đến mặt phẳng chứa b",
                "Bằng 0"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Định nghĩa: khoảng cách giữa 2 đường chéo nhau bằng độ dài đoạn vuông góc chung."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Gieo đồng thời hai con xúc xắc cân đối. Xác suất để tổng số chấm bằng 7 là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "1/6",
                "1/12",
                "1/36",
                "7/36"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Các kết quả (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) có 6 kết quả. Số phần tử KG mẫu là 36. P = 6/36 = 1/6."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Hai biến cố A và B độc lập nếu:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "P(AB) = P(A) + P(B)",
                "P(AB) = P(A).P(B)",
                "P(A ∪ B) = P(A) + P(B)",
                "A và B không cùng xảy ra"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Định nghĩa: A, B độc lập ↔ P(A∩B) = P(A).P(B)."
        },
        {
            type: "short",
            question: "Cho A và B là hai biến cố độc lập, P(A) = 0,4; P(B) = 0,5. P(A ∪ B) bằng: (Lưu ý: Đáp án đúng gốc là \"0,7\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "0,7",
            explanation: "P(AB) = 0,4×0,5 = 0,2. P(A∪B) = P(A) + P(B) − P(AB) = 0,4 + 0,5 − 0,2 = 0,7."
        },
        {
            type: "short",
            question: "Một hộp có 4 bi đỏ và 6 bi xanh. Rút ngẫu nhiên lần lượt 2 bi (có hoàn lại). Xác suất để cả 2 bi đều đỏ là: (Lưu ý: Đáp án đúng gốc là \"16/100\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1610",
            explanation: "Rút có hoàn lại là độc lập. P = (4/10) × (4/10) = 16/100 = 4/25 = 0,16."
        },
        {
            type: "short",
            question: "Xác suất có điều kiện P(A|B) được tính bởi công thức: (Lưu ý: Đáp án đúng gốc là \"P(A|B) = P(A ∩ B) / P(B)\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Công thức xác suất có điều kiện: P(A|B) = P(AB)/P(B) (với P(B)>0)."
        },
        {
            type: "short",
            question: "Cho hàm số f(x) = sin(2x). f''(π/4) bằng: (Lưu ý: Đáp án đúng gốc là \"−4\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "4",
            explanation: "f'(x) = 2cos(2x); f''(x) = −4sin(2x). f''(π/4) = −4sin(π/2) = −4."
        },
        {
            type: "essay",
            question: "Cho hàm số f(x) = x³ − 3x² + 2.\n\na) Tính đạo hàm f'(x).\nb) Viết phương trình tiếp tuyến của đồ thị (C) tại điểm có hoành độ x₀ = 1.",
            suggested: "a) f'(x) = 3x² − 6x.\n\nb) x₀ = 1 → y₀ = 1³ − 3(1)² + 2 = 0.\nf'(1) = 3(1)² − 6(1) = −3.\nPTTT: y = f'(1)(x − x₀) + y₀ = −3(x − 1) + 0 = −3x + 3.",
            points: 25,
            explanation: "AI chấm: f'(x) = 3x² − 6x; y = −3x + 3."
        },
        {
            type: "essay",
            question: "Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, cạnh bên SA vuông góc với đáy và SA = a√2.\n\na) Chứng minh BC ⊥ (SAB).\nb) Tính góc giữa đường thẳng SC và mặt phẳng (ABCD).\nc) Tính khoảng cách từ điểm A đến mặt phẳng (SBD).",
            suggested: "a) Ta có BC ⊥ AB (ABCD là hình vuông) và BC ⊥ SA (do SA ⊥ (ABCD)).\nSuy ra BC ⊥ (SAB).\n\nb) SC chiếu lên (ABCD) là AC. Góc cần tìm là ∠SCA.\nAC = a√2 (đường chéo hình vuông cạnh a).\nSA = a√2. Tam giác SAC vuông tại A có SA = AC = a√2 → tam giác vuông cân.\nGóc ∠SCA = 45°.\n\nc) Kẻ AH ⊥ SO (O là tâm đáy). \nBD ⊥ AC và BD ⊥ SA → BD ⊥ (SAC) → BD ⊥ AH.\nVậy AH ⊥ (SBD). d(A,(SBD)) = AH.\n1/AH² = 1/SA² + 1/AO² = 1/(2a²) + 1/(a²/2) = 1/(2a²) + 2/a² = 5/(2a²).\nAH = a√(2/5) = a√10 / 5.",
            points: 25,
            explanation: "AI chấm: c/m BC⊥(SAB); góc 45°; d = a√10/5."
        },
        {
            type: "essay",
            question: "Hai xạ thủ cùng bắn độc lập vào một mục tiêu. Xác suất bắn trúng của xạ thủ A là 0,8; của xạ thủ B là 0,7.\n\na) Tính xác suất để cả hai xạ thủ cùng bắn trúng.\nb) Tính xác suất để mục tiêu bị bắn trúng (ít nhất một người trúng).",
            suggested: "a) Hai biến cố độc lập. P(A ∩ B) = P(A) × P(B) = 0,8 × 0,7 = 0,56.\n\nb) Xác suất cả hai bắn trượt: P(trượt) = (1−0,8) × (1−0,7) = 0,2 × 0,3 = 0,06.\nXác suất mục tiêu bị trúng: 1 − 0,06 = 0,94.\n(Hoặc: 0,8 + 0,7 − 0,56 = 0,94).",
            points: 25,
            explanation: "AI chấm: Cả hai trúng: 0,56; Ít nhất một trúng: 0,94."
        }
    ]
};
