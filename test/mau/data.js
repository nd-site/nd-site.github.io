// data.js - File dữ liệu mẫu cho EduSpace Quiz (Dùng để test)
window.quizData = {
    title: "Bài kiểm tra mẫu (Chế độ Test)",
    config: {
        testDuration: 600  // 10 phút
    },
    questions: [
        {
            type: "multiple",
            question: "Đây là câu hỏi trắc nghiệm số 1. Chọn đáp án đúng?",
            options: ["Đáp án A (Sai)", "Đáp án B (Đúng)", "Đáp án C (Sai)", "Đáp án D (Sai)"],
            correct: 1,
            points: 10,
            explanation: "Giải thích: Đáp án B là đáp án được thiết lập là đúng."
        },
        {
            type: "truefalse",
            question: "Đây là câu hỏi Đúng/Sai số 2. Đánh giá các phát biểu sau:",
            statements: [
                "Phát biểu 1: Đúng",
                "Phát biểu 2: Sai",
                "Phát biểu 3: Đúng"
            ],
            correctAnswers: [true, false, true],
            points: 15,
            explanation: "Giải thích: 1-Đúng, 2-Sai, 3-Đúng theo thiết lập."
        },
        {
            type: "short",
            question: "Đây là câu hỏi trả lời ngắn số 3. Nhập từ 'test'?",
            correct: "test",
            points: 10,
            explanation: "Giải thích: Bạn cần nhập đúng từ 'test' (không phân biệt hoa thường tùy cấu hình)."
        },
        {
            type: "multiple",
            question: `<p>Đây là câu hỏi trắc nghiệm số 4 có kèm ảnh minh họa:</p>`,
            image: "https://placehold.co/600x400?text=Placeholder+Image",
            options: ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3 (Đúng)"],
            correct: 2,
            points: 10,
            explanation: "Giải thích: Lựa chọn 3 là đáp án đúng cho câu hỏi này."
        },
        {
            type: "essay",
            question: "Đây là câu hỏi tự luận số 5. Hãy viết một đoạn văn ngắn khoảng 50 từ về mục đích của bài test này?",
            suggested: "Bài test này dùng để kiểm tra bố cục, giao diện và các tính năng cơ bản của hệ thống EduSpace Quiz mà không cần dữ liệu thật phức tạp.",
            points: 20,
            explanation: "Giải thích: AI sẽ chấm điểm dựa trên độ phù hợp của nội dung với mục đích kiểm tra hệ thống."
        },
        {
            type: "multiple",
            question: "Đây là câu hỏi số 6 có chứa công thức MathJax:",
            options: [
                "$$x = 1$$",
                "$$x = 2$$",
                "$$x = 3$$"
            ],
            correct: 0,
            points: 5,
            explanation: "Giải thích: Công thức $$x = 1$$ là đáp án đúng."
        }
    ]
};
