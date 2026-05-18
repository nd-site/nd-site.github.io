window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Địa Lý (Bản 1)",
    config: {
        testDuration: 3000, // 50 minutes
        examLayout: {
            multiple: { count: 18, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 },
            short: { count: 6, pointsPerQ: 0.25 }
        }
    },
    questions: [
        // --- PHẦN I: Trắc nghiệm nhiều lựa chọn ---
        {
            type: "multiple",
            question: "Lãnh thổ Việt Nam nằm hoàn toàn trong vùng nội chí tuyến Bắc bán cầu, nên có đặc điểm:",
            options: ["Nhiệt độ trung bình năm cao", "Chịu ảnh hưởng mạnh của gió Tây ôn đới", "Có mùa đông lạnh giá như vùng ôn đới", "Lượng mưa phân bố đều quanh năm"],
            correct: 0,
            explanation: "Vùng nội chí tuyến có góc nhập xạ lớn, nhận được nhiều nhiệt nên nhiệt độ trung bình năm cao."
        },
        {
            type: "multiple",
            question: "Địa hình nước ta chủ yếu là:",
            options: ["Đồng bằng", "Núi cao", "Đồi núi thấp", "Cao nguyên"],
            correct: 2,
            explanation: "Đồi núi chiếm 3/4 diện tích, nhưng chủ yếu là đồi núi thấp (dưới 1000m chiếm 85%)."
        },
        {
            type: "multiple",
            question: "Hướng núi chính của vùng núi Đông Bắc là:",
            options: ["Tây Bắc - Đông Nam", "Vòng cung", "Đông - Tây", "Bắc - Nam"],
            correct: 1,
            explanation: "Vùng núi Đông Bắc có các dãy núi hình cánh cung (Sông Gâm, Ngân Sơn, Bắc Sơn, Đông Triều)."
        },
        {
            type: "multiple",
            question: "Hệ sinh thái đặc trưng của vùng ven biển nước ta là:",
            options: ["Rừng kín thường xanh", "Rừng ngập mặn", "Rừng thưa", "Rừng trên núi đá vôi"],
            correct: 1,
            explanation: "Nước ta có diện tích rừng ngập mặn lớn thứ 2 thế giới sau rừng Amazon (về độ đa dạng)."
        },
        {
            type: "multiple",
            question: "Sông ngòi nước ta có đặc điểm nào sau đây?",
            options: ["Ít sông, ít nước", "Mạng lưới dày đặc, nhiều nước, giàu phù sa", "Sông ngắn và dốc, ít nước", "Chảy chủ yếu theo hướng Đông - Tây"],
            correct: 1,
            explanation: "Do mưa nhiều và địa hình dốc, chia cắt mạnh."
        },
        {
            type: "multiple",
            question: "Đất feralit là loại đất chính ở vùng nào của nước ta?",
            options: ["Đồng bằng Sông Hồng", "Đồng bằng Sông Cửu Long", "Vùng đồi núi", "Vùng ven biển"],
            correct: 2,
            explanation: "Đất feralit hình thành trên đá mẹ axit, là loại đất đặc trưng cho vùng đồi núi nhiệt đới ẩm."
        },
        {
            type: "multiple",
            question: "Dân cư nước ta phân bố không đều, tập trung đông đúc nhất ở:",
            options: ["Vùng núi cao", "Vùng trung du", "Các đồng bằng và ven biển", "Vùng biên giới"],
            correct: 2,
            explanation: "Đồng bằng có điều kiện tự nhiên và kinh tế thuận lợi hơn nên dân cư tập trung đông."
        },
        {
            type: "multiple",
            question: "Ngành kinh tế đóng góp tỉ trọng lớn nhất trong cơ cấu GDP của nước ta hiện nay là:",
            options: ["Nông, lâm, thủy sản", "Công nghiệp và xây dựng", "Dịch vụ", "Khai thác khoáng sản"],
            correct: 2,
            explanation: "Xu hướng chuyển dịch cơ cấu kinh tế là tăng tỉ trọng dịch vụ."
        },
        {
            type: "multiple",
            question: "Cây công nghiệp lâu năm được trồng nhiều nhất ở vùng Tây Nguyên là:",
            options: ["Cao su", "Chè", "Cà phê", "Điều"],
            correct: 2,
            explanation: "Tây Nguyên là vùng chuyên canh cà phê lớn nhất nước ta."
        },
        {
            type: "multiple",
            question: "Vùng kinh tế trọng điểm phía Bắc bao gồm các tỉnh, thành phố nào sau đây?",
            options: ["Hà Nội, Hải Phòng, Quảng Ninh, Hải Dương, Hưng Yên, Bắc Ninh, Vĩnh Phúc", "Hà Nội, Thái Nguyên, Phú Thọ", "Hải Phòng, Nam Định, Thái Bình", "Hà Nội, Hòa Bình, Lào Cai"],
            correct: 0,
            explanation: "Đây là tập hợp các tỉnh cốt lõi của vùng kinh tế trọng điểm phía Bắc."
        },
        {
            type: "multiple",
            question: "Gió mùa Đông Bắc hoạt động mạnh nhất ở vùng nào của nước ta?",
            options: ["Tây Bắc", "Đông Bắc", "Trung Bộ", "Nam Bộ"],
            correct: 1,
            explanation: "Đông Bắc là nơi đón gió mùa Đông Bắc đầu tiên và mạnh nhất."
        },
        {
            type: "multiple",
            question: "Loại thiên tai thường gây thiệt hại nặng nề nhất cho vùng ven biển miền Trung nước ta là:",
            options: ["Động đất", "Bão", "Lũ quét", "Sương muối"],
            correct: 1,
            explanation: "Bão kết hợp với nước dâng và mưa lớn thường gây thiệt hại nghiêm trọng cho miền Trung."
        },
        {
            type: "multiple",
            question: "Tài nguyên khoáng sản có trữ lượng lớn nhất ở vùng bể trầm tích thềm lục địa phía Nam nước ta là:",
            options: ["Than đá", "Sắt", "Dầu mỏ và khí đốt", "Bôxit"],
            correct: 2,
            explanation: "Vùng thềm lục địa phía Nam giàu tiềm năng dầu khí."
        },
        {
            type: "multiple",
            question: "Đường bờ biển nước ta dài khoảng bao nhiêu km?",
            options: ["2360 km", "3260 km", "4550 km", "1650 km"],
            correct: 1,
            explanation: "Bờ biển Việt Nam dài 3260 km từ Móng Cái đến Hà Tiên."
        },
        {
            type: "multiple",
            question: "Đặc điểm của quá trình đô thị hóa ở nước ta hiện nay là:",
            options: ["Tỉ lệ dân thành thị tăng nhanh", "Trình độ đô thị hóa rất cao", "Phân bố đô thị đều khắp cả nước", "Quá trình đô thị hóa diễn ra chậm"],
            correct: 0,
            explanation: "Tỉ lệ dân thành thị đang tăng lên cùng với quá trình công nghiệp hóa."
        },
        {
            type: "multiple",
            question: "Vùng nào sau đây có diện tích rừng ngập mặn lớn nhất nước ta?",
            options: ["Đồng bằng sông Hồng", "Bắc Trung Bộ", "Nam Trung Bộ", "Đồng bằng sông Cửu Long"],
            correct: 3,
            explanation: "Đồng bằng sông Cửu Long có diện tích rừng ngập mặn lớn nhất, đặc biệt là ở Cà Mau."
        },
        {
            type: "multiple",
            question: "Mục đích chính của việc hình thành các vùng chuyên canh cây công nghiệp ở nước ta là:",
            options: ["Giải quyết việc làm cho lao động nông thôn", "Tạo ra khối lượng sản phẩm lớn cho xuất khẩu", "Bảo vệ môi trường sinh thái", "Thay đổi diện mạo nông thôn"],
            correct: 1,
            explanation: "Chuyên canh giúp áp dụng KHKT, tạo sản phẩm hàng hóa quy mô lớn để xuất khẩu."
        },
        {
            type: "multiple",
            question: "Vấn đề quan trọng nhất trong việc sử dụng tài nguyên đất ở đồng bằng sông Hồng là:",
            options: ["Chống xói mòn, rửa trôi", "Ngăn chặn nhiễm mặn, nhiễm phèn", "Thâm canh, tăng vụ và bảo vệ đất khỏi bạc màu", "Xây dựng hệ thống đê điều"],
            correct: 2,
            explanation: "Do quỹ đất hạn hẹp, dân số đông nên cần thâm canh và bảo vệ độ màu mỡ."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai ---
        {
            type: "truefalse",
            question: "Về vị trí địa lí và phạm vi lãnh thổ nước ta:",
            options: [
                "Việt Nam nằm ở rìa phía Đông của bán đảo Đông Dương, gần trung tâm khu vực Đông Nam Á.",
                "Lãnh thổ Việt Nam là một khối thống nhất và toàn vẹn, bao gồm vùng đất, vùng biển và vùng trời.",
                "Nước ta có chung đường biên giới trên đất liền với 4 quốc gia.",
                "Vị trí địa lí tạo điều kiện thuận lợi để nước ta phát triển kinh tế mở và giao lưu quốc tế."
            ],
            correct: [true, true, false, true],
            explanation: "- Đúng về vị trí.\n- Đúng về phạm vi.\n- Nước ta chỉ giáp 3 nước trên đất liền: Trung Quốc, Lào, Campuchia (Sai).\n- Thuận lợi giao lưu (Đúng)."
        },
        {
            type: "truefalse",
            question: "Về đặc điểm dân số nước ta hiện nay:",
            options: [
                "Nước ta là một quốc gia đông dân, có nhiều thành phần dân tộc.",
                "Cơ cấu dân số theo độ tuổi đang có xu hướng già hóa.",
                "Tỉ lệ gia tăng dân số tự nhiên đang ở mức rất cao (trên 2%).",
                "Phân bố dân cư còn chưa hợp lí giữa đồng bằng và miền núi."
            ],
            correct: [true, true, false, true],
            explanation: "- Đông dân, đa dân tộc (Đúng).\n- Già hóa dân số (Đúng).\n- Tỉ lệ gia tăng tự nhiên đã giảm xuống thấp, dưới 1% (Sai).\n- Phân bố dân cư chênh lệch (Đúng)."
        },
        {
            type: "truefalse",
            question: "Về vấn đề khai thác thế mạnh ở vùng Tây Nguyên:",
            options: [
                "Tây Nguyên có diện tích đất đỏ bazan lớn, thuận lợi cho trồng cây công nghiệp lâu năm.",
                "Thế mạnh về thủy điện ở Tây Nguyên là do sông ngòi có độ dốc lớn và trữ lượng nước dồi dào.",
                "Khai thác tài nguyên rừng là thế mạnh duy nhất của vùng.",
                "Việc phát triển các vùng chuyên canh cây công nghiệp gắn liền với công nghiệp chế biến."
            ],
            correct: [true, true, false, true],
            explanation: "- Đất bazan trồng cà phê, cao su... (Đúng).\n- Thủy điện trên sông Sê San, Srêpôk... (Đúng).\n- Còn thế mạnh về du lịch, khoáng sản bôxit... (Sai).\n- Gắn sản xuất với chế biến (Đúng)."
        },
        {
            type: "truefalse",
            question: "Về vùng biển Việt Nam:",
            options: [
                "Vùng biển nước ta bao gồm nội thủy, lãnh hải, vùng tiếp giáp lãnh hải, vùng đặc quyền kinh tế và thềm lục địa.",
                "Nội thủy là vùng nước nằm phía ngoài đường cơ sở.",
                "Vùng đặc quyền kinh tế có chiều rộng 200 hải lí tính từ đường cơ sở.",
                "Nước ta có chủ quyền hoàn toàn và tuyệt đối ở vùng lãnh hải."
            ],
            correct: [true, false, true, true],
            explanation: "- Đúng về các bộ phận.\n- Nội thủy nằm phía trong đường cơ sở (Sai).\n- Đặc quyền kinh tế 200 hải lí (Đúng).\n- Lãnh hải thuộc chủ quyền tuyệt đối như đất liền (Đúng)."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn ---
        {
            type: "short",
            question: "Tính mật độ dân số trung bình (người/km2) của một tỉnh có diện tích 5000 km2 và dân số 1.500.000 người.",
            correct: "300",
            explanation: "$1.500.000 / 5000 = 300$."
        },
        {
            type: "short",
            question: "Nếu tỉ suất sinh là 15‰ và tỉ suất tử là 6‰, thì tỉ lệ gia tăng dân số tự nhiên là bao nhiêu %? (Chỉ nhập số, ví dụ 0.9)",
            correct: "0.9",
            explanation: "$(15 - 6) / 10 = 0.9\%$"
        },
        {
            type: "short",
            question: "Tính tỉ lệ (%) diện tích đất đồi núi so với tổng diện tích lãnh thổ Việt Nam.",
            correct: "75",
            explanation: "Đồi núi chiếm 3/4 diện tích $= 75\%$."
        },
        {
            type: "short",
            question: "Trong cơ cấu GDP của nước ta, nếu khu vực I chiếm 12%, khu vực II chiếm 38%, thì khu vực III chiếm bao nhiêu %?",
            correct: "50",
            explanation: "$100 - (12 + 38) = 50\%$"
        },
        {
            type: "short",
            question: "Một bản đồ có tỉ lệ 1 : 200.000. Khoảng cách đo được trên bản đồ là 5 cm. Tính khoảng cách thực tế ngoài địa hình theo đơn vị km.",
            correct: "10",
            explanation: "$5 \cdot 200.000 = 1.000.000 cm = 10 km$."
        },
        {
            type: "short",
            question: "Nhiệt độ trung bình tháng 1 của Hà Nội là $16^\circ C$, của TP. Hồ Chí Minh là $26^\circ C$. Tính biên độ nhiệt độ tháng 1 giữa hai địa điểm này.",
            correct: "10",
            explanation: "$26 - 16 = 10^\circ C$."
        }
    ]
};
