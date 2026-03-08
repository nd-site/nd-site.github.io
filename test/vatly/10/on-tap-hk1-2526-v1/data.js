// data.js - ĐỀ CƯƠNG ÔN TẬP KIỂM TRA CUỐI HỌC KÌ I - VẬT LÝ 10 (Năm học 2025)
// Bao gồm đầy đủ câu hỏi từ tài liệu: Thực hành đo g, Chuyển động ném, ĐL I, ĐL III Newton, Trọng lực & Lực căng, Lực ma sát

window.quizData = {
    title: "Ôn tập đầy đủ - Kiểm tra cuối Học kì I Vật lý 10 (2025)",
    config: {
        testDuration: 3600 // 60 phút - phù hợp kiểm tra đầy đủ
    },
    questions: [
        // BÀI 11: THỰC HÀNH ĐO GIA TỐC RƠI TỰ DO
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

        // BÀI 12: CHUYỂN ĐỘNG NÉM
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

        // BÀI 14: ĐỊNH LUẬT I NEWTON
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
            type: "multiple",
            question: "Tại sao bắt buộc người lái xe và người ngồi trong xe ô tô phải thắt dây an toàn?",
            options: [
                "Để người ngồi không bị rung khi chạy xe.",
                "Để không bị nghiêng khi xe rẽ.",
                "Để khỏi bị xô về phía trước khi xe đang chạy bình thường.",
                "Để khi dừng lại đột ngột, người không bị xô về phía trước do quán tính, tránh va chạm."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Khi xe dừng đột ngột, do quán tính người ngồi sẽ bị lao về phía trước. Dây an toàn giúp giữ người lại, bảo vệ khỏi va đập."
        },
        {
            type: "multiple",
            question: "Tại sao vận động viên nhảy xa phải tập thêm chạy nhanh trước khi dậm nhảy?",
            options: [
                "Do cơ thể không có quán tính.",
                "Để tăng sức bật khi dậm nhảy.",
                "Để tạo quán tính khi nhảy.",
                "Để làm giảm vận tốc khi bật nhảy."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Chạy lấy đà giúp vận động viên có vận tốc lớn, từ đó có quán tính lớn để khi rời mặt đất có thể bay xa hơn."
        },
        {
            type: "multiple",
            question: "Một xe tải lớn và một xe đạp di chuyển cùng vận tốc. Nếu phanh gấp cùng lúc, xe nào dừng lại trước?",
            options: [
                "Xe tải, vì có trọng lượng lớn hơn.",
                "Xe đạp, vì có khối lượng nhỏ hơn.",
                "Cả hai dừng lại cùng lúc.",
                "Xe tải, vì diện tích tiếp xúc lớn hơn."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Xe đạp có khối lượng nhỏ hơn nên quán tính nhỏ hơn, dễ dàng thay đổi vận tốc (dừng lại) nhanh hơn xe tải."
        },
        {
            type: "multiple",
            question: "Một quả bóng lăn trên mặt phẳng nhẵn và dừng lại sau một khoảng thời gian. Lý do là:",
            options: [
                "Lực hấp dẫn.",
                "Quả bóng mất năng lượng.",
                "Lực ma sát.",
                "Không còn lực đẩy."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Lực ma sát giữa bóng và mặt sàn đóng vai trò lực cản làm thay đổi vận tốc của bóng."
        },
        {
            type: "multiple",
            question: "Một hộp hàng trên sàn xe tải, khi xe đột ngột tăng tốc thì hộp hàng:",
            options: [
                "Trượt về phía trước.",
                "Trượt về phía sau.",
                "Giữ nguyên vị trí so với sàn xe.",
                "Bị văng lên cao."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Theo quán tính, hộp hàng muốn duy trì trạng thái đứng yên cũ nên khi sàn xe lao về phía trước, hộp hàng có xu hướng tụt lại phía sau."
        },
        {
            type: "multiple",
            question: "Hiện tượng nào sau đây không thể hiện tính quán tính?",
            options: [
                "Vẫy mực để mực văng ra khỏi bút bị tắc.",
                "Viên bi khối lượng lớn lăn nhanh hơn viên bi khối lượng nhỏ xuống máng nghiêng.",
                "Ô tô tắt máy vẫn chạy thêm một đoạn.",
                "Người trên xe buýt ngã về trước khi xe hãm phanh."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Việc lăn nhanh hay chậm xuống máng nghiêng phụ thuộc vào gia tốc (liên quan định luật II), không phải ví dụ điển hình của quán tính."
        },

        // BÀI 16: ĐỊNH LUẬT III NEWTON
        {
            type: "multiple",
            question: "Theo Định luật III Newton, lực và phản lực là cặp lực:",
            options: [
                "Cân bằng.",
                "Có cùng điểm đặt.",
                "Cùng phương, cùng chiều và cùng độ lớn.",
                "Xuất hiện và mất đi đồng thời."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Lực và phản lực luôn xuất hiện đồng thời, mất đi đồng thời, cùng giá trị, ngược chiều nhưng đặt vào hai vật khác nhau."
        },
        {
            type: "multiple",
            question: "Cặp 'lực và phản lực' trong Định luật III Newton:",
            options: [
                "Không cùng bản chất.",
                "Cùng bản chất.",
                "Tác dụng vào cùng một vật.",
                "Bằng nhau về độ lớn nhưng không cùng giá."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Đặc điểm quan trọng là chúng phải cùng bản chất (ví dụ cùng là lực đàn hồi, lực hấp dẫn...)."
        },
        {
            type: "multiple",
            question: "Khi một con ngựa kéo xe, lực làm ngựa chuyển động về phía trước là:",
            options: [
                "Lực ngựa tác dụng vào xe.",
                "Lực xe tác dụng vào ngựa.",
                "Lực ngựa tác dụng vào mặt đất.",
                "Lực mặt đất tác dụng vào ngựa."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Ngựa đạp vào đất một lực hướng ra sau, theo định luật III, đất đẩy lại chân ngựa một lực hướng về phía trước."
        },
        {
            type: "multiple",
            question: "Một trái bóng bàn bay đến đập vào tường và bật ngược trở lại thì:",
            options: [
                "Lực bóng nhỏ hơn lực tường.",
                "Lực bóng bằng lực tường.",
                "Lực bóng lớn hơn lực tường.",
                "Lực bóng cùng hướng với lực tường."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Theo định luật III Newton, lực tác dụng và phản lực luôn bằng nhau về độ lớn."
        },
        {
            type: "multiple",
            question: "Ô tô tải va chạm với ô tô con chạy ngược chiều. Xe nào chịu lực lớn hơn? Xe nào nhận gia tốc lớn hơn?",
            options: [
                "Hai ô tô chịu lực bằng nhau, ô tô con nhận gia tốc lớn hơn.",
                "Hai ô tô chịu lực bằng nhau, ô tô con nhận gia tốc nhỏ hơn.",
                "Ô tô con chịu lực lớn hơn, hai ô tô cùng gia tốc.",
                "Ô tô con chịu lực nhỏ hơn, hai ô tô cùng gia tốc."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Lực va chạm bằng nhau (Định luật III). Vì $$a = \\frac{F}{m}$$, xe con có khối lượng nhỏ hơn nên nhận gia tốc lớn hơn."
        },
        {
            type: "multiple",
            question: "Một người xách túi thức ăn với lực 40 N hướng lên. Phản lực của túi tác dụng lên tay là:",
            options: [
                "50 N, hướng lên.",
                "40 N, hướng xuống dưới.",
                "50 N, hướng xuống dưới.",
                "40 N, hướng lên trên."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Phản lực cùng độ lớn (40 N) nhưng ngược chiều (người kéo lên thì túi kéo xuống)."
        },

        // BÀI 17: TRỌNG LỰC VÀ LỰC CĂNG
        {
            type: "multiple",
            question: "Một vật khối lượng m đặt ở nơi có gia tốc g. Phát biểu nào sau đây sai?",
            options: [
                "Trọng lực có độ lớn P = mg.",
                "Điểm đặt của trọng lực là trọng tâm của vật.",
                "Trọng lực tỉ lệ nghịch với khối lượng của vật.",
                "Trọng lực là lực hút của Trái Đất tác dụng lên vật."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Theo công thức P = mg, trọng lực tỉ lệ thuận với khối lượng."
        },
        {
            type: "multiple",
            question: "Một vật nằm yên trên mặt đất, lực hấp dẫn do Trái Đất tác dụng vào vật có độ lớn:",
            options: [
                "Lớn hơn trọng lượng.",
                "Nhỏ hơn trọng lượng.",
                "Bằng trọng lượng.",
                "Bằng 0."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Trọng lượng chính là độ lớn của trọng lực (lực hấp dẫn của Trái Đất gần mặt đất)."
        },
        {
            type: "multiple",
            question: "Khi vật treo trên sợi dây nhẹ cân bằng thì trọng lực:",
            options: [
                "Cùng hướng với lực căng dây.",
                "Cân bằng với lực căng dây.",
                "Hợp với lực căng dây góc 90°.",
                "Bằng không."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Vật cân bằng nên hợp lực bằng 0 ⇒ P + T = 0 ⇒ P = T và ngược chiều."
        },
        {
            type: "multiple",
            question: "Một vật nằm yên trên mặt bàn ngang. P là trọng lực, N là phản lực bàn. Nhận xét nào sai?",
            options: [
                "P và N là cặp lực cân bằng.",
                "P và N có độ lớn bằng nhau.",
                "P và N cùng chiều.",
                "P và N cùng phương ngược chiều."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Hai lực này cân bằng nên phải ngược chiều nhau."
        },
        {
            type: "multiple",
            question: "Vật 200 g (0,2 kg) treo cân bằng. Lấy g = 9,8 m/s². Lực căng dây là:",
            options: [
                "1,96 N.",
                "19,6 N.",
                "16,9 N.",
                "1,69 N."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. T = P = m·g = 0,2 · 9,8 = 1,96 N."
        },
        {
            type: "multiple",
            question: "Vật 4 kg treo đứng yên. Lấy g = 9,8 m/s². Lực căng dây là:",
            options: [
                "2,45 N.",
                "39,2 N.",
                "3,92 N.",
                "24,5 N."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. T = P = 4 · 9,8 = 39,2 N."
        },

        // BÀI 18: LỰC MA SÁT
        {
            type: "multiple",
            question: "Vật trượt có ma sát trên mặt ngang. Vận tốc tăng 2 lần thì lực ma sát trượt:",
            options: [
                "Tăng 2 lần.",
                "Tăng 4 lần.",
                "Giảm 2 lần.",
                "Không đổi."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Lực ma sát trượt không phụ thuộc vận tốc."
        },
        {
            type: "multiple",
            question: "Vật dừng lại sau khi trượt một đoạn là vì:",
            options: [
                "Quán tính.",
                "Lực ma sát.",
                "Phản lực.",
                "Trọng lực."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B."
        },
        {
            type: "multiple",
            question: "Chọn hệ thức đúng của lực ma sát trượt:",
            options: [
                "$$F_{mst} = N \\cdot \\mu_t$$",
                "$$F_{mst} = \\mu_t \\cdot N^2$$",
                "$$F_{mst} = \\mu_t^2 \\cdot N$$",
                "$$F_{mst} = \\mu_t \\cdot N$$"
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Công thức chuẩn: $$F_{mst} = \\mu_t \\cdot N$$ (lực pháp tuyến)."
        },
        {
            type: "multiple",
            question: "Tình huống nào lực ma sát xuất hiện có hại?",
            options: [
                "Viết bảng.",
                "Đi bộ trên đường nhựa.",
                "Mài dao.",
                "Trong ổ trục xe khi chuyển động."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Ma sát trong ổ trục làm hao tổn năng lượng, gây hại."
        },
        {
            type: "multiple",
            question: "Nhận định nào sau đây sai?",
            options: [
                "Hệ số ma sát trượt phụ thuộc bản chất vật liệu.",
                "Hệ số ma sát trượt phụ thuộc tình trạng bề mặt.",
                "Hệ số ma sát trượt phụ thuộc áp lực.",
                "Lực ma sát trượt tỉ lệ thuận với áp lực."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Hệ số ma sát trượt không phụ thuộc áp lực (lực pháp tuyến)."
        },
        {
            type: "multiple",
            question: "Khi vật nằm cân bằng dưới tác dụng của ngoại lực thì chiều của lực ma sát nghỉ:",
            options: [
                "Ngược chiều vận tốc.",
                "Ngược chiều gia tốc.",
                "Ngược chiều thành phần ngoại lực song song mặt tiếp xúc.",
                "Vuông góc mặt tiếp xúc."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Lực ma sát nghỉ có chiều ngược với xu hướng trượt (ngược thành phần ngoại lực song song)."
        }
    ]
};