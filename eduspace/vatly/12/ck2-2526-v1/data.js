// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Vật Lý 12 (Kết nối tri thức) 2025-2026",
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
            question: "Trong mạch dao động LC lý tưởng, khi năng lượng điện trường đạt cực đại thì năng lượng từ trường:",
            options: [
                "Cũng đạt cực đại",
                "Bằng 0",
                "Bằng một nửa cực đại",
                "Không xác định"
            ],
            correct: 1,
            explanation: "Cơ chế chuyển hóa: khi Wđiện cực đại (tụ tích điện cực đại) thì dòng qua L = 0 → Wtừ = 0."
        },
        {
            type: "multiple",
            question: "Chu kỳ dao động riêng của mạch LC là:",
            options: [
                "$$T = 2\\pi\\sqrt{LC}$$",
                "$$T = 2\\pi\\sqrt{\\frac{L}{C}}$$",
                "$$T = \\frac{1}{2\\pi\\sqrt{LC}}$$",
                "$$T = \\frac{2\\pi}{\\sqrt{LC}}$$"
            ],
            correct: 0,
            explanation: "T = 2π√(LC); tần số f = 1/(2π√LC)."
        },
        {
            type: "multiple",
            question: "Sóng điện từ trong chân không truyền với vận tốc:",
            options: [
                "3×10⁸ km/s",
                "3×10⁸ m/s",
                "3×10⁶ m/s",
                "Tùy tần số"
            ],
            correct: 1,
            explanation: "Vận tốc ánh sáng trong chân không c = 3×10⁸ m/s, không phụ thuộc tần số."
        },
        {
            type: "multiple",
            question: "Mạch LC có L = 0,4 mH, C = 40 pF. Tần số dao động riêng là:",
            options: [
                "≈ 1,26 MHz",
                "≈ 398 kHz",
                "≈ 12,6 MHz",
                "≈ 39,8 kHz"
            ],
            correct: 0,
            explanation: "f = 1/(2π√LC) = 1/(2π√(0,4×10⁻³×40×10⁻¹²)) ≈ 1/(2π×4×10⁻⁷) ≈ 1,26×10⁶ Hz."
        },
        {
            type: "multiple",
            question: "Sóng điện từ nào sau đây có bước sóng dài nhất?",
            options: [
                "Tia X",
                "Ánh sáng nhìn thấy",
                "Tia hồng ngoại",
                "Sóng vô tuyến"
            ],
            correct: 3,
            explanation: "Thứ tự tăng dần bước sóng: tia γ < tia X < UV < ánh sáng < IR < sóng vô tuyến."
        },
        {
            type: "multiple",
            question: "Định luật Snell (khúc xạ ánh sáng) được biểu diễn bằng:",
            options: [
                "n₁sinθ₁ = n₂sinθ₂",
                "n₁cosθ₁ = n₂cosθ₂",
                "n₁sinθ₁ = n₂tanθ₂",
                "sinθ₁/sinθ₂ = n₁.n₂"
            ],
            correct: 0,
            explanation: "Định luật khúc xạ: n₁sinθ₁ = n₂sinθ₂."
        },
        {
            type: "multiple",
            question: "Góc giới hạn phản xạ toàn phần θ_gh của môi trường có chiết suất n₂ < n₁ được tính bởi:",
            options: [
                "$$\\sin\\theta_{gh} = n_1/n_2$$",
                "$$\\sin\\theta_{gh} = n_2/n_1$$",
                "$$\\tan\\theta_{gh} = n_2/n_1$$",
                "$$\\cos\\theta_{gh} = n_2/n_1$$"
            ],
            correct: 1,
            explanation: "sinθgh = n₂/n₁ (ánh sáng đi từ môi trường chiết quang hơn sang kém hơn)."
        },
        {
            type: "multiple",
            question: "Thấu kính hội tụ tạo ảnh thật khi vật đặt:",
            options: [
                "Trong khoảng tiêu cự",
                "Tại tiêu điểm vật",
                "Ngoài tiêu điểm vật",
                "Bất kì vị trí nào"
            ],
            correct: 2,
            explanation: "Vật ngoài tiêu cự (d > f) → ảnh thật ngược chiều."
        },
        {
            type: "multiple",
            question: "Công thức thấu kính mỏng (quy ước dấu) là:",
            options: [
                "$$\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$$",
                "$$\\frac{1}{f} = \\frac{1}{d} - \\frac{1}{d'}$$",
                "$$f = d + d'$$",
                "$$\\frac{1}{d'} = \\frac{1}{f} - \\frac{1}{d}$$"
            ],
            correct: 0,
            explanation: "1/f = 1/d + 1/d' (theo quy ước Descarte: d, d' có thể âm hoặc dương)."
        },
        {
            type: "multiple",
            question: "Vật đặt cách thấu kính hội tụ (f = 20 cm) một khoảng d = 30 cm. Ảnh cách thấu kính:",
            options: [
                "60 cm",
                "12 cm",
                "30 cm",
                "20 cm"
            ],
            correct: 0,
            explanation: "1/d' = 1/f − 1/d = 1/20 − 1/30 = 1/60 → d' = 60 cm."
        },
        {
            type: "multiple",
            question: "Theo thuyết lượng tử của Planck, năng lượng của một photon có tần số f là:",
            options: [
                "ε = hf²",
                "ε = hf",
                "ε = h/f",
                "ε = hc/λ²"
            ],
            correct: 1,
            explanation: "ε = hf = hc/λ; h = 6,626×10⁻³⁴ J.s (hằng số Planck)."
        },
        {
            type: "multiple",
            question: "Hiện tượng quang điện ngoài xảy ra khi:",
            options: [
                "Ánh sáng có bước sóng đủ dài chiếu vào kim loại",
                "Ánh sáng có tần số lớn hơn hoặc bằng tần số giới hạn f₀",
                "Cường độ ánh sáng đủ lớn",
                "Kim loại được đốt nóng đến nhiệt độ cao"
            ],
            correct: 1,
            explanation: "Điều kiện quang điện: f ≥ f₀ (tần số giới hạn), tương đương λ ≤ λ₀."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Công thức Einstein về hiện tượng quang điện:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "$$hf = A + \\frac{1}{2}mv_{max}^2$$",
                "$$hf = A - \\frac{1}{2}mv_{max}^2$$",
                "$$hf = \\frac{1}{2}mv_{max}^2$$",
                "$$hf = A$$"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "hf = A + ½mv²max; năng lượng photon bằng công thoát cộng động năng ban đầu cực đại."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Tia X (Rơn-ghen) có bản chất là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Chùm electron tốc độ cao",
                "Sóng điện từ có bước sóng ngắn",
                "Chùm hạt proton",
                "Sóng âm tần số cao"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Tia X là sóng điện từ (λ ≈ 10⁻¹¹ – 10⁻⁸ m), có khả năng đâm xuyên mạnh."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Photon ánh sáng có bước sóng λ = 0,5 μm. Năng lượng photon (h = 6,625×10⁻³⁴ J.s; c = 3×10⁸ m/s) là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "≈ 3,98×10⁻¹⁹ J",
                "≈ 2,0×10⁻¹⁹ J",
                "≈ 6,0×10⁻¹⁹ J",
                "≈ 1,0×10⁻¹⁹ J"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "ε = hc/λ = 6,625×10⁻³⁴×3×10⁸/(0,5×10⁻⁶) ≈ 3,975×10⁻¹⁹ J."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Hiện tượng huỳnh quang là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Vật phát quang khi bị đốt nóng",
                "Vật hấp thụ photon và phát ra photon có tần số cao hơn",
                "Vật hấp thụ ánh sáng và phát ra ánh sáng có bước sóng dài hơn",
                "Phản xạ toàn phần của ánh sáng"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Huỳnh quang: ánh sáng kích thích (λ ngắn, f cao) → phát quang (λ dài hơn, f thấp hơn)."
        },
        {
            type: "short",
            question: "Hạt nhân nguyên tử $$^A_Z X$$ có: (Lưu ý: Đáp án đúng gốc là \"Z proton và (A−Z) neutron\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Số khối A = số proton Z + số neutron N → N = A − Z."
        },
        {
            type: "short",
            question: "Phóng xạ β⁻ xảy ra khi: (Lưu ý: Đáp án đúng gốc là \"Hạt nhân phóng ra electron và tăng số proton lên 1\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "β⁻: n → p + e⁻ + ν̄; số proton tăng 1, số khối không đổi."
        },
        {
            type: "short",
            question: "Chu kỳ bán rã T của chất phóng xạ là: (Lưu ý: Đáp án đúng gốc là \"Thời gian để một nửa số hạt nhân ban đầu phân rã\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Sau mỗi chu kỳ T, số hạt nhân còn lại giảm đi một nửa: N = N₀/2."
        },
        {
            type: "short",
            question: "Năng lượng liên kết hạt nhân được tính theo công thức Einstein: (Lưu ý: Đáp án đúng gốc là \"$$W = \\Delta m . c^2$$\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: ".2",
            explanation: "Năng lượng liên kết W = Δm.c², Δm là độ hụt khối."
        },
        {
            type: "essay",
            question: "Mạch dao động LC có L = 1 mH và C = 25 pF.\n\na) Tính tần số dao động riêng.\nb) Điện tích cực đại trên tụ Q₀ = 5×10⁻⁸ C. Tính năng lượng điện trường cực đại và năng lượng toàn phần của mạch.",
            suggested: "a) f = 1/(2π√LC) = 1/(2π√(10⁻³×25×10⁻¹²))\n= 1/(2π×5×10⁻⁸) ≈ 3,18×10⁶ Hz ≈ 3,18 MHz.\n\nb) W_điện cực đại = Q₀²/(2C) = (5×10⁻⁸)²/(2×25×10⁻¹²)\n= 25×10⁻¹⁶/(50×10⁻¹²) = 5×10⁻⁵ J.\nNăng lượng toàn phần = W_điện cực đại = 5×10⁻⁵ J (vì lý tưởng, bảo toàn).",
            points: 25,
            explanation: "AI chấm: f ≈ 3,18 MHz; W = Q₀²/(2C) = 5×10⁻⁵ J."
        },
        {
            type: "essay",
            question: "Ánh sáng chiếu từ thủy tinh (n₁ = 1,5) sang không khí (n₂ = 1).\n\na) Tính góc giới hạn phản xạ toàn phần.\nb) Tia sáng trong thủy tinh tới mặt phân cách với góc tới θ = 45°, xảy ra hiện tượng gì? Giải thích.",
            suggested: "a) sinθ_gh = n₂/n₁ = 1/1,5 = 2/3\nθ_gh = arcsin(2/3) ≈ 41,8°.\n\nb) θ = 45° > θ_gh ≈ 41,8° → xảy ra phản xạ toàn phần.\nÁnh sáng phản xạ hoàn toàn trở lại thủy tinh, không có tia khúc xạ sang không khí.",
            points: 25,
            explanation: "AI chấm: θ_gh ≈ 41,8°; θ = 45° > θ_gh → phản xạ toàn phần."
        },
        {
            type: "essay",
            question: "Hạt nhân $$^{210}_{84}Po$$ phóng xạ α, tạo thành hạt nhân con X và hạt α $$^4_2He$$.\n\na) Xác định hạt nhân X (số proton Z_X và số khối A_X).\nb) Hỏi sau 3 chu kỳ bán rã (T = 138 ngày), khối lượng Po-210 còn lại là bao nhiêu % so với ban đầu?\nc) Nếu m₀ = 1 g, tính khối lượng Po còn lại sau 414 ngày.",
            suggested: "a) Bảo toàn số khối: 210 = 4 + A_X → A_X = 206.\nBảo toàn điện tích: 84 = 2 + Z_X → Z_X = 82.\nHạt nhân X là $$^{206}_{82}Pb$$ (chì-206).\n\nb) n = 3T/T = 3 chu kỳ.\nN/N₀ = (1/2)³ = 1/8 = 12,5%.\n\nc) m = m₀ × (1/2)³ = 1 × 1/8 = 0,125 g.",
            points: 25,
            explanation: "AI chấm: X là Pb-206; còn 12,5%; m = 0,125 g sau 414 ngày."
        }
    ]
};
