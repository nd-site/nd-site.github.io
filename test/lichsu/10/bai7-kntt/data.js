// short 4
// data.js - Bộ đề kiểm tra về các cuộc cách mạng công nghiệp hiện đại
window.quizData = {
    title: "Kiểm tra Lịch Sử 10 bài 7 - Các cuộc Cách mạng Công nghiệp thời hiện đại - Sách Kết nối tri thức",
    config: {
        testDuration: 6600  // 1 tiếng 50 phút
    },
    questions: [
        {
            type: "multiple",
            question: "Cuộc cách mạng công nghiệp lần thứ ba bắt đầu vào khoảng thời gian nào?",
            options: ["Cuối thế kỉ XIX", "Đầu thế kỉ XXI", "Những năm 1940 của thế kỉ XX", "Năm 2018"],
            correct: 2,
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ ba bắt đầu vào những năm 1940 của thế kỉ XX."
        },
        {
            type: "multiple",
            question: "Thành tựu nào sau đây là đặc trưng của Cách mạng công nghiệp lần thứ tư?",
            options: ["Máy tính điện tử IBM 6080", "Máy hơi nước", "Điện thoại bàn", "Trí tuệ nhân tạo (AI)"],
            correct: 3,
            points: 10,
            explanation: "Trí tuệ nhân tạo là một trong những thành tựu nổi bật của Cách mạng công nghiệp lần thứ tư."
        },
        {
            type: "truefalse",
            question: "Đánh giá tính đúng/sai về các phát biểu sau liên quan đến công nghệ hiện đại:",
            statements: [
                "Rô-bốt Sophia được cấp quyền công dân bởi Việt Nam.",
                "Máy ENIAC là máy tính đầu tiên trên thế giới.",
                "Wi-Fi là công nghệ kết nối internet không dây.",
                "Neil Armstrong là người đầu tiên đặt chân lên Sao Hỏa."
            ],
            correctAnswers: [false, true, true, false],
            points: 20,
            explanation: "Sophia được cấp quyền công dân bởi Ả-rập Xê-út; ENIAC ra đời năm 1946; Wi-Fi đăng sáng chế 1996; Neil Armstrong đặt chân lên Mặt Trăng."
        },
        {
            type: "short",
            question: "Cách mạng công nghiệp lần thứ tư còn được gọi là gì?",
            correct: "4.0",
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ tư còn gọi là Cách mạng 4.0."
        },
        {
            type: "essay",
            question: "Trình bày ngắn gọn ý nghĩa xã hội và văn hóa của các cuộc cách mạng công nghiệp hiện đại. (Tối đa 150 từ)",
            suggested: "Các cuộc cách mạng công nghiệp hiện đại giúp giải phóng sức lao động, thúc đẩy giao lưu văn hóa, chia sẻ tri thức toàn cầu, làm thay đổi lối sống và giá trị xã hội.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: giải phóng sức lao động, tiếp cận thông tin, giao lưu văn hóa, toàn cầu hóa, tác động tiêu cực."
        },
        {
            type: "multiple",
            question: "Sputnik 1 là vệ tinh nhân tạo đầu tiên do quốc gia nào phóng lên?",
            options: ["Liên Xô", "Pháp", "Trung Quốc", "Hoa Kỳ"],
            correct: 0,
            points: 10,
            explanation: "Liên Xô đã phóng vệ tinh Sputnik 1 vào quỹ đạo năm 1957."
        },
        {
            type: "multiple",
            question: "Neil Armstrong là người đầu tiên đặt chân lên đâu?",
            options: ["Sao Hỏa", "Trái Đất", "Mặt Trăng", "Sao Kim"],
            correct: 2,
            points: 10,
            explanation: "Neil Armstrong là người đầu tiên đặt chân lên Mặt Trăng năm 1969."
        },
        {
            type: "multiple",
            question: "Phát minh nào giúp kết nối internet không dây?",
            options: ["USB", "Wi-Fi", "Ethernet", "Bluetooth"],
            correct: 1,
            points: 10,
            explanation: "Wi-Fi là công nghệ kết nối internet không dây, đăng sáng chế năm 1996."
        },
        {
            type: "multiple",
            question: "Một trong những ý nghĩa xã hội của công nghệ tự động hóa là gì?",
            options: ["Giảm năng suất lao động", "Giải phóng sức lao động con người", "Làm việc trong môi trường độc hại", "Tăng chi phí sản xuất"],
            correct: 1,
            points: 10,
            explanation: "Công nghệ tự động hóa giúp giải phóng sức lao động, đặc biệt trong môi trường độc hại."
        },
        {
            type: "multiple",
            question: "Tỉ lệ công việc hiện nay có thể được thực hiện bởi rô-bốt là bao nhiêu?",
            options: ["10%", "75%", "50%", "25%"],
            correct: 2,
            points: 10,
            explanation: "Hiện nay, khoảng 50% công việc có thể được thực hiện bởi rô-bốt."
        },
        {
            type: "multiple",
            question: "Công nghệ nào sau đây không thuộc Cách mạng công nghiệp lần thứ tư?",
            options: ["Công nghệ in 3D", "Dữ liệu lớn (Big Data)", "Máy hơi nước", "Internet vạn vật (IoT)"],
            correct: 2,
            points: 10,
            explanation: "Máy hơi nước thuộc Cách mạng công nghiệp lần thứ nhất, không phải lần thứ tư."
        },
        {
            type: "multiple",
            question: "Cách mạng công nghiệp lần thứ tư bắt đầu vào thời điểm nào?",
            options: ["Cuối thế kỉ XIX", "Đầu thế kỉ XXI", "Những năm 1940", "Năm 1990"],
            correct: 1,
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ tư bắt đầu từ đầu thế kỉ XXI."
        },
        {
            type: "multiple",
            question: "Sự giao thoa văn hóa toàn cầu là kết quả của yếu tố nào?",
            options: ["Phát triển giao thông", "Phát triển internet và thiết bị điện tử", "Tăng dân số", "Chiến tranh thế giới"],
            correct: 1,
            points: 10,
            explanation: "Internet và thiết bị điện tử giúp con người tiếp cận và giao lưu văn hóa toàn cầu."
        },
        {
            type: "multiple",
            question: "Tác động tiêu cực của các cuộc cách mạng công nghiệp hiện đại là gì?",
            options: ["Gây ô nhiễm môi trường", "Phát triển giáo dục", "Tăng năng suất lao động", "Tăng chất lượng sản phẩm"],
            correct: 0,
            points: 10,
            explanation: "Một trong những tác động tiêu cực là gây ô nhiễm môi trường do khai thác tài nguyên quá mức."
        },
        {
            type: "short",
            question: "Tim Berners-Lee phát minh ra World Wide Web (WWW) vào năm bao nhiểu?",
            correct: "1990",
            points: 10,
            explanation: "Tim Berners-Lee phát minh ra World Wide Web năm 1990."
        },
        {
            type: "multiple",
            question: "Máy tính xách tay đầu tiên được sản xuất vào năm nào?",
            options: ["1946", "1957", "1994", "2001"],
            correct: 2,
            points: 10,
            explanation: "Máy tính xách tay đầu tiên được sản xuất năm 1994."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Công nghệ gen là một thành tựu của Cách mạng công nghiệp lần thứ tư.",
                "Công nghệ hơi nước là thành tựu của Cách mạng công nghiệp lần thứ ba.",
                "Internet vạn vật (IoT) được ứng dụng trong quản lí đô thị.",
                "Sputnik 1 được phóng lên quỹ đạo năm 1957."
            ],
            correctAnswers: [true, false, true, true],
            points: 20,
            explanation: "Gen thuộc lần thứ tư; hơi nước thuộc lần thứ nhất; IoT ứng dụng quản lí đô thị; Sputnik 1 phóng năm 1957."
        },
        {
            type: "multiple",
            question: "Hình ảnh 'The Blue Marble' nổi tiếng được chụp bởi phi hành đoàn Apollo 17 vào năm nào?",
            options: ["1969", "1972", "1980", "1990"],
            correct: 1,
            points: 10,
            explanation: "Bức ảnh 'The Blue Marble' được chụp ngày 7/12/1972."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp xây dựng nhà ở tại Dubai bằng máy in?",
            options: ["Công nghệ in 3D", "Công nghệ gen", "Công nghệ tế bào", "Công nghệ vi sinh"],
            correct: 0,
            points: 10,
            explanation: "Công nghệ in 3D đã được ứng dụng để xây dựng nhà ở tại Dubai."
        },
        {
            type: "essay",
            question: "Phân tích ý nghĩa kinh tế của các cuộc cách mạng công nghiệp hiện đại. (Tối đa 150 từ)",
            suggested: "Các cuộc cách mạng công nghiệp hiện đại giúp tăng năng suất lao động, nâng cao chất lượng sản phẩm, thúc đẩy phát triển kinh tế toàn cầu.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: năng suất, chất lượng, phát triển kinh tế quốc gia và toàn cầu."
        },
        {
            type: "multiple",
            question: "Máy tính điện tử IBM 6080 được sản xuất vào năm nào?",
            options: ["1946", "1957", "1994", "2000"],
            correct: 1,
            points: 10,
            explanation: "IBM 6080 là máy tính điện tử đầu tiên, sản xuất năm 1957."
        },
        {
            type: "multiple",
            question: "Cuộc cách mạng công nghiệp lần thứ ba còn được gọi là gì?",
            options: ["Cách mạng hơi nước", "Cách mạng kỹ thuật số", "Cách mạng xanh", "Cách mạng 4.0"],
            correct: 1,
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ ba còn gọi là Cách mạng kỹ thuật số."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Công nghệ sinh học đạt được thành tựu trong công nghệ di truyền.",
                "Công nghệ tế bào không liên quan đến Cách mạng công nghiệp lần thứ ba.",
                "Công nghệ vi sinh là một phần của công nghệ sinh học.",
                "Công nghệ lên men không thuộc lĩnh vực công nghệ sinh học."
            ],
            correctAnswers: [true, false, true, false],
            points: 20,
            explanation: "Công nghệ sinh học bao gồm công nghệ di truyền, tế bào, vi sinh và lên men."
        },
        {
            type: "multiple",
            question: "Hình ảnh vệ tinh Sputnik 1 gắn liền với sự kiện nào?",
            options: ["Cuộc chạy đua vũ trang", "Cuộc chạy đua vũ trụ", "Chiến tranh lạnh", "Cách mạng công nghiệp lần thứ ba"],
            correct: 1,
            points: 10,
            explanation: "Sputnik 1 gắn liền với cuộc chạy đua vũ trụ giữa Liên Xô và Mỹ."
        },
        {
            type: "short",
            question: "Neil Armstrong là nhà du hành vũ trụ đầu tiên đặt chân lên Mặt Trăng, năm đó là năm bao nhiêu?",
            correct: "1969",
            points: 10,
            explanation: "Neil Armstrong đặt chân lên Mặt Trăng năm 1969."
        },
        {
            type: "multiple",
            question: "Công nghệ nào sau đây là thành tựu của Cách mạng công nghiệp lần thứ ba?",
            options: ["Máy tính điện tử", "Trí tuệ nhân tạo", "Internet vạn vật", "Công nghệ in 3D"],
            correct: 0,
            points: 10,
            explanation: "Máy tính điện tử là thành tựu tiêu biểu của Cách mạng công nghiệp lần thứ ba."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp kết nối các thiết bị điện tử dễ dàng hơn?",
            options: ["Internet", "Máy hơi nước", "Điện thoại bàn", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp kết nối các thiết bị điện tử dễ dàng hơn."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được ứng dụng trong quản lí đô thị, giao thông, xây dựng, thời trang, chăm sóc sức khỏe?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet vạn vật (IoT) được ứng dụng trong nhiều lĩnh vực đời sống."
        },
        {
            type: "essay",
            question: "Phân tích tác động của dữ liệu lớn (Big Data) trong thời đại 4.0. (Tối đa 150 từ)",
            suggested: "Big Data giúp lưu trữ, phân tích khối lượng dữ liệu khổng lồ, hỗ trợ ra quyết định trong kinh tế, y tế, giáo dục, quản lý đô thị.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: lưu trữ dữ liệu, phân tích, hỗ trợ ra quyết định, ứng dụng đa lĩnh vực."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra nhiều giống cây mới chống sâu bệnh?",
            options: ["Công nghệ sinh học", "Công nghệ hơi nước", "Công nghệ in 3D", "Công nghệ IoT"],
            correct: 0,
            points: 10,
            explanation: "Công nghệ sinh học tạo ra nhiều giống cây mới có khả năng chống sâu bệnh."
        },
        {
            type: "multiple",
            question: "Cuộc cách mạng công nghiệp lần thứ ba tạo ra phát minh nào dưới đây?",
            options: ["Máy tính điện tử", "Máy hơi nước", "Trí tuệ nhân tạo", "Công nghệ in 3D"],
            correct: 0,
            points: 10,
            explanation: "Máy tính điện tử là phát minh tiêu biểu của Cách mạng công nghiệp lần thứ ba."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao hiệu suất lao động rõ rệt trong thời đại kỹ thuật số?",
            options: ["Internet", "Máy hơi nước", "Điện thoại bàn", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp nâng cao hiệu suất lao động và kết nối toàn cầu."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Công nghệ in 3D là thành tựu của Cách mạng công nghiệp lần thứ tư.",
                "Máy ENIAC nặng khoảng 30 tấn.",
                "Neil Armstrong đặt chân lên Mặt Trăng năm 1972.",
                "Sophia là rô-bốt có thể biểu cảm và giao tiếp phi ngôn ngữ."
            ],
            correctAnswers: [true, true, false, true],
            points: 20,
            explanation: "In 3D thuộc lần thứ tư; ENIAC nặng 30 tấn; Armstrong đặt chân lên Mặt Trăng năm 1969; Sophia có khả năng biểu cảm."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra kho dữ liệu khổng lồ phục vụ phát triển công nghệ?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp lưu trữ và phân tích dữ liệu khổng lồ."
        },
        {
            type: "short",
            question: "Cách mạng kỹ thuật số là CMCN lần thứ mấy?",
            correct: "3",
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ ba còn gọi là Cách mạng kỹ thuật số."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được ứng dụng trong sản xuất ô tô hiện đại?",
            options: ["Cánh tay rô-bốt", "Máy hơi nước", "Điện thoại bàn", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Cánh tay rô-bốt được ứng dụng trong dây chuyền sản xuất ô tô."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp chia sẻ thông tin và tri thức toàn cầu?",
            options: ["Internet", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp chia sẻ thông tin và tri thức toàn cầu."
        },
        {
            type: "essay",
            question: "Phân tích ý nghĩa văn hóa của các cuộc cách mạng công nghiệp hiện đại. (Tối đa 150 từ)",
            suggested: "Các cuộc cách mạng công nghiệp hiện đại thúc đẩy giao lưu văn hóa, toàn cầu hóa, tiếp thu giá trị mới.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: giao lưu văn hóa, toàn cầu hóa, tiếp thu và giao thoa giá trị."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra giống cây mới chống sâu bệnh?",
            options: ["Công nghệ sinh học", "Máy hơi nước", "Công nghệ in 3D", "Công nghệ IoT"],
            correct: 0,
            points: 10,
            explanation: "Công nghệ sinh học tạo ra giống cây mới chống sâu bệnh."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được coi là 'nhà máy năng lượng' của tế bào?",
            options: ["Ti thể", "Nhân tế bào", "Bộ máy Golgi", "Lưới nội chất"],
            correct: 0,
            points: 10,
            explanation: "Ti thể là bào quan sản xuất năng lượng chính của tế bào."
        },
        {
            type: "multiple",
            question: "Công nghệ nào sau đây là nền tảng của Cách mạng công nghiệp lần thứ ba?",
            options: ["Máy hơi nước", "Công nghệ thông tin", "Trí tuệ nhân tạo", "Công nghệ in 3D"],
            correct: 1,
            points: 10,
            explanation: "Công nghệ thông tin là nền tảng của Cách mạng công nghiệp lần thứ ba."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp con người dễ dàng tiếp cận và chia sẻ tri thức toàn cầu?",
            options: ["Internet", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp con người dễ dàng tiếp cận và chia sẻ tri thức toàn cầu."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Công nghệ tự động hóa giúp giải phóng sức lao động con người.",
                "Công nghệ hơi nước là thành tựu của Cách mạng công nghiệp lần thứ ba.",
                "Sophia là rô-bốt có thể chơi nhạc và trình diễn thời trang.",
                "Neil Armstrong là người đầu tiên đặt chân lên Sao Hỏa."
            ],
            correctAnswers: [true, false, true, false],
            points: 20,
            explanation: "Tự động hóa giúp giải phóng sức lao động; hơi nước thuộc lần thứ nhất; Sophia có thể chơi nhạc, trình diễn; Armstrong đặt chân lên Mặt Trăng."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được ứng dụng trong giáo dục, y tế, thực phẩm, bảo vệ môi trường?",
            options: ["Thiết bị thông minh", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Thiết bị thông minh được ứng dụng rộng rãi trong nhiều lĩnh vực."
        },
        {
            type: "short",
            question: "Tên gọi khác của Cách mạng công nghiệp lần thứ tư là gì?",
            correct: "Cách mạng 4.0",
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ tư còn gọi là Cách mạng 4.0."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra dữ liệu lớn phục vụ phát triển công nghệ?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp lưu trữ và phân tích dữ liệu khổng lồ."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp xây dựng nhà ở bằng máy in tại Dubai?",
            options: ["Công nghệ in 3D", "Công nghệ gen", "Công nghệ tế bào", "Công nghệ vi sinh"],
            correct: 0,
            points: 10,
            explanation: "Công nghệ in 3D đã được ứng dụng để xây dựng nhà ở tại Dubai."
        },
        {
            type: "essay",
            question: "Phân tích tác động của trí tuệ nhân tạo (AI) trong đời sống hiện đại. (Tối đa 150 từ)",
            suggested: "AI giúp tự động hóa, hỗ trợ y tế, giáo dục, sản xuất, nhưng cũng đặt ra thách thức về việc làm.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: tự động hóa, ứng dụng đa lĩnh vực, thách thức việc làm, đạo đức."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp quản lí đô thị thông minh?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp quản lí đô thị thông minh, kết nối dữ liệu và thiết bị."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao chất lượng sản phẩm trong thời đại hiện đại?",
            options: ["Tự động hóa", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Tự động hóa giúp nâng cao chất lượng sản phẩm và giảm sai sót."
        },
        {
            type: "multiple",
            question: "Máy tính ENIAC ra đời vào năm nào?",
            options: ["1946", "1957", "1994", "2001"],
            correct: 0,
            points: 10,
            explanation: "ENIAC là máy tính đầu tiên trên thế giới, ra đời năm 1946 tại Mỹ."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao năng suất và chất lượng sản phẩm?",
            options: ["Tự động hóa", "Máy hơi nước", "Điện thoại bàn", "Công nghệ vi sinh"],
            correct: 0,
            points: 10,
            explanation: "Tự động hóa giúp nâng cao năng suất và chất lượng sản phẩm."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Công nghệ gen là thành tựu của Cách mạng công nghiệp lần thứ tư.",
                "Máy tính xách tay đầu tiên được sản xuất năm 1994.",
                "Sputnik 1 được phóng lên quỹ đạo năm 1957.",
                "Neil Armstrong đặt chân lên Mặt Trăng năm 1969."
            ],
            correctAnswers: [true, true, true, true],
            points: 20,
            explanation: "Gen thuộc lần thứ tư; laptop sản xuất năm 1994; Sputnik 1 phóng năm 1957; Armstrong đặt chân lên Mặt Trăng năm 1969."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp quản lí dữ liệu khổng lồ trong thời đại 4.0?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp quản lí và phân tích dữ liệu khổng lồ."
        },
        {
            type: "short",
            question: "Ai là người phát minh ra mạng không dây (Wi-Fi)?",
            correct: "Nhóm các nhà khoa học do ông Su-pha-nan dẫn đầu",
            points: 10,
            explanation: "Wi-Fi được đăng sáng chế năm 1996 bởi nhóm do ông Su-pha-nan dẫn đầu."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra giống cây mới chống sâu bệnh?",
            options: ["Công nghệ sinh học", "Máy hơi nước", "Công nghệ in 3D", "Công nghệ IoT"],
            correct: 0,
            points: 10,
            explanation: "Công nghệ sinh học tạo ra giống cây mới chống sâu bệnh."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được ứng dụng trong quản lí đô thị thông minh?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp quản lí đô thị thông minh."
        },
        {
            type: "essay",
            question: "Phân tích tác động của Internet trong đời sống hiện đại. (Tối đa 150 từ)",
            suggested: "Internet giúp kết nối toàn cầu, chia sẻ thông tin, nâng cao năng suất, nhưng cũng gây ra thách thức về an ninh mạng.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: kết nối toàn cầu, chia sẻ thông tin, nâng cao năng suất, thách thức an ninh."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra kho dữ liệu khổng lồ phục vụ phát triển công nghệ?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp lưu trữ và phân tích dữ liệu khổng lồ."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp giải phóng sức lao động con người trong môi trường độc hại?",
            options: ["Tự động hóa", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Tự động hóa giúp giải phóng sức lao động con người trong môi trường độc hại."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp kết nối mọi thứ trong thời đại 4.0?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp kết nối mọi thứ thông qua internet trong thời đại 4.0."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra giống cây mới chống sâu bệnh?",
            options: ["Công nghệ sinh học", "Máy hơi nước", "Công nghệ in 3D", "Công nghệ IoT"],
            correct: 0,
            points: 10,
            explanation: "Công nghệ sinh học tạo ra giống cây mới chống sâu bệnh."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Công nghệ tự động hóa giúp giảm chi phí sản xuất.",
                "Sophia là rô-bốt có thể biểu cảm và giao tiếp phi ngôn ngữ.",
                "Neil Armstrong đặt chân lên Mặt Trăng năm 1969.",
                "Máy hơi nước là thành tựu của Cách mạng công nghiệp lần thứ tư."
            ],
            correctAnswers: [true, true, true, false],
            points: 20,
            explanation: "Tự động hóa giảm chi phí; Sophia có thể biểu cảm; Armstrong đặt chân lên Mặt Trăng năm 1969; máy hơi nước thuộc lần thứ nhất."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao hiệu suất lao động rõ rệt?",
            options: ["Internet", "Máy hơi nước", "Điện thoại bàn", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp nâng cao hiệu suất lao động rõ rệt."
        },
        {
            type: "short",
            question: "Tên gọi khác của Cách mạng công nghiệp lần thứ ba là gì?",
            correct: "Cách mạng kỹ thuật số",
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ ba còn gọi là Cách mạng kỹ thuật số."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp quản lí đô thị thông minh?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp quản lí đô thị thông minh."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao chất lượng sản phẩm?",
            options: ["Tự động hóa", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Tự động hóa giúp nâng cao chất lượng sản phẩm."
        },
        {
            type: "essay",
            question: "Phân tích tác động tiêu cực của các cuộc cách mạng công nghiệp hiện đại. (Tối đa 150 từ)",
            suggested: "Các cuộc cách mạng công nghiệp hiện đại gây ô nhiễm môi trường, thay đổi nghề nghiệp, xung đột văn hóa.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: ô nhiễm môi trường, thay đổi nghề nghiệp, xung đột văn hóa."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra kho dữ liệu khổng lồ phục vụ phát triển công nghệ?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp lưu trữ và phân tích dữ liệu khổng lồ."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được coi là 'nhà máy năng lượng' của tế bào?",
            options: ["Ti thể", "Nhân tế bào", "Bộ máy Golgi", "Lưới nội chất"],
            correct: 0,
            points: 10,
            explanation: "Ti thể là bào quan sản xuất năng lượng chính của tế bào."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra giống cây mới có khả năng chống sâu bệnh?",
            options: ["Công nghệ sinh học", "Máy hơi nước", "Công nghệ in 3D", "Công nghệ IoT"],
            correct: 0,
            points: 10,
            explanation: "Công nghệ sinh học tạo ra giống cây mới có khả năng chống sâu bệnh."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao năng suất lao động trong thời đại kỹ thuật số?",
            options: ["Internet", "Máy hơi nước", "Điện thoại bàn", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp nâng cao năng suất lao động trong thời đại kỹ thuật số."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Sophia là rô-bốt được cấp quyền công dân bởi Ả-rập Xê-út.",
                "Máy ENIAC ra đời năm 1946.",
                "Neil Armstrong đặt chân lên Mặt Trăng năm 1969.",
                "Công nghệ hơi nước là thành tựu của Cách mạng công nghiệp lần thứ tư."
            ],
            correctAnswers: [true, true, true, false],
            points: 20,
            explanation: "Sophia được cấp quyền công dân bởi Ả-rập Xê-út; ENIAC ra đời năm 1946; Armstrong đặt chân lên Mặt Trăng năm 1969; máy hơi nước thuộc lần thứ nhất."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp quản lí đô thị thông minh?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp quản lí đô thị thông minh."
        },
        {
            type: "short",
            question: "Ai là người phát minh ra World Wide Web (WWW)?",
            correct: "Tim Berners-Lee",
            points: 10,
            explanation: "Tim Berners-Lee phát minh ra World Wide Web năm 1990."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao chất lượng sản phẩm?",
            options: ["Tự động hóa", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Tự động hóa giúp nâng cao chất lượng sản phẩm."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra kho dữ liệu khổng lồ phục vụ phát triển công nghệ?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp lưu trữ và phân tích dữ liệu khổng lồ."
        },
        {
            type: "essay",
            question: "Phân tích ý nghĩa kinh tế của các cuộc cách mạng công nghiệp hiện đại. (Tối đa 150 từ)",
            suggested: "Các cuộc cách mạng công nghiệp hiện đại giúp tăng năng suất lao động, nâng cao chất lượng sản phẩm, thúc đẩy phát triển kinh tế toàn cầu.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: năng suất, chất lượng, phát triển kinh tế quốc gia và toàn cầu."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được coi là 'nhà máy năng lượng' của tế bào?",
            options: ["Ti thể", "Nhân tế bào", "Bộ máy Golgi", "Lưới nội chất"],
            correct: 0,
            points: 10,
            explanation: "Ti thể là bào quan sản xuất năng lượng chính của tế bào."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp chia sẻ thông tin và tri thức toàn cầu?",
            options: ["Internet", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp chia sẻ thông tin và tri thức toàn cầu."
        },
        {
            type: "multiple",
            question: "Cuộc cách mạng công nghiệp lần thứ ba còn được gọi là gì?",
            options: ["Cách mạng hơi nước", "Cách mạng kỹ thuật số", "Cách mạng xanh", "Cách mạng 4.0"],
            correct: 1,
            points: 10,
            explanation: "Cuộc cách mạng công nghiệp lần thứ ba còn gọi là Cách mạng kỹ thuật số."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao hiệu suất lao động rõ rệt?",
            options: ["Internet", "Máy hơi nước", "Điện thoại bàn", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp nâng cao hiệu suất lao động rõ rệt."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Sophia là rô-bốt có thể chơi nhạc và trình diễn thời trang.",
                "Máy ENIAC nặng khoảng 30 tấn.",
                "Neil Armstrong đặt chân lên Mặt Trăng năm 1969.",
                "Công nghệ hơi nước là thành tựu của Cách mạng công nghiệp lần thứ ba."
            ],
            correctAnswers: [true, true, true, false],
            points: 20,
            explanation: "Sophia có thể chơi nhạc, trình diễn; ENIAC nặng 30 tấn; Armstrong đặt chân lên Mặt Trăng năm 1969; máy hơi nước thuộc lần thứ nhất."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp quản lí đô thị thông minh?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp quản lí đô thị thông minh."
        },
        {
            type: "short",
            question: "Ai là người phát minh ra mạng không dây (Wi-Fi)?",
            correct: "Nhóm các nhà khoa học do ông Su-pha-nan dẫn đầu",
            points: 10,
            explanation: "Wi-Fi được đăng sáng chế năm 1996 bởi nhóm do ông Su-pha-nan dẫn đầu."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao chất lượng sản phẩm?",
            options: ["Tự động hóa", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Tự động hóa giúp nâng cao chất lượng sản phẩm."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra kho dữ liệu khổng lồ phục vụ phát triển công nghệ?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp lưu trữ và phân tích dữ liệu khổng lồ."
        },
        {
            type: "essay",
            question: "Phân tích ý nghĩa xã hội của các cuộc cách mạng công nghiệp hiện đại. (Tối đa 150 từ)",
            suggested: "Các cuộc cách mạng công nghiệp hiện đại giúp giải phóng sức lao động, thúc đẩy giao lưu văn hóa, chia sẻ tri thức toàn cầu.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: giải phóng sức lao động, giao lưu văn hóa, chia sẻ tri thức."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được coi là 'nhà máy năng lượng' của tế bào?",
            options: ["Ti thể", "Nhân tế bào", "Bộ máy Golgi", "Lưới nội chất"],
            correct: 0,
            points: 10,
            explanation: "Ti thể là bào quan sản xuất năng lượng chính của tế bào."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp chia sẻ thông tin và tri thức toàn cầu?",
            options: ["Internet", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp chia sẻ thông tin và tri thức toàn cầu."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao năng suất và chất lượng sản phẩm?",
            options: ["Tự động hóa", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Tự động hóa giúp nâng cao năng suất và chất lượng sản phẩm."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp kết nối mọi thứ trong thời đại 4.0?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp kết nối mọi thứ thông qua internet trong thời đại 4.0."
        },
        {
            type: "truefalse",
            question: "Đánh giá đúng/sai về các phát biểu sau:",
            statements: [
                "Sophia là rô-bốt có thể biểu cảm và giao tiếp phi ngôn ngữ.",
                "Máy ENIAC ra đời năm 1946.",
                "Neil Armstrong đặt chân lên Mặt Trăng năm 1969.",
                "Công nghệ hơi nước là thành tựu của Cách mạng công nghiệp lần thứ tư."
            ],
            correctAnswers: [true, true, true, false],
            points: 20,
            explanation: "Sophia có thể biểu cảm; ENIAC ra đời năm 1946; Armstrong đặt chân lên Mặt Trăng năm 1969; máy hơi nước thuộc lần thứ nhất."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp quản lí đô thị thông minh?",
            options: ["Internet vạn vật (IoT)", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "IoT giúp quản lí đô thị thông minh."
        },
        {
            type: "short",
            question: "Tên gọi khác của Cách mạng công nghiệp lần thứ tư là gì?",
            correct: "Cách mạng 4.0",
            points: 10,
            explanation: "Cách mạng công nghiệp lần thứ tư còn gọi là Cách mạng 4.0."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp tạo ra kho dữ liệu khổng lồ phục vụ phát triển công nghệ?",
            options: ["Big Data", "Máy hơi nước", "Công nghệ vi sinh", "Điện thoại bàn"],
            correct: 0,
            points: 10,
            explanation: "Big Data giúp lưu trữ và phân tích dữ liệu khổng lồ."
        },
        {
            type: "multiple",
            question: "Công nghệ nào được coi là 'nhà máy năng lượng' của tế bào?",
            options: ["Ti thể", "Nhân tế bào", "Bộ máy Golgi", "Lưới nội chất"],
            correct: 0,
            points: 10,
            explanation: "Ti thể là bào quan sản xuất năng lượng chính của tế bào."
        },
        {
            type: "essay",
            question: "Phân tích tác động của các cuộc cách mạng công nghiệp hiện đại đối với văn hóa. (Tối đa 150 từ)",
            suggested: "Các cuộc cách mạng công nghiệp hiện đại thúc đẩy giao lưu văn hóa, toàn cầu hóa, tiếp thu giá trị mới.",
            points: 30,
            explanation: "Đáp án cần đề cập đến: giao lưu văn hóa, toàn cầu hóa, tiếp thu và giao thoa giá trị."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp chia sẻ thông tin và tri thức toàn cầu?",
            options: ["Internet", "Máy hơi nước", "Công nghệ vi sinh", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp chia sẻ thông tin và tri thức toàn cầu."
        },
        {
            type: "multiple",
            question: "Công nghệ nào giúp nâng cao hiệu suất lao động rõ rệt?",
            options: ["Internet", "Máy hơi nước", "Điện thoại bàn", "Công nghệ gen"],
            correct: 0,
            points: 10,
            explanation: "Internet giúp nâng cao hiệu suất lao động rõ rệt."
        }
    ]
};