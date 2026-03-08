// data.js - ĐỀ CƯƠNG ÔN TẬP KIỂM TRA CUỐI HỌC KÌ I - ĐỊA LÝ 10 (2025-2026)
// Bao gồm toàn bộ câu hỏi trắc nghiệm, đúng/sai và tự luận từ tài liệu

window.quizData = {
    title: "Ôn tập đầy đủ - Kiểm tra cuối Học kì I Địa lý 10 (2025-2026)",
    config: {
        testDuration: 3600 // 60 phút - phù hợp kiểm tra đầy đủ
    },
    questions: [
        // TRẮC NGHIỆM NHIỀU LỰA CHỌN
        {
            type: "multiple",
            question: "Phát biểu nào sau đây đúng với lớp vỏ Trái Đất?",
            options: [
                "Vỏ cứng ngoài cùng, ở đại dương dày khoảng 5 km.",
                "Độ dày đồng đều, cấu tạo bởi các tầng đá khác nhau.",
                "Trên cùng là đá ba dan, dưới cùng là đá trầm tích.",
                "Giới hạn vỏ Trái Đất đồng nhất với thạch quyển."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Lớp vỏ Trái Đất là lớp vỏ cứng ngoài cùng, có độ dày không đồng đều: vỏ lục địa dày trung bình 35-40 km, vỏ đại dương mỏng hơn, trung bình khoảng 5-10 km."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây không đúng về vỏ Trái Đất?",
            options: [
                "Gồm vỏ lục địa và vỏ đại dương.",
                "Vỏ lục địa dày hơn vỏ đại dương.",
                "Vỏ lục địa mỏng hơn vỏ đại dương.",
                "Cấu tạo bởi các tầng đá khác nhau."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Đây là phát biểu sai vì thực tế vỏ lục địa (trung bình 35-40 km) luôn dày hơn vỏ đại dương (5-10 km)."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây không đúng về vỏ Trái Đất?",
            options: [
                "Gồm vỏ lục địa và vỏ đại dương.",
                "Vỏ lục địa dày hơn vỏ đại dương.",
                "Có sự đồng nhất về độ dày ở mọi nơi.",
                "Tầng trầm tích có độ dày không đều."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Vỏ Trái Đất có độ dày thay đổi rõ rệt giữa lục địa và đại dương, không hề có sự đồng nhất."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây không đúng về các mảng kiến tạo?",
            options: [
                "Di chuyển độc lập với tốc độ chậm.",
                "Nơi tiếp xúc thường có động đất, núi lửa.",
                "Luôn luôn đứng yên không di chuyển.",
                "Nổi lên trên lớp vật chất quánh dẻo."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Theo thuyết Kiến tạo mảng, các mảng kiến tạo không đứng yên mà luôn di chuyển trên lớp man-ti trên quánh dẻo."
        },
        {
            type: "multiple",
            question: "Các mảng kiến tạo nổi trên lớp vật chất quánh dẻo thuộc:",
            options: [
                "phần trên lớp man-ti.",
                "phần dưới lớp man-ti.",
                "trên nhân Trái Đất.",
                "mặt các đại dương."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Thạch quyển (bao gồm vỏ Trái Đất và phần trên cùng của lớp man-ti) nằm trên lớp vật chất quánh dẻo (quyển mềm) của lớp man-ti trên."
        },
        {
            type: "multiple",
            question: "Các mảng kiến tạo:",
            options: [
                "di chuyển với tốc độ nhanh.",
                "di chuyển với tốc độ chậm.",
                "chỉ có các mảng lục địa.",
                "chỉ có các mảng đại dương."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Các mảng kiến tạo di chuyển rất chậm, chỉ vài centimet mỗi năm."
        },
        {
            type: "multiple",
            question: "Nội lực là lực phát sinh từ:",
            options: [
                "bên ngoài Trái Đất.",
                "bên trong Trái Đất.",
                "bức xạ của Mặt Trời.",
                "nhân của Trái Đất."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Nội lực là lực phát sinh từ bên trong Trái Đất, nguồn năng lượng chủ yếu từ sự phân rã các chất phóng xạ..."
        },
        {
            type: "multiple",
            question: "Gió mùa là loại gió:",
            options: [
                "thổi theo mùa.",
                "thổi quanh năm.",
                "thổi trên cao.",
                "thổi ở mặt đất."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Gió mùa là loại gió thổi theo mùa với hướng ngược nhau giữa hai mùa."
        },
        {
            type: "multiple",
            question: "Các loại gió nào sau đây có phạm vi địa phương?",
            options: [
                "Gió Tây ôn đới, gió phơn.",
                "Gió Đông cực; gió đất, biển.",
                "Gió đất, biển; gió phơn.",
                "Gió Mậu dịch; gió mùa."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Gió đất - biển và gió phơn là các loại gió hình thành do đặc điểm địa hình và sự nóng lên, lạnh đi không đều trong phạm vi hẹp."
        },
        {
            type: "multiple",
            question: "Đặc điểm của gió mùa là:",
            options: [
                "hướng gió thay đổi theo mùa.",
                "tính chất không đổi theo mùa.",
                "nhiệt độ các mùa giống nhau.",
                "độ ẩm các mùa tương tự nhau."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Đặc điểm cơ bản nhất của gió mùa là hướng gió thay đổi ngược nhau theo mùa."
        },
        {
            type: "multiple",
            question: "Miền có Frông, nhất là dải hội tụ nhiệt đới đi qua thường:",
            options: [
                "không mưa.",
                "mưa nhiều.",
                "khô hạn.",
                "mưa rất ít."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Tại nơi có Frông hoặc dải hội tụ nhiệt đới, các khối khí nóng bốc lên mạnh tạo điều kiện cho hơi nước ngưng tụ, gây mưa lớn."
        },
        {
            type: "multiple",
            question: "Gió Mậu dịch có tính chất:",
            options: [
                "khô, ít mưa.",
                "ẩm, mưa nhiều.",
                "lạnh, ít mưa.",
                "nóng, mưa nhiều."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Gió Mậu dịch thổi từ áp cao chí tuyến về áp thấp xích đạo, tính chất chung là khô và ít mưa."
        },
        {
            type: "multiple",
            question: "Tính chất của gió Tây ôn đới là:",
            options: [
                "nóng ẩm.",
                "lạnh khô.",
                "khô.",
                "ẩm."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Gió Tây ôn đới thổi qua bề mặt đại dương nên mang theo nhiều hơi ẩm."
        },
        {
            type: "multiple",
            question: "Từ xích đạo về cực có:",
            options: [
                "nhiệt độ trung bình năm giảm, biên độ nhiệt độ năm tăng.",
                "biên độ nhiệt độ năm tăng, nhiệt độ trung bình năm tăng.",
                "góc chiếu của tia bức xạ mặt trời tăng, nhiệt độ hạ thấp.",
                "nhiệt độ hạ thấp, biên độ nhiệt độ trung bình năm giảm."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Càng về phía cực, góc nhập xạ càng nhỏ nên nhiệt độ giảm dần; biên độ nhiệt tăng."
        },
        {
            type: "multiple",
            question: "Nhận xét nào sau đây không đúng về phân bố mưa theo vĩ độ?",
            options: [
                "Xích đạo có lượng mưa nhỏ nhất.",
                "Lượng mưa phân hóa theo vĩ độ.",
                "Xích đạo có lượng mưa lớn nhất.",
                "Ở hai cực có lượng mưa nhỏ nhất."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Đây là nhận xét sai vì khu vực Xích đạo là nơi có lượng mưa lớn nhất thế giới."
        },
        {
            type: "multiple",
            question: "Nhận xét nào sau đây đúng về phân bố mưa trên Trái Đất?",
            options: [
                "Xích đạo có lượng mưa nhỏ nhất, chí tuyến mưa nhiều nhất.",
                "Ở vùng nhiệt đới, bờ đông của lục địa mưa nhiều hơn bờ tây.",
                "Ở vùng ôn đới, bờ đông của lục địa mưa nhiều hơn bờ tây.",
                "Ôn đới có mưa nhiều nhất, vùng chí tuyến có mưa nhỏ nhất."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Ở vùng nhiệt đới, bờ đông thường có dòng biển nóng và gió từ biển thổi vào nên mưa nhiều."
        },
        {
            type: "multiple",
            question: "Nước trên Trái Đất chủ yếu là:",
            options: [
                "nước ngọt.",
                "nước mặn.",
                "nước lợ.",
                "nước phèn."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Nước mặn chiếm khoảng 97,5% tổng lượng nước trên Trái Đất."
        },
        {
            type: "multiple",
            question: "Thủy quyển là:",
            options: [
                "toàn bộ nước ở các biển và đại dương.",
                "toàn bộ lớp nước bao quanh Trái Đất.",
                "toàn bộ nước ngầm, nước băng tuyết.",
                "toàn bộ nước trong cơ thể các sinh vật."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Thủy quyển là lớp vỏ lỏng không liên tục bao quanh Trái Đất."
        },
        {
            type: "multiple",
            question: "Nước trên Trái Đất tồn tại ở các trạng thái khác nhau là:",
            options: [
                "lỏng, rắn, hơi.",
                "lỏng và rắn.",
                "rắn và hơi.",
                "không xác định."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Nước tồn tại ở ba trạng thái: lỏng, rắn, hơi."
        },
        {
            type: "multiple",
            question: "Nguồn cung cấp nước ngọt ngầm không phải là:",
            options: [
                "nước mưa.",
                "băng tuyết.",
                "nước trên mặt.",
                "nước ở biển."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Nước biển là nước mặn, không phải nguồn cung cấp trực tiếp cho nước ngọt ngầm."
        },
        {
            type: "multiple",
            question: "Độ muối của nước biển không phụ thuộc vào:",
            options: [
                "lượng mưa.",
                "lượng bốc hơi.",
                "lượng nước ở các hồ đầm.",
                "lượng nước sông chảy ra."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Hồ đầm trong nội địa không ảnh hưởng đến độ muối đại dương."
        },
        {
            type: "multiple",
            question: "Độ muối nước biển lớn nhất ở vùng:",
            options: [
                "xích đạo.",
                "chí tuyến.",
                "cực.",
                "ôn đới."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Vùng chí tuyến có áp cao, ít mưa nhưng lượng bốc hơi cực lớn."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây đúng về sự thay đổi nhiệt độ nước biển theo thời gian?",
            options: [
                "Mùa hạ có nhiệt độ thấp hơn mùa đông.",
                "Nhiệt độ không thay đổi theo mùa.",
                "Mùa đông có nhiệt độ cao hơn mùa hạ.",
                "Mùa hạ có nhiệt độ cao hơn mùa đông."
            ],
            correct: 3,
            points: 5,
            explanation: "Đáp án D. Mùa hạ nhận được nhiều bức xạ mặt trời nên nhiệt độ cao hơn."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây đúng về nhiệt độ nước biển theo vĩ tuyến?",
            options: [
                "Tăng dần từ xích đạo về cực.",
                "Giảm dần từ xích đạo về cực.",
                "Cao nhất ở vùng ôn đới.",
                "Thấp nhất ở vùng chí tuyến."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Nhiệt độ nước biển giảm dần từ xích đạo về hai cực."
        },
        {
            type: "multiple",
            question: "Nhiệt độ nước biển phụ thuộc nhiều nhất vào nhiệt độ của:",
            options: [
                "Không khí.",
                "Các dòng biển.",
                "Các đảo.",
                "Các đại dương."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Nhiệt độ nước biển tầng mặt chủ yếu phụ thuộc vào bức xạ mặt trời và sự trao đổi nhiệt với không khí."
        },
        {
            type: "multiple",
            question: "Nguồn nước ngầm không phụ thuộc vào:",
            options: [
                "Đặc điểm đất đá.",
                "Độ mặn của nước biển.",
                "Lượng mưa.",
                "Địa hình và lớp phủ thực vật."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Độ mặn nước biển không quyết định nguồn cung cấp hay sự hình thành nước ngầm trong lục địa."
        },
        {
            type: "multiple",
            question: "Nguồn nước giúp duy trì sự sống trên lục địa chủ yếu là:",
            options: [
                "Nước mặn.",
                "Nước lợ.",
                "Nước ngọt.",
                "Nước phèn."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Hầu hết các sinh vật và con người trên lục địa cần nước ngọt."
        },
        {
            type: "multiple",
            question: "Phần lớn lượng nước ngầm trên lục địa có nguồn gốc từ:",
            options: [
                "Nước trên mặt thấm xuống.",
                "Nước biển xâm nhập.",
                "Nước trong lòng đất tự có.",
                "Hơi nước từ trên cao."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Nước ngầm chủ yếu do nước mưa, nước sông ngòi, hồ ao thấm xuống."
        },
        {
            type: "multiple",
            question: "Nước băng tuyết ở thể nào sau đây?",
            options: [
                "Rắn.",
                "Lỏng.",
                "Hơi.",
                "Khí."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A."
        },
        {
            type: "multiple",
            question: "Đặc trưng của đất (thổ nhưỡng) là:",
            options: [
                "Độ tơi xốp.",
                "Độ phì.",
                "Độ ẩm.",
                "Thành phần khoáng."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B. Độ phì là khả năng cung cấp nước, nhiệt, khí và chất dinh dưỡng cho thực vật."
        },
        {
            type: "multiple",
            question: "Quy luật thống nhất và hoàn chỉnh của lớp vỏ địa lí là:",
            options: [
                "Quy luật về mối quan hệ quy định lẫn nhau giữa các thành phần của lớp vỏ địa lí.",
                "Quy luật về sự thay đổi các thành phần theo vĩ độ.",
                "Quy luật về sự thay đổi theo độ cao.",
                "Quy luật về sự lặp lại các hiện tượng địa lí."
            ],
            correct: 0,
            points: 5,
            explanation: "Đáp án A. Các thành phần của lớp vỏ địa lí luôn tác động, phụ thuộc và quy định lẫn nhau."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây không đúng với vỏ địa lí?",
            options: [
                "Bao gồm toàn bộ thủy quyển và sinh quyển.",
                "Giới hạn dưới của vỏ địa lí là đáy vực thẳm đại dương.",
                "Ranh giới trùng hoàn toàn với lớp vỏ Trái Đất.",
                "Giới hạn trên là nơi tiếp xúc giữa tầng đối lưu và tầng bình lưu."
            ],
            correct: 2,
            points: 5,
            explanation: "Đáp án C. Ranh giới vỏ địa lí không trùng hoàn toàn với lớp vỏ Trái Đất."
        },
        {
            type: "multiple",
            question: "Chiều dày của lớp vỏ địa lí là:",
            options: [
                "Từ 5 – 10 km.",
                "Từ 30 – 35 km.",
                "Từ 70 – 100 km.",
                "Từ 5 – 70 km."
            ],
            correct: 1,
            points: 5,
            explanation: "Đáp án B."
        },

        // TRẮC NGHIỆM ĐÚNG SAI (Nhiệt độ theo vĩ độ)
        {
            type: "truefalse",
            question: "Đánh giá tính đúng/sai của các phát biểu sau về nhiệt độ theo vĩ độ:",
            statements: [
                "Nhiệt độ trung bình năm giảm từ xích đạo về cực.",
                "Chênh lệch nhiệt độ giữa 0° - 20° thấp hơn vùng 40° - 50°.",
                "Biên độ nhiệt tăng từ xích đạo về cực, tăng 20,9°C lên vĩ độ 80°.",
                "Biên độ nhiệt thay đổi do góc nhập xạ giảm."
            ],
            correctAnswers: [true, true, false, true],
            points: 20,
            explanation: `
                <ul>
                    <li>A) ĐÚNG</li>
                    <li>B) ĐÚNG (Vùng nhiệt đới góc nhập xạ thay đổi ít hơn)</li>
                    <li>C) SAI (Mức tăng thực tế thường lớn hơn, gần 30°C ở cực)</li>
                    <li>D) ĐÚNG</li>
                </ul>
            `
        },

        // TRẮC NGHIỆM ĐÚNG SAI (Khí áp và mưa)
        {
            type: "truefalse",
            question: "Đánh giá tính đúng/sai của các phát biểu sau về khí áp và mưa:",
            statements: [
                "Bất cứ địa điểm áp thấp nào cũng mưa rất nhiều.",
                "Khu áp cao cận chí tuyến thường mưa ít hoặc không mưa.",
                "Ôn đới là khu áp thấp nhưng bốc hơi nhỏ nên mưa ít.",
                "Các khu khí áp hình thành theo mùa thường mưa theo mùa."
            ],
            correctAnswers: [false, true, false, true],
            points: 20,
            explanation: `
                <ul>
                    <li>A) SAI (Phải có độ ẩm cao và khối khí ẩm)</li>
                    <li>B) ĐÚNG</li>
                    <li>C) SAI (Ôn đới có mưa khá nhiều do gió Tây ôn đới mang ẩm)</li>
                    <li>D) ĐÚNG</li>
                </ul>
            `
        },

        // TRẮC NGHIỆM ĐÚNG SAI (Chủ đề Đất và Sinh quyển)
        {
            type: "truefalse",
            question: "Đánh giá tính đúng/sai của các phát biểu sau về đất và sinh quyển:",
            statements: [
                "Mỗi loài thích nghi với giới hạn nhiệt độ nhất định.",
                "Khí hậu ảnh hưởng qua nhiệt độ và ánh sáng.",
                "Đối với động vật ánh sáng ảnh hưởng không đáng kể.",
                "Động vật đa dạng do khí hậu phân hóa đa dạng."
            ],
            correctAnswers: [true, true, false, true],
            points: 20,
            explanation: `
                <ul>
                    <li>A) ĐÚNG</li>
                    <li>B) ĐÚNG</li>
                    <li>C) SAI (Ánh sáng ảnh hưởng đến định hướng, chu kỳ sinh sản...)</li>
                    <li>D) ĐÚNG</li>
                </ul>
            `
        },

        // TỰ LUẬN
        {
            type: "essay",
            question: "Giải thích hiện tượng Thủy triều trên Trái Đất.",
            suggested: "Thủy triều là hiện tượng nước biển dâng cao và hạ thấp theo chu kỳ do lực hút của Mặt Trăng, Mặt Trời và lực li tâm của Trái Đất. Triều cường xảy ra khi Mặt Trời, Mặt Trăng và Trái Đất nằm trên cùng một đường thẳng (ngày trăng tròn hoặc không trăng). Triều kém xảy ra khi chúng nằm vuông góc (trăng khuyết).",
            points: 30,
            explanation: "Câu trả lời cần nêu rõ nguyên nhân (lực hút + lực li tâm) và phân biệt triều cường / triều kém."
        },
        {
            type: "essay",
            question: "Phân tích ý nghĩa của biển và đại dương đối với sự phát triển kinh tế.",
            suggested: "Biển và đại dương có vai trò: giao thông vận tải rẻ tiền, cung cấp năng lượng (dầu khí), khoáng sản, thực phẩm (hải sản), phát triển du lịch, điều hòa khí hậu toàn cầu.",
            points: 30,
            explanation: "Câu trả lời tốt nên đề cập ít nhất 4-5 ý chính: giao thông, tài nguyên, thực phẩm, du lịch, điều hòa khí hậu."
        }
    ]
};