// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Không có trả lời ngắn (MCQ, TF, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Công nghệ 10 (Thiết kế và Công nghệ) 2025-2026",
    config: {
        testDuration: 2700,
        examLayout: {
            multiple: {
                count: 12,
                pointsPerQ: 0.25
            },
            truefalse: {
                count: 4,
                pointsPerQ: 1,
                partialScoring: [
                    0.1,
                    0.25,
                    0.5,
                    1
                ]
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
            question: "Hình chiếu trục đo là hình biểu diễn được xây dựng bằng phép chiếu nào?",
            options: [
                "Phép chiếu xuyên tâm",
                "Phép chiếu song song",
                "Phép chiếu vuông góc (lên một mặt phẳng tọa độ)",
                "Phép chiếu phối cảnh"
            ],
            correct: 1,
            explanation: "Hình chiếu trục đo dùng phép chiếu song song để chiếu vật thể cùng hệ trục tọa độ vuông góc lên một mặt phẳng (mặt phẳng hình chiếu)."
        },
        {
            type: "multiple",
            question: "Đặc điểm chính của hình chiếu trục đo là gì?",
            options: [
                "Chỉ thể hiện được một mặt của vật thể",
                "Thể hiện đồng thời 3 chiều (chiều dài, chiều rộng, chiều cao) của vật thể trên cùng một mặt phẳng",
                "Cho hình ảnh giống hệt như mắt người nhìn trong thực tế (có tụ điểm)",
                "Không có tỉ lệ biến dạng"
            ],
            correct: 1,
            explanation: "Hình chiếu trục đo là hình biểu diễn không gian 3 chiều của vật thể, giúp người đọc dễ hình dung hình dáng vật thể."
        },
        {
            type: "multiple",
            question: "Trong hình chiếu trục đo vuông góc đều, góc giữa các trục đo (x'O'y', y'O'z', z'O'x') bằng bao nhiêu?",
            options: [
                "90 độ",
                "120 độ",
                "135 độ",
                "180 độ"
            ],
            correct: 1,
            explanation: "HCTĐ vuông góc đều có 3 góc trục đo bằng nhau và bằng 120 độ."
        },
        {
            type: "multiple",
            question: "Trong hình chiếu trục đo vuông góc đều, hệ số biến dạng theo các trục (p, q, r) có đặc điểm gì?",
            options: [
                "p = q = r = 1",
                "p = r = 1; q = 0.5",
                "p = 0.5; q = r = 1",
                "p = q = r = 0.5"
            ],
            correct: 0,
            explanation: "Trong HCTĐ vuông góc đều, để thuận tiện cho việc vẽ, người ta quy ước lấy hệ số biến dạng p = q = r = 1."
        },
        {
            type: "multiple",
            question: "Trong hình chiếu trục đo xiên góc cân, góc trục đo x'O'z' bằng bao nhiêu?",
            options: [
                "90 độ",
                "120 độ",
                "135 độ",
                "45 độ"
            ],
            correct: 0,
            explanation: "HCTĐ xiên góc cân có mặt phẳng tọa độ xOz song song với mặt phẳng hình chiếu nên góc x'O'z' = 90 độ."
        },
        {
            type: "multiple",
            question: "Trong hình chiếu trục đo xiên góc cân, hệ số biến dạng theo trục O'y' (trục chiều rộng) là bao nhiêu?",
            options: [
                "p = 1",
                "q = 0.5",
                "q = 1",
                "r = 0.5"
            ],
            correct: 1,
            explanation: "HCTĐ xiên góc cân có p = r = 1 (trục x', z') và q = 0.5 (trục y')."
        },
        {
            type: "multiple",
            question: "Nội dung của một bản vẽ chi tiết bao gồm những phần nào?",
            options: [
                "Hình biểu diễn, kích thước, yêu cầu kĩ thuật, khung tên",
                "Hình chiếu đứng, hình chiếu bằng, hình chiếu cạnh",
                "Bảng kê, hình biểu diễn, khung tên",
                "Hình cắt, mặt cắt, kích thước"
            ],
            correct: 0,
            explanation: "Bản vẽ chi tiết gồm 4 nội dung chính: Khung tên, Hình biểu diễn, Kích thước, Yêu cầu kĩ thuật."
        },
        {
            type: "multiple",
            question: "Công dụng của bản vẽ chi tiết là gì?",
            options: [
                "Dùng để lắp ráp các chi tiết thành cụm máy",
                "Dùng để chế tạo và kiểm tra chi tiết",
                "Dùng để giới thiệu sản phẩm cho khách hàng",
                "Dùng để thi công xây dựng công trình"
            ],
            correct: 1,
            explanation: "Bản vẽ chi tiết là tài liệu kĩ thuật thể hiện hình dáng, kích thước, vật liệu, độ nhám bề mặt... dùng để chế tạo và kiểm tra chi tiết đó."
        },
        {
            type: "multiple",
            question: "Trình tự đọc một bản vẽ chi tiết đúng nhất là:",
            options: [
                "Khung tên → Kích thước → Hình biểu diễn → Yêu cầu kĩ thuật",
                "Hình biểu diễn → Khung tên → Kích thước → Yêu cầu kĩ thuật",
                "Khung tên → Hình biểu diễn → Kích thước → Yêu cầu kĩ thuật",
                "Yêu cầu kĩ thuật → Khung tên → Hình biểu diễn → Kích thước"
            ],
            correct: 2,
            explanation: "Bước 1: Đọc khung tên để biết tên chi tiết, vật liệu, tỉ lệ. Bước 2: Hình biểu diễn. Bước 3: Kích thước. Bước 4: Yêu cầu kĩ thuật."
        },
        {
            type: "multiple",
            question: "Trên bản vẽ chi tiết, ghi chú 'Làm sạch bavia' hoặc 'Mạ kẽm' thường nằm ở phần nào?",
            options: [
                "Khung tên",
                "Hình biểu diễn",
                "Kích thước",
                "Yêu cầu kĩ thuật"
            ],
            correct: 3,
            explanation: "Các chỉ dẫn về gia công, xử lí bề mặt, nhiệt luyện... được ghi ở phần Yêu cầu kĩ thuật."
        },
        {
            type: "multiple",
            question: "Bản vẽ lắp khác bản vẽ chi tiết ở điểm nổi bật nào?",
            options: [
                "Bản vẽ lắp không có hình biểu diễn",
                "Bản vẽ lắp có bảng kê các chi tiết",
                "Bản vẽ lắp không có khung tên",
                "Bản vẽ lắp chỉ vẽ bằng hình chiếu trục đo"
            ],
            correct: 1,
            explanation: "Nội dung bản vẽ lắp gồm: Hình biểu diễn, Kích thước, Bảng kê, Khung tên. Bảng kê liệt kê số lượng, tên gọi các chi tiết để lắp ráp."
        },
        {
            type: "multiple",
            question: "Công dụng chính của bản vẽ lắp là gì?",
            options: [
                "Dùng để chế tạo từng chi tiết máy",
                "Dùng để lắp ráp các chi tiết thành sản phẩm và hướng dẫn sử dụng",
                "Dùng để thiết kế kết cấu nhà cửa",
                "Dùng để kiểm tra độ cứng của vật liệu"
            ],
            correct: 1,
            explanation: "Bản vẽ lắp thể hiện vị trí, quan hệ lắp ghép giữa các chi tiết, dùng làm tài liệu kĩ thuật cho quá trình lắp ráp."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Trên bản vẽ lắp, các kích thước nào thường được ghi?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Tất cả các kích thước của từng chi tiết nhỏ nhất",
                "Kích thước chung (dài, rộng, cao lớn nhất), kích thước lắp ráp và kích thước lắp đặt",
                "Chỉ ghi kích thước đường kính lỗ",
                "Không ghi bất kì kích thước nào"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Bản vẽ lắp không ghi mọi kích thước, chỉ ghi kích thước choán chỗ (chung), kích thước khoảng cách giữa các chi tiết (lắp ráp)."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Để đánh số vị trí các chi tiết trên bản vẽ lắp, người ta dùng:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Chữ cái A, B, C...",
                "Đường dóng và đường dẫn có vẽ dấu chấm ở đầu, cuối đường dẫn ghi số thứ tự",
                "Vẽ mũi tên chỉ thẳng vào hình chiếu",
                "Tô màu khác nhau cho từng chi tiết"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Đánh số chi tiết dùng đường dẫn (kẻ từ chi tiết ra ngoài), đầu có dấu chấm đen, cuối đường dẫn ghi số thứ tự tương ứng với bảng kê."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Trình tự đọc bản vẽ lắp đúng nhất là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Khung tên → Bảng kê → Hình biểu diễn → Kích thước → Phân tích chi tiết → Tổng hợp",
                "Hình biểu diễn → Bảng kê → Khung tên → Kích thước",
                "Khung tên → Phân tích chi tiết → Bảng kê → Hình biểu diễn",
                "Bảng kê → Hình biểu diễn → Khung tên → Kích thước"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Đọc theo thứ tự: Khung tên (tên cụm lắp) -> Bảng kê (có những chi tiết gì) -> Hình biểu diễn -> Kích thước -> Phân tích (vị trí lắp) -> Tổng hợp."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Bản vẽ xây dựng chủ yếu bao gồm những bản vẽ nào?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Bản vẽ chi tiết và bản vẽ lắp",
                "Bản vẽ quy hoạch, bản vẽ kiến trúc, bản vẽ kết cấu, hệ thống điện nước...",
                "Bản vẽ hình chiếu trục đo vuông góc đều",
                "Bản vẽ trải vật thể"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Bản vẽ xây dựng là tài liệu kĩ thuật dùng trong thiết kế, thi công các công trình xây dựng (nhà, cầu đường...)."
        },
        {
            type: "essay",
            question: "Trình bày sự khác nhau cơ bản giữa Hình chiếu trục đo vuông góc đều và Hình chiếu trục đo xiên góc cân (về góc trục đo và hệ số biến dạng). Ứng dụng của chúng?",
            suggested: "1. Hình chiếu trục đo vuông góc đều:\n- Góc trục đo: x'O'y' = y'O'z' = z'O'x' = 120 độ.\n- Hệ số biến dạng: p = q = r = 1.\n- Ứng dụng: Hình biểu diễn cân đối, thường dùng vẽ các vật thể có các mặt đều nhau.\n\n2. Hình chiếu trục đo xiên góc cân:\n- Góc trục đo: x'O'z' = 90 độ; x'O'y' = y'O'z' = 135 độ.\n- Hệ số biến dạng: p = r = 1; q = 0.5 (trục y' bị thu nhỏ một nửa).\n- Ứng dụng: Dùng khi vật thể có nhiều vòng tròn ở mặt trước (mặt xOz), vì khi đó hình tròn trên mặt xOz không bị biến dạng thành elip, dễ vẽ bằng compa.",
            points: 25,
            explanation: "AI chấm: Phân biệt đúng góc trục đo (10đ) và hệ số biến dạng (10đ) của hai loại. Nêu được ưu điểm vẽ đường tròn mặt trước của xiên góc cân (5đ)."
        },
        {
            type: "essay",
            question: "Bản vẽ nhà là gì? Kể tên và trình bày khái quát nội dung của 3 hình biểu diễn chính trên bản vẽ nhà (mặt bằng, mặt đứng, mặt cắt).",
            suggested: "1. Khái niệm: Bản vẽ nhà là tài liệu kĩ thuật thể hiện hình dáng, kích thước, cấu tạo của ngôi nhà, dùng để thi công xây dựng.\n2. Ba hình biểu diễn chính:\n- Mặt bằng: Là hình cắt bằng (cắt ngang nhà cách mặt sàn khoảng 1.5m). Thể hiện vị trí tường, vách ngăn, cửa đi, cửa sổ, kích thước các phòng... Đây là hình quan trọng nhất.\n- Mặt đứng: Là hình chiếu vuông góc mặt ngoài ngôi nhà lên mặt phẳng thẳng đứng. Thể hiện hình dáng bên ngoài, kiến trúc, vẻ đẹp mặt tiền.\n- Mặt cắt: Là hình cắt tạo bởi mặt phẳng cắt thẳng đứng (vuông góc mặt đất) cắt qua các phần chính yếu (cầu thang, cửa sổ). Thể hiện chiều cao các tầng, cấu tạo sàn, móng, mái nhà.",
            points: 25,
            explanation: "AI chấm: Nêu đúng khái niệm bản vẽ nhà (5đ). Giải thích đúng và đủ chức năng của Mặt bằng (8đ), Mặt đứng (6đ) và Mặt cắt (6đ)."
        },
        {
            type: "essay",
            question: "Cho một bản vẽ chi tiết cơ khí ghi tỉ lệ 1:5. Trên bản vẽ, chiều dài của một trục đo được là 40 mm. Hỏi chiều dài thật của trục đó ngoài thực tế là bao nhiêu mm? Nêu ý nghĩa của việc ghi kích thước trên bản vẽ chi tiết.",
            suggested: "1. Tính toán:\n- Tỉ lệ 1:5 nghĩa là kích thước vẽ nhỏ gấp 5 lần kích thước thật ngoài đời.\n- Kích thước đo trên giấy = 40 mm.\n- Chiều dài thật = 40 mm × 5 = 200 mm.\n*(Tuy nhiên, cần lưu ý: Con số kích thước ghi trên bản vẽ LUÔN LUÔN là kích thước thật của vật thể, không phụ thuộc vào tỉ lệ vẽ. Nếu đề hỏi 'Con số ghi trên bản vẽ là bao nhiêu' thì đáp án là 200).* \n\n2. Ý nghĩa của ghi kích thước:\n- Kích thước ghi trên bản vẽ là căn cứ duy nhất để người thợ gia công, chế tạo chi tiết đúng với yêu cầu thiết kế.\n- Giúp người kiểm tra (KCS) dùng dụng cụ đo để kiểm tra sản phẩm xem có đạt yêu cầu hay không.",
            points: 25,
            explanation: "AI chấm: Tính toán đúng chiều dài thật (200mm) hoặc giải thích hiểu đúng tỉ lệ 1:5 (15đ). Nêu được ý nghĩa để chế tạo và kiểm tra sản phẩm (10đ)."
        }
    ]
};
