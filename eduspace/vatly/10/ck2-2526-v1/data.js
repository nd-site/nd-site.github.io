// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Vật Lý 10 (Kết nối tri thức) 2025-2026",
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
                count: 3,
                pointsPerQ: 1
            }
        }
    },
    questions: [
        {
            type: "multiple",
            question: "Moment lực đối với một trục quay được tính theo công thức:",
            options: [
                "M = F + d",
                "M = F.d",
                "M = F/d",
                "M = F − d"
            ],
            correct: 1,
            explanation: "M = F.d, với d là cánh tay đòn (khoảng cách vuông góc từ trục đến giá lực)."
        },
        {
            type: "multiple",
            question: "Đơn vị của moment lực trong hệ SI là:",
            options: [
                "N/m",
                "N.m",
                "J/s",
                "kg.m/s"
            ],
            correct: 1,
            explanation: "Đơn vị moment lực là N.m (Niutơn mét)."
        },
        {
            type: "multiple",
            question: "Ngẫu lực là hệ hai lực:",
            options: [
                "Cùng giá, cùng chiều, cùng độ lớn",
                "Song song, ngược chiều, cùng độ lớn, tác dụng lên cùng một vật",
                "Cùng giá, ngược chiều, cùng độ lớn",
                "Song song, cùng chiều, khác độ lớn"
            ],
            correct: 1,
            explanation: "Ngẫu lực: hai lực song song, ngược chiều, độ lớn bằng nhau, cùng tác dụng lên một vật."
        },
        {
            type: "multiple",
            question: "Một cờ lê dài 30 cm. Người thợ tác dụng lực 50 N vuông góc vào đầu cờ lê. Moment lực là:",
            options: [
                "150 N.m",
                "15 N.m",
                "1,5 N.m",
                "1500 N.m"
            ],
            correct: 1,
            explanation: "M = F.d = 50 × 0,30 = 15 N.m."
        },
        {
            type: "multiple",
            question: "Điều kiện cân bằng của vật rắn có trục quay cố định là:",
            options: [
                "Tổng các lực tác dụng bằng 0",
                "Tổng moment thuận chiều bằng tổng moment ngược chiều",
                "Vật không chịu lực nào tác dụng",
                "Hai lực tác dụng phải cùng giá"
            ],
            correct: 1,
            explanation: "Quy tắc moment: ΣM thuận = ΣM ngược."
        },
        {
            type: "multiple",
            question: "Tác dụng của ngẫu lực lên vật rắn tự do là:",
            options: [
                "Chuyển động tịnh tiến",
                "Vừa quay vừa tịnh tiến",
                "Chỉ chuyển động quay",
                "Đứng yên hoàn toàn"
            ],
            correct: 2,
            explanation: "Hợp lực của ngẫu lực = 0 → không tịnh tiến, chỉ gây quay."
        },
        {
            type: "multiple",
            question: "Moment ngẫu lực F = 20 N, khoảng cách giữa hai giá là 0,4 m bằng:",
            options: [
                "50 N.m",
                "8 N.m",
                "0,8 N.m",
                "80 N.m"
            ],
            correct: 1,
            explanation: "M = F.d = 20 × 0,4 = 8 N.m."
        },
        {
            type: "multiple",
            question: "Công cơ học A = F.s.cosα bằng 0 khi:",
            options: [
                "α = 0°",
                "α = 45°",
                "α = 90°",
                "α = 180°"
            ],
            correct: 2,
            explanation: "cos90° = 0 nên lực vuông góc với chiều dịch chuyển thì A = 0."
        },
        {
            type: "multiple",
            question: "Kéo vật 5 m bằng lực 60 N theo hướng chuyển động. Công thực hiện là:",
            options: [
                "12 J",
                "300 J",
                "30 J",
                "600 J"
            ],
            correct: 1,
            explanation: "A = F.s = 60 × 5 = 300 J."
        },
        {
            type: "multiple",
            question: "Một máy thực hiện công 36 000 J trong 2 phút. Công suất là:",
            options: [
                "300 W",
                "18 000 W",
                "72 000 W",
                "600 W"
            ],
            correct: 0,
            explanation: "P = A/t = 36000/120 = 300 W."
        },
        {
            type: "multiple",
            question: "Ô tô chạy thẳng đều 90 km/h, công suất động cơ 45 kW. Lực kéo là:",
            options: [
                "500 N",
                "1 800 N",
                "4 050 N",
                "2 000 N"
            ],
            correct: 1,
            explanation: "v = 25 m/s. F = P/v = 45000/25 = 1 800 N."
        },
        {
            type: "multiple",
            question: "Lực ma sát trượt tác dụng lên vật chuyển động sinh:",
            options: [
                "Công phát động (dương)",
                "Công bằng không",
                "Công cản (âm)",
                "Công dương hoặc âm tùy trường hợp"
            ],
            correct: 2,
            explanation: "Ma sát ngược chiều chuyển động → α = 180° → A âm."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Một người đẩy xe nhưng xe không dịch chuyển. Công người thực hiện là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Rất lớn",
                "Âm",
                "Bằng 0",
                "Bằng lực nhân thời gian"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "A = F.s.cosα, s = 0 nên A = 0."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Biểu thức liên hệ công suất P, lực F và vận tốc v (cùng hướng) là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "P = F/v",
                "P = F.v",
                "P = F.v²",
                "P = F²/v"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "P = A/t = F.s/t = F.v."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Động năng của vật 2 kg, vận tốc 10 m/s là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "100 J",
                "20 J",
                "200 J",
                "40 J"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Wd = ½mv² = ½×2×100 = 100 J."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Thế năng trọng trường của vật 5 kg ở độ cao 4 m (g = 10 m/s²) là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "12,5 J",
                "200 J",
                "50 J",
                "2 J"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Wt = mgh = 5×10×4 = 200 J."
        },
        {
            type: "short",
            question: "Định luật bảo toàn cơ năng áp dụng khi vật: (Lưu ý: Đáp án đúng gốc là \"Chỉ chịu tác dụng của lực thế\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "1",
            explanation: "Cơ năng bảo toàn khi chỉ có lực thế (trọng lực, lực đàn hồi) sinh công."
        },
        {
            type: "short",
            question: "Vật rơi tự do từ h = 20 m. Vận tốc khi chạm đất (g = 10 m/s²): (Lưu ý: Đáp án đúng gốc là \"20 m/s\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "20",
            explanation: "v = √(2gh) = √(2×10×20) = 20 m/s."
        },
        {
            type: "short",
            question: "Tại vị trí thấp nhất của con lắc đơn (không ma sát): (Lưu ý: Đáp án đúng gốc là \"Động năng cực đại, thế năng cực tiểu\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "",
            explanation: "h nhỏ nhất → Wt nhỏ nhất; v lớn nhất → Wd lớn nhất."
        },
        {
            type: "short",
            question: "Vật 1 kg rơi từ h = 5 m. Tại h = 2 m, vận tốc (g = 10 m/s²) là: (Lưu ý: Đáp án đúng gốc là \"$$\\sqrt{60}$$ m/s\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "60",
            explanation: "v² = 2g(h₁−h₂) = 2×10×3 = 60 → v = √60 m/s."
        },
        {
            type: "essay",
            question: "Một người dùng hai tay vặn vô lăng (ngẫu lực). Mỗi tay tác dụng lực F = 30 N, đường kính vô lăng 40 cm.\n\na) Tính moment ngẫu lực.\nb) Muốn moment tăng gấp đôi mà không đổi vô lăng, mỗi tay phải tác dụng lực bao nhiêu?",
            suggested: "a) d = 0,4 m.\nM = F × d = 30 × 0,4 = 12 N.m.\n\nb) M' = 24 N.m.\nF' = M'/d = 24/0,4 = 60 N.",
            points: 25,
            explanation: "AI chấm: M = 12 N.m; F' = 60 N."
        },
        {
            type: "essay",
            question: "Xe 1 500 kg, vận tốc v₁ = 20 m/s phanh dừng trong s = 50 m (g = 10 m/s²).\n\na) Dùng định lý biến thiên động năng tính lực hãm trung bình.\nb) Tính hệ số ma sát μ.",
            suggested: "a) ΔWd = A_hãm → 0 − ½mv₁² = −F.s\nF = mv₁²/(2s) = 1500×400/100 = 6 000 N.\n\nb) F = μmg → μ = 6000/(1500×10) = 0,4.",
            points: 25,
            explanation: "AI chấm: F_hãm = 6 000 N; μ = 0,4."
        },
        {
            type: "essay",
            question: "Viên đạn m₁ = 0,01 kg, v₀ = 400 m/s cắm vào khúc gỗ m₂ = 0,99 kg đứng yên (bề mặt ngang, bỏ ma sát). Đạn và gỗ chuyển động cùng nhau.\n\na) Tính vận tốc hệ đạn-gỗ ngay sau va chạm.\nb) Tính tỉ lệ phần trăm động năng bị mất.",
            suggested: "a) Bảo toàn động lượng:\nv' = m₁v₀/(m₁+m₂) = 0,01×400/1 = 4 m/s.\n\nb) Wd₀ = ½×0,01×400² = 800 J.\nWd' = ½×1×4² = 8 J.\nMất = (800−8)/800 × 100% = 99%.",
            points: 25,
            explanation: "AI chấm: v' = 4 m/s; mất 99% động năng."
        }
    ]
};
