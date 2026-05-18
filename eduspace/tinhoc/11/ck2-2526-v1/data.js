// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Không có trả lời ngắn (MCQ, TF, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Tin Học 11 (Kết nối tri thức) 2025-2026",
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
            question: "Cơ sở dữ liệu (CSDL) là gì?",
            options: [
                "Tập hợp dữ liệu rời rạc, không liên quan đến nhau lưu trên máy tính",
                "Tập hợp các dữ liệu có liên quan với nhau, được lưu trữ có tổ chức trên các thiết bị nhớ",
                "Phần mềm dùng để vẽ biểu đồ và phân tích số liệu",
                "Hệ thống máy tính điều khiển việc lưu trữ"
            ],
            correct: 1,
            explanation: "CSDL là tập hợp dữ liệu có liên quan, được lưu trữ một cách có tổ chức."
        },
        {
            type: "multiple",
            question: "Hệ quản trị cơ sở dữ liệu (DBMS) là:",
            options: [
                "Phần mềm cung cấp môi trường thuận lợi và hiệu quả để tạo lập, cập nhật và khai thác CSDL",
                "Một tập hợp các bảng dữ liệu",
                "Ngôn ngữ lập trình dùng để thao tác với phần cứng",
                "Thiết bị lưu trữ dữ liệu dung lượng lớn"
            ],
            correct: 0,
            explanation: "DBMS là phần mềm hệ thống (như MySQL, Access, SQL Server) giúp quản lý CSDL."
        },
        {
            type: "multiple",
            question: "Khái niệm 'Khóa chính' (Primary Key) trong một bảng (Table) là:",
            options: [
                "Trường dùng để mã hóa dữ liệu",
                "Trường hoặc tập hợp trường có giá trị duy nhất, dùng để phân biệt các bản ghi (row) trong bảng",
                "Trường chứa mật khẩu của người dùng",
                "Trường luôn có kiểu dữ liệu là số"
            ],
            correct: 1,
            explanation: "Khóa chính định danh duy nhất cho mỗi bản ghi (dòng) trong một bảng."
        },
        {
            type: "multiple",
            question: "Khái niệm 'Khóa ngoại' (Foreign Key) dùng để làm gì?",
            options: [
                "Để kết nối Internet",
                "Thiết lập mối liên kết (quan hệ) giữa hai bảng",
                "Làm khóa dự phòng khi khóa chính bị lỗi",
                "Đánh số thứ tự các dòng trong bảng"
            ],
            correct: 1,
            explanation: "Khóa ngoại ở bảng này tham chiếu đến khóa chính ở bảng khác, tạo mối quan hệ giữa chúng."
        },
        {
            type: "multiple",
            question: "Tính toàn vẹn dữ liệu trong CSDL nghĩa là:",
            options: [
                "Dữ liệu không bao giờ bị xóa",
                "Dữ liệu luôn bảo đảm tính chính xác và nhất quán",
                "Dữ liệu được lưu ở nhiều máy tính khác nhau",
                "Dữ liệu được nén lại để giảm dung lượng"
            ],
            correct: 1,
            explanation: "Toàn vẹn dữ liệu đảm bảo dữ liệu nhập vào phải hợp lệ, chính xác, nhất quán."
        },
        {
            type: "multiple",
            question: "Trong mô hình CSDL quan hệ, dữ liệu được tổ chức dưới dạng:",
            options: [
                "Cây (Tree)",
                "Đồ thị (Graph)",
                "Các bảng (Table) 2 chiều gồm cột và dòng",
                "Các tập tin văn bản liên tiếp"
            ],
            correct: 2,
            explanation: "Mô hình quan hệ (Relational Model) tổ chức dữ liệu thành các bảng."
        },
        {
            type: "multiple",
            question: "Mỗi Cột (Column / Field) trong bảng thể hiện điều gì?",
            options: [
                "Một đối tượng cụ thể",
                "Một thuộc tính của đối tượng được quản lý",
                "Số lượng dữ liệu trong bảng",
                "Mối quan hệ giữa các bảng"
            ],
            correct: 1,
            explanation: "Cột (Field) đại diện cho một thuộc tính (VD: Họ tên, Ngày sinh)."
        },
        {
            type: "multiple",
            question: "Mỗi Dòng (Row / Record) trong bảng thể hiện điều gì?",
            options: [
                "Thông tin của tất cả đối tượng",
                "Một thuộc tính của một đối tượng",
                "Thông tin đầy đủ về một đối tượng (thực thể) cụ thể",
                "Kiểu dữ liệu của các cột"
            ],
            correct: 2,
            explanation: "Dòng (Record / Bản ghi) chứa dữ liệu của 1 cá thể cụ thể (VD: 1 học sinh)."
        },
        {
            type: "multiple",
            question: "Ràng buộc 'NOT NULL' khi tạo bảng có ý nghĩa gì?",
            options: [
                "Trường đó không được phép chứa giá trị 0",
                "Trường đó bắt buộc phải được nhập dữ liệu (không được để trống)",
                "Trường đó không được chứa chuỗi rỗng",
                "Trường đó là khóa chính"
            ],
            correct: 1,
            explanation: "NOT NULL nghĩa là trường (cột) đó bắt buộc phải có giá trị."
        },
        {
            type: "multiple",
            question: "Sự dư thừa dữ liệu (Data redundancy) trong CSDL có thể dẫn đến hậu quả gì?",
            options: [
                "Làm tăng tốc độ tìm kiếm",
                "Tiết kiệm bộ nhớ lưu trữ",
                "Gây lãng phí bộ nhớ và dễ dẫn đến sự không nhất quán dữ liệu khi cập nhật",
                "Không có ảnh hưởng gì"
            ],
            correct: 2,
            explanation: "Dữ liệu lặp lại nhiều lần gây tốn dung lượng và dễ xảy ra dị thường khi cập nhật."
        },
        {
            type: "multiple",
            question: "SQL là viết tắt của:",
            options: [
                "Standard Query Language",
                "Structured Query Language",
                "Simple Question Language",
                "System Query Logic"
            ],
            correct: 1,
            explanation: "SQL: Structured Query Language (Ngôn ngữ truy vấn mang tính cấu trúc)."
        },
        {
            type: "multiple",
            question: "Lệnh SQL nào dùng để TẠO một bảng mới?",
            options: [
                "MAKE TABLE",
                "CREATE TABLE",
                "ADD TABLE",
                "NEW TABLE"
            ],
            correct: 1,
            explanation: "Cú pháp: `CREATE TABLE ten_bang (...)`."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Để LẤY (đọc) dữ liệu từ một bảng, ta dùng câu lệnh nào?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "GET",
                "OPEN",
                "SELECT",
                "PULL"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Lệnh `SELECT` dùng để truy vấn/lấy dữ liệu."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Câu lệnh `SELECT * FROM HocSinh` có chức năng gì?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Xóa toàn bộ dữ liệu bảng HocSinh",
                "Chọn bảng HocSinh làm bảng mặc định",
                "Lấy toàn bộ các cột và các dòng dữ liệu từ bảng HocSinh",
                "Lấy một dòng bất kỳ từ bảng HocSinh"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Dấu `*` đại diện cho 'tất cả các cột'."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Để THÊM một bản ghi (dòng) mới vào bảng, dùng lệnh nào?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "INSERT INTO",
                "ADD ROW",
                "UPDATE",
                "APPEND TO"
            ],
            correct: [
                true,
                false,
                false,
                false
            ],
            explanation: "Cú pháp: `INSERT INTO ten_bang (cot1, cot2) VALUES (gt1, gt2)`."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Lệnh SQL nào dùng để CẬP NHẬT (sửa đổi) dữ liệu đã có trong bảng?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "MODIFY",
                "UPDATE",
                "CHANGE",
                "ALTER"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Lệnh `UPDATE` đi kèm với `SET` và thường là `WHERE` để sửa dữ liệu."
        },
        {
            type: "essay",
            question: "Cho bảng Sach (MaSach, TenSach, TacGia, NamXuatBan, GiaTien).\nTrong đó MaSach là khóa chính.\n\na) Viết câu lệnh SQL để lấy tất cả thông tin của những cuốn sách xuất bản sau năm 2020.\nb) Viết câu lệnh SQL để sắp xếp danh sách các cuốn sách theo giá tiền giảm dần.",
            suggested: "a) SELECT * FROM Sach WHERE NamXuatBan > 2020;\n\nb) SELECT * FROM Sach ORDER BY GiaTien DESC;",
            points: 25,
            explanation: "AI chấm: Câu a dùng `SELECT *`, `WHERE NamXuatBan > 2020` (10đ); Câu b dùng `ORDER BY GiaTien DESC` (15đ)."
        },
        {
            type: "essay",
            question: "Cho bảng HocSinh (MaHS, HoTen, GioiTinh, DiemToan, DiemVan).\n\nViết câu lệnh SQL để thực hiện các yêu cầu sau:\na) Thêm một học sinh mới có thông tin: ('HS005', 'Nguyễn Văn A', 'Nam', 8.5, 7.0)\nb) Cập nhật điểm Toán thành 9.0 cho học sinh có mã là 'HS005'.\nc) Xóa các học sinh có DiemVan dưới 5.0.",
            suggested: "a) INSERT INTO HocSinh (MaHS, HoTen, GioiTinh, DiemToan, DiemVan) VALUES ('HS005', 'Nguyễn Văn A', 'Nam', 8.5, 7.0);\n\nb) UPDATE HocSinh SET DiemToan = 9.0 WHERE MaHS = 'HS005';\n\nc) DELETE FROM HocSinh WHERE DiemVan < 5.0;",
            points: 25,
            explanation: "AI chấm: Lệnh INSERT đúng cú pháp (10đ), Lệnh UPDATE đúng cú pháp có WHERE (8đ), Lệnh DELETE đúng cú pháp có WHERE (7đ)."
        },
        {
            type: "essay",
            question: "Giải thích ngắn gọn vai trò của 'Khóa chính' (Primary Key) và 'Khóa ngoại' (Foreign Key) trong cơ sở dữ liệu quan hệ. Cho một ví dụ minh họa về 2 bảng có liên kết với nhau.",
            suggested: "Khóa chính: Dùng để định danh duy nhất một bản ghi trong bảng (không rỗng, không trùng).\nKhóa ngoại: Là một trường ở bảng này nhưng đóng vai trò tham chiếu đến khóa chính của bảng khác, dùng để tạo mối quan hệ (liên kết) giữa 2 bảng.\n\nVí dụ: \n- Bảng LOP (MaLop (Khóa chính), TenLop)\n- Bảng HOCSINH (MaHS (Khóa chính), HoTen, MaLop (Khóa ngoại tham chiếu đến MaLop của bảng LOP)).",
            points: 25,
            explanation: "AI chấm: Giải thích đúng vai trò Khóa chính (8đ), Khóa ngoại (8đ), Ví dụ hợp lý (9đ)."
        }
    ]
};
