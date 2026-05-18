window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Tin Học (Bản 2)",
    config: {
        testDuration: 3000,
        examLayout: {
            multiple: { count: 24, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 }
        }
    },
    questions: [
        // --- PHẦN I: Trắc nghiệm 4 lựa chọn (24 câu) ---
        {
            type: "multiple",
            question: "Đặc trưng nào sau đây KHÔNG phải là đặc trưng cơ bản của Dữ liệu lớn (Big Data)?",
            options: [
                "Khối lượng dữ liệu cực lớn (Volume)",
                "Tốc độ xử lý và sinh dữ liệu cực nhanh (Velocity)",
                "Độ phức tạp và tính đa dạng cao (Variety)",
                "Tính bảo mật tuyệt đối của mọi nguồn dữ liệu (Security)"
            ],
            correct: 3,
            explanation: "Big Data được định nghĩa qua các thuộc tính cốt lõi (V-V-V): Volume, Velocity, Variety. Tính bảo mật không phải là thuộc tính định nghĩa cốt lõi của Big Data."
        },
        {
            type: "multiple",
            question: "Trí tuệ nhân tạo hẹp (Narrow AI) được thiết kế để thực hiện nhiệm vụ nào?",
            options: [
                "Thực hiện một hoặc một số nhiệm vụ cụ thể cụ thể trong phạm vi hẹp",
                "Có khả năng tư duy và tự nhận thức vượt trội hơn con người trong mọi lĩnh vực",
                "Tự động hóa hoàn toàn việc quản lý toàn bộ hệ thống Internet toàn cầu",
                "Lập trình ra các hệ thống AI khác tự động"
            ],
            correct: 0,
            explanation: "Narrow AI (AI yếu/AI hẹp) là hệ thống AI được thiết kế và huấn luyện để giải quyết một nhiệm vụ chuyên biệt (như chơi cờ, nhận diện gương mặt)."
        },
        {
            type: "multiple",
            question: "Mạng máy tính diện rộng (WAN) thường được kết nối thông qua phương tiện truyền thông nào sau đây?",
            options: [
                "Cáp quang biển, vệ tinh, đường truyền viễn thông diện rộng",
                "Cáp mạng xoắn đôi UTP loại ngắn dưới 10m",
                "Sóng hồng ngoại phạm vi hẹp",
                "Kết nối Bluetooth cá nhân"
            ],
            correct: 0,
            explanation: "Mạng WAN kết nối các vùng địa lý rộng lớn nên sử dụng cáp quang biển, vệ tinh và mạng viễn thông."
        },
        {
            type: "multiple",
            question: "Thiết bị mạng nào sau đây hoạt động ở tầng liên kết dữ liệu, có khả năng học địa chỉ MAC để chuyển tiếp gói tin chính xác đến cổng đích?",
            options: ["Switch (Bộ chuyển mạch)", "Repeater (Bộ lặp)", "Hub (Bộ tập trung)", "Cáp mạng"],
            correct: 0,
            explanation: "Switch học địa chỉ MAC của các thiết bị kết nối để gửi dữ liệu chính xác đến cổng đích, giảm xung đột mạng."
        },
        {
            type: "multiple",
            question: "Để gán địa chỉ IP động cho các thiết bị khi chúng kết nối vào mạng, hệ thống sử dụng dịch vụ nào sau đây?",
            options: ["DHCP", "DNS", "FTP", "HTTP"],
            correct: 0,
            explanation: "DHCP (Dynamic Host Configuration Protocol) tự động cấp phát cấu hình IP động cho thiết bị trong mạng."
        },
        {
            type: "multiple",
            question: "Giao thức nào sau đây chuyển đổi tên miền thân thiện (ví dụ: eduspace.vn) thành địa chỉ IP số tương ứng?",
            options: ["DNS", "DHCP", "TCP/IP", "SMTP"],
            correct: 0,
            explanation: "DNS (Domain Name System) là dịch vụ phân giải tên miền thành địa chỉ IP."
        },
        {
            type: "multiple",
            question: "Hình thức tấn công mạng nhằm làm tê liệt hệ thống máy chủ bằng cách gửi hàng loạt yêu cầu truy cập từ nhiều máy tính khác nhau được gọi là:",
            options: ["Tấn công từ chối dịch vụ phân tán (DDoS)", "Tấn công giả mạo (Phishing)", "Lây nhiễm mã độc Trojan", "Quét cổng hệ thống (Port scanning)"],
            correct: 0,
            explanation: "DDoS huy động nhiều máy tính bị chiếm quyền điều khiển (botnet) gửi lưu lượng lớn làm máy chủ quá tải và ngưng hoạt động."
        },
        {
            type: "multiple",
            question: "Phần mềm độc hại tự nhân bản và lây lan qua mạng từ máy tính này sang máy tính khác mà không cần tệp tin đính kèm hay sự tương tác trực tiếp của người dùng được gọi là:",
            options: ["Worm (Sâu máy tính)", "Virus máy tính", "Trojan Horse", "Spyware (Phần mềm gián điệp)"],
            correct: 0,
            explanation: "Worm có khả năng tự phát tán qua các lỗ hổng bảo mật mạng mà không phụ thuộc vào vật chủ."
        },
        {
            type: "multiple",
            question: "Trong HTML, cặp thẻ nào dùng để tạo danh sách có thứ tự (được đánh số tự động)?",
            options: ["<ol> và </ol>", "<ul> và </ul>", "<li> và </li>", "<dl> và </dl>"],
            correct: 0,
            explanation: "Ordered List (<ol>) dùng để tạo danh sách có thứ tự. Unordered List (<ul>) dùng cho danh sách không thứ tự."
        },
        {
            type: "multiple",
            question: "Thuộc tính nào của thẻ <a> trong HTML dùng để khai báo đường dẫn liên kết đích?",
            options: ["href", "src", "alt", "link"],
            correct: 0,
            explanation: "Thẻ <a href=\"URL\"> dùng để tạo liên kết siêu văn bản."
        },
        {
            type: "multiple",
            question: "Trong CSS, để thiết lập khoảng cách viền ngoài (khoảng cách giữa phần tử đó với các phần tử xung quanh), ta sử dụng thuộc tính nào?",
            options: ["margin", "padding", "border", "spacing"],
            correct: 0,
            explanation: "Margin tạo khoảng trống bên ngoài đường viền; Padding tạo khoảng trống bên trong giữa nội dung và đường viền."
        },
        {
            type: "multiple",
            question: "Đoạn mã CSS nào sau đây định dạng màu nền màu xanh dương cho phần tử có ID là 'header'?",
            options: [
                "#header { background-color: blue; }",
                ".header { background-color: blue; }",
                "header { background: blue; }",
                "*header { background-color: blue; }"
            ],
            correct: 0,
            explanation: "Ký tự '#' dùng để định nghĩa bộ chọn theo ID (ID selector)."
        },
        {
            type: "multiple",
            question: "Hệ quản trị cơ sở dữ liệu (DBMS) là gì?",
            options: [
                "Là phần mềm cung cấp môi trường để tạo lập, lưu trữ và khai thác cơ sở dữ liệu",
                "Là tập hợp các bảng dữ liệu liên kết với nhau",
                "Là thiết bị phần cứng để lưu trữ các ổ đĩa cứng",
                "Là nhân viên quản lý dữ liệu cho doanh nghiệp"
            ],
            correct: 0,
            explanation: "DBMS (như MySQL, SQL Server) là phần mềm trung gian giúp người dùng quản lý, truy xuất CSDL."
        },
        {
            type: "multiple",
            question: "Trong cơ sở dữ liệu quan hệ, khóa chính (Primary Key) có vai trò gì?",
            options: [
                "Xác định duy nhất một bản ghi (dòng) trong bảng",
                "Liên kết hai bảng dữ liệu lại với nhau",
                "Cho phép dữ liệu trong cột chứa giá trị rỗng (NULL)",
                "Tự động tăng giá trị của cột lên gấp đôi"
            ],
            correct: 0,
            explanation: "Khóa chính đảm bảo tính toàn vẹn thực thể, các giá trị trong cột khóa chính phải duy nhất và không được NULL."
        },
        {
            type: "multiple",
            question: "Câu lệnh SQL nào dùng để truy xuất dữ liệu từ một bảng?",
            options: ["SELECT", "INSERT", "UPDATE", "DELETE"],
            correct: 0,
            explanation: "SELECT dùng để truy vấn/lấy dữ liệu. INSERT dùng để thêm mới, UPDATE để cập nhật, DELETE để xóa."
        },
        {
            type: "multiple",
            question: "Trong câu lệnh SQL: `SELECT * FROM HocSinh WHERE DiemTB >= 8.0;`, từ khóa `WHERE` thực hiện chức năng gì?",
            options: [
                "Lọc dữ liệu theo điều kiện xác định",
                "Sắp xếp thứ tự các cột hiển thị",
                "Chỉ định tên bảng dữ liệu",
                "Gộp các nhóm bản ghi giống nhau"
            ],
            correct: 0,
            explanation: "Mệnh đề WHERE dùng để thiết lập điều kiện lọc cho các bản ghi được trả về từ câu truy vấn."
        },
        {
            type: "multiple",
            question: "Khái niệm 'Học sâu' (Deep Learning) là:",
            options: [
                "Một tập con của Học máy, sử dụng các mạng thần kinh nhân tạo nhiều lớp",
                "Một phương pháp học tập chăm chỉ của các học sinh chuyên ngành Tin học",
                "Phần mềm dịch thuật đa ngôn ngữ của Google",
                "Thuật toán tìm kiếm thông tin dưới lòng đại dương"
            ],
            correct: 0,
            explanation: "Deep Learning (Học sâu) là nhánh nâng cao của Machine Learning sử dụng mạng neuron đa tầng để khai phá dữ liệu phức tạp."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây đúng về cơ chế hoạt động của thuật toán tìm kiếm nhị phân (Binary Search)?",
            options: [
                "Yêu cầu danh sách phải được sắp xếp trước và mỗi bước chia đôi không gian tìm kiếm",
                "Duyệt tuần tự từ đầu đến cuối danh sách để tìm kiếm khóa",
                "Chỉ hoạt động được trên các mảng có kích thước nhỏ hơn 10 phần tử",
                "Tìm kiếm ngẫu nhiên các phần tử cho đến khi khớp đáp án"
            ],
            correct: 0,
            explanation: "Binary search hoạt động trên mảng đã sắp xếp, so sánh khóa với phần tử giữa để loại bỏ một nửa số phần tử trong mỗi lượt chia."
        },
        {
            type: "multiple",
            question: "Trong Python, đoạn mã: `for i in range(1, 5): print(i)` sẽ in ra các số nào?",
            options: ["1, 2, 3, 4", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4", "2, 3, 4, 5"],
            correct: 0,
            explanation: "Hàm `range(1, 5)` sinh ra các số từ 1 đến sát 5 (không gồm 5), tức là: 1, 2, 3, 4."
        },
        {
            type: "multiple",
            question: "Giao thức bảo mật nào sau đây được khuyên dùng để bảo vệ mạng không dây Wi-Fi gia đình hiện nay?",
            options: ["WPA3 / WPA2", "WEP", "HTTP", "TELNET"],
            correct: 0,
            explanation: "WEP là chuẩn cũ đã bị bẻ khóa dễ dàng. WPA2 và WPA3 là các chuẩn bảo mật mạng không dây mạnh mẽ, an toàn hiện hành."
        },
        {
            type: "multiple",
            question: "Hành vi nào dưới đây được coi là vi phạm bản quyền phần mềm?",
            options: [
                "Bẻ khóa (crack) phần mềm thương mại để sử dụng miễn phí",
                "Sử dụng phần mềm mã nguồn mở để học tập",
                "Gỡ cài đặt phần mềm không sử dụng trên máy tính",
                "Mua bản quyền chính hãng từ nhà sản xuất"
            ],
            correct: 0,
            explanation: "Bẻ khóa phần mềm thương mại để xài lậu là vi phạm nghiêm trọng bản quyền tác giả và luật sở hữu trí tuệ."
        },
        {
            type: "multiple",
            question: "Trong ngôn ngữ lập trình Python, để thêm một phần tử vào cuối một danh sách (list), ta dùng phương thức nào?",
            options: ["append()", "add()", "insert()", "push()"],
            correct: 0,
            explanation: "`list.append(x)` thêm phần tử x vào cuối danh sách. `insert(index, x)` chèn vào vị trí tùy chọn."
        },
        {
            type: "multiple",
            question: "Thiết bị nào thực hiện việc điều biến và giải điều chế tín hiệu để kết nối mạng LAN của gia đình với nhà cung cấp dịch vụ Internet (ISP)?",
            options: ["Modem", "Switch", "Hub", "Access Point"],
            correct: 0,
            explanation: "Modem (Modulator-Demodulator) chuyển đổi tín hiệu tương tự (analog) thành số (digital) và ngược lại."
        },
        {
            type: "multiple",
            question: "Trong CSDL, khi một cột ở bảng này tham chiếu đến khóa chính ở một bảng khác thì cột đó gọi là:",
            options: ["Khóa ngoại (Foreign Key)", "Khóa phụ", "Trường chỉ mục", "Khóa kép"],
            correct: 0,
            explanation: "Khóa ngoại dùng để tạo mối liên kết và bảo đảm tính toàn vẹn tham chiếu giữa các bảng dữ liệu."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai (4 câu) ---
        {
            type: "truefalse",
            question: "Xét hoạt động lập trình và các thuật toán tìm kiếm, sắp xếp trong Tin học:",
            options: [
                "Thuật toán sắp xếp nổi bọt (Bubble Search) hoạt động bằng cách liên tục hoán đổi các phần tử kề nhau nếu chúng sai thứ tự.",
                "Độ phức tạp thời gian trung bình của thuật toán tìm kiếm tuần tự (Linear Search) tốt hơn so với tìm kiếm nhị phân.",
                "Để lập trình web động tương tác tốt với máy chủ, lập trình viên thường dùng HTML kết hợp các ngôn ngữ phía máy chủ như PHP, Python.",
                "Mọi chương trình Python viết ra đều phải khai báo hàm main() tường minh và kết thúc bằng dấu chấm phẩy (;)."
            ],
            correct: [true, false, true, false],
            explanation: "- Sắp xếp nổi bọt so sánh kề nhau: Đúng.\n- Độ phức tạp Linear Search là O(n), Binary Search là O(log n) → Binary search tốt hơn nhiều: Sai.\n- PHP, Python kết hợp HTML để tạo web động: Đúng.\n- Python không cần hàm main() bắt buộc và không dùng chấm phẩy kết thúc lệnh: Sai."
        },
        {
            type: "truefalse",
            question: "Về mạng máy tính, giao thức truyền thông và bảo mật thông tin:",
            options: [
                "Mô hình TCP/IP gồm có 4 tầng chức năng: Ứng dụng, Giao vận, Mạng, và Truy cập mạng.",
                "Giao thức UDP truyền dữ liệu nhanh hơn TCP nhưng không đảm bảo độ tin cậy và không kiểm tra lỗi gói tin.",
                "Khi truy cập một trang web sử dụng giao thức HTTPS, toàn bộ dữ liệu trao đổi giữa trình duyệt và máy chủ đều được mã hóa.",
                "Tường lửa (Firewall) có thể phát hiện và tiêu diệt triệt để mọi virus máy tính ẩn sâu trong các tệp tin đã bị nhiễm."
            ],
            correct: [true, true, true, false],
            explanation: "- Mô hình TCP/IP chuẩn gồm 4 tầng: Đúng.\n- UDP truyền không tin cậy nhưng tốc độ rất cao (thường dùng stream video): Đúng.\n- HTTPS mã hóa đường truyền bảo mật: Đúng.\n- Firewall ngăn chặn truy cập mạng trái phép, không có chức năng quét diệt virus nội bộ trong file: Sai."
        },
        {
            type: "truefalse",
            question: "Về Hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) và các lệnh truy vấn SQL:",
            options: [
                "Một bảng dữ liệu có thể thiết lập nhiều khóa chính độc lập cùng một lúc.",
                "Giá trị trong cột khóa ngoại bắt buộc phải trùng khớp với một giá trị có sẵn trong cột khóa chính được tham chiếu đến (hoặc để trống NULL).",
                "Câu lệnh `SELECT` kết hợp mệnh đề `ORDER BY` dùng để sắp xếp kết quả hiển thị theo thứ tự tăng dần hoặc giảm dần.",
                "Câu lệnh `DROP TABLE` được dùng để xóa toàn bộ các bản ghi trong bảng nhưng vẫn giữ lại cấu trúc của bảng đó."
            ],
            correct: [false, true, true, false],
            explanation: "- Một bảng chỉ có tối đa một khóa chính (có thể gồm nhiều cột gộp lại làm khóa chính phức hợp): Sai.\n- Quy tắc toàn vẹn tham chiếu của khóa ngoại: Đúng.\n- ORDER BY dùng để sắp xếp: Đúng.\n- DROP TABLE xóa hoàn toàn bảng (mất cả cấu trúc). Để xóa bản ghi giữ cấu trúc ta dùng DELETE hoặc TRUNCATE: Sai."
        },
        {
            type: "truefalse",
            question: "Về các khía cạnh công nghệ thông tin hiện đại và ứng dụng trí tuệ nhân tạo (AI):",
            options: [
                "Hệ thống điều khiển xe tự lái thông minh kết hợp camera cảm biến là một sản phẩm tiêu biểu của Trí tuệ nhân tạo.",
                "Mọi hệ thống AI do con người tạo ra đều tuyệt đối khách quan, không chứa thiên kiến hay sự sai lệch thông tin.",
                "Khai thác dữ liệu lớn giúp các doanh nghiệp dự báo được hành vi tiêu dùng và tối ưu hóa hoạt động sản xuất kinh doanh.",
                "Mọi thiết bị thông minh kết nối IoT đều sử dụng chung một hệ điều hành duy nhất là Windows 11."
            ],
            correct: [true, false, true, false],
            explanation: "- Xe tự lái là ứng dụng AI: Đúng.\n- AI có thể có thiên kiến (bias) do dữ liệu đầu vào bị lệch lệch hoặc sai số: Sai.\n- Tác dụng của Big Data trong dự báo hành vi kinh tế: Đúng.\n- Thiết bị IoT dùng nhiều hệ điều hành nhúng chuyên dụng (như Linux nhúng, FreeRTOS...), không thể chạy Win 11 nặng nề: Sai."
        }
    ]
};
