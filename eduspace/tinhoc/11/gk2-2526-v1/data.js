window.quizData = {
    "title": "Kiểm tra Giữa Học Kì II – Tin học 11 (KNTT) – 2025-2026",
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
            "question": "Cơ sở dữ liệu (CSDL) là gì?",
            "options": [
                "Tập hợp các tệp văn bản rời rạc.",
                "Tập hợp dữ liệu có liên quan với nhau, được lưu trữ một cách có tổ chức trên máy tính.",
                "Một chương trình phần mềm dùng để tính toán.",
                "Dữ liệu được in ra trên giấy."
            ],
            "correct": 1,
            "explanation": "CSDL là tập hợp dữ liệu có cấu trúc, cho phép truy cập và quản lý hiệu quả."
        },
        {
            "type": "multiple",
            "question": "Hệ quản trị CSDL (DBMS) có nhiệm vụ chính là gì?",
            "options": [
                "Soạn thảo văn bản.",
                "Thiết kế hình ảnh đồ họa.",
                "Điều khiển, quản lý việc lưu trữ và truy xuất dữ liệu trong CSDL.",
                "Chụp ảnh và quay phim."
            ],
            "correct": 2,
            "explanation": "DBMS (như MySQL, Access, SQL Server) là phần mềm trung gian giúp người dùng tương tác với CSDL."
        },
        {
            "type": "multiple",
            "question": "Trong mô hình dữ liệu quan hệ, dữ liệu được tổ chức dưới dạng nào?",
            "options": ["Cấu trúc cây.", "Dạng bảng (Relation).", "Danh sách liên kết.", "Dạng đồ thị."],
            "correct": 1,
            "explanation": "Mô hình quan hệ sử dụng các bảng gồm hàng (bản ghi) và cột (thuộc tính)."
        },
        {
            "type": "multiple",
            "question": "Khóa chính (Primary Key) của một bảng dùng để:",
            "options": [
                "Mô tả nội dung của bảng.",
                "Liên kết với các bảng khác.",
                "Xác định duy nhất một bản ghi trong bảng.",
                "Lưu trữ các dữ liệu số."
            ],
            "correct": 2,
            "explanation": "Khóa chính đảm bảo không có hai hàng nào trong bảng có cùng giá trị khóa, giúp định danh bản ghi."
        },
        {
            "type": "multiple",
            "question": "Ngôn ngữ truy vấn mang tính chuẩn hóa được sử dụng phổ biến trong các CSDL quan hệ là:",
            "options": ["Python.", "HTML.", "SQL.", "Java."],
            "correct": 2,
            "explanation": "SQL (Structured Query Language) là ngôn ngữ chuẩn để làm việc với CSDL quan hệ."
        },
        {
            "type": "multiple",
            "question": "Lệnh SQL nào dùng để trích xuất dữ liệu từ CSDL?",
            "options": ["INSERT", "UPDATE", "SELECT", "DELETE"],
            "correct": 2,
            "explanation": "Lệnh SELECT là lệnh cơ bản và quan trọng nhất để truy vấn thông tin."
        },
        {
            "type": "multiple",
            "question": "Để lọc dữ liệu theo một điều kiện nào đó trong SQL, ta dùng từ khóa nào?",
            "options": ["FROM", "WHERE", "ORDER BY", "GROUP BY"],
            "correct": 1,
            "explanation": "Mệnh đề WHERE dùng để chỉ định các điều kiện lọc bản ghi."
        },
        {
            "type": "multiple",
            "question": "Khóa ngoại (Foreign Key) dùng để làm gì?",
            "options": [
                "Định danh duy nhất bản ghi.",
                "Thiết lập mối liên kết giữa hai bảng.",
                "Tăng tốc độ truy cập dữ liệu.",
                "Bảo mật CSDL."
            ],
            "correct": 1,
            "explanation": "Khóa ngoại trỏ đến khóa chính của bảng khác để tạo mối quan hệ giữa chúng."
        },
        {
            "type": "multiple",
            "question": "Các bước chính để thiết kế CSDL là:",
            "options": [
                "Khảo sát -> Thiết kế -> Cài đặt.",
                "Viết code -> Chạy thử -> Sửa lỗi.",
                "Chụp ảnh -> In ấn -> Lưu trữ.",
                "Mua phần mềm -> Cài đặt -> Sử dụng."
            ],
            "correct": 0,
            "explanation": "Quy trình chuẩn bắt đầu từ việc tìm hiểu yêu cầu (khảo sát) đến thiết kế mô hình và cài đặt thực tế."
        },
        {
            "type": "multiple",
            "question": "Trong SQL, lệnh nào dùng để thêm một bản ghi mới vào bảng?",
            "options": ["ADD", "CREATE", "INSERT INTO", "SET"],
            "correct": 2,
            "explanation": "INSERT INTO dùng để chèn dữ liệu mới."
        },
        {
            "type": "multiple",
            "question": "Tính độc lập dữ liệu trong hệ quản trị CSDL có nghĩa là:",
            "options": [
                "Dữ liệu có thể tồn tại mà không cần máy tính.",
                "Thay đổi cấu trúc lưu trữ không làm thay đổi chương trình ứng dụng.",
                "Dữ liệu của người này không liên quan đến người khác.",
                "Dữ liệu không bao giờ bị mất."
            ],
            "correct": 1,
            "explanation": "Đây là ưu điểm lớn của DBMS, giúp tách biệt giữa mức vật lý và mức logic."
        },
        {
            "type": "multiple",
            "question": "Thứ tự đúng của các từ khóa trong một câu lệnh SELECT cơ bản là:",
            "options": [
                "SELECT ... WHERE ... FROM ...",
                "SELECT ... FROM ... WHERE ...",
                "FROM ... SELECT ... WHERE ...",
                "WHERE ... SELECT ... FROM ..."
            ],
            "correct": 1,
            "explanation": "Cú pháp chuẩn: SELECT [cột] FROM [bảng] WHERE [điều kiện]."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Xét các phát biểu sau về Cơ sở dữ liệu và SQL:",
            "options": [
                "Một bảng trong CSDL quan hệ có thể có nhiều khóa chính.",
                "Giá trị trong cột khóa chính không được phép để trống (NULL).",
                "SQL là ngôn ngữ lập trình bậc cao giống như Python.",
                "Microsoft Access là một ví dụ về hệ quản trị CSDL quan hệ dành cho cá nhân hoặc doanh nghiệp nhỏ."
            ],
            "correct": [false, true, false, true],
            "explanation": "Mỗi bảng chỉ có duy nhất một khóa chính. SQL là ngôn ngữ truy vấn dữ liệu, không phải ngôn ngữ lập trình đa năng như Python."
        },
        {
            "type": "truefalse",
            "question": "Về thiết kế và tổ chức dữ liệu:",
            "options": [
                "Mục đích của chuẩn hóa CSDL là giảm thiểu sự dư thừa dữ liệu.",
                "Khóa ngoại phải có giá trị trùng với một giá trị nào đó của khóa chính ở bảng tham chiếu hoặc để NULL.",
                "Trong mô hình ER, thực thể thường được biểu diễn bằng hình tròn.",
                "Mối quan hệ 1-n là mối quan hệ phổ biến nhất giữa các bảng trong CSDL."
            ],
            "correct": [true, true, false, true],
            "explanation": "Trong mô hình ER, thực thể biểu diễn bằng hình chữ nhật, thuộc tính bằng hình oval/tròn."
        },
        {
            "type": "truefalse",
            "question": "Về bảo mật và an toàn dữ liệu:",
            "options": [
                "Hệ quản trị CSDL cung cấp cơ chế phân quyền người dùng (Read, Write, Admin).",
                "Việc sao lưu (Backup) dữ liệu định kỳ là không cần thiết nếu máy tính hiện đại.",
                "Mọi người dùng đều có quyền xóa bất kỳ dữ liệu nào trong CSDL.",
                "Mật khẩu là một biện pháp bảo mật mức người dùng phổ biến."
            ],
            "correct": [true, false, false, true],
            "explanation": "Sao lưu là bắt buộc để phòng ngừa sự cố. Quyền xóa dữ liệu phải được kiểm soát nghiêm ngặt."
        },
        {
            "type": "truefalse",
            "question": "Về các thao tác trong SQL:",
            "options": [
                "Từ khóa ORDER BY dùng để sắp xếp kết quả truy vấn theo thứ tự tăng dần hoặc giảm dần.",
                "Lệnh DELETE dùng để xóa cấu trúc của bảng.",
                "Hàm COUNT() dùng để đếm số lượng bản ghi thỏa mãn điều kiện.",
                "Có thể sử dụng toán tử LIKE để tìm kiếm các bản ghi có chứa một chuỗi ký tự cụ thể."
            ],
            "correct": [true, false, true, true],
            "explanation": "DELETE xóa dữ liệu (hàng), muốn xóa cấu trúc bảng phải dùng DROP TABLE."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Viết từ khóa SQL dùng để sắp xếp kết quả theo thứ tự giảm dần.",
            "correct": "DESC",
            "explanation": "DESC (Descending) dùng sau tên cột trong mệnh đề ORDER BY."
        },
        {
            "type": "short",
            "question": "Trong bảng 'HocSinh(MaHS, HoTen, NgaySinh)', thuộc tính nào nên được chọn làm khóa chính?",
            "correct": "MaHS",
            "explanation": "Mã học sinh thường là duy nhất và không thay đổi."
        },
        {
            "type": "short",
            "question": "Hàm SQL nào dùng để tính giá trị trung bình của một cột dữ liệu số?",
            "correct": "AVG",
            "explanation": "AVG (Average) là hàm gộp để tính trung bình."
        },
        {
            "type": "short",
            "question": "Viết câu lệnh SQL để lấy tất cả các cột từ bảng 'SanPham'.",
            "correct": "SELECT * FROM SanPham",
            "explanation": "Dấu '*' đại diện cho tất cả các cột."
        },
        {
            "type": "short",
            "question": "Kết quả của lệnh `SELECT COUNT(*) FROM Lop` là gì? (Viết ý nghĩa bằng tiếng Việt)",
            "correct": "Số lượng bản ghi",
            "explanation": "Đếm tổng số hàng (bản ghi) hiện có trong bảng Lop."
        },
        {
            "type": "short",
            "question": "Tên viết tắt của ngôn ngữ định nghĩa dữ liệu (một phần của SQL) là gì?",
            "correct": "DDL",
            "explanation": "DDL (Data Definition Language) gồm các lệnh như CREATE, ALTER, DROP."
        }
    ]
};