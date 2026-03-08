// data.js - File dữ liệu mẫu cho EduSpace Quiz
window.quizData = {
    title: "Bài kiểm tra mẫu - Hỗ trợ bảng, ảnh & công thức (2026)",
    config: {
        testDuration: 1800  // 30 phút cho chế độ kiểm tra
    },
    questions: [
        {
            type: "multiple",
            question: `
                <p>Dựa vào bảng dữ liệu dưới đây, hành tinh nào có <strong>khối lượng lớn nhất</strong> trong Hệ Mặt Trời?</p>
                <table>
                    <thead>
                        <tr>
                            <th>Hành tinh</th>
                            <th>Khối lượng (×10²⁴ kg)</th>
                            <th>Đường kính trung bình (km)</th>
                            <th>Số vệ tinh tự nhiên</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Trái Đất</td><td>5.972</td><td>12.742</td><td>1</td></tr>
                        <tr><td>Sao Hỏa</td><td>0.642</td><td>6.779</td><td>2</td></tr>
                        <tr><td>Sao Mộc</td><td>1898</td><td>139.820</td><td>95</td></tr>
                        <tr><td>Sao Thổ</td><td>568</td><td>116.460</td><td>146</td></tr>
                    </tbody>
                </table>
            `,
            image: "https://science.nasa.gov/wp-content/uploads/2023/09/jupiter-marble-beauty-16x9-1.jpg?w=2048",
            options: ["Trái Đất", "Sao Hỏa", "Sao Mộc", "Sao Thổ"],
            correct: 2,
            points: 10,
            explanation: `
                <p>Đáp án đúng là <strong>Sao Mộc</strong> với khối lượng khoảng <strong>1.898 × 10²⁷ kg</strong> – lớn gấp hơn 300 lần Trái Đất.</p>
                <img src="https://science.nasa.gov/wp-content/uploads/2023/09/jupiter-marble-beauty-16x9-1.jpg?w=1024" alt="Hình ảnh Sao Mộc từ tàu Juno">
                <p>Bảng trên cho thấy rõ sự chênh lệch lớn về khối lượng giữa các hành tinh khí khổng lồ (Sao Mộc, Sao Thổ) và các hành tinh đất đá.</p>
            `
        },
        {
            type: "truefalse",
            question: "Đánh giá tính đúng/sai của các phát biểu sau về quang hợp ở thực vật:",
            statements: [
                "Quang hợp chỉ diễn ra ở lá cây nhờ diệp lục.",
                "Phản ứng quang hợp cần ánh sáng, CO₂ và nước để tạo ra glucose và oxy.",
                "Phương trình tổng quát của quang hợp là: $$6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$$.",
                "Thực vật không thực hiện quang hợp vào ban đêm."
            ],
            correctAnswers: [false, true, true, true],
            points: 20,
            explanation: `
                <ul>
                    <li><strong>A. Sai</strong>: Quang hợp còn xảy ra ở thân non, cành xanh có diệp lục.</li>
                    <li><strong>B. Đúng</strong>: Đây là các yếu tố cần thiết.</li>
                    <li><strong>C. Đúng</strong>: Phương trình cân bằng chính xác (có xúc tác ánh sáng và diệp lục).</li>
                    <li><strong>D. Đúng</strong>: Ban đêm thực vật chủ yếu hô hấp, không quang hợp do thiếu ánh sáng.</li>
                </ul>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Photosynthesis_equation.svg/1280px-Photosynthesis_equation.svg.png" alt="Phương trình quang hợp">
            `
        },
        {
            type: "short",
            question: "Năm hiện tại là năm bao nhiêu? (Nhập 4 chữ số)",
            correct: "2026",
            points: 10,
            explanation: "Đúng rồi! Năm hiện tại là <strong>2026</strong>."
        },
        {
            type: "multiple",
            question: `
                <p>Quan sát hình ảnh bên dưới và chọn phát biểu <strong>đúng</strong> nhất:</p>
            `,
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg",
            options: [
                "Đây là hình ảnh Trái Đất chụp từ Mặt Trăng bởi phi hành gia Apollo 17.",
                "Đây là hình ảnh Sao Hỏa chụp bởi tàu Curiosity.",
                "Đây là hình ảnh giả lập từ phần mềm mô phỏng.",
                "Đây là hình ảnh Sao Kim chụp bởi tàu Magellan."
            ],
            correct: 0,
            points: 15,
            explanation: `
                <p>Đúng! Đây là bức ảnh nổi tiếng <strong>"The Blue Marble"</strong> được chụp bởi phi hành đoàn Apollo 17 vào ngày 7/12/1972 – một trong những hình ảnh Trái Đất đẹp và đầy đủ nhất từ không gian.</p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1280px-The_Earth_seen_from_Apollo_17.jpg" alt="The Blue Marble - Apollo 17">
            `
        },
        {
            type: "essay",
            question: "Giải thích ngắn gọn vai trò của ti thể (mitochondria) trong tế bào nhân chuẩn. (Tối đa 150 từ)",
            suggested: "Ti thể là bào quan sản xuất năng lượng chính của tế bào, thường được gọi là 'nhà máy năng lượng'. Chúng thực hiện hô hấp tế bào, chuyển hóa glucose và oxy thành ATP thông qua chuỗi hô hấp và phosphoryl hóa oxy hóa. Ti thể có DNA riêng và có thể tự nhân đôi. Chúng rất quan trọng với các tế bào cần nhiều năng lượng như cơ bắp và thần kinh.",
            points: 30,
            explanation: `
                <p>Câu trả lời sẽ được AI chấm dựa trên các ý chính:</p>
                <ul>
                    <li>Ti thể là nơi sản xuất ATP (năng lượng)</li>
                    <li>Thực hiện hô hấp tế bào / chuỗi hô hấp</li>
                    <li>Có DNA riêng, tự nhân đôi</li>
                    <li>Quan trọng với tế bào tiêu thụ nhiều năng lượng</li>
                </ul>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Mitochondrion_structure.svg/800px-Mitochondrion_structure.svg.png" alt="Cấu trúc ti thể">
            `
        },
        {
            type: "multiple",
            question: "Công thức tính vận tốc trung bình trong chuyển động thẳng đều là:",
            options: [
                "$$v = \\frac{s}{t}$$",
                "$$v = \\frac{\\Delta s}{\\Delta t}$$",
                "$$v = s \\times t$$",
                "$$v = \\frac{t}{s}$$"
            ],
            correct: 0,
            points: 10,
            explanation: "Đáp án đúng là $$v = \\frac{s}{t}$$ (quãng đường chia cho thời gian). Đây là công thức cơ bản của chuyển động thẳng đều."
        }
    ]
};