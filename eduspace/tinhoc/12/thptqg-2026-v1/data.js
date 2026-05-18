window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Tin Học (Bản 1)",
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
            question: "Trong kỷ nguyên số, hai yếu tố bổ sung cho nhau để định hình đặc điểm của thông tin trong môi trường số là gì?",
            options: [
                "Tính bản quyền và khả năng chia sẻ toàn cầu",
                "Tính toàn vẹn dữ liệu và độ trễ truyền thông thấp",
                "Sự phổ biến của các công nghệ phần cứng và phần mềm nhúng",
                "Tính kết nối mạng diện rộng và khả năng lưu trữ không giới hạn"
            ],
            correct: 0,
            explanation: "Trong môi trường số, thông tin dễ dàng được sao chép và chia sẻ toàn cầu nhưng đồng thời cũng đặt ra bài toán lớn về bảo vệ bản quyền."
        },
        {
            type: "multiple",
            question: "Trí tuệ nhân tạo tổng hợp (Strong AI hay AGI) được định nghĩa là hệ thống AI có khả năng:",
            options: [
                "Thực hiện bất kỳ nhiệm vụ trí tuệ nào mà con người có thể làm được",
                "Chỉ thực hiện một công việc duy nhất được huấn luyện sẵn",
                "Hoạt động không cần nguồn điện năng",
                "Tự động viết lại mã nguồn hệ điều hành Windows"
            ],
            correct: 0,
            explanation: "Strong AI (AGI) là mục tiêu hướng tới của AI, nơi hệ thống có khả năng tự nhận thức, suy luận và giải quyết mọi vấn đề như một bộ não người."
        },
        {
            type: "multiple",
            question: "Trong Big Data, thuộc tính chỉ sự tin cậy, độ chính xác và tính xác thực của dữ liệu được gọi là:",
            options: [
                "Veracity (Tính xác thực)",
                "Value (Giá trị)",
                "Velocity (Tốc độ)",
                "Variety (Sự đa dạng)"
            ],
            correct: 0,
            explanation: "Veracity chỉ tính tin cậy, chính xác của dữ liệu đầu vào. Dữ liệu dù lớn nhưng nếu không chính xác (low veracity) thì giá trị khai thác sẽ rất thấp."
        },
        {
            type: "multiple",
            question: "Địa chỉ IPv6 gồm bao nhiêu bit và được biểu diễn dưới dạng nào?",
            options: [
                "128 bit, chia thành 8 nhóm số thập lục phân ngăn cách bởi dấu hai chấm (:)",
                "32 bit, chia thành 4 nhóm số thập phân ngăn cách bởi dấu chấm (.)",
                "64 bit, chia thành 4 nhóm số thập lục phân ngăn cách bởi dấu gạch ngang (-)",
                "256 bit, biểu diễn dưới dạng chuỗi ký tự mã hóa Base64"
            ],
            correct: 0,
            explanation: "IPv6 gồm 128 bit (so với 32 bit của IPv4) và được viết dưới dạng số thập lục phân (hexadecimal) gồm 8 nhóm."
        },
        {
            type: "multiple",
            question: "Khi kết nối các máy tính trong một văn phòng nhỏ theo mô hình mạng hình sao (Star Topology), thiết bị trung tâm thường dùng là:",
            options: [
                "Switch hoặc Hub",
                "Cáp đồng trục",
                "Card mạng không dây",
                "Repeater công suất lớn"
            ],
            correct: 0,
            explanation: "Trong mạng hình sao, mọi máy tính đều kết nối trực tiếp đến một thiết bị trung tâm như Switch hoặc Hub để truyền dữ liệu qua lại."
        },
        {
            type: "multiple",
            question: "Giao thức nào sau đây được sử dụng để truyền tải các tập tin dữ liệu giữa máy tính cá nhân và máy chủ qua Internet?",
            options: [
                "FTP",
                "SMTP",
                "HTTP",
                "DHCP"
            ],
            correct: 0,
            explanation: "FTP (File Transfer Protocol) là giao thức chuẩn để truyền tải tập tin trong mạng."
        },
        {
            type: "multiple",
            question: "Để bảo mật thông tin trên đường truyền không dây công cộng, phương pháp mã hóa nào được sử dụng phổ biến nhất?",
            options: [
                "Mã hóa đầu cuối kết hợp VPN (Virtual Private Network)",
                "Chống nhiễu điện từ bằng cáp mạng UTP",
                "Tắt tính năng định vị GPS trên điện thoại",
                "Sử dụng cáp mạng có vỏ bọc chống nhiễu STP"
            ],
            correct: 0,
            explanation: "VPN mã hóa toàn bộ lưu lượng dữ liệu đi và đến thiết bị, bảo vệ thông tin khỏi bị nghe lén trên mạng Wi-Fi công cộng."
        },
        {
            type: "multiple",
            question: "Mã độc Trojan Horse thường hoạt động theo cơ chế nào sau đây?",
            options: [
                "Ẩn mình trong một phần mềm hợp pháp để đánh lừa người dùng cài đặt",
                "Tự nhân bản và tự động quét các cổng mạng để lây nhiễm từ xa",
                "Tấn công trực tiếp vào phần cứng làm cháy ổ đĩa cứng",
                "Gửi thư điện tử hàng loạt chứa quảng cáo lừa đảo"
            ],
            correct: 0,
            explanation: "Trojan ẩn giấu dưới vỏ bọc một ứng dụng hữu ích hoặc trò chơi miễn phí, khi người dùng kích hoạt nó sẽ âm thầm mở cổng hậu (backdoor) cho kẻ tấn công."
        },
        {
            type: "multiple",
            question: "Trong HTML, thẻ nào được sử dụng để chèn một hình ảnh vào trang web?",
            options: [
                "<img src=\"url\" alt=\"text\">",
                "<image href=\"url\">",
                "<picture source=\"url\">",
                "<img href=\"url\">"
            ],
            correct: 0,
            explanation: "Thẻ `<img>` là thẻ tự đóng, sử dụng thuộc tính `src` để chỉ đường dẫn ảnh và `alt` để hiển thị văn bản thay thế."
        },
        {
            type: "multiple",
            question: "Để tạo một bảng trong HTML, nhóm thẻ nào sau đây được sử dụng đúng cách?",
            options: [
                "<table>, <tr>, <td>",
                "<table>, <row>, <cell>",
                "<grid>, <row>, <col>",
                "<table>, <tbody>, <col>"
            ],
            correct: 0,
            explanation: "`<table>` định nghĩa bảng, `<tr>` định nghĩa hàng (table row), và `<td>` định nghĩa ô dữ liệu (table data)."
        },
        {
            type: "multiple",
            question: "Trong CSS, để định dạng kiểu chữ in nghiêng cho một phần tử văn bản, ta dùng thuộc tính nào?",
            options: [
                "font-style: italic;",
                "text-transform: italic;",
                "font-weight: bold;",
                "text-decoration: underline;"
            ],
            correct: 0,
            explanation: "`font-style: italic;` làm văn bản in nghiêng. `font-weight` chỉnh độ đậm, còn `text-decoration` chỉnh gạch chân."
        },
        {
            type: "multiple",
            question: "Đoạn mã CSS nào sau đây sẽ áp dụng định dạng cho tất cả các phần tử có class là 'highlight'?",
            options: [
                ".highlight { color: red; }",
                "#highlight { color: red; }",
                "highlight { color: red; }",
                "*highlight { color: red; }"
            ],
            correct: 0,
            explanation: "Trong CSS, dấu chấm (.) dùng để biểu diễn class selector, dấu thăng (#) dùng cho ID selector."
        },
        {
            type: "multiple",
            question: "Cơ sở dữ liệu quan hệ (Relational Database) tổ chức lưu trữ dữ liệu dưới dạng nào?",
            options: [
                "Các bảng hai chiều gồm các hàng và các cột",
                "Các tệp văn bản tuần tự ngăn cách bởi dấu phẩy",
                "Cấu trúc cây thư mục phân cấp tuyến tính",
                "Các nút mạng liên kết ngẫu nhiên"
            ],
            correct: 0,
            explanation: "CSDL quan hệ lưu trữ dữ liệu trong các bảng (relations) gồm hàng (bản ghi) và cột (thuộc tính)."
        },
        {
            type: "multiple",
            question: "Khi thiết kế CSDL, việc đảm bảo một thuộc tính trong một bảng phải tham chiếu chính xác đến một giá trị khóa chính trong bảng khác được gọi là gì?",
            options: [
                "Ràng buộc toàn vẹn tham chiếu",
                "Ràng buộc toàn vẹn thực thể",
                "Tính đóng gói của dữ liệu",
                "Tính độc lập vật lý của cơ sở dữ liệu"
            ],
            correct: 0,
            explanation: "Toàn vẹn tham chiếu đảm bảo mối quan hệ giữa các bảng luôn nhất quán, khóa ngoại phải khớp với khóa chính được tham chiếu."
        },
        {
            type: "multiple",
            question: "Lệnh SQL nào được sử dụng để thêm một bản ghi mới vào bảng dữ liệu?",
            options: [
                "INSERT INTO",
                "ADD RECORD",
                "UPDATE VALUES",
                "CREATE ROW"
            ],
            correct: 0,
            explanation: "`INSERT INTO table_name (column1, column2) VALUES (value1, value2);` là cú pháp thêm bản ghi mới trong SQL."
        },
        {
            type: "multiple",
            question: "Cho câu lệnh SQL: `DELETE FROM HocSinh WHERE Tuoi > 18;`. Kết quả thực thi câu lệnh này là gì?",
            options: [
                "Xóa tất cả học sinh có tuổi lớn hơn 18 khỏi bảng HocSinh",
                "Xóa cột Tuoi khỏi bảng HocSinh",
                "Xóa bảng HocSinh hoàn toàn khỏi hệ thống",
                "Cập nhật tuổi của tất cả học sinh về giá trị 18"
            ],
            correct: 0,
            explanation: "Lệnh `DELETE` dùng để xóa các bản ghi thỏa mãn điều kiện chỉ định trong mệnh đề `WHERE`."
        },
        {
            type: "multiple",
            question: "Trong các phát biểu sau, phát biểu nào phản ánh đúng về mối quan hệ giữa Trí tuệ nhân tạo (AI), Học máy (Machine Learning) và Học sâu (Deep Learning)?",
            options: [
                "Học máy là một nhánh của AI, còn Học sâu là một nhánh của Học máy",
                "AI là một nhánh của Học máy, còn Học máy là một nhánh của Học sâu",
                "Cả ba khái niệm hoạt động độc lập và không có mối liên hệ nào",
                "Học sâu là công nghệ bao trùm cả AI và Học máy"
            ],
            correct: 0,
            explanation: "AI là khái niệm rộng nhất. Machine Learning là tập con của AI. Deep Learning là tập con chuyên sâu của Machine Learning."
        },
        {
            type: "multiple",
            question: "Thuật toán sắp xếp chọn (Selection Sort) hoạt động dựa trên nguyên lý nào sau đây?",
            options: [
                "Tìm phần tử nhỏ nhất trong mảng chưa sắp xếp và đưa về vị trí đầu tiên",
                "Liên tục so sánh hoán đổi các cặp phần tử kề nhau",
                "Chia mảng thành nhiều mảng con nhỏ rồi gộp lại theo thứ tự",
                "Chèn ngẫu nhiên các phần tử vào một danh sách liên kết"
            ],
            correct: 0,
            explanation: "Selection Sort liên tục tìm kiếm phần tử nhỏ nhất (hoặc lớn nhất) từ phần chưa sắp xếp của danh sách và hoán đổi nó về đúng vị trí."
        },
        {
            type: "multiple",
            question: "Trong Python, để tạo một bộ dữ liệu không thể thay đổi giá trị sau khi khởi tạo (immutable), ta dùng kiểu dữ liệu nào?",
            options: [
                "Tuple",
                "List",
                "Dictionary",
                "Set"
            ],
            correct: 0,
            explanation: "Tuple là kiểu dữ liệu danh sách cố định (immutable) trong Python, được viết trong cặp ngoặc đơn `()`."
        },
        {
            type: "multiple",
            question: "Chữ ký số (Digital Signature) được sử dụng trong giao dịch điện tử nhằm mục đích chính là gì?",
            options: [
                "Xác thực danh tính người gửi và đảm bảo tính chống chối bỏ của thông điệp",
                "Nén dung lượng tập tin văn bản xuống mức tối đa",
                "Tự động sửa lỗi chính tả trong văn bản điện tử",
                "Tăng tốc độ truyền tải thư điện tử qua mạng internet"
            ],
            correct: 0,
            explanation: "Chữ ký số sử dụng mật mã hóa khóa công khai để xác thực người gửi và đảm bảo tính toàn vẹn của dữ liệu, người ký không thể phủ nhận việc đã ký."
        },
        {
            type: "multiple",
            question: "Trong Python, kết quả của biểu thức: `15 // 4` và `15 % 4` lần lượt là:",
            options: [
                "3 và 3",
                "3.75 và 3",
                "3 và 1",
                "4 và 3"
            ],
            correct: 0,
            explanation: "Toán tử `//` chia lấy phần nguyên ($15 // 4 = 3$). Toán tử `%` chia lấy phần dư ($15 \% 4 = 3$)."
        },
        {
            type: "multiple",
            question: "Khi kết nối mạng không dây, thiết bị phát sóng Wi-Fi cho các thiết bị di động kết nối vào mạng LAN được gọi là:",
            options: [
                "Access Point (Điểm truy cập không dây)",
                "Cáp UTP",
                "Card mạng PCI Express",
                "Bộ lặp tín hiệu (Repeater)"
            ],
            correct: 0,
            explanation: "Access Point nhận tín hiệu mạng dây và chuyển đổi thành sóng vô tuyến để thiết bị không dây có thể kết nối mạng."
        },
        {
            type: "multiple",
            question: "Để xóa hoàn toàn một bảng dữ liệu (gồm cả cấu trúc và dữ liệu) khỏi cơ sở dữ liệu quan hệ, ta dùng lệnh SQL nào?",
            options: [
                "DROP TABLE",
                "DELETE TABLE",
                "REMOVE TABLE",
                "TRUNCATE TABLE"
            ],
            correct: 0,
            explanation: "`DROP TABLE table_name;` xóa sạch bảng khỏi CSDL. `DELETE` hoặc `TRUNCATE` chỉ xóa dữ liệu trong bảng."
        },
        {
            type: "multiple",
            question: "Trong Python, để kiểm tra xem một phần tử `x` có tồn tại trong danh sách `my_list` hay không, ta sử dụng toán tử nào?",
            options: [
                "in",
                "exists",
                "has",
                "contain"
            ],
            correct: 0,
            explanation: "Toán tử `in` dùng để kiểm tra sự tồn tại của một phần tử trong một iterable (list, tuple, string...)."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai (4 câu) ---
        {
            type: "truefalse",
            question: "Xét các thuật toán sắp xếp và kiểu dữ liệu cơ bản trong ngôn ngữ lập trình Python:",
            options: [
                "Thuật toán sắp xếp chọn (Selection Sort) luôn có độ phức tạp thời gian trong mọi trường hợp là O(n^2).",
                "Kiểu dữ liệu danh sách (List) trong Python cho phép chứa các phần tử có kiểu dữ liệu khác nhau và có thể thay đổi kích thước linh hoạt.",
                "Trong Python, Tuple và List đều là các kiểu dữ liệu dạng chuỗi tuần tự (sequence) nên có thể thêm, sửa, xóa phần tử giống hệt nhau.",
                "Biến trong Python bắt buộc phải khai báo kiểu dữ liệu tường minh (như int, float) trước khi gán giá trị."
            ],
            correct: [true, true, false, false],
            explanation: "- Sắp xếp chọn luôn chạy qua 2 vòng lặp lồng nhau nên độ phức tạp luôn là O(n^2): Đúng.\n- List trong Python rất linh hoạt, chứa được nhiều kiểu dữ liệu cùng lúc và co giãn được: Đúng.\n- Tuple là hằng số (immutable), không cho phép sửa đổi hay xóa phần tử sau khi tạo: Sai.\n- Python là ngôn ngữ định kiểu động, tự nhận diện kiểu dữ liệu khi gán giá trị nên không cần khai báo: Sai."
        },
        {
            type: "truefalse",
            question: "Về kiến trúc mạng máy tính, thiết bị mạng và các giao thức truyền thông phổ biến:",
            options: [
                "Địa chỉ IP dùng ở tầng mạng để định tuyến gói tin, còn địa chỉ MAC dùng ở tầng liên kết dữ liệu để xác định thiết bị vật lý cụ thể.",
                "Thiết bị Hub gửi gói tin nhận được đến chính xác cổng của thiết bị nhận nhờ đọc địa chỉ MAC.",
                "Giao thức HTTP truyền dữ liệu dạng văn bản thuần túy không mã hóa, dẫn đến nguy cơ bị đánh cắp thông tin nhạy cảm.",
                "IPv4 cung cấp không gian địa chỉ khổng lồ gồm khoảng 3,4 x 10^38 địa chỉ, giải quyết triệt để tình trạng khan hiếm IP."
            ],
            correct: [true, false, true, false],
            explanation: "- IP ở tầng mạng định tuyến, MAC ở tầng liên kết định vị vật lý: Đúng.\n- Hub không có trí thông minh, nó nhân bản gói tin và gửi ra tất cả các cổng (chỉ có Switch mới gửi chính xác cổng): Sai.\n- HTTP không mã hóa nên không an toàn (HTTPS mới mã hóa): Đúng.\n- IPv4 chỉ có 2^32 ≈ 4,3 tỷ địa chỉ nên đã cạn kiệt, con số khổng lồ 3.4x10^38 là của IPv6: Sai."
        },
        {
            type: "truefalse",
            question: "Khi làm việc với các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) và ngôn ngữ SQL:",
            options: [
                "Một bảng dữ liệu có thể chứa nhiều khóa ngoại tham chiếu đến các bảng khác nhau.",
                "Lệnh `INSERT INTO` bắt buộc người dùng phải nhập đầy đủ giá trị cho mọi cột trong bảng, kể cả các cột tự động tăng (AUTO_INCREMENT).",
                "Mệnh đề `GROUP BY` trong SQL dùng để nhóm các dòng dữ liệu có cùng giá trị lại với nhau để thực hiện các phép toán gộp (SUM, AVG, COUNT).",
                "Khóa chính của một bảng không cho phép chứa giá trị trùng lặp và không được phép để rỗng (NULL)."
            ],
            correct: [true, false, true, true],
            explanation: "- Một bảng có thể có nhiều khóa ngoại để liên kết đa chiều: Đúng.\n- Cột tự động tăng hoặc cột cho phép NULL/có giá trị mặc định thì không bắt buộc truyền vào lệnh INSERT: Sai.\n- GROUP BY kết hợp với hàm gộp để gom nhóm dữ liệu: Đúng.\n- Khóa chính luôn phải là duy nhất và khác NULL: Đúng."
        },
        {
            type: "truefalse",
            question: "Về vấn đề bảo mật an ninh mạng và xu hướng công nghệ thông tin hiện nay:",
            options: [
                "Mật mã hóa khóa công khai (asymmetric encryption) sử dụng một khóa duy nhất để thực hiện cả hai quá trình mã hóa và giải mã dữ liệu.",
                "Tấn công lừa đảo (Phishing) thường sử dụng email giả mạo hoặc trang web giả giống hệt tổ chức uy tín để dụ người dùng cung cấp mật khẩu.",
                "Công nghệ chuỗi khối (Blockchain) cung cấp cơ chế lưu trữ dữ liệu phi tập trung, bất biến và có tính minh bạch cao.",
                "Trí tuệ nhân tạo tạo sinh (Generative AI) chỉ có khả năng phân tích dữ liệu cũ chứ không thể tạo ra nội dung mới như văn bản, hình ảnh."
            ],
            correct: [false, true, true, false],
            explanation: "- Mã hóa bất đối xứng dùng cặp khóa: khóa công khai (public key) để mã hóa và khóa bí mật (private key) để giải mã: Sai.\n- Phishing là hình thức giả mạo phổ biến để ăn cắp tài khoản: Đúng.\n- Blockchain nổi bật với tính phân tán và chống sửa đổi: Đúng.\n- Generative AI (như ChatGPT, Midjourney) chuyên tạo ra nội dung mới độc đáo dựa trên mẫu học được: Sai."
        }
    ]
};
