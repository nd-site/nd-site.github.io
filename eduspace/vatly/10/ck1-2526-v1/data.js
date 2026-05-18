window.quizData = {
    "title": "Kiểm tra Cuối Học Kì I – Vật lí 10 (KNTT) – 2025-2026",
    "config": {
        "testDuration": 2700,
        "examLayout": {
            "multiple": { "count": 12, "pointsPerQ": 0.25 },
            "truefalse": { "count": 4, "pointsPerQ": 1.0, "partialScoring": [0.1, 0.25, 0.5, 1.0] },
            "short": { "count": 6, "pointsPerQ": 0.5 }
        }
    },
    "questions": [
        // --- PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN ---
        {
            "type": "multiple",
            "question": "Phát biểu nào sau đây là đúng về tốc độ và vận tốc?",
            "options": [
                "Tốc độ và vận tốc luôn có cùng giá trị.",
                "Tốc độ là đại lượng vectơ, vận tốc là đại lượng vô hướng.",
                "Vận tốc đặc trưng cho sự nhanh chậm và chiều của chuyển động.",
                "Tốc độ trung bình luôn bằng độ lớn của vận tốc trung bình."
            ],
            "correct": 2,
            "explanation": "Vận tốc là đại lượng vectơ bao gồm cả độ lớn (tốc độ) và hướng chuyển động."
        },
        {
            "type": "multiple",
            "question": "Công thức liên hệ giữa độ dịch chuyển d, vận tốc đầu $v_0$ và gia tốc a trong chuyển động thẳng biến đổi đều là:",
            "options": [
                "$v^2 - v_0^2 = 2ad$",
                "$v - v_0 = ad^2$",
                "$v^2 + v_0^2 = 2ad$",
                "$d = v_0.t + a.t^2$"
            ],
            "correct": 0,
            "explanation": "Đây là công thức độc lập với thời gian trong chuyển động thẳng biến đổi đều."
        },
        {
            "type": "multiple",
            "question": "Gia tốc của vật rơi tự do (ở cùng một nơi trên Trái Đất) có đặc điểm:",
            "options": [
                "Phụ thuộc vào khối lượng của vật.",
                "Thay đổi theo thời gian rơi.",
                "Có phương thẳng đứng, chiều từ dưới lên trên.",
                "Có giá trị không đổi và hướng thẳng đứng xuống dưới."
            ],
            "correct": 3,
            "explanation": "Mọi vật rơi tự do tại cùng một nơi đều có cùng gia tốc trọng trường g."
        },
        {
            "type": "multiple",
            "question": "Theo định luật II Newton, gia tốc của một vật có đặc điểm gì?",
            "options": [
                "Tỉ lệ thuận với khối lượng của vật.",
                "Tỉ lệ thuận với độ lớn của lực tác dụng.",
                "Tỉ lệ nghịch với độ lớn của lực tác dụng.",
                "Luôn ngược hướng với lực tác dụng."
            ],
            "correct": 1,
            "explanation": "Định luật II Newton: $\\\\vec{a} = \\\\vec{F}/m$. Gia tốc tỉ lệ thuận với lực và tỉ lệ nghịch với khối lượng."
        },
        {
            "type": "multiple",
            "question": "Lực ma sát trượt xuất hiện khi nào?",
            "options": [
                "Vật đứng yên trên bề mặt vật khác.",
                "Vật có xu hướng chuyển động nhưng chưa chuyển động.",
                "Vật trượt trên bề mặt của vật khác.",
                "Vật lăn trên bề mặt vật khác."
            ],
            "correct": 2,
            "explanation": "Lực ma sát trượt cản trở chuyển động trượt của vật."
        },
        {
            "type": "multiple",
            "question": "Đại lượng đặc trưng cho khả năng thực hiện công nhanh hay chậm của lực được gọi là:",
            "options": ["Công cơ học.", "Công suất.", "Động năng.", "Thế năng."],
            "correct": 1,
            "explanation": "Công suất $P = A/t$ là tốc độ thực hiện công."
        },
        {
            "type": "multiple",
            "question": "Một vật có khối lượng m đang ở độ cao h so với mặt đất. Thế năng trọng trường của vật được tính bằng công thức:",
            "options": [
                "$W_t = m.g.h$",
                "$W_t = 1/2 m.v^2$",
                "$W_t = m.v.h$",
                "$W_t = m.g/h$"
            ],
            "correct": 0,
            "explanation": "Thế năng trọng trường tỉ lệ với khối lượng và độ cao."
        },
        {
            "type": "multiple",
            "question": "Khi một vật chuyển động ném ngang từ độ cao h, thời gian rơi của vật phụ thuộc vào yếu tố nào?",
            "options": [
                "Vận tốc ném ban đầu.",
                "Khối lượng của vật.",
                "Độ cao h từ điểm ném.",
                "Cả vận tốc và độ cao."
            ],
            "correct": 2,
            "explanation": "Thời gian rơi: $t = \\\\sqrt{2h/g}$. Nó chỉ phụ thuộc vào h và g."
        },
        {
            "type": "multiple",
            "question": "Đơn vị của công suất là:",
            "options": ["Jun (J).", "Niutơn (N).", "Oat (W).", "Mã lực (HP) và Oat (W)."],
            "correct": 3,
            "explanation": "Watt (W) là đơn vị SI, HP cũng thường dùng trong kỹ thuật."
        },
        {
            "type": "multiple",
            "question": "Lực đẩy Archimedes tác dụng lên vật nhúng trong chất lỏng có chiều như thế nào?",
            "options": ["Hướng sang ngang.", "Hướng thẳng đứng từ dưới lên.", "Hướng thẳng đứng từ trên xuống.", "Cùng chiều với trọng lực."],
            "correct": 1,
            "explanation": "Lực đẩy Archimedes luôn hướng ngược chiều với trọng lực."
        },
        {
            "type": "multiple",
            "question": "Một xe máy đang chạy với vận tốc 36 km/h thì hãm phanh chuyển động chậm dần đều. Sau 5s xe dừng hẳn. Gia tốc của xe là:",
            "options": ["$2 m/s^2$", "$-2 m/s^2$", "$7,2 m/s^2$", "$-7,2 m/s^2$"],
            "correct": 1,
            "explanation": "$v_0 = 10 m/s, v = 0, t = 5s \\\\Rightarrow a = (0 - 10) / 5 = -2 m/s^2$."
        },
        {
            "type": "multiple",
            "question": "Trong hệ đơn vị SI, các đơn vị nào sau đây là đơn vị cơ bản?",
            "options": [
                "m, kg, s.",
                "m, N, J.",
                "m/s, kg, W.",
                "km, g, h."
            ],
            "correct": 0,
            "explanation": "Mét (m), Kilôgam (kg), Giây (s) là 3 trong số 7 đơn vị cơ bản của hệ SI."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Xét các phát biểu sau về lực và chuyển động:",
            "options": [
                "Nếu không có lực tác dụng vào vật thì vật không thể chuyển động.",
                "Hợp lực của hai lực thành phần có độ lớn nằm trong khoảng từ hiệu đến tổng độ lớn hai lực đó.",
                "Trọng lực là lực hút của Trái Đất tác dụng lên vật, có điểm đặt tại trọng tâm của vật.",
                "Lực và phản lực luôn xuất hiện và mất đi đồng thời (Định luật III Newton)."
            ],
            "correct": [false, true, true, true],
            "explanation": "Vật vẫn có thể chuyển động thẳng đều nếu tổng hợp lực bằng 0 (quán tính)."
        },
        {
            "type": "truefalse",
            "question": "Về năng lượng và công:",
            "options": [
                "Công của lực ma sát luôn là công cản (công âm).",
                "Định luật bảo toàn cơ năng chỉ đúng khi vật chỉ chịu tác dụng của các lực phát động.",
                "Cơ năng của vật bằng tổng động năng và thế năng.",
                "Công suất của một động cơ cho biết khả năng làm việc của động cơ đó trong một đơn vị thời gian."
            ],
            "correct": [true, false, true, true],
            "explanation": "Định luật bảo toàn cơ năng đúng khi vật chỉ chịu tác dụng của lực thế (như trọng lực, lực đàn hồi)."
        },
        {
            "type": "truefalse",
            "question": "Về sai số trong đo lường vật lí:",
            "options": [
                "Sai số hệ thống là sai số có quy luật, có thể do dụng cụ đo không chính xác.",
                "Sai số ngẫu nhiên có thể được hạn chế bằng cách thực hiện phép đo nhiều lần.",
                "Giá trị trung bình của các lần đo được coi là giá trị thực của đại lượng cần đo.",
                "Cách viết kết quả đo đúng tiêu chuẩn là: $x = \\\\bar{x} \\\\pm \\\\Delta x$."
            ],
            "correct": [true, true, false, true],
            "explanation": "Giá trị trung bình chỉ là giá trị gần đúng nhất với giá trị thực."
        },
        {
            "type": "truefalse",
            "question": "Về chuyển động rơi tự do và ném ngang:",
            "options": [
                "Rơi tự do là chuyển động thẳng nhanh dần đều với gia tốc g.",
                "Vật ném ngang có quỹ đạo là một đường thẳng nằm ngang.",
                "Ở cùng một độ cao, vật ném ngang và vật rơi tự do sẽ chạm đất cùng lúc.",
                "Tầm xa của vật ném ngang tỉ lệ thuận với vận tốc ném ban đầu."
            ],
            "correct": [true, false, true, true],
            "explanation": "Vật ném ngang có quỹ đạo là một nhánh của đường parabol."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Tính động năng (J) của một vật có khối lượng 2kg đang chuyển động với vận tốc 5 m/s.",
            "correct": "25",
            "explanation": "$W_đ = 1/2 m.v^2 = 1/2 . 2 . 5^2 = 25$ J."
        },
        {
            "type": "short",
            "question": "Một người kéo một vật với lực 100N theo phương ngang đi được quãng đường 10m. Tính công (J) mà người đó đã thực hiện.",
            "correct": "1000",
            "explanation": "$A = F . s . \\\\cos 0 = 100 . 10 = 1000$ J."
        },
        {
            "type": "short",
            "question": "Tính gia tốc ($m/s^2$) của một vật khối lượng 5kg khi chịu tác dụng của lực hợp lực 20N.",
            "correct": "4",
            "explanation": "$a = F / m = 20 / 5 = 4 m/s^2$."
        },
        {
            "type": "short",
            "question": "Một vật rơi tự do từ độ cao 20m xuống đất. Lấy $g = 10 m/s^2$. Tính thời gian rơi (s) của vật.",
            "correct": "2",
            "explanation": "$t = \\\\sqrt{2h/g} = \\\\sqrt{2.20/10} = 2$ s."
        },
        {
            "type": "short",
            "question": "Xác định trọng lượng (N) của một vật có khối lượng 500g tại nơi có $g = 9,8 m/s^2$.",
            "correct": "4,9",
            "explanation": "$P = m.g = 0,5 . 9,8 = 4,9$ N."
        },
        {
            "type": "short",
            "question": "Tính hiệu suất (%) của một động cơ nếu công có ích là 800J và công toàn phần là 1000J.",
            "correct": "80",
            "explanation": "$H = (800 / 1000) . 100 = 80\\%$."
        }
    ]
};