window.quizData = {
    "title": "Kiểm tra Cuối Học Kì I – Công nghệ 12 (KNTT) – 2025-2026",
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
            "question": "Hệ thống điện quốc gia bao gồm các thành phần chính nào?",
            "options": [
                "Nguồn điện và các hộ tiêu thụ.",
                "Nguồn điện, lưới điện và các hộ tiêu thụ điện trên toàn quốc.",
                "Các nhà máy nhiệt điện và thủy điện.",
                "Chỉ bao gồm các đường dây truyền tải điện cao thế."
            ],
            "correct": 1,
            "explanation": "Hệ thống điện quốc gia là một thể thống nhất thực hiện việc sản xuất, truyền tải, phân phối và tiêu thụ điện."
        },
        {
            "type": "multiple",
            "question": "Lưới điện truyền tải ở Việt Nam hiện nay có cấp điện áp cao nhất là bao nhiêu?",
            "options": ["110 kV.", "220 kV.", "500 kV.", "800 kV."],
            "correct": 2,
            "explanation": "Đường dây 500 kV Bắc - Nam là trục xương sống của hệ thống điện truyền tải quốc gia."
        },
        {
            "type": "multiple",
            "question": "Mục đích của việc nâng cao điện áp trước khi truyền tải điện năng đi xa là:",
            "options": [
                "Để dòng điện chạy nhanh hơn.",
                "Để giảm hao tổn điện năng trên đường dây truyền tải.",
                "Để tăng cường công suất của nhà máy điện.",
                "Để bảo vệ an toàn cho người dân sống gần đường dây."
            ],
            "correct": 1,
            "explanation": "Theo công thức tính hao phí $P_{hp} = R.P^2/U^2$, tăng $U$ sẽ giảm $P_{hp}$ đáng kể."
        },
        {
            "type": "multiple",
            "question": "Linh kiện điện tử nào dùng để hạn chế dòng điện và phân chia điện áp trong mạch?",
            "options": ["Tụ điện.", "Điện trở.", "Cuộn cảm.", "Diode."],
            "correct": 1,
            "explanation": "Điện trở có đặc tính cản trở dòng điện, tuân theo định luật Ohm."
        },
        {
            "type": "multiple",
            "question": "Trị số của điện trở được xác định bằng các vòng màu. Vòng màu thứ nhất là Đỏ, thứ hai là Đỏ, thứ ba là Nâu, thứ tư là Kim nhũ. Trị số điện trở là:",
            "options": ["22 Ohm.", "220 Ohm.", "2200 Ohm.", "22000 Ohm."],
            "correct": 1,
            "explanation": "Đỏ (2), Đỏ (2), Nâu ($10^1$) = $22 \\\\times 10 = 220$ Ohm."
        },
        {
            "type": "multiple",
            "question": "Công dụng chính của Tụ điện trong mạch điện tử là:",
            "options": [
                "Chỉnh lưu dòng điện xoay chiều.",
                "Ngăn cách dòng điện một chiều và cho dòng điện xoay chiều đi qua.",
                "Khuếch đại tín hiệu điện.",
                "Tạo ra từ trường biến thiên."
            ],
            "correct": 1,
            "explanation": "Tụ điện tích và phóng điện, có đặc tính ngăn DC và dẫn AC."
        },
        {
            "type": "multiple",
            "question": "Diode bán dẫn có đặc tính quan trọng nhất là:",
            "options": [
                "Dẫn điện theo hai chiều như nhau.",
                "Chỉ cho dòng điện đi qua theo một chiều từ Anode sang Cathode.",
                "Tăng độ ổn định cho mạch điện.",
                "Biến đổi điện năng thành nhiệt năng."
            ],
            "correct": 1,
            "explanation": "Đây là đặc tính dẫn điện đơn hướng, dùng phổ biến trong mạch chỉnh lưu."
        },
        {
            "type": "multiple",
            "question": "Linh kiện điện tử có 3 cực: Emitter (E), Base (B) và Collector (C) được gọi là:",
            "options": ["Diode.", "Transistor.", "Triac.", "IC."],
            "correct": 1,
            "explanation": "Transistor là linh kiện tích cực dùng để khuếch đại hoặc đóng ngắt mạch điện."
        },
        {
            "type": "multiple",
            "question": "Mạch điện trong nhà hiện nay ở Việt Nam sử dụng nguồn điện có thông số là:",
            "options": ["220V - 50Hz.", "110V - 60Hz.", "220V - 60Hz.", "380V - 50Hz."],
            "correct": 0,
            "explanation": "Đây là chuẩn điện áp và tần số dân dụng phổ biến nhất."
        },
        {
            "type": "multiple",
            "question": "Thiết bị dùng để tự động ngắt mạch khi có sự cố quá tải hoặc ngắn mạch trong gia đình là:",
            "options": ["Công tắc.", "Ổ cắm.", "Aptomat (MCB).", "Đồng hồ điện."],
            "correct": 2,
            "explanation": "Aptomat giúp bảo vệ an toàn cho thiết bị và người dùng khi có sự cố dòng điện."
        },
        {
            "type": "multiple",
            "question": "Trong các nhà máy thủy điện, năng lượng nào được chuyển hóa thành điện năng?",
            "options": ["Nhiệt năng.", "Quang năng.", "Thế năng và động năng của dòng nước.", "Năng lượng hạt nhân."],
            "correct": 2,
            "explanation": "Dòng nước làm quay tuabin, kéo máy phát điện hoạt động."
        },
        {
            "type": "multiple",
            "question": "Đơn vị đo của Điện dung tụ điện là:",
            "options": ["Ohm ($\\Omega$).", "Fara (F).", "Henri (H).", "Vôn (V)."],
            "correct": 1,
            "explanation": "Thường dùng các đơn vị nhỏ hơn như $\\mu F, nF, pF$."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Xét các nhận định sau về hệ thống điện:",
            "options": [
                "Năng lượng tái tạo (như điện gió, điện mặt trời) đang được ưu tiên phát triển để bảo vệ môi trường.",
                "Lưới điện phân phối đưa điện năng trực tiếp từ nhà máy điện đến các khu công nghiệp ở khoảng cách rất xa.",
                "Hệ thống điện quốc gia giúp điều hòa công suất giữa các vùng miền khác nhau.",
                "Để đảm bảo an toàn, các đường dây truyền tải điện siêu cao áp luôn được đặt chìm dưới lòng đất trong khu dân cư."
            ],
            "correct": [true, false, true, false],
            "explanation": "Lưới điện truyền tải mới đi xa, lưới phân phối cấp điện tại chỗ. Đường dây siêu cao áp thường đi trên không để tản nhiệt và giảm chi phí."
        },
        {
            "type": "truefalse",
            "question": "Về linh kiện điện tử thụ động:",
            "options": [
                "Cuộn cảm có trị số càng lớn thì cản trở dòng điện xoay chiều càng mạnh.",
                "Tụ điện có thể dùng để lọc nhiễu trong các mạch nguồn điện.",
                "Điện trở nhiệt (Thermistor) có trị số thay đổi theo cường độ ánh sáng chiếu vào.",
                "Sai số của điện trở được ký hiệu bằng vòng màu cuối cùng (thường là Kim nhũ hoặc Ngân nhũ)."
            ],
            "correct": [true, true, false, true],
            "explanation": "Linh kiện thay đổi theo ánh sáng là Quang trở (LDR), điện trở nhiệt thay đổi theo nhiệt độ."
        },
        {
            "type": "truefalse",
            "question": "Về an toàn điện và mạng điện trong nhà:",
            "options": [
                "Dây trung tính (dây nguội) trong mạng điện dân dụng có điện áp bằng 0 so với đất trong điều kiện lý tưởng.",
                "Có thể dùng tay không để kiểm tra xem dây dẫn có điện hay không.",
                "Nối đất vỏ kim loại của các thiết bị điện (như tủ lạnh, máy giặt) giúp phòng tránh điện giật khi rò điện.",
                "Khi có người bị điện giật, việc đầu tiên cần làm là dùng tay kéo người đó ra khỏi nguồn điện."
            ],
            "correct": [true, false, true, false],
            "explanation": "Tuyệt đối không chạm vào người bị giật khi chưa ngắt điện. Phải dùng vật cách điện để tách nạn nhân."
        },
        {
            "type": "truefalse",
            "question": "Về Diode và Transistor:",
            "options": [
                "Diode Zener thường được dùng trong các mạch ổn áp.",
                "Transistor loại PNP có dòng điện đi từ cực C sang cực E khi mở.",
                "LED là một loại diode đặc biệt có khả năng phát sáng khi có dòng điện đi qua.",
                "Transistor chỉ có thể hoạt động ở chế độ đóng hoặc ngắt (khóa), không có chế độ khuếch đại."
            ],
            "correct": [true, false, true, false],
            "explanation": "Transistor có 3 chế độ: Đóng, Ngắt và Khuếch đại. Loại NPN mới dẫn từ C sang E."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Tần số tiêu chuẩn của lưới điện quốc gia Việt Nam là bao nhiêu Hz?",
            "correct": "50",
            "explanation": "50 Hertz (Hz)."
        },
        {
            "type": "short",
            "question": "Linh kiện điện tử nào có khả năng lưu trữ năng lượng dưới dạng từ trường?",
            "correct": "Cuon cam",
            "explanation": "Cuộn cảm (Inductor)."
        },
        {
            "type": "short",
            "question": "Dụng cụ dùng để kiểm tra sự hiện diện của điện áp tại các ổ cắm hoặc dây dẫn điện trong gia đình.",
            "correct": "But thu dien",
            "explanation": "Bút thử điện."
        },
        {
            "type": "short",
            "question": "Điện năng tiêu thụ được đo bằng thiết bị gì? (Thường gắn trước cửa nhà)",
            "correct": "Cong to dien",
            "explanation": "Công tơ điện (Kế điện)."
        },
        {
            "type": "short",
            "question": "Ký hiệu 'p' trong trị số tụ điện '10p' là viết tắt của đơn vị nào?",
            "correct": "Picofara",
            "explanation": "Picofarad ($10^{-12} F$)."
        },
        {
            "type": "short",
            "question": "Transistor có 2 loại chính dựa trên cấu tạo lớp bán dẫn là NPN và gì?",
            "correct": "PNP",
            "explanation": "Hai loại bổ sung cho nhau trong các thiết kế mạch."
        }
    ]
};