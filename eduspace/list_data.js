

/* HƯỚNG DẪN NHẬP LIỆU:
 * - type: 'quiz' (màu xanh dương) hoặc 'lesson' (màu xanh lá)
 * - class: Số lớp (vd: "10")
 * - subject: Tên môn học chính (VD: Công Nghệ, Vật Lý, ...)
 * - subSubject: Tên phân loại con (VD: Công Nghiệp, Nông Nghiệp, ...)
 * - buttonText: Tên nút tùy biến (để trống sẽ dùng mặc định theo type)
 * - isHot: true (nếu muốn đánh dấu "HOT" cho mục này)
 * - isComingSoon: true (nếu muốn đánh dấu "SẮP RA MẮT" cho mục này)
 */
const quizList = [
    /** Mẫu */
    /**
        {
            title: "Mẫu",
            url: "/eduspace/mau",
            description: "Bài kiểm tra mẫu để bạn tham khảo cách tạo đề.",
            tag: "Mẫu",
            type: "quiz",
            isHot: true
        }
    */

    // ── isComingSoon example (commented out) ─────────────
    /**
        {
            title: "Đề cương Tin Học 10 - Học kỳ I năm học 2025-2026",
            url: "/eduspace/tinhoc/10/on-tap-hk1-2526-v1",
            description: "Tổng hợp các câu hỏi ôn tập học kỳ I môn Tin Học lớp 10 năm học 2025-2026 'Bản 1'",
            tag: "Tin Học",
            type: "quiz",
            class: "10",
            subject: "Tin Học",
            isComingSoon: true
        },
    */

    // ── Coming Soon ───────────────────────────────────────
    /*{
        title: "Học tất cả các nguyên tố hóa học trong bảng tuần hoàn",
        url: "/eduspace/BTH/",
        description: "Bài học tương tác giúp bạn nắm vững bảng tuần hoàn các nguyên tố hóa học một cách dễ dàng và thú vị với 'chuỗi kỷ lục'.",
        tag: "Công Cụ",
        type: "quiz",
        subject: "Hóa Học",
        buttonText: "Tạo 'chuỗi kỷ lục' ngay!",
    },*/

    // ── HOT ───────────────────────────────────────────────
    {
        title: "Scan2Word by ND Labs",
        url: "https://scan2word.vercel.app/",
        description: "Scan2Word by ND Labs - Ứng dụng chuyển đổi hình ảnh thành văn bản bằng AI",
        tag: "Công Cụ",
        buttonText: "Trải nghiệm ngay!",
        isHot: true
    },

    // ── THI THỬ THPT 2026 (Cấu trúc mới) ─────────────
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Toán (Bản 1)",
        url: "/eduspace/toan/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Toán theo cấu trúc mới của Bộ GD&ĐT (Trắc nghiệm I, II, III).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Toán",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Toán (Bản 2)",
        url: "/eduspace/toan/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Toán (Bản 2) chuẩn GDPT 2018 (Trắc nghiệm I, II, III).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Toán",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Ngữ văn (Bản 1)",
        url: "/eduspace/nguvan/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Ngữ văn với cấu trúc Đọc hiểu và Viết (Tự luận).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Ngữ Văn",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Ngữ văn (Bản 2)",
        url: "/eduspace/nguvan/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Ngữ văn (Bản 2) - Ngữ liệu và Đề bài hoàn toàn mới chuẩn GDPT 2018.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Ngữ Văn",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Tiếng Anh (Bản 1)",
        url: "/eduspace/tienganh/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Tiếng Anh (40 câu trắc nghiệm).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Tiếng Anh",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Tiếng Anh (Bản 2)",
        url: "/eduspace/tienganh/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Tiếng Anh (Bản 2) - Cập nhật dạng bài đọc điền, sắp xếp đoạn văn chuẩn xác.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Tiếng Anh",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Vật lý (Bản 1)",
        url: "/eduspace/vatly/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Vật lý theo cấu trúc mới (Trắc nghiệm I, II, III).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Vật Lý",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Vật lý (Bản 2)",
        url: "/eduspace/vatly/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Vật lý (Bản 2) - Cập nhật nội dung Vật lý nhiệt, khí lí tưởng chuẩn xác.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Vật Lý",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Hóa học (Bản 1)",
        url: "/eduspace/hoahoc/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Hóa học theo cấu trúc mới (Trắc nghiệm I, II, III).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Hóa Học",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Hóa học (Bản 2)",
        url: "/eduspace/hoahoc/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Hóa học (Bản 2) - Thực nghiệm hóa học, phức chất và hóa học ứng dụng xanh.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Hóa Học",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Sinh học (Bản 1)",
        url: "/eduspace/sinhhoc/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Sinh học theo cấu trúc mới (Trắc nghiệm I, II, III).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Sinh Học",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Sinh học (Bản 2)",
        url: "/eduspace/sinhhoc/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Sinh học (Bản 2) - Cập nhật nội dung di truyền học tế bào và sinh thái thực tiễn.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Sinh Học",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Lịch sử (Bản 1)",
        url: "/eduspace/lichsu/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Lịch sử theo cấu trúc mới (Trắc nghiệm I, II).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Lịch Sử",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Lịch sử (Bản 2)",
        url: "/eduspace/lichsu/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Lịch sử (Bản 2) - Cung cấp sử liệu gốc, đánh giá năng lực tư duy lịch sử.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Lịch Sử",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Địa lí (Bản 1)",
        url: "/eduspace/diali/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Địa lí theo cấu trúc mới (Trắc nghiệm I, II, III).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Địa Lý",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Địa lí (Bản 2)",
        url: "/eduspace/diali/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Địa lí (Bản 2) - Rèn luyện kỹ năng Atlat, bảng số liệu địa lí thực tế.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Địa Lý",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn KT & PL (Bản 1)",
        url: "/eduspace/ktpl/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Giáo dục Kinh tế và Pháp luật theo cấu trúc mới.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Kinh Tế và Pháp Luật",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn KT & PL (Bản 2)",
        url: "/eduspace/ktpl/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn KT & PL (Bản 2) - Tình huống kinh tế vĩ mô và pháp lý gắn liền với thực tiễn.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Kinh Tế và Pháp Luật",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Tin học (Bản 1)",
        url: "/eduspace/tinhoc/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Tin học (Bản 1) - Chuẩn cấu trúc GDPT 2018 (AI, CSDL, Python, Network).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Tin Học",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Tin học (Bản 2)",
        url: "/eduspace/tinhoc/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Tin học (Bản 2) - Chuẩn cấu trúc GDPT 2018 (AI, CSDL, Python, Network).",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Tin Học",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Công nghệ (Bản 1)",
        url: "/eduspace/congnghe-nongnghiep/12/thptqg-2026-v1/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Công nghệ Nông nghiệp (Bản 1) - Canh tác công nghệ cao và an toàn sinh học.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
        isHot: true
    },
    {
        title: "Thi thử tốt nghiệp THPT 2026 - Môn Công nghệ (Bản 2)",
        url: "/eduspace/congnghe-nongnghiep/12/thptqg-2026-v2/",
        description: "Đề thi thử tốt nghiệp THPT năm 2026 môn Công nghệ Nông nghiệp (Bản 2) - Canh tác công nghệ cao và an toàn sinh học.",
        tag: "THPT 2026",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
        isHot: true
    },

    // ── Lessons & Quizzes ─────────────────────────────────
    {
        title: "Học bài viết Tiếng Anh 10 - Học kỳ II năm học 2025-2026",
        url: "/eduspace/tienganh/10/hoc-bai-viet-ck2-2526",
        description: "Học bài viết Tiếng Anh 10 - Học kỳ II năm học 2025-2026",
        tag: "Tiếng Anh",
        type: "lesson",
        class: "10",
        subject: "Tiếng Anh"
    },
    {
        title: "Đề cương Lịch Sử 10 - Học kỳ II năm học 2025-2026",
        url: "/eduspace/lichsu/10/on-tap-hk2-2526-v1",
        description: "Tổng hợp các câu hỏi ôn tập học kỳ II môn Lịch Sử lớp 10 năm học 2025-2026 'Bản 1'",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử"
    },
    {
        title: "Lịch sử bài 8 - Kết Nối Tri Thức",
        url: "/eduspace/lichsu/10/bai8-kntt",
        description: "Lịch sử bài 8: Hành trình phát triển và thành tựu của văn minh Đông Nam Á thời cổ, trung đại - Kết Nối Tri Thức",
        tag: "Lịch Sử",
        type: "lesson",
        subject: "Lịch Sử",
        class: "10"
    },
    {
        title: "Moment lực - Vật Lý 10 KNTT",
        url: "/eduspace/vatly/10/moment-luc",
        description: "Moment Lực. Cân bằng của vật rắn - Vật Lý 10 sách Kết Nối Tri Thức với Cuộc Sống - EduSpace by ND Labs",
        tag: "Vật Lý",
        type: "quiz",
        subject: "Vật Lý",
        class: "10"
    },
    {
        title: "Học thơ - EduSpace by ND Labs",
        url: "/eduspace/nguvan/hoc-tho",
        description: "Học thơ với nhiều tính năng thú vị - EduSpace by ND Labs",
        tag: "Ngữ Văn",
        type: "lesson",
        subject: "Ngữ Văn",
        buttonText: "Học thuộc thơ",
    },
    {
        title: "Học Lịch Sử 10 bài 7 - Kết nối tri thức",
        url: "/eduspace/lichsu/10/bai7-kntt",
        description: "Học Lịch Sử 10 bài 7 - Các cuộc Cách mạng Công nghiệp thời hiện đại - Sách Kết nối tri thức",
        tag: "Lịch Sử",
        type: "lesson",
        subject: "Lịch Sử",
        class: "10",
    },
    {
        title: "Kiểm tra Lịch Sử 10 bài 7 - Kết nối tri thức",
        url: "/eduspace/lichsu/10/bai7-kntt",
        description: "100 câu kiểm tra Lịch Sử 10 bài 7 - Các cuộc Cách mạng Công nghiệp thời hiện đại - Sách Kết nối tri thức",
        tag: "Lịch Sử",
        type: "quiz",
        subject: "Lịch Sử",
        class: "10",
        buttonText: "Làm bài kiểm tra",
    },
    {
        title: "EduVoc by ND Labs - Học từ vựng tiếng Anh thú vị",
        url: "/eduspace/tienganh/voc",
        description: "EduVoc by ND Labs giúp bạn học từ vựng tiếng Anh thú vị hơn bằng nhiều tính năng như flashcard, thử thách nhanh tay, ...",
        tag: "Công Cụ",
        type: "lesson",
        subject: "Tiếng Anh",
        buttonText: "Học ngay!",
    },
    {
        title: "Học các nguyên tố hóa học phổ biến",
        url: "/eduspace/BTH/phobien",
        description: "Bài học tương tác giúp bạn nắm vững bảng tuần hoàn các nguyên tố hóa học một cách dễ dàng và thú vị với 'chuỗi kỷ lục'.",
        tag: "Công Cụ",
        type: "quiz",
        subject: "Hóa Học",
        buttonText: "Tạo 'chuỗi kỷ lục' ngay!",
    },
    {
        title: "EduAI Assistant by ND Labs - Trợ lý AI về Giáo dục",
        url: "/eduspace/assistant",
        description: "EduAI Assistant by ND Labs là trợ lý ảo AI về lĩnh vực Giáo dục.",
        tag: "Công Cụ",
        buttonText: "Trò chuyện với EduAI",
    },
    {
        title: "Đề cương ôn tập Vật lý 10 - Học kì I năm học 2025-2026",
        url: "/eduspace/vatly/10/on-tap-hk1-2526-v1",
        description: "Tổng hợp các câu hỏi ôn tập học kỳ I môn Vật Lý lớp 10 năm học 2025-2026 'Bản 1'",
        tag: "Vật Lý",
        type: "quiz",
        class: "10",
        subject: "Vật Lý"
    },
    {
        title: "Đề cương Địa lí 10 - Học kỳ 1 năm học 2025-2026.",
        url: "/eduspace/diali/10/on-tap-hk1-2526-v1/index.html",
        tag: "Địa Lý",
        type: "quiz",
        subject: "Địa Lý",
        class: "10",
    },
    {
        title: "Thử thách trí nhớ của bạn!",
        url: "/eduspace/memo",
        description: "Bài kiểm tra giúp bạn rèn luyện và thử thách trí nhớ của mình qua các câu hỏi thú vị.",
        tag: "Trí nhớ",
        type: "quiz",
        buttonText: "Bắt đầu thử thách",
    },
    {
        title: "Đề kiểm tra viết Tiếng Anh 10 - Học kỳ I năm học 2025-2026",
        url: "/eduspace/tienganh/10/de-viet-doan-van-hk1-2526-v1",
        description: "Đề kiểm tra viết Tiếng Anh lớp 10 học kỳ I năm học 2025-2026 với yêu cầu viết đoạn văn về lợi ích của một phát minh.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "10",
        subject: "Tiếng Anh",
        buttonText: "Kiểm tra viết",
    },
    {
        title: "Đề cương Lịch Sử 10 - Học kỳ I năm học 2025-2026",
        url: "/eduspace/lichsu/10/on-tap-hk1-2526-v1",
        description: "Tổng hợp các câu hỏi ôn tập học kỳ I môn Lịch Sử lớp 10 năm học 2025-2026 'Bản 1'",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử",
    },
    {
        title: "Đề cương Sinh Học 10 - Học kỳ I năm học 2025-2026",
        url: "/eduspace/sinhhoc/10/on-tap-hk1-2526-v1",
        description: "Tổng hợp các câu hỏi ôn tập học kỳ I môn Sinh Học lớp 10 năm học 2025-2026 'Bản 1'",
        tag: "Sinh Học",
        type: "quiz",
        class: "10",
        subject: "Sinh Học",
    },
    {
        title: "Đề cương GDQP-AN 10 - Học kỳ I năm học 2025-2026",
        url: "/eduspace/gdqp/10/on-tap-hk1-2526-v1",
        description: "Tổng hợp các câu hỏi ôn tập học kỳ I môn Giáo dục Quốc phòng và An ninh lớp 10 năm học 2025-2026 'Bản 1'",
        tag: "GDQP-AN",
        type: "quiz",
        class: "10",
        subject: "Quốc Phòng và An Ninh"
    },
    {
        title: "Đề cương KTPL 10 - Học kỳ I năm học 2025-2026",
        url: "/eduspace/ktpl/10/hk1/on-tap-1",
        description: "Tổng hợp các câu hỏi ôn tập học kỳ I môn Kinh tế Pháp luật lớp 10 năm học 2025-2026 'Bản 1'",
        tag: "KTPL",
        type: "quiz",
        class: "10",
        subject: "Kinh Tế và Pháp Luật"
    },
    {
        title: "Hành trình văn minh nhân loại - Lịch Sử 10",
        url: "/eduspace/lichsu/10/hanh-trinh-van-minh-nhan-loai",
        tag: "Lịch Sử",
        type: "lesson",
        class: "10",
        subject: "Lịch Sử",
        buttonText: "Xem bài học"
    },
    {
        title: "Bài tập Hành trình văn minh nhân loại - Lịch Sử 10",
        url: "/eduspace/lichsu/10/hanh-trinh-van-minh-nhan-loai/bai-tap",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử",
        buttonText: "Thử sức ngay"
    },
    {
        title: "Đề cương Hóa Học 10 - Tính lượng ion dư (Bài 1)",
        url: "/eduspace/hoahoc/10/tinh-luong-ion-du-1",
        description: "Tổng hợp các câu hỏi 'Tính lượng ion dư 1' ôn tập học kỳ I môn Hóa Học lớp 10 năm học 2025-2026",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Đề cương Hóa Học 10 - Tính lượng ion dư (Bài 2)",
        url: "/eduspace/hoahoc/10/tinh-luong-ion-du-2",
        description: "Tổng hợp các câu hỏi 'Tính lượng ion dư 2' ôn tập học kỳ I môn Hóa Học lớp 10 năm học 2025-2026",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Đề cương Hóa Học 10 - Tính lượng ion dư (Bài 3)",
        url: "/eduspace/hoahoc/10/tinh-luong-ion-du-3",
        description: "Tổng hợp các câu hỏi 'Tính lượng ion dư 3' ôn tập học kỳ I môn Hóa Học lớp 10 năm học 2025-2026",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Đề cương Hóa Học 10 - Tính lượng ion dư (Bài 4)",
        url: "/eduspace/hoahoc/10/tinh-luong-ion-du-4",
        description: "Tổng hợp các câu hỏi 'Tính lượng ion dư 4' ôn tập học kỳ I môn Hóa Học lớp 10 năm học 2025-2026",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Hành trình văn minh nhân loại - Lịch Sử 10",
        url: "/eduspace/lichsu/10/hanh-trinh-van-minh-nhan-loai/kiem-tra",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử",
    },
    {
        title: "ÔN TẬP GIỮA HỌC KÌ II - MÔN: CÔNG NGHỆ 10 (2025-2026)",
        url: "/eduspace/congnghe/10/on-tap-gk2-2526-cncn-v1/",
        description: "Tổng hợp các câu hỏi ôn tập giữa học kỳ II môn Thiết kế và Công nghệ lớp 10 năm học 2025-2026",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ",
        subSubject: "Công Nghiệp",
    },
    {
        title: "Ôn tập Giữa học kỳ II - Môn: Lịch Sử 10 (2025-2026)",
        url: "/eduspace/lichsu/10/on-tap-gk2-2526-v1/",
        description: "Tổng hợp các câu hỏi ôn tập giữa học kỳ II môn Lịch Sử lớp 10 năm học 2025-2026",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử",
    },
    {
        title: "Ôn tập Giữa học kỳ II - Môn: Vật Lý 10 2025-2026",
        url: "/eduspace/vatly/10/on-tap-gk2-kntt-v1/",
        description: "Tổng hợp 60 câu trắc nghiệm và 6 bài tự luận ôn tập giữa học kỳ II môn Vật Lý lớp 10 năm học 2025-2026. Bài 21–26.",
        tag: "Vật Lý",
        type: "quiz",
        class: "10",
        subject: "Vật Lý",
    },
    {
        title: "Ôn tập Giữa học kỳ II - Môn: Lịch Sử 9 (2025-2026) v1",
        url: "/eduspace/lichsu/9/on-tap-gk2-2526-v1/",
        description: "Tổng hợp các câu hỏi ôn tập giữa học kỳ II môn Lịch Sử lớp 9 biên soạn bởi EduSpace by ND Labs theo sách Chân Trời Sáng Tạo năm học 2025-2026",
        tag: "Lịch Sử",
        type: "quiz",
        class: "9",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Vật Lý 10 2025-2026",
        url: "/eduspace/vatly/10/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Vật Lý lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Vật Lý",
        type: "quiz",
        class: "10",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Vật Lý 11 2025-2026",
        url: "/eduspace/vatly/11/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Vật Lý lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Vật Lý",
        type: "quiz",
        class: "11",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Vật Lý 12 2025-2026",
        url: "/eduspace/vatly/12/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Vật Lý lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Vật Lý",
        type: "quiz",
        class: "12",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Hóa Học 10 2025-2026",
        url: "/eduspace/hoahoc/10/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Hóa Học lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Hóa Học 11 2025-2026",
        url: "/eduspace/hoahoc/11/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Hóa Học lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Hóa Học",
        type: "quiz",
        class: "11",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Hóa Học 12 2025-2026",
        url: "/eduspace/hoahoc/12/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Hóa Học lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Hóa Học",
        type: "quiz",
        class: "12",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Toán 10 2025-2026",
        url: "/eduspace/toan/10/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Toán lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Toán",
        type: "quiz",
        class: "10",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Toán 11 2025-2026",
        url: "/eduspace/toan/11/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Toán lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Toán",
        type: "quiz",
        class: "11",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Toán 12 2025-2026",
        url: "/eduspace/toan/12/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Toán lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Toán",
        type: "quiz",
        class: "12",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Tin Học 10 2025-2026",
        url: "/eduspace/tinhoc/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Tin Học lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Tin Học",
        type: "quiz",
        class: "10",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Tin Học 11 2025-2026",
        url: "/eduspace/tinhoc/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Tin Học lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Tin Học",
        type: "quiz",
        class: "11",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Tin Học 12 2025-2026",
        url: "/eduspace/tinhoc/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Tin Học lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Tin Học",
        type: "quiz",
        class: "12",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Địa Lí 10 2025-2026",
        url: "/eduspace/diali/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Địa Lí lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Địa Lý",
        type: "quiz",
        class: "10",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Địa Lí 11 2025-2026",
        url: "/eduspace/diali/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Địa Lí lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Địa Lý",
        type: "quiz",
        class: "11",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Địa Lí 12 2025-2026",
        url: "/eduspace/diali/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Địa Lí lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Địa Lý",
        type: "quiz",
        class: "12",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Lịch Sử 10 2025-2026",
        url: "/eduspace/lichsu/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Lịch Sử lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Lịch Sử 11 2025-2026",
        url: "/eduspace/lichsu/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Lịch Sử lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Lịch Sử",
        type: "quiz",
        class: "11",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Lịch Sử 12 2025-2026",
        url: "/eduspace/lichsu/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Lịch Sử lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Lịch Sử",
        type: "quiz",
        class: "12",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Kinh tế và Pháp luật 10 2025-2026",
        url: "/eduspace/ktpl/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Kinh tế và Pháp luật lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "KTPL",
        type: "quiz",
        class: "10",
        subject: "Kinh Tế và Pháp Luật"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Kinh tế và Pháp luật 11 2025-2026",
        url: "/eduspace/ktpl/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Kinh tế và Pháp luật lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "KTPL",
        type: "quiz",
        class: "11",
        subject: "Kinh Tế và Pháp Luật"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Kinh tế và Pháp luật 12 2025-2026",
        url: "/eduspace/ktpl/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Kinh tế và Pháp luật lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "KTPL",
        type: "quiz",
        class: "12",
        subject: "Kinh Tế và Pháp Luật"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 10 Nông nghiệp 2025-2026",
        url: "/eduspace/congnghe-nongnghiep/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 10 (Nông nghiệp trồng trọt) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 11 Chăn nuôi 2025-2026",
        url: "/eduspace/congnghe-nongnghiep/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 11 (Chăn nuôi) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 12 Lâm nghiệp - Thủy sản 2025-2026",
        url: "/eduspace/congnghe-nongnghiep/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 12 (Lâm nghiệp - Thủy sản) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 10 (Thiết kế và Công nghệ) 2025-2026",
        url: "/eduspace/congnghe-congnghiep/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 10 (Thiết kế và Công nghệ) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ",
        subSubject: "Công Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 11 Cơ khí động lực 2025-2026",
        url: "/eduspace/congnghe-congnghiep/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 11 (Cơ khí động lực) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ",
        subSubject: "Công Nghiệp",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Hóa Học 12 2025-2026",
        url: "/eduspace/hoahoc/12/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Hóa Học lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Hóa Học",
        type: "quiz",
        class: "12",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Toán 10 2025-2026",
        url: "/eduspace/toan/10/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Toán lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Toán",
        type: "quiz",
        class: "10",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Toán 11 2025-2026",
        url: "/eduspace/toan/11/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Toán lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Toán",
        type: "quiz",
        class: "11",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Toán 12 2025-2026",
        url: "/eduspace/toan/12/ck2-2526-kntt-v1/",
        description: "Đề kiểm tra cuối học kì II môn Toán lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức). Gồm trắc nghiệm và tự luận.",
        tag: "Toán",
        type: "quiz",
        class: "12",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Tin Học 10 2025-2026",
        url: "/eduspace/tinhoc/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Tin Học lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Tin Học",
        type: "quiz",
        class: "10",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Tin Học 11 2025-2026",
        url: "/eduspace/tinhoc/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Tin Học lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Tin Học",
        type: "quiz",
        class: "11",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Tin Học 12 2025-2026",
        url: "/eduspace/tinhoc/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Tin Học lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Tin Học",
        type: "quiz",
        class: "12",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Địa Lí 10 2025-2026",
        url: "/eduspace/diali/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Địa Lí lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Địa Lý",
        type: "quiz",
        class: "10",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Địa Lí 11 2025-2026",
        url: "/eduspace/diali/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Địa Lí lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Địa Lý",
        type: "quiz",
        class: "11",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Địa Lí 12 2025-2026",
        url: "/eduspace/diali/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Địa Lí lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Địa Lý",
        type: "quiz",
        class: "12",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Lịch Sử 10 2025-2026",
        url: "/eduspace/lichsu/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Lịch Sử lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Lịch Sử 11 2025-2026",
        url: "/eduspace/lichsu/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Lịch Sử lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Lịch Sử",
        type: "quiz",
        class: "11",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Lịch Sử 12 2025-2026",
        url: "/eduspace/lichsu/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Lịch Sử lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "Lịch Sử",
        type: "quiz",
        class: "12",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Kinh tế và Pháp luật 10 2025-2026",
        url: "/eduspace/ktpl/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Kinh tế và Pháp luật lớp 10 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "KTPL",
        type: "quiz",
        class: "10",
        subject: "Kinh Tế và Pháp Luật"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Kinh tế và Pháp luật 11 2025-2026",
        url: "/eduspace/ktpl/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Kinh tế và Pháp luật lớp 11 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "KTPL",
        type: "quiz",
        class: "11",
        subject: "Kinh Tế và Pháp Luật"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Kinh tế và Pháp luật 12 2025-2026",
        url: "/eduspace/ktpl/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Kinh tế và Pháp luật lớp 12 theo chương trình GDPT 2018 (sách Kết nối tri thức).",
        tag: "KTPL",
        type: "quiz",
        class: "12",
        subject: "Kinh Tế và Pháp Luật"
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 10 Nông nghiệp 2025-2026",
        url: "/eduspace/congnghe-nongnghiep/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 10 (Nông nghiệp trồng trọt) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 11 Chăn nuôi 2025-2026",
        url: "/eduspace/congnghe-nongnghiep/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 11 (Chăn nuôi) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 12 Lâm nghiệp - Thủy sản 2025-2026",
        url: "/eduspace/congnghe-nongnghiep/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 12 (Lâm nghiệp - Thủy sản) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ",
        subSubject: "Nông Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 10 (Thiết kế và Công nghệ) 2025-2026",
        url: "/eduspace/congnghe-congnghiep/10/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 10 (Thiết kế và Công nghệ) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ",
        subSubject: "Công Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 11 Cơ khí động lực 2025-2026",
        url: "/eduspace/congnghe-congnghiep/11/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 11 (Cơ khí động lực) theo chương trình GDPT 2018.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ",
        subSubject: "Công Nghiệp",
    },
    {
        title: "Kiểm tra Cuối Học Kì II – Công nghệ 12 Điện - Điện tử 2025-2026",
        url: "/eduspace/congnghe-congnghiep/12/ck2-2526-kntt-v1",
        description: "Đề kiểm tra cuối học kì II môn Công nghệ lớp 12 (Điện - Điện tử) theo chương trình GDPT 2018.",
    },
    // ── NĂM HỌC 2025-2026 (TX, GK, CK) ────────────────────
    // --- CUỐI HỌC KỲ I ---
    { title: "Kiểm tra Cuối Học Kì I – Ngữ văn 10 (KNTT) – 2025-2026", url: "/eduspace/nguvan/10/ck1-2526-v1", tag: "Ngữ Văn", type: "quiz", class: "10", subject: "Ngữ Văn" },
    { title: "Kiểm tra Cuối Học Kì I – Ngữ văn 11 (KNTT) – 2025-2026", url: "/eduspace/nguvan/11/ck1-2526-v1", tag: "Ngữ Văn", type: "quiz", class: "11", subject: "Ngữ Văn" },
    { title: "Kiểm tra Cuối Học Kì I – Ngữ văn 12 (KNTT) – 2025-2026", url: "/eduspace/nguvan/12/ck1-2526-v1", tag: "Ngữ Văn", type: "quiz", class: "12", subject: "Ngữ Văn" },
    { title: "Kiểm tra Cuối Học Kì I – Toán 10 (KNTT) – 2025-2026", url: "/eduspace/toan/10/ck1-2526-v1", tag: "Toán", type: "quiz", class: "10", subject: "Toán" },
    { title: "Kiểm tra Cuối Học Kì I – Toán 11 (KNTT) – 2025-2026", url: "/eduspace/toan/11/ck1-2526-v1", tag: "Toán", type: "quiz", class: "11", subject: "Toán" },
    { title: "Kiểm tra Cuối Học Kì I – Toán 12 (KNTT) – 2025-2026", url: "/eduspace/toan/12/ck1-2526-v1", tag: "Toán", type: "quiz", class: "12", subject: "Toán" },
    { title: "Kiểm tra Cuối Học Kì I – Tiếng Anh 10 (Global Success) – 2025-2026", url: "/eduspace/tienganh/10/ck1-2526-v1", tag: "Tiếng Anh", type: "quiz", class: "10", subject: "Tiếng Anh" },
    { title: "Kiểm tra Cuối Học Kì I – Tiếng Anh 11 (Global Success) – 2025-2026", url: "/eduspace/tienganh/11/ck1-2526-v1", tag: "Tiếng Anh", type: "quiz", class: "11", subject: "Tiếng Anh" },
    { title: "Kiểm tra Cuối Học Kì I – Tiếng Anh 12 (Global Success) – 2025-2026", url: "/eduspace/tienganh/12/ck1-2526-v1", tag: "Tiếng Anh", type: "quiz", class: "12", subject: "Tiếng Anh" },
    { title: "Kiểm tra Cuối Học Kì I – Vật lí 10 (KNTT) – 2025-2026", url: "/eduspace/vatly/10/ck1-2526-v1", tag: "Vật Lý", type: "quiz", class: "10", subject: "Vật Lý" },
    { title: "Kiểm tra Cuối Học Kì I – Vật lí 11 (KNTT) – 2025-2026", url: "/eduspace/vatly/11/ck1-2526-v1", tag: "Vật Lý", type: "quiz", class: "11", subject: "Vật Lý" },
    { title: "Kiểm tra Cuối Học Kì I – Vật lí 12 (KNTT) – 2025-2026", url: "/eduspace/vatly/12/ck1-2526-v1", tag: "Vật Lý", type: "quiz", class: "12", subject: "Vật Lý" },
    { title: "Kiểm tra Cuối Học Kì I – Hóa học 10 (KNTT) – 2025-2026", url: "/eduspace/hoahoc/10/ck1-2526-v1", tag: "Hóa Học", type: "quiz", class: "10", subject: "Hóa Học" },
    { title: "Kiểm tra Cuối Học Kì I – Hóa học 11 (KNTT) – 2025-2026", url: "/eduspace/hoahoc/11/ck1-2526-v1", tag: "Hóa Học", type: "quiz", class: "11", subject: "Hóa Học" },
    { title: "Kiểm tra Cuối Học Kì I – Hóa học 12 (KNTT) – 2025-2026", url: "/eduspace/hoahoc/12/ck1-2526-v1", tag: "Hóa Học", type: "quiz", class: "12", subject: "Hóa Học" },
    { title: "Kiểm tra Cuối Học Kì I – Sinh học 10 (KNTT) – 2025-2026", url: "/eduspace/sinhhoc/10/ck1-2526-v1", tag: "Sinh Học", type: "quiz", class: "10", subject: "Sinh Học" },
    { title: "Kiểm tra Cuối Học Kì I – Sinh học 11 (KNTT) – 2025-2026", url: "/eduspace/sinhhoc/11/ck1-2526-v1", tag: "Sinh Học", type: "quiz", class: "11", subject: "Sinh Học" },
    { title: "Kiểm tra Cuối Học Kì I – Sinh học 12 (KNTT) – 2025-2026", url: "/eduspace/sinhhoc/12/ck1-2526-v1", tag: "Sinh Học", type: "quiz", class: "12", subject: "Sinh Học" },
    { title: "Kiểm tra Cuối Học Kì I – Lịch sử 10 (KNTT) – 2025-2026", url: "/eduspace/lichsu/10/ck1-2526-v1", tag: "Lịch Sử", type: "quiz", class: "10", subject: "Lịch Sử" },
    { title: "Kiểm tra Cuối Học Kì I – Lịch sử 11 (KNTT) – 2025-2026", url: "/eduspace/lichsu/11/ck1-2526-v1", tag: "Lịch Sử", type: "quiz", class: "11", subject: "Lịch Sử" },
    { title: "Kiểm tra Cuối Học Kì I – Lịch sử 12 (KNTT) – 2025-2026", url: "/eduspace/lichsu/12/ck1-2526-v1", tag: "Lịch Sử", type: "quiz", class: "12", subject: "Lịch Sử" },
    { title: "Kiểm tra Cuối Học Kì I – Địa lí 10 (KNTT) – 2025-2026", url: "/eduspace/diali/10/ck1-2526-v1", tag: "Địa Lý", type: "quiz", class: "10", subject: "Địa Lý" },
    { title: "Kiểm tra Cuối Học Kì I – Địa lí 11 (KNTT) – 2025-2026", url: "/eduspace/diali/11/ck1-2526-v1", tag: "Địa Lý", type: "quiz", class: "11", subject: "Địa Lý" },
    { title: "Kiểm tra Cuối Học Kì I – Địa lí 12 (KNTT) – 2025-2026", url: "/eduspace/diali/12/ck1-2526-v1", tag: "Địa Lý", type: "quiz", class: "12", subject: "Địa Lý" },
    { title: "Kiểm tra Cuối Học Kì I – GDKT-PL 10 (KNTT) – 2025-2026", url: "/eduspace/ktpl/10/ck1-2526-v1", tag: "GDKT-PL", type: "quiz", class: "10", subject: "GDKT-PL" },
    { title: "Kiểm tra Cuối Học Kì I – GDKT-PL 11 (KNTT) – 2025-2026", url: "/eduspace/ktpl/11/ck1-2526-v1", tag: "GDKT-PL", type: "quiz", class: "11", subject: "GDKT-PL" },
    { title: "Kiểm tra Cuối Học Kì I – GDKT-PL 12 (KNTT) – 2025-2026", url: "/eduspace/ktpl/12/ck1-2526-v1", tag: "GDKT-PL", type: "quiz", class: "12", subject: "GDKT-PL" },
    { title: "Kiểm tra Cuối Học Kì I – Công nghệ 10 (KNTT) – 2025-2026", url: "/eduspace/congnghe/10/ck1-2526-v1", tag: "Công Nghệ", type: "quiz", class: "10", subject: "Công Nghệ" },
    { title: "Kiểm tra Cuối Học Kì I – Công nghệ 11 (KNTT) – 2025-2026", url: "/eduspace/congnghe/11/ck1-2526-v1", tag: "Công Nghệ", type: "quiz", class: "11", subject: "Công Nghệ" },
    { title: "Kiểm tra Cuối Học Kì I – Công nghệ 12 (KNTT) – 2025-2026", url: "/eduspace/congnghe/12/ck1-2526-v1", tag: "Công Nghệ", type: "quiz", class: "12", subject: "Công Nghệ" },
    { title: "Kiểm tra Cuối Học Kì I – Tin học 10 (KNTT) – 2025-2026", url: "/eduspace/tinhoc/10/ck1-2526-v1", tag: "Tin Học", type: "quiz", class: "10", subject: "Tin Học" },
    { title: "Kiểm tra Cuối Học Kì I – Tin học 11 (KNTT) – 2025-2026", url: "/eduspace/tinhoc/11/ck1-2526-v1", tag: "Tin Học", type: "quiz", class: "11", subject: "Tin Học" },
    { title: "Kiểm tra Cuối Học Kì I – Tin học 12 (KNTT) – 2025-2026", url: "/eduspace/tinhoc/12/ck1-2526-v1", tag: "Tin Học", type: "quiz", class: "12", subject: "Tin Học" },

    // --- GIỮA HỌC KỲ I ---
    { title: "Kiểm tra Giữa Học Kì I – Ngữ văn 10 (KNTT) – 2025-2026", url: "/eduspace/nguvan/10/gk1-2526-v1", tag: "Ngữ Văn", type: "quiz", class: "10", subject: "Ngữ Văn" },
    { title: "Kiểm tra Giữa Học Kì I – Toán 10 (KNTT) – 2025-2026", url: "/eduspace/toan/10/gk1-2526-v1", tag: "Toán", type: "quiz", class: "10", subject: "Toán" },
    { title: "Kiểm tra Giữa Học Kì I – Tiếng Anh 10 (Global Success) – 2025-2026", url: "/eduspace/tienganh/10/gk1-2526-v1", tag: "Tiếng Anh", type: "quiz", class: "10", subject: "Tiếng Anh" }


    ,
    {
        title: "Kiểm tra Thường xuyên – Ngữ văn 10 (KNTT) – HK II",
        url: "/eduspace/nguvan/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Ngữ văn lớp 10.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "10",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Thường xuyên – Ngữ văn 11 (KNTT) – HK II",
        url: "/eduspace/nguvan/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Ngữ văn lớp 11.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "11",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Thường xuyên – Ngữ văn 12 (KNTT) – HK II",
        url: "/eduspace/nguvan/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Ngữ văn lớp 12.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "12",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Thường xuyên – Toán 10 (KNTT) – HK II",
        url: "/eduspace/toan/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Toán lớp 10.",
        tag: "Toán",
        type: "quiz",
        class: "10",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Thường xuyên – Toán 11 (KNTT) – HK II",
        url: "/eduspace/toan/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Toán lớp 11.",
        tag: "Toán",
        type: "quiz",
        class: "11",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Thường xuyên – Toán 12 (KNTT) – HK II",
        url: "/eduspace/toan/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Toán lớp 12.",
        tag: "Toán",
        type: "quiz",
        class: "12",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Thường xuyên – Tiếng Anh 10 (KNTT) – HK II",
        url: "/eduspace/tienganh/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Tiếng Anh lớp 10.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "10",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Thường xuyên – Tiếng Anh 11 (KNTT) – HK II",
        url: "/eduspace/tienganh/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Tiếng Anh lớp 11.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "11",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Thường xuyên – Tiếng Anh 12 (KNTT) – HK II",
        url: "/eduspace/tienganh/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Tiếng Anh lớp 12.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "12",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Thường xuyên – Lịch sử 11 (KNTT) – HK II",
        url: "/eduspace/lichsu/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Lịch sử lớp 11.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "11",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Thường xuyên – Lịch sử 12 (KNTT) – HK II",
        url: "/eduspace/lichsu/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Lịch sử lớp 12.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "12",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Thường xuyên – Địa lí 10 (KNTT) – HK II",
        url: "/eduspace/diali/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Địa lí lớp 10.",
        tag: "Địa Lý",
        type: "quiz",
        class: "10",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – Địa lí 11 (KNTT) – HK II",
        url: "/eduspace/diali/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Địa lí lớp 11.",
        tag: "Địa Lý",
        type: "quiz",
        class: "11",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – Địa lí 12 (KNTT) – HK II",
        url: "/eduspace/diali/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Địa lí lớp 12.",
        tag: "Địa Lý",
        type: "quiz",
        class: "12",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – GDKT-PL 10 (KNTT) – HK II",
        url: "/eduspace/ktpl/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn GDKT-PL lớp 10.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "10",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Thường xuyên – GDKT-PL 11 (KNTT) – HK II",
        url: "/eduspace/ktpl/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn GDKT-PL lớp 11.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "11",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Thường xuyên – GDKT-PL 12 (KNTT) – HK II",
        url: "/eduspace/ktpl/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn GDKT-PL lớp 12.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "12",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Thường xuyên – Vật lí 10 (KNTT) – HK II",
        url: "/eduspace/vatly/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Vật lí lớp 10.",
        tag: "Vật Lý",
        type: "quiz",
        class: "10",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – Vật lí 11 (KNTT) – HK II",
        url: "/eduspace/vatly/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Vật lí lớp 11.",
        tag: "Vật Lý",
        type: "quiz",
        class: "11",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – Vật lí 12 (KNTT) – HK II",
        url: "/eduspace/vatly/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Vật lí lớp 12.",
        tag: "Vật Lý",
        type: "quiz",
        class: "12",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – Hóa học 10 (KNTT) – HK II",
        url: "/eduspace/hoahoc/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Hóa học lớp 10.",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Hóa học 11 (KNTT) – HK II",
        url: "/eduspace/hoahoc/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Hóa học lớp 11.",
        tag: "Hóa Học",
        type: "quiz",
        class: "11",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Hóa học 12 (KNTT) – HK II",
        url: "/eduspace/hoahoc/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Hóa học lớp 12.",
        tag: "Hóa Học",
        type: "quiz",
        class: "12",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Sinh học 10 (KNTT) – HK II",
        url: "/eduspace/sinhhoc/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Sinh học lớp 10.",
        tag: "Sinh Học",
        type: "quiz",
        class: "10",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Sinh học 11 (KNTT) – HK II",
        url: "/eduspace/sinhhoc/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Sinh học lớp 11.",
        tag: "Sinh Học",
        type: "quiz",
        class: "11",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Sinh học 12 (KNTT) – HK II",
        url: "/eduspace/sinhhoc/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Sinh học lớp 12.",
        tag: "Sinh Học",
        type: "quiz",
        class: "12",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Công nghệ 10 (KNTT) – HK II",
        url: "/eduspace/congnghe/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Công nghệ lớp 10.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Thường xuyên – Công nghệ 11 (KNTT) – HK II",
        url: "/eduspace/congnghe/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Công nghệ lớp 11.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Thường xuyên – Công nghệ 12 (KNTT) – HK II",
        url: "/eduspace/congnghe/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Công nghệ lớp 12.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Thường xuyên – Tin học 10 (KNTT) – HK II",
        url: "/eduspace/tinhoc/10/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Tin học lớp 10.",
        tag: "Tin Học",
        type: "quiz",
        class: "10",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Tin học 11 (KNTT) – HK II",
        url: "/eduspace/tinhoc/11/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Tin học lớp 11.",
        tag: "Tin Học",
        type: "quiz",
        class: "11",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Tin học 12 (KNTT) – HK II",
        url: "/eduspace/tinhoc/12/tx2-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ II môn Tin học lớp 12.",
        tag: "Tin Học",
        type: "quiz",
        class: "12",
        subject: "Tin Học"
    }
    ,
    {
        title: "Kiểm tra Cuối Học Kì I – Ngữ văn 11 (KNTT) – 2025-2026",
        url: "/eduspace/nguvan/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Ngữ văn lớp 11.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "11",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Ngữ văn 12 (KNTT) – 2025-2026",
        url: "/eduspace/nguvan/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Ngữ văn lớp 12.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "12",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Toán 11 (KNTT) – 2025-2026",
        url: "/eduspace/toan/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Toán lớp 11.",
        tag: "Toán",
        type: "quiz",
        class: "11",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Toán 12 (KNTT) – 2025-2026",
        url: "/eduspace/toan/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Toán lớp 12.",
        tag: "Toán",
        type: "quiz",
        class: "12",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Tiếng Anh 11 (KNTT) – 2025-2026",
        url: "/eduspace/tienganh/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Tiếng Anh lớp 11.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "11",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Tiếng Anh 12 (KNTT) – 2025-2026",
        url: "/eduspace/tienganh/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Tiếng Anh lớp 12.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "12",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Lịch sử 10 (KNTT) – 2025-2026",
        url: "/eduspace/lichsu/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Lịch sử lớp 10.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Lịch sử 11 (KNTT) – 2025-2026",
        url: "/eduspace/lichsu/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Lịch sử lớp 11.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "11",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Lịch sử 12 (KNTT) – 2025-2026",
        url: "/eduspace/lichsu/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Lịch sử lớp 12.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "12",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Địa lí 10 (KNTT) – 2025-2026",
        url: "/eduspace/diali/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Địa lí lớp 10.",
        tag: "Địa Lý",
        type: "quiz",
        class: "10",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Địa lí 11 (KNTT) – 2025-2026",
        url: "/eduspace/diali/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Địa lí lớp 11.",
        tag: "Địa Lý",
        type: "quiz",
        class: "11",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Địa lí 12 (KNTT) – 2025-2026",
        url: "/eduspace/diali/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Địa lí lớp 12.",
        tag: "Địa Lý",
        type: "quiz",
        class: "12",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – GDKT-PL 10 (KNTT) – 2025-2026",
        url: "/eduspace/ktpl/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn GDKT-PL lớp 10.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "10",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – GDKT-PL 11 (KNTT) – 2025-2026",
        url: "/eduspace/ktpl/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn GDKT-PL lớp 11.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "11",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – GDKT-PL 12 (KNTT) – 2025-2026",
        url: "/eduspace/ktpl/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn GDKT-PL lớp 12.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "12",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Vật lí 10 (KNTT) – 2025-2026",
        url: "/eduspace/vatly/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Vật lí lớp 10.",
        tag: "Vật Lý",
        type: "quiz",
        class: "10",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Vật lí 11 (KNTT) – 2025-2026",
        url: "/eduspace/vatly/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Vật lí lớp 11.",
        tag: "Vật Lý",
        type: "quiz",
        class: "11",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Vật lí 12 (KNTT) – 2025-2026",
        url: "/eduspace/vatly/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Vật lí lớp 12.",
        tag: "Vật Lý",
        type: "quiz",
        class: "12",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Hóa học 10 (KNTT) – 2025-2026",
        url: "/eduspace/hoahoc/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Hóa học lớp 10.",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Hóa học 11 (KNTT) – 2025-2026",
        url: "/eduspace/hoahoc/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Hóa học lớp 11.",
        tag: "Hóa Học",
        type: "quiz",
        class: "11",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Hóa học 12 (KNTT) – 2025-2026",
        url: "/eduspace/hoahoc/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Hóa học lớp 12.",
        tag: "Hóa Học",
        type: "quiz",
        class: "12",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Sinh học 10 (KNTT) – 2025-2026",
        url: "/eduspace/sinhhoc/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Sinh học lớp 10.",
        tag: "Sinh Học",
        type: "quiz",
        class: "10",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Sinh học 11 (KNTT) – 2025-2026",
        url: "/eduspace/sinhhoc/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Sinh học lớp 11.",
        tag: "Sinh Học",
        type: "quiz",
        class: "11",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Sinh học 12 (KNTT) – 2025-2026",
        url: "/eduspace/sinhhoc/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Sinh học lớp 12.",
        tag: "Sinh Học",
        type: "quiz",
        class: "12",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Công nghệ 10 (KNTT) – 2025-2026",
        url: "/eduspace/congnghe/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Công nghệ lớp 10.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Công nghệ 11 (KNTT) – 2025-2026",
        url: "/eduspace/congnghe/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Công nghệ lớp 11.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Công nghệ 12 (KNTT) – 2025-2026",
        url: "/eduspace/congnghe/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Công nghệ lớp 12.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Tin học 10 (KNTT) – 2025-2026",
        url: "/eduspace/tinhoc/10/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Tin học lớp 10.",
        tag: "Tin Học",
        type: "quiz",
        class: "10",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Tin học 11 (KNTT) – 2025-2026",
        url: "/eduspace/tinhoc/11/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Tin học lớp 11.",
        tag: "Tin Học",
        type: "quiz",
        class: "11",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Cuối Học Kì I – Tin học 12 (KNTT) – 2025-2026",
        url: "/eduspace/tinhoc/12/ck1-2526-v1",
        description: "Đề kiểm tra cuối học kì I môn Tin học lớp 12.",
        tag: "Tin Học",
        type: "quiz",
        class: "12",
        subject: "Tin Học"
    }
    ,
    {
        title: "Kiểm tra Giữa Học Kì I – Ngữ văn 11 (KNTT) – 2025-2026",
        url: "/eduspace/nguvan/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Ngữ văn lớp 11.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "11",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Ngữ văn 12 (KNTT) – 2025-2026",
        url: "/eduspace/nguvan/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Ngữ văn lớp 12.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "12",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Toán 11 (KNTT) – 2025-2026",
        url: "/eduspace/toan/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Toán lớp 11.",
        tag: "Toán",
        type: "quiz",
        class: "11",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Toán 12 (KNTT) – 2025-2026",
        url: "/eduspace/toan/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Toán lớp 12.",
        tag: "Toán",
        type: "quiz",
        class: "12",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Tiếng Anh 11 (KNTT) – 2025-2026",
        url: "/eduspace/tienganh/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Tiếng Anh lớp 11.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "11",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Tiếng Anh 12 (KNTT) – 2025-2026",
        url: "/eduspace/tienganh/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Tiếng Anh lớp 12.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "12",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Lịch sử 10 (KNTT) – 2025-2026",
        url: "/eduspace/lichsu/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Lịch sử lớp 10.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "10",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Lịch sử 11 (KNTT) – 2025-2026",
        url: "/eduspace/lichsu/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Lịch sử lớp 11.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "11",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Lịch sử 12 (KNTT) – 2025-2026",
        url: "/eduspace/lichsu/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Lịch sử lớp 12.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "12",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Địa lí 10 (KNTT) – 2025-2026",
        url: "/eduspace/diali/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Địa lí lớp 10.",
        tag: "Địa Lý",
        type: "quiz",
        class: "10",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Địa lí 11 (KNTT) – 2025-2026",
        url: "/eduspace/diali/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Địa lí lớp 11.",
        tag: "Địa Lý",
        type: "quiz",
        class: "11",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Địa lí 12 (KNTT) – 2025-2026",
        url: "/eduspace/diali/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Địa lí lớp 12.",
        tag: "Địa Lý",
        type: "quiz",
        class: "12",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – GDKT-PL 10 (KNTT) – 2025-2026",
        url: "/eduspace/ktpl/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn GDKT-PL lớp 10.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "10",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – GDKT-PL 11 (KNTT) – 2025-2026",
        url: "/eduspace/ktpl/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn GDKT-PL lớp 11.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "11",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – GDKT-PL 12 (KNTT) – 2025-2026",
        url: "/eduspace/ktpl/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn GDKT-PL lớp 12.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "12",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Vật lí 10 (KNTT) – 2025-2026",
        url: "/eduspace/vatly/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Vật lí lớp 10.",
        tag: "Vật Lý",
        type: "quiz",
        class: "10",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Vật lí 11 (KNTT) – 2025-2026",
        url: "/eduspace/vatly/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Vật lí lớp 11.",
        tag: "Vật Lý",
        type: "quiz",
        class: "11",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Vật lí 12 (KNTT) – 2025-2026",
        url: "/eduspace/vatly/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Vật lí lớp 12.",
        tag: "Vật Lý",
        type: "quiz",
        class: "12",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Hóa học 10 (KNTT) – 2025-2026",
        url: "/eduspace/hoahoc/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Hóa học lớp 10.",
        tag: "Hóa Học",
        type: "quiz",
        class: "10",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Hóa học 11 (KNTT) – 2025-2026",
        url: "/eduspace/hoahoc/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Hóa học lớp 11.",
        tag: "Hóa Học",
        type: "quiz",
        class: "11",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Hóa học 12 (KNTT) – 2025-2026",
        url: "/eduspace/hoahoc/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Hóa học lớp 12.",
        tag: "Hóa Học",
        type: "quiz",
        class: "12",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Sinh học 10 (KNTT) – 2025-2026",
        url: "/eduspace/sinhhoc/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Sinh học lớp 10.",
        tag: "Sinh Học",
        type: "quiz",
        class: "10",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Sinh học 11 (KNTT) – 2025-2026",
        url: "/eduspace/sinhhoc/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Sinh học lớp 11.",
        tag: "Sinh Học",
        type: "quiz",
        class: "11",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Sinh học 12 (KNTT) – 2025-2026",
        url: "/eduspace/sinhhoc/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Sinh học lớp 12.",
        tag: "Sinh Học",
        type: "quiz",
        class: "12",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Công nghệ 10 (KNTT) – 2025-2026",
        url: "/eduspace/congnghe/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Công nghệ lớp 10.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Công nghệ 11 (KNTT) – 2025-2026",
        url: "/eduspace/congnghe/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Công nghệ lớp 11.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Công nghệ 12 (KNTT) – 2025-2026",
        url: "/eduspace/congnghe/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Công nghệ lớp 12.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Tin học 10 (KNTT) – 2025-2026",
        url: "/eduspace/tinhoc/10/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Tin học lớp 10.",
        tag: "Tin Học",
        type: "quiz",
        class: "10",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Tin học 11 (KNTT) – 2025-2026",
        url: "/eduspace/tinhoc/11/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Tin học lớp 11.",
        tag: "Tin Học",
        type: "quiz",
        class: "11",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Giữa Học Kì I – Tin học 12 (KNTT) – 2025-2026",
        url: "/eduspace/tinhoc/12/gk1-2526-v1",
        description: "Đề kiểm tra giữa học kì I môn Tin học lớp 12.",
        tag: "Tin Học",
        type: "quiz",
        class: "12",
        subject: "Tin Học"
    }
    ,
    {
        title: "Kiểm tra Thường xuyên – Ngữ văn 11 (KNTT) – HK I",
        url: "/eduspace/nguvan/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Ngữ văn lớp 11.",
        tag: "Ngữ Văn",
        type: "quiz",
        class: "11",
        subject: "Ngữ Văn"
    },
    {
        title: "Kiểm tra Thường xuyên – Toán 11 (KNTT) – HK I",
        url: "/eduspace/toan/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Toán lớp 11.",
        tag: "Toán",
        type: "quiz",
        class: "11",
        subject: "Toán"
    },
    {
        title: "Kiểm tra Thường xuyên – Tiếng Anh 11 (KNTT) – HK I",
        url: "/eduspace/tienganh/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Tiếng Anh lớp 11.",
        tag: "Tiếng Anh",
        type: "quiz",
        class: "11",
        subject: "Tiếng Anh"
    },
    {
        title: "Kiểm tra Thường xuyên – Lịch sử 11 (KNTT) – HK I",
        url: "/eduspace/lichsu/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Lịch sử lớp 11.",
        tag: "Lịch Sử",
        type: "quiz",
        class: "11",
        subject: "Lịch Sử"
    },
    {
        title: "Kiểm tra Thường xuyên – Địa lí 11 (KNTT) – HK I",
        url: "/eduspace/diali/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Địa lí lớp 11.",
        tag: "Địa Lý",
        type: "quiz",
        class: "11",
        subject: "Địa Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – GDKT-PL 11 (KNTT) – HK I",
        url: "/eduspace/ktpl/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn GDKT-PL lớp 11.",
        tag: "GDKT-PL",
        type: "quiz",
        class: "11",
        subject: "GDKT-PL"
    },
    {
        title: "Kiểm tra Thường xuyên – Vật lí 11 (KNTT) – HK I",
        url: "/eduspace/vatly/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Vật lí lớp 11.",
        tag: "Vật Lý",
        type: "quiz",
        class: "11",
        subject: "Vật Lý"
    },
    {
        title: "Kiểm tra Thường xuyên – Hóa học 11 (KNTT) – HK I",
        url: "/eduspace/hoahoc/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Hóa học lớp 11.",
        tag: "Hóa Học",
        type: "quiz",
        class: "11",
        subject: "Hóa Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Sinh học 11 (KNTT) – HK I",
        url: "/eduspace/sinhhoc/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Sinh học lớp 11.",
        tag: "Sinh Học",
        type: "quiz",
        class: "11",
        subject: "Sinh Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Công nghệ 10 (KNTT) – HK I",
        url: "/eduspace/congnghe/10/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Công nghệ lớp 10.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "10",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Thường xuyên – Công nghệ 11 (KNTT) – HK I",
        url: "/eduspace/congnghe/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Công nghệ lớp 11.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "11",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Thường xuyên – Công nghệ 12 (KNTT) – HK I",
        url: "/eduspace/congnghe/12/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Công nghệ lớp 12.",
        tag: "Công Nghệ",
        type: "quiz",
        class: "12",
        subject: "Công Nghệ"
    },
    {
        title: "Kiểm tra Thường xuyên – Tin học 10 (KNTT) – HK I",
        url: "/eduspace/tinhoc/10/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Tin học lớp 10.",
        tag: "Tin Học",
        type: "quiz",
        class: "10",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Tin học 11 (KNTT) – HK I",
        url: "/eduspace/tinhoc/11/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Tin học lớp 11.",
        tag: "Tin Học",
        type: "quiz",
        class: "11",
        subject: "Tin Học"
    },
    {
        title: "Kiểm tra Thường xuyên – Tin học 12 (KNTT) – HK I",
        url: "/eduspace/tinhoc/12/tx1-2526-v1",
        description: "Bài kiểm tra thường xuyên học kỳ I môn Tin học lớp 12.",
        tag: "Tin Học",
        type: "quiz",
        class: "12",
        subject: "Tin Học"
    }
]
