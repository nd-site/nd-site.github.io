// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Ôn tập đầy đủ - Kiểm tra cuối Học kì I Vật lý 10 (2025)",
    config: {
        testDuration: 3600,
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
            question: "Trong thí nghiệm đo gia tốc rơi tự do, khi thả trụ thép rơi qua cổng quang điện trên máng đứng, để xác định gia tốc rơi tự do của trụ thép ta cần đo đại lượng:",
            options: [
                "Quãng đường rơi của trụ thép và vận tốc rơi.",
                "Quãng đường rơi của trụ thép và thời gian rơi.",
                "Vận tốc rơi của trụ thép và thời gian rơi.",
                "Quãng đường rơi và khối lượng của trụ thép."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Công thức xác định gia tốc rơi tự do là $$g = \\frac{2s}{t^2}$$. Do đó, ta cần đo quãng đường rơi $$s$$ và thời gian rơi $$t$$."
        },
        {
            type: "multiple",
            question: "Trong thực hành thí nghiệm đo gia tốc rơi tự do, thiết bị đồng hồ đo thời gian hiện số cần đặt ở chế độ (MODE) nào?",
            options: [
                "MODE A.",
                "MODE A ↔ B.",
                "MODE B.",
                "MODE T."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Chế độ A ↔ B cho phép đo khoảng thời gian từ khi vật đi qua cổng quang điện thứ nhất (A) đến khi đi qua cổng quang điện thứ hai (B)."
        },
        {
            type: "multiple",
            question: "Dụng cụ nào sau đây không có trong bộ thí nghiệm đo gia tốc rơi tự do?",
            options: [
                "Công tắc kép.",
                "Cổng quang điện.",
                "Máng đứng có gắn dây dọi.",
                "Cân điện tử."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Gia tốc rơi tự do không phụ thuộc vào khối lượng của vật nên không cần dùng cân điện tử trong thí nghiệm này."
        },
        {
            type: "multiple",
            question: "Trong chuyển động ném ngang, chuyển động của chất điểm là:",
            options: [
                "Chuyển động thẳng đều.",
                "Chuyển động thẳng biến đổi đều.",
                "Chuyển động rơi tự do.",
                "Chuyển động thẳng đều theo phương ngang và rơi tự do theo phương thẳng đứng."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Chuyển động ném ngang là sự tổng hợp của hai chuyển động thành phần: theo trục Ox (ngang) là chuyển động thẳng đều, theo trục Oy (thẳng đứng hướng xuống) là chuyển động rơi tự do."
        },
        {
            type: "multiple",
            question: "Công thức tính thời gian chuyển động của vật ném ngang từ độ cao $$h$$ cho đến khi chạm đất là:",
            options: [
                "$$t = \\sqrt{\\frac{2h}{g}}$$",
                "$$t = \\sqrt{\\frac{h}{2g}}$$",
                "$$t = \\sqrt{\\frac{h}{g}}$$",
                "$$t = \\sqrt{2hg}$$"
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Dựa vào phương trình chuyển động theo phương thẳng đứng: $$y = \\frac{1}{2}gt^2$$. Khi chạm đất $$y = h \\Rightarrow t = \\sqrt{\\frac{2h}{g}}$$."
        },
        {
            type: "multiple",
            question: "Tầm bay xa của vật ($$L$$) theo phương ngang được tính theo biểu thức nào?",
            options: [
                "$$L = v_0 \\sqrt{2gh}$$",
                "$$L = v_0 \\sqrt{\\frac{h}{g}}$$",
                "$$L = v_0 \\sqrt{\\frac{2h}{g}}$$",
                "$$L = v_0 \\frac{h}{2g}$$"
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Tầm xa $$L = x_{max} = v_0 \\cdot t$$. Thay $$t = \\sqrt{\\frac{2h}{g}}$$ vào ta được $$L = v_0 \\sqrt{\\frac{2h}{g}}$$."
        },
        {
            type: "multiple",
            question: "Khi một xe buýt đang di chuyển với vận tốc không đổi và tài xế phanh gấp, hành khách trên xe sẽ:",
            options: [
                "Chúi người về phía trước.",
                "Ngả người về phía sau.",
                "Nghiêng người sang trái.",
                "Nghiêng người sang phải."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Do quán tính, khi xe dừng đột ngột, thân người vẫn có xu hướng duy trì vận tốc cũ nên bị đẩy về phía trước."
        },
        {
            type: "multiple",
            question: "Khi một vật đứng yên và không có lực tác dụng hoặc chịu các lực tác dụng có hợp lực bằng không, vật sẽ:",
            options: [
                "Tiếp tục đứng yên.",
                "Chuyển động thẳng đều.",
                "Chuyển động nhanh dần.",
                "Chuyển động chậm dần."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Theo Định luật I Newton, nếu một vật đang đứng yên mà không chịu tác dụng của lực nào (hoặc các lực cân bằng) thì nó sẽ tiếp tục đứng yên."
        },
        {
            type: "multiple",
            question: "Định luật I Newton thường được gọi là:",
            options: [
                "Định luật quán tính.",
                "Định luật bảo toàn năng lượng.",
                "Định luật lực và gia tốc.",
                "Định luật vạn vật hấp dẫn."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Định luật I Newton khẳng định mọi vật đều có tính lười thay đổi trạng thái chuyển động, gọi là quán tính."
        },
        {
            type: "multiple",
            question: "Một vật có khối lượng lớn hơn sẽ có quán tính như thế nào so với vật có khối lượng nhỏ hơn?",
            options: [
                "Quán tính lớn hơn.",
                "Quán tính nhỏ hơn.",
                "Quán tính bằng nhau.",
                "Không có quán tính."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Khối lượng là đại lượng đặc trưng cho mức quán tính của vật. Khối lượng càng lớn thì quán tính càng lớn."
        },
        {
            type: "multiple",
            question: "Đại lượng đặc trưng cho mức quán tính của một vật là:",
            options: [
                "Trọng lượng.",
                "Khối lượng.",
                "Vận tốc.",
                "Lực."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Khối lượng là đại lượng đặc trưng cho quán tính."
        },
        {
            type: "multiple",
            question: "Nếu một vật đang chuyển động thẳng đều mà tất cả các lực tác dụng vào nó bỗng nhiên mất đi thì:",
            options: [
                "Vật lập tức dừng lại.",
                "Vật chuyển động chậm dần rồi dừng lại.",
                "Vật chuyển động chậm dần rồi sau đó chuyển động thẳng đều.",
                "Vật chuyển động thẳng đều."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Theo Định luật I Newton, vật đang chuyển động sẽ tiếp tục chuyển động thẳng đều nếu hợp lực tác dụng bằng không."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Tại sao bắt buộc người lái xe và người ngồi trong xe ô tô phải thắt dây an toàn?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Để người ngồi không bị rung khi chạy xe.",
                "Để không bị nghiêng khi xe rẽ.",
                "Để khỏi bị xô về phía trước khi xe đang chạy bình thường.",
                "Để khi dừng lại đột ngột, người không bị xô về phía trước do quán tính, tránh va chạm."
            ],
            correct: [
                false,
                false,
                false,
                true
            ],
            explanation: "Đáp án D. Khi xe dừng đột ngột, do quán tính người ngồi sẽ bị lao về phía trước. Dây an toàn giúp giữ người lại, bảo vệ khỏi va đập."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Tại sao vận động viên nhảy xa phải tập thêm chạy nhanh trước khi dậm nhảy?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Do cơ thể không có quán tính.",
                "Để tăng sức bật khi dậm nhảy.",
                "Để tạo quán tính khi nhảy.",
                "Để làm giảm vận tốc khi bật nhảy."
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Đáp án C. Chạy lấy đà giúp vận động viên có vận tốc lớn, từ đó có quán tính lớn để khi rời mặt đất có thể bay xa hơn."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Một xe tải lớn và một xe đạp di chuyển cùng vận tốc. Nếu phanh gấp cùng lúc, xe nào dừng lại trước?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Xe tải, vì có trọng lượng lớn hơn.",
                "Xe đạp, vì có khối lượng nhỏ hơn.",
                "Cả hai dừng lại cùng lúc.",
                "Xe tải, vì diện tích tiếp xúc lớn hơn."
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Đáp án B. Xe đạp có khối lượng nhỏ hơn nên quán tính nhỏ hơn, dễ dàng thay đổi vận tốc (dừng lại) nhanh hơn xe tải."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Một quả bóng lăn trên mặt phẳng nhẵn và dừng lại sau một khoảng thời gian. Lý do là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Lực hấp dẫn.",
                "Quả bóng mất năng lượng.",
                "Lực ma sát.",
                "Không còn lực đẩy."
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Đáp án C. Lực ma sát giữa bóng và mặt sàn đóng vai trò lực cản làm thay đổi vận tốc của bóng."
        },
        {
            type: "short",
            question: "Một hộp hàng trên sàn xe tải, khi xe đột ngột tăng tốc thì hộp hàng: (Lưu ý: Đáp án đúng gốc là \"Trượt về phía sau.\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "",
            explanation: "Đáp án B. Theo quán tính, hộp hàng muốn duy trì trạng thái đứng yên cũ nên khi sàn xe lao về phía trước, hộp hàng có xu hướng tụt lại phía sau."
        },
        {
            type: "short",
            question: "Hiện tượng nào sau đây không thể hiện tính quán tính? (Lưu ý: Đáp án đúng gốc là \"Viên bi khối lượng lớn lăn nhanh hơn viên bi khối lượng nhỏ xuống máng nghiêng.\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "",
            explanation: "Đáp án B. Việc lăn nhanh hay chậm xuống máng nghiêng phụ thuộc vào gia tốc (liên quan định luật II), không phải ví dụ điển hình của quán tính."
        },
        {
            type: "short",
            question: "Theo Định luật III Newton, lực và phản lực là cặp lực: (Lưu ý: Đáp án đúng gốc là \"Xuất hiện và mất đi đồng thời.\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "",
            explanation: "Đáp án D. Lực và phản lực luôn xuất hiện đồng thời, mất đi đồng thời, cùng giá trị, ngược chiều nhưng đặt vào hai vật khác nhau."
        },
        {
            type: "short",
            question: "Cặp 'lực và phản lực' trong Định luật III Newton: (Lưu ý: Đáp án đúng gốc là \"Cùng bản chất.\". Hãy nhập số hoặc giá trị thích hợp)",
            correct: "",
            explanation: "Đáp án B. Đặc điểm quan trọng là chúng phải cùng bản chất (ví dụ cùng là lực đàn hồi, lực hấp dẫn...)."
        }
    ]
};
