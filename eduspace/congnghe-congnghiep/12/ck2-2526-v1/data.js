// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Không có trả lời ngắn (MCQ, TF, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Công nghệ 12 Điện - Điện tử (Kết nối tri thức) 2025-2026",
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
            question: "Điện trở (Resistor) có công dụng chính là gì trong mạch điện tử?",
            options: [
                "Lưu trữ năng lượng dưới dạng từ trường",
                "Hạn chế dòng điện và phân chia điện áp trong mạch",
                "Biến đổi dòng điện xoay chiều thành một chiều",
                "Khuếch đại tín hiệu điện"
            ],
            correct: 1,
            explanation: "Điện trở cản trở dòng điện đi qua nó, dùng để hạn dòng, sụt áp, phân áp."
        },
        {
            type: "multiple",
            question: "Linh kiện điện tử nào có khả năng tích lũy năng lượng dưới dạng điện trường?",
            options: [
                "Điện trở",
                "Cuộn cảm",
                "Tụ điện",
                "Diode"
            ],
            correct: 2,
            explanation: "Tụ điện (Capacitor) tích lũy năng lượng điện trường, có tác dụng ngăn dòng một chiều (DC) và cho dòng xoay chiều (AC) đi qua."
        },
        {
            type: "multiple",
            question: "Đặc điểm nổi bật nhất của Diode chỉnh lưu là gì?",
            options: [
                "Khuếch đại dòng điện hàng trăm lần",
                "Chỉ cho dòng điện đi qua theo một chiều (từ Anode sang Cathode)",
                "Biến đổi cơ năng thành điện năng",
                "Ngăn chặn hoàn toàn dòng điện xoay chiều"
            ],
            correct: 1,
            explanation: "Diode có tính dẫn điện một chiều, được ứng dụng rộng rãi trong các mạch chỉnh lưu (biến AC thành DC)."
        },
        {
            type: "multiple",
            question: "Transistor loại BJT (Bipolar Junction Transistor) có mấy cực?",
            options: [
                "2 cực (A, K)",
                "3 cực (B, C, E)",
                "3 cực (G, S, D)",
                "4 cực"
            ],
            correct: 1,
            explanation: "Transistor BJT có 3 cực: Base (B - Cực nền), Collector (C - Cực góp), Emitter (E - Cực phát)."
        },
        {
            type: "multiple",
            question: "Chức năng quan trọng nhất của Transistor trong mạch điện tử là gì?",
            options: [
                "Lọc nhiễu tín hiệu",
                "Khuếch đại tín hiệu và đóng cắt mạch điện (như một công tắc điện tử)",
                "Phát sáng khi có dòng điện chạy qua",
                "Đổi tần số dòng điện"
            ],
            correct: 1,
            explanation: "Transistor là linh kiện bán dẫn cốt lõi, có khả năng khuếch đại dòng điện/điện áp và hoạt động như công tắc trong mạch logic."
        },
        {
            type: "multiple",
            question: "IC (Integrated Circuit - Vi mạch tích hợp) là gì?",
            options: [
                "Một linh kiện rời rạc chỉ chứa 1 transistor",
                "Mạch điện tử chứa hàng ngàn đến hàng tỉ linh kiện bán dẫn nhỏ xíu (transistor, điện trở...) được tích hợp trên một phiến silicon",
                "Một bảng mạch in (PCB) lớn",
                "Một loại dây dẫn điện đặc biệt"
            ],
            correct: 1,
            explanation: "IC giúp thu nhỏ kích thước thiết bị điện tử, tăng độ tin cậy và giảm giá thành."
        },
        {
            type: "multiple",
            question: "Vi điều khiển (Microcontroller) khác với Vi xử lí (Microprocessor) ở điểm cơ bản nào?",
            options: [
                "Vi điều khiển không có bộ nhớ",
                "Vi điều khiển tích hợp sẵn cả CPU, bộ nhớ (RAM, ROM) và các cổng vào/ra trên cùng một con chip",
                "Vi điều khiển chỉ dùng cho máy tính để bàn",
                "Vi xử lí kích thước nhỏ hơn Vi điều khiển"
            ],
            correct: 1,
            explanation: "Vi điều khiển như một máy tính siêu nhỏ hoàn chỉnh, được dùng để điều khiển các thiết bị cụ thể (máy giặt, điều hòa, robot...)."
        },
        {
            type: "multiple",
            question: "Trong bo mạch Arduino Uno (sử dụng vi điều khiển ATmega328P), cổng Analog (A0-A5) dùng để làm gì?",
            options: [
                "Cấp nguồn điện 5V",
                "Chỉ xuất tín hiệu bật/tắt bóng đèn",
                "Đọc các tín hiệu tương tự (liên tục) từ các cảm biến (như cảm biến nhiệt độ, ánh sáng)",
                "Kết nối với mạng Wifi"
            ],
            correct: 2,
            explanation: "Chân Analog (A) dùng để đọc điện áp thay đổi liên tục và chuyển đổi thành tín hiệu số (ADC) cho vi điều khiển xử lí."
        },
        {
            type: "multiple",
            question: "Một mạch khuếch đại thuật toán (Op-Amp) lí tưởng có đặc điểm điện trở vào (R_in) và điện trở ra (R_out) như thế nào?",
            options: [
                "R_in = 0, R_out = vô cùng",
                "R_in = vô cùng lớn, R_out = xấp xỉ 0",
                "Cả hai đều bằng 0",
                "Cả hai đều vô cùng lớn"
            ],
            correct: 1,
            explanation: "Op-Amp lí tưởng có hệ số khuếch đại vô cùng, trở kháng vào vô cùng (không hút dòng đầu vào) và trở kháng ra bằng 0 (dẫn dòng đầu ra tối đa)."
        },
        {
            type: "multiple",
            question: "Trong mạch tạo xung đa hài tự dao động dùng transistor, người ta dùng linh kiện nào để tạo ra thời gian trễ (chu kì dao động)?",
            options: [
                "Điện trở và Cuộn cảm",
                "Điện trở và Tụ điện (Mạch RC)",
                "Chỉ dùng Diode",
                "Biến áp"
            ],
            correct: 1,
            explanation: "Sự nạp và phóng điện của tụ điện qua điện trở quyết định thời gian luân phiên đóng cắt của 2 transistor (tạo xung vuông)."
        },
        {
            type: "multiple",
            question: "Hệ thống điện quốc gia bao gồm các thành phần chính nào?",
            options: [
                "Các nhà máy phát điện và các hộ tiêu thụ điện",
                "Nguồn điện (nhà máy điện), lưới điện (trạm biến áp, đường dây) và các hộ tiêu thụ điện trên toàn quốc",
                "Đường dây 500kV Bắc - Nam",
                "Các trạm biến áp hạ áp và lưới điện sinh hoạt"
            ],
            correct: 1,
            explanation: "Hệ thống điện quốc gia là một thể thống nhất gồm sản xuất (nguồn), truyền tải, phân phối (lưới) và tiêu thụ điện."
        },
        {
            type: "multiple",
            question: "Vì sao phải truyền tải điện năng đi xa bằng điện áp cao (ví dụ 500kV)?",
            options: [
                "Để dòng điện chạy nhanh hơn",
                "Để giảm hao phí điện năng dưới dạng nhiệt tỏa ra trên đường dây truyền tải",
                "Để ngăn chặn người dân câu trộm điện",
                "Để an toàn hơn cho người sử dụng"
            ],
            correct: 1,
            explanation: "Công suất hao phí tỏa nhiệt tỉ lệ nghịch với bình phương điện áp truyền tải. Điện áp càng cao, dòng điện càng nhỏ, hao phí tỏa nhiệt (I^2.R) càng giảm."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Lưới điện truyền tải ở Việt Nam thường có điện áp từ bao nhiêu trở lên?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "220V và 380V",
                "Từ 110 kV đến 500 kV",
                "Từ 22 kV đến 35 kV",
                "Dưới 1000V"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Lưới điện phân phối có cấp điện áp từ 35kV trở xuống, lưới điện truyền tải (đi xa) là 110kV, 220kV, 500kV."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Trong máy biến áp điện lực 3 pha, nếu muốn lấy ra cả nguồn 3 pha (380V) và nguồn 1 pha (220V) cho sinh hoạt, cuộn thứ cấp thường được nối theo hình gì?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Nối hình tam giác",
                "Nối hình sao có dây trung tính (Y/yo)",
                "Nối nối tiếp",
                "Nối song song"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Nối hình sao có dây trung tính (dây mát) cho phép lấy ra điện áp dây (380V, giữa 2 dây pha) và điện áp pha (220V, giữa 1 dây pha và dây trung tính)."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Mạng điện sản xuất quy mô nhỏ thường nhận điện năng từ lưới điện phân phối có điện áp là bao nhiêu?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "500 kV",
                "220 kV",
                "Từ 22 kV đến 35 kV, sau đó hạ áp xuống 380V/220V",
                "12V"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Các cơ sở sản xuất nhỏ thường dùng trạm biến áp hạ áp riêng biệt, nhận điện trung thế (22kV) hạ xuống hạ thế (380V 3 pha) cho máy móc."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Trong tủ điện phân phối của xưởng sản xuất, thiết bị nào có chức năng đóng cắt nguồn điện tổng và bảo vệ ngắn mạch, quá tải?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Khởi động từ (Contactor)",
                "Rơ le nhiệt",
                "Cầu dao tự động (Aptomat/ MCCB, MCB)",
                "Cầu chì"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Aptomat (CB) là thiết bị đóng cắt tự động khi dòng điện vượt ngưỡng an toàn."
        },
        {
            type: "essay",
            question: "Hãy phân biệt dòng điện xoay chiều (AC) và dòng điện một chiều (DC) về đặc điểm, nguồn tạo ra và ứng dụng cơ bản.",
            suggested: "1. Đặc điểm:\n- AC (Alternating Current): Chiều và trị số biến đổi theo thời gian (thường theo quy luật hình sin). Có đặc tính tần số (VD: lưới điện VN là 50Hz).\n- DC (Direct Current): Chiều không đổi, trị số thường cố định theo thời gian.\n\n2. Nguồn tạo ra:\n- AC: Tạo ra từ máy phát điện xoay chiều (ở các nhà máy thủy điện, nhiệt điện...).\n- DC: Tạo ra từ Pin, Ắc quy, pin mặt trời, hoặc dùng mạch chỉnh lưu biến AC thành DC.\n\n3. Ứng dụng:\n- AC: Dùng để truyền tải điện năng đi xa (vì dễ dàng thay đổi điện áp bằng máy biến áp), cấp nguồn cho các thiết bị sinh hoạt, động cơ công nghiệp.\n- DC: Cấp nguồn cho các mạch điện tử, thiết bị cầm tay (điện thoại, laptop), xe điện.",
            points: 25,
            explanation: "AI chấm: Nêu được sự khác biệt về chiều dòng điện (10đ); Kể đúng nguồn tạo ra (AC từ máy phát, DC từ pin/ắc quy) (7đ); Nêu được ứng dụng (AC truyền tải/sinh hoạt, DC mạch điện tử/pin) (8đ)."
        },
        {
            type: "essay",
            question: "Trình bày các bước cơ bản để thiết kế một mạch điện tử đơn giản. Tại sao hiện nay Vi điều khiển (Microcontroller) lại được ứng dụng rộng rãi thay thế cho các mạch logic rời rạc?",
            suggested: "1. Các bước thiết kế mạch điện tử:\n- B1: Xác định yêu cầu kĩ thuật, chức năng của mạch.\n- B2: Lên phương án, chọn sơ đồ khối và thiết kế sơ đồ nguyên lí.\n- B3: Tính toán, lựa chọn linh kiện điện tử phù hợp.\n- B4: Thiết kế sơ đồ lắp ráp (vẽ mạch in PCB) và thi công, thử nghiệm.\n\n2. Lí do Vi điều khiển được ứng dụng rộng rãi:\n- Kích thước siêu nhỏ nhưng tích hợp đầy đủ CPU, bộ nhớ, cổng vào/ra (như một máy tính thu nhỏ).\n- Lập trình linh hoạt: Thay vì phải thay đổi phần cứng (nhổ/hàn linh kiện) như mạch logic cũ, người ta chỉ cần viết lại đoạn mã phần mềm (code) để thay đổi chức năng điều khiển.\n- Giúp mạch điện tử gọn gàng, độ tin cậy cao, dễ nâng cấp và giá thành rẻ.",
            points: 25,
            explanation: "AI chấm: Liệt kê tối thiểu 3 bước thiết kế (Xác định yêu cầu -> Vẽ nguyên lí -> Tính chọn linh kiện -> Mạch in/Thử nghiệm) (12đ). Giải thích được tính linh hoạt, lập trình bằng phần mềm và thu gọn phần cứng của Vi điều khiển (13đ)."
        },
        {
            type: "essay",
            question: "Lưới điện quốc gia có vai trò gì đối với sự phát triển kinh tế - xã hội? Việc sử dụng điện tiết kiệm và hiệu quả mang lại những lợi ích thiết thực nào?",
            suggested: "1. Vai trò của lưới điện quốc gia:\n- Cung cấp năng lượng huyết mạch cho mọi ngành kinh tế (công nghiệp, nông nghiệp, dịch vụ).\n- Nâng cao đời sống vật chất, tinh thần của nhân dân (phục vụ sinh hoạt, giáo dục, y tế).\n- Đảm bảo an ninh năng lượng và phát triển đồng đều giữa các vùng miền miền núi, hải đảo.\n\n2. Lợi ích của tiết kiệm điện:\n- Lợi ích cá nhân/doanh nghiệp: Giảm chi phí hóa đơn tiền điện hàng tháng, tăng tuổi thọ thiết bị.\n- Lợi ích quốc gia: Giảm áp lực đầu tư xây dựng nhà máy điện mới, hạn chế cắt điện luân phiên trong giờ cao điểm.\n- Lợi ích môi trường: Giảm thiểu khai thác tài nguyên (than đá, khí đốt) và giảm phát thải khí nhà kính (CO2), bảo vệ môi trường, chống biến đổi khí hậu.",
            points: 25,
            explanation: "AI chấm: Nêu vai trò lưới điện (huyết mạch kinh tế, dân sinh) (10đ). Nêu lợi ích tiết kiệm điện trên 3 phương diện: Kinh tế gia đình, Kinh tế quốc gia, Bảo vệ môi trường sinh thái (15đ)."
        }
    ]
};
