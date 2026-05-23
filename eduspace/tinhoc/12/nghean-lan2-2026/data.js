window.quizData = {
    title: "Đề thi khảo sát chất lượng lớp 12 năm học 2025 – 2026 (Đợt 2) – Sở GD&ĐT Nghệ An",
    pageTitle: "Tin học 12 – Đề Nghệ An Đợt 2 (2026)",
    examInfo: {
        department: "Sở Giáo dục và Đào tạo Nghệ An",
        school: "",
        province: "Nghệ An",
        examName: "Kỳ khảo sát chất lượng kết hợp thi thử lớp 12",
        attempt: "Đợt 2 (Mã đề 0924)",
        date: "Năm học 2025 - 2026",
        subject: "Tin học",
        grade: "Lớp 12"
    },
    config: {
        testDuration: 3000,
        examLayout: {
            multiple: { count: 24, pointsPerQ: 0.25 },
            truefalse: { count: 6, pointsPerQ: 1.0 }
        }
    },
    questions: [
        // =============================================
        // PHẦN I – Trắc nghiệm 4 lựa chọn (24 câu)
        // =============================================
        {
            type: "multiple",
            question: "Một học sinh lưu tệp HTML tại thư mục D:\\BAI_TAP và tệp hình ảnh logo.png tại thư mục D:\\BAI_TAP\\IMAGES. Đường dẫn nào sau đây là đúng để chèn ảnh vào trang web?",
            options: [
                '<img src="logo.png" alt="Logo">',
                '<img src="D:\\logo.png" alt="Logo">',
                '<img src="IMAGES/logo.png" alt="Logo">',
                '<img href="IMAGES/logo.png" alt="Logo">'
            ],
            correct: 2,
            explanation: "Tệp HTML nằm ở thư mục D:\\BAI_TAP và hình ảnh ở D:\\BAI_TAP\\IMAGES. Để tham chiếu từ HTML sang ảnh bằng đường dẫn tương đối, ta đi từ vị trí hiện tại vào thư mục con IMAGES rồi đến tệp logo.png, tức là 'IMAGES/logo.png'. Thẻ chèn ảnh trong HTML sử dụng thuộc tính 'src' chứ không phải 'href'."
        },
        {
            type: "multiple",
            question: "Hành vi nào sau đây bị coi là vi phạm pháp luật trên không gian mạng?",
            options: [
                "Cảnh báo người khác về tin giả trên mạng.",
                "Chia sẻ lại thông tin chính xác từ nguồn chính thống.",
                "Kiểm chứng thông tin trước khi đăng tải lên mạng xã hội.",
                "Cố ý đăng tải thông tin sai sự thật gây hoang mang dư luận."
            ],
            correct: 3,
            explanation: "Cố ý đăng tải thông tin sai sự thật, xuyên tạc, vu khống hoặc gây hoang mang dư luận là hành vi vi phạm Luật An ninh mạng và các quy định pháp luật liên quan trên không gian mạng."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây mô tả đúng về trí tuệ nhân tạo (AI)?",
            options: [
                "Là khả năng của hệ thống máy tính mô phỏng một số hoạt động trí tuệ của con người như học, suy luận và thích nghi.",
                "Là khả năng của hệ thống máy tính xử lí và phân tích dữ liệu với tốc độ cao để hỗ trợ con người ra quyết định.",
                "Là khả năng của hệ thống máy tính lưu trữ và khai thác dữ liệu trong các hệ thống thông tin quy mô lớn.",
                "Là khả năng của hệ thống máy tính tự động thực hiện các quy trình đã được lập trình sẵn mà không cần sự can thiệp của con người."
            ],
            correct: 0,
            explanation: "Trí tuệ nhân tạo (AI) là một ngành khoa học máy tính hướng tới việc thiết kế các hệ thống thông minh, mô phỏng các hoạt động trí tuệ của con người như khả năng tự học, suy luận logic, giải quyết vấn đề và thích nghi với môi trường mới."
        },
        {
            type: "multiple",
            question: "Giả sử bạn có một phần tử <div> được thiết lập các thông số sau: width: 250px; padding: 10px; border: 5px solid blue; margin: 20px;. Theo mô hình hộp (Box Model), tổng chiều rộng thực tế mà phần tử này chiếm không gian trên giao diện trang web (tính từ mép ngoài của lề bên trái đến mép ngoài của lề bên phải) là:",
            options: [
                "320px",
                "300px",
                "265px",
                "280px"
            ],
            correct: 0,
            explanation: "Theo mô hình hộp (Box Model) mặc định (content-box), tổng chiều rộng thực tế mà một phần tử chiếm trên trang web được tính bằng: Lề trái (margin-left) + Viền trái (border-left) + Vùng đệm trái (padding-left) + Chiều rộng nội dung (width) + Vùng đệm phải (padding-right) + Viền phải (border-right) + Lề phải (margin-right) = 20px + 5px + 10px + 250px + 10px + 5px + 20px = 320px."
        },
        {
            type: "multiple",
            question: "Thuộc tính CSS nào sau đây dùng để xác định kích thước của chữ?",
            options: [
                "font-size",
                "text-transform",
                "font-weight",
                "line-height"
            ],
            correct: 0,
            explanation: "Thuộc tính CSS 'font-size' được sử dụng để xác định kích thước (cỡ) của chữ. Các thuộc tính khác: 'text-transform' dùng để định dạng chữ hoa/thường, 'font-weight' để định độ đậm nhạt của chữ, 'line-height' để định khoảng cách dòng."
        },
        {
            type: "multiple",
            question: "Chọn ngôn ngữ Python hoặc C++ để xem xét đoạn chương trình sau:\n\n*Đoạn chương trình Python*:\n```python\ndef Sum(x):\n    s = u = 0\n    while x > 0:\n        e = x % 10\n        if e % 2 == 1: s += e\n        x = x // 10\n        u += 1\n    return s + u\n```\n*Đoạn chương trình C++*:\n```cpp\nint Sum(int x){\n    int s = 0, u = 0;\n    while(x > 0){\n        int e = x%10;\n        if(e%2 == 1) s += e;\n        x = x/10;\n        u++;\n    }\n    return s + u;\n}\n```\nKhi x = 20252026 thì giá trị của hàm Sum(x) trả về giá trị nào sau đây?",
            options: [
                "22.",
                "27.",
                "21.",
                "13."
            ],
            correct: 3,
            explanation: "Hàm Sum(x) lặp qua từng chữ số của x từ phải qua trái:\n- Biến u đếm số lượng chữ số của x. Số 20252026 có 8 chữ số, do đó u = 8.\n- Biến s tính tổng các chữ số lẻ. Trong số 20252026, các chữ số lẻ chỉ có một chữ số 5. Do đó s = 5.\n- Hàm trả về s + u = 5 + 8 = 13."
        },
        {
            type: "multiple",
            question: "Một bệnh viện muốn cải thiện hiệu quả lưu trữ và truy xuất hồ sơ bệnh án điện tử. Vị trí nào sau đây sẽ được ưu tiên tuyển dụng?",
            options: [
                "Nhà thiết kế đồ họa xây dựng hình ảnh truyền thông cho bệnh viện.",
                "Nhân viên hỗ trợ kỹ thuật sửa chữa thiết bị máy tính tại phòng khám.",
                "Chuyên viên quản trị cơ sở dữ liệu và tối ưu hệ thống lưu trữ dữ liệu.",
                "Chuyên gia an ninh mạng đảm bảo an toàn cho hệ thống thông tin nội bộ."
            ],
            correct: 2,
            explanation: "Hệ thống hồ sơ bệnh án điện tử bản chất là một cơ sở dữ liệu (CSDL) quy mô lớn. Để quản lý, cải thiện hiệu quả lưu trữ và tối ưu hóa việc truy xuất dữ liệu bệnh án, vị trí Chuyên viên quản trị cơ sở dữ liệu (Database Administrator) là phù hợp nhất."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây là sai khi nói về đặc điểm và chức năng của thiết bị Switch trong mạng cục bộ (LAN)?",
            options: [
                "Switch có chức năng chính là định tuyến gói tin giữa các mạng khác nhau trên Internet.",
                "Switch giúp giảm thiểu sự tranh chấp băng thông và xung đột dữ liệu giữa các máy tính trong mạng.",
                "Switch thực hiện việc chuyển tiếp dữ liệu đến đúng cổng đích dựa trên địa chỉ vật lý MAC.",
                "Switch có khả năng kết nối nhiều thiết bị máy tính và máy in vào cùng một phân đoạn mạng."
            ],
            correct: 0,
            explanation: "Định tuyến gói tin giữa các mạng khác nhau là chức năng của thiết bị Router (bộ định tuyến). Switch hoạt động ở tầng liên kết dữ liệu, chuyển tiếp các khung dữ liệu trong cùng một mạng cục bộ (LAN) dựa trên địa chỉ MAC chứ không thể định tuyến qua Internet."
        },
        {
            type: "multiple",
            question: "Giao thức nào sau đây được sử dụng phổ biến để hỗ trợ việc gửi thư điện tử (email) qua mạng?",
            options: [
                "HTML",
                "SMTP",
                "DNS",
                "HTTPS"
            ],
            correct: 1,
            explanation: "SMTP (Simple Mail Transfer Protocol - Giao thức truyền tải thư đơn giản) là giao thức chuẩn được sử dụng phổ biến nhất để gửi email từ máy khách đến máy chủ thư điện tử hoặc giữa các máy chủ thư điện tử với nhau."
        },
        {
            type: "multiple",
            question: "Lựa chọn ngôn ngữ Python hoặc C++ để tìm hiểu đoạn chương trình sau:\n\n*Đoạn chương trình Python*:\n```python\nn, i, S = 10, 1, 0\nwhile i < n:\n    if i % 3 == 0:\n        S = S + i\n    i = i + 1\nprint(S)\n```\n*Đoạn chương trình C++*:\n```cpp\nint n = 10, i = 1, S = 0;\nwhile (i < n) {\n    if (i % 3 == 0) S = S + i;\n    i = i + 1;\n}\ncout << S;\n```\nSau khi thực hiện đoạn chương trình trên, giá trị của biến S được in ra màn hình là:",
            options: [
                "18",
                "9",
                "15",
                "10"
            ],
            correct: 0,
            explanation: "Vòng lặp while thực hiện duyệt biến i chạy từ 1 đến 9 (i < n = 10). Với mỗi giá trị của i, nếu i chia hết cho 3 (i % 3 == 0) thì cộng dồn i vào S. Các giá trị i chia hết cho 3 trong khoảng [1, 9] là 3, 6, 9. Vậy S = 3 + 6 + 9 = 18."
        },
        {
            type: "multiple",
            question: "Một học sinh nhận được cuộc gọi từ người lạ tự xưng là nhân viên hỗ trợ của mạng xã hội, thông báo tài khoản có dấu hiệu bị xâm nhập và yêu cầu cung cấp mật khẩu để “xác minh”. Trong tình huống này, hành động nào sau đây là không an toàn trên không gian mạng?",
            options: [
                "Từ chối cung cấp mật khẩu và tự đổi mật khẩu ngay.",
                "Kiểm tra thông tin qua kênh chính thức của nền tảng.",
                "Nhờ người thân hoặc thầy cô tư vấn cách xử lý.",
                "Cung cấp mật khẩu theo yêu cầu để xác minh tài khoản."
            ],
            correct: 3,
            explanation: "Cung cấp mật khẩu tài khoản cho bất kỳ ai (kể cả những người tự xưng là nhân viên hỗ trợ) là hành động cực kỳ không an toàn, vi phạm quy tắc bảo mật cơ bản và dẫn đến nguy cơ cao bị chiếm đoạt tài khoản."
        },
        {
            type: "multiple",
            question: "Trong các ngành học sau, ngành học nào liên quan trực tiếp đến nghề bảo mật dữ liệu ở các bậc học tiếp theo?",
            options: [
                "Công nghệ kỹ thuật điện, điện tử.",
                "Kỹ thuật điều khiển và Tự động hóa.",
                "Tài chính kế toán.",
                "Khoa học máy tính."
            ],
            correct: 3,
            explanation: "Khoa học máy tính là ngành học cung cấp các kiến thức nền tảng và chuyên sâu về cấu trúc máy tính, thuật toán, CSDL và hệ điều hành. Từ đây, người học có thể nghiên cứu các chuyên ngành liên quan trực tiếp đến an toàn thông tin, bảo mật dữ liệu và mật mã học."
        },
        {
            type: "multiple",
            question: "Trong HTML, phương án nào sau đây là mục đích chính của thuộc tính action trong thẻ <form>?",
            options: [
                "Quy định các quy tắc định dạng về màu sắc và phông chữ của form.",
                "Xác định địa chỉ URL sẽ tiếp nhận và xử lý dữ liệu từ biểu mẫu.",
                "Thiết lập nội dung nhãn hiển thị cho nút bấm gửi dữ liệu (Submit).",
                "Xác định phương thức truyền dữ liệu về máy chủ là GET hoặc POST."
            ],
            correct: 1,
            explanation: "Thuộc tính 'action' trong thẻ <form> chỉ định URL (địa chỉ trang web hoặc dịch vụ phía máy chủ) nơi dữ liệu biểu mẫu sẽ được gửi đến để xử lý sau khi người dùng nhấn nút gửi (Submit)."
        },
        {
            type: "multiple",
            question: "Thẻ HTML nào dưới đây có tác dụng làm cho kích cỡ chữ nhỏ hơn so với cỡ chữ bình thường của văn bản xung quanh?",
            options: [
                "<mark>",
                "<em>",
                "<small>",
                "<sub>"
            ],
            correct: 2,
            explanation: "Thẻ <small> dùng để hiển thị văn bản có kích thước nhỏ hơn một cỡ so với văn bản xung quanh. Các thẻ khác: <mark> dùng để bôi màu nổi bật văn bản, <em> in nghiêng nhấn mạnh văn bản, <sub> định dạng chỉ số dưới."
        },
        {
            type: "multiple",
            question: "Trong các tình huống sau, tình huống nào thể hiện khả năng nhận thức của trí tuệ nhân tạo?",
            options: [
                "Hệ thống tự động dịch thuật các đoạn văn bản từ tiếng Anh sang tiếng Việt.",
                "Hệ thống dự báo thời tiết dựa trên việc phân tích các dữ liệu khí tượng quá khứ.",
                "Hệ thống gợi ý danh sách nhạc mới dựa trên lịch sử nghe nhạc của người dùng.",
                "Hệ thống xe tự lái sử dụng dữ liệu từ cảm biến để nhận biết vật cản trên đường."
            ],
            correct: 3,
            explanation: "Khả năng nhận thức (Perception) của AI liên quan đến việc thu thập dữ liệu từ môi trường thông qua các cảm biến (hình ảnh, âm thanh, radar, lidar...) và xử lý chúng để hiểu thế giới xung quanh. Hệ thống xe tự lái sử dụng dữ liệu từ cảm biến để phát hiện, nhận biết vật cản, vạch kẻ đường, biển báo là một ví dụ điển hình của nhận thức AI."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây mô tả sai về công việc của nghề sửa chữa và bảo trì máy tính?",
            options: [
                "Nghề sửa chữa và bảo trì máy tính nhằm duy trì sự ổn định của máy tính cũng như các thiết bị liên quan, giúp người dùng được hỗ trợ kỹ thuật khi cần.",
                "Những người làm trong nghề sửa chữa và bảo trì máy tính cần thực hiện các công việc liên quan đến mạng máy tính như đảm bảo kết nối và rà soát an toàn hệ thống.",
                "Nghề sửa chữa và bảo trì máy tính bao gồm cả việc hướng dẫn người dùng sử dụng máy tính và các phần mềm thông dụng đúng cách.",
                "Nghề sửa chữa và bảo trì máy tính tập trung hoàn toàn vào việc sửa chữa, thay thế các linh kiện phần cứng bị hỏng mà không cần quan tâm đến các sự cố về phần mềm."
            ],
            correct: 3,
            explanation: "Công việc sửa chữa và bảo trì máy tính không chỉ giới hạn ở phần cứng mà còn bao gồm chẩn đoán, khắc phục các sự cố phần mềm (như cài đặt hệ điều hành, trình điều khiển driver, phần mềm ứng dụng, diệt virus và tối ưu hóa hệ thống). Do đó, phát biểu D nói 'tập trung hoàn toàn vào phần cứng mà không cần quan tâm phần mềm' là sai."
        },
        {
            type: "multiple",
            question: "Hành vi nào sau đây thể hiện tính nhân văn khi tham gia không gian mạng?",
            options: [
                "Thờ ơ, không quan tâm khi thấy người khác bị bắt nạt trên mạng.",
                "Bình luận chế giễu khi người khác chia sẻ khó khăn.",
                "Chia sẻ lại nội dung tiêu cực để gây chú ý.",
                "Động viên, an ủi người đang gặp vấn đề tinh thần."
            ],
            correct: 3,
            explanation: "Tính nhân văn trên không gian mạng thể hiện qua thái độ đồng cảm, chia sẻ, hỗ trợ và động viên, an ủi những người gặp khó khăn hoặc có vấn đề về tinh thần, giúp xây dựng môi trường mạng lành mạnh, an toàn."
        },
        {
            type: "multiple",
            question: "Trong HTML, để một tệp âm thanh hoặc video tự động lặp lại từ đầu ngay sau khi phát hết, bạn cần thêm thuộc tính nào sau đây vào thẻ <audio> hoặc <video>?",
            options: [
                "muted",
                "loop",
                "autoplay",
                "controls"
            ],
            correct: 1,
            explanation: "Thuộc tính boolean 'loop' trong các thẻ đa phương tiện <audio> và <video> của HTML5 quy định tệp âm thanh hoặc video sẽ tự động phát lại (lặp lại) từ đầu sau khi kết thúc."
        },
        {
            type: "multiple",
            question: "Trợ lí ảo nào sau đây được phát triển bởi tập đoàn Samsung?",
            options: [
                "Alexa.",
                "Copilot.",
                "Siri.",
                "Bixby."
            ],
            correct: 3,
            explanation: "Bixby là trợ lý ảo thông minh được phát triển bởi Samsung Electronics. Các trợ lý ảo khác: Alexa của Amazon, Copilot của Microsoft, Siri của Apple."
        },
        {
            type: "multiple",
            question: "Gia đình bạn Nam lắp đặt đường truyền Internet cáp quang. Nhân viên kỹ thuật cung cấp một thiết bị tích hợp có khả năng vừa chuyển đổi tín hiệu quang, vừa cấp địa chỉ IP và phát sóng Wi-fi. Phát biểu nào sau đây thể hiện thiết bị đang thực hiện chức năng của một Router?",
            options: [
                "Cho phép nhiều máy tính cắm dây LAN có thể cùng truy cập vào Internet.",
                "Chuyển đổi tín hiệu ánh sáng từ cáp quang sang tín hiệu điện kỹ thuật số.",
                "Cấp phát địa chỉ IP động và định tuyến các gói tin đi ra mạng ngoài.",
                "Phát sóng vô tuyến để các điện thoại trong nhà có thể bắt được tín hiệu."
            ],
            correct: 2,
            explanation: "Chức năng cốt lõi của Router (bộ định tuyến) là định tuyến đường đi cho các gói dữ liệu từ mạng nội bộ ra mạng ngoài (Internet) và cấp phát địa chỉ IP cho các thiết bị trong mạng cục bộ thông qua giao thức DHCP."
        },
        {
            type: "multiple",
            question: "Trong CSS, thuộc tính list-style-type: none; thường được ứng dụng để làm gì sau đây khi thiết kế thanh điều hướng (menu)?",
            options: [
                "Để loại bỏ các dấu đầu mục mặc định giúp tùy biến giao diện menu.",
                "Để thay đổi danh sách từ dạng cột đứng sang dạng hàng ngang.",
                "Để thiết lập màu chữ của các mục danh sách thành màu trắng.",
                "Để vô hiệu hóa hoàn toàn các liên kết có trong danh sách."
            ],
            correct: 0,
            explanation: "Các thẻ danh sách <ul>, <li> mặc định hiển thị dấu chấm đầu mục (bullet points). Khi thiết kế menu điều hướng bằng danh sách, thuộc tính 'list-style-type: none;' được sử dụng để loại bỏ các dấu chấm mặc định này, giúp giao diện menu trông sạch sẽ và dễ tùy biến hơn."
        },
        {
            type: "multiple",
            question: "Trong các ứng dụng sau, ứng dụng nào không sử dụng trí tuệ nhân tạo?",
            options: [
                "Chương trình tìm kiếm tệp tin xác định kết quả dựa trên đối chiếu từ khóa và sắp xếp theo quy tắc cố định.",
                "Ứng dụng bản đồ đề xuất tuyến đường phù hợp dựa trên dữ liệu giao thông và điều chỉnh theo thời điểm.",
                "Hệ thống phát hiện bất thường trong giao dịch dựa trên việc so sánh với các mẫu hành vi đã ghi nhận trước đó.",
                "Hệ thống phân loại hình ảnh có khả năng cải thiện kết quả dựa trên dữ liệu được bổ sung theo thời gian."
            ],
            correct: 0,
            explanation: "Tìm kiếm tệp dựa trên đối chiếu từ khóa thuần túy và sắp xếp theo các quy tắc cố định không có khả năng tự học, thích nghi hay suy luận nên chỉ là các thuật toán lập trình truyền thống chứ không phải AI. Các ứng dụng còn lại đều có sự tham gia của các mô hình AI/học máy để giải quyết vấn đề linh hoạt dựa trên dữ liệu thay đổi."
        },
        {
            type: "multiple",
            question: "Khi muốn một ô trong bảng trải dài qua 3 cột khác nhau trên cùng một hàng, bạn phải sử dụng thuộc tính nào sau đây?",
            options: [
                'rowspan="3"',
                'colspan="3"',
                'border="3"',
                'width="3"'
            ],
            correct: 1,
            explanation: "Thuộc tính 'colspan' (column span) dùng để gộp nhiều cột trên cùng một hàng. 'colspan=\"3\"' cho phép ô đó kéo dài qua 3 cột. Ngược lại, 'rowspan' dùng để gộp các ô theo chiều dọc (qua nhiều hàng)."
        },
        {
            type: "multiple",
            question: "Phương án nào sau đây mô tả đúng đặc điểm của địa chỉ IPv6?",
            options: [
                "Độ dài 128 bit, viết dưới dạng các số thập lục phân.",
                "Độ dài 48 bit, viết dưới dạng các mã nhị phân.",
                "Độ dài 32 bit, viết dưới dạng các số thập phân.",
                "Độ dài 64 bit, viết dưới dạng các ký tự bát phân."
            ],
            correct: 0,
            explanation: "Địa chỉ IPv6 có độ dài 128 bit (gấp 4 lần IPv4), được biểu diễn dưới dạng 8 nhóm số thập lục phân ngăn cách bởi dấu hai chấm (:)."
        },

        // =============================================
        // PHẦN II – Đúng/Sai (6 câu)
        // =============================================
        {
            type: "truefalse",
            question: "Một Phòng khám đa khoa thiết lập hệ thống mạng nội bộ để quản lý hồ sơ bệnh nhân và phục vụ công việc chuyên môn. Dữ liệu bệnh án được lưu trữ tập trung tại một máy chủ (Server) kết nối dây cáp vào Switch trung tâm. Tại khu vực phòng khám và sảnh chờ, phòng khám lắp đặt các Access Point (AP) nối vào Switch trung tâm để phát Wi-Fi cho bác sĩ dùng máy tính bảng truy cập hồ sơ và cho bệnh nhân sử dụng Internet. Toàn bộ hệ thống kết nối ra bên ngoài thông qua một Router nối với nhà cung cấp dịch vụ Internet (ISP).\n\nMột nhân viên kỹ thuật đưa ra các nhận định về việc vận hành hệ thống như sau:",
            options: [
                "Thiết bị Router trong phòng khám đóng vai trò xác định đường đi tốt nhất để các gói tin chứa báo cáo y tế được gửi từ mạng nội bộ ra Internet đến đúng địa chỉ nhận tại Sở Y tế.",
                "Trong trường hợp hệ thống mạng của phòng khám bị mất kết nối Internet, bác sĩ sẽ không có cách nào sử dụng máy tính bảng truy cập và xem hồ sơ bệnh án đang được lưu trữ tại máy chủ (Server) thông qua kết nối Wi-Fi.",
                "Giao thức mạng (như bộ TCP/IP) đóng vai trò là tập hợp các quy tắc giúp máy chủ và các máy tính bảng của bác sĩ có thể 'hiểu' và trao đổi dữ liệu hồ sơ một cách chính xác, thống nhất.",
                "Khi thực hiện chia sẻ thư mục 'HỒ SƠ' trên máy chủ, nếu nhân viên kĩ thuật thiết lập quyền truy cập là 'Read' (chỉ đọc), bác sĩ có thể xem hồ sơ, tải bệnh án về máy tính bảng và thực hiện xóa các tệp cũ không còn dùng đến để giải phóng bộ nhớ cho máy chủ."
            ],
            correct: { 0: true, 1: false, 2: true, 3: false },
            explanation: "a) ĐÚNG: Định tuyến các gói tin ra mạng ngoài (Internet) và chọn đường đi tối ưu là chức năng cơ bản của Router.\nb) SAI: Dữ liệu hồ sơ lưu trên máy chủ (Server) nội bộ. Khi mất kết nối Internet ra bên ngoài, mạng LAN (kết nối nội bộ qua Switch và Access Point phát Wi-Fi) vẫn hoạt động, nên máy tính bảng vẫn có thể truy cập vào máy chủ nội bộ để xem bệnh án.\nc) ĐÚNG: Giao thức mạng định nghĩa các quy chuẩn truyền tải thông tin giữa các thiết bị trên mạng để giao tiếp diễn ra đồng bộ và chính xác.\nd) SAI: Quyền 'Read' chỉ cho phép đọc và tải dữ liệu về thiết bị cá nhân, hoàn toàn không được sửa đổi hay xóa tệp tin trên máy chủ. Muốn xóa tệp phải được cấp quyền Write/Modify/Delete."
        },
        {
            type: "truefalse",
            question: "Để quản lí điểm thi cho kì thi thử tốt nghiệp THPT lần 2, CLB tin học của nhà trường đã thiết kế một cơ sở dữ liệu Quản lý điểm thi với các bảng có cấu trúc như sau:\n- HOCSINH (MaHS, HoTen, GioiTinh, NgaySinh, Lop): lưu thông tin Mã học sinh, Họ tên, Giới tính, Ngày sinh, Lớp học.\n- MONHOC (MaMH, TenMH): lưu thông tin Mã môn học, Tên môn học.\n- DIEM (MaHS, MaMH, DiemSo): lưu thông tin Mã học sinh, Mã môn học, Điểm số.\n\nSau khi tìm hiểu các phần mềm để quản trị cơ sở dữ liệu trên, một số học sinh trong nhóm có ý kiến nhận xét sau:",
            options: [
                "Để đưa ra được thông tin gồm: Họ tên, Tên môn học, Điểm số của học sinh có Mã là: HS03, có thể thực hiện các câu truy vấn với các thành phần sau:\n- Các bảng và các trường được chọn: HOCSINH.HoTen, MONHOC.TenMH, DIEM.DiemSo\n- Các bảng được liên kết qua khoá: HOCSINH liên kết DIEM qua khoá MaHS.\n- Điều kiện kết xuất dữ liệu: HOCSINH.MaHS = 'HS03'.",
                "Trong bảng DIEM trường MaMH là khoá ngoại tham chiếu đến bảng MONHOC.",
                "Trong bảng DIEM, bộ hai thuộc tính MaHS, MaMH là đủ để xác định duy nhất mỗi bản ghi.",
                "Khi thực hiện xóa một học sinh trong bảng HOCSINH, hệ thống sẽ tự động xóa toàn bộ các dòng liên quan đến học sinh đó trong bảng DIEM mà không cần thiết lập thêm bất kỳ ràng buộc nào."
            ],
            correct: { 0: false, 1: true, 2: true, 3: false },
            explanation: "a) SAI: Để đưa ra được cả tên môn học (MONHOC.TenMH) và điểm số, truy vấn phải liên kết cả 3 bảng HOCSINH, DIEM, MONHOC. Ở nhận xét trên mới chỉ có liên kết HOCSINH và DIEM qua MaHS, chưa có liên kết bảng DIEM với MONHOC qua khóa MaMH, dẫn đến không thể truy xuất chính xác thông tin môn học.\nb) ĐÚNG: MaMH trong DIEM liên kết trực tiếp tới khóa chính MaMH của MONHOC nhằm thiết lập quan hệ toàn vẹn dữ liệu.\nc) ĐÚNG: Mỗi học sinh đối với mỗi môn học chỉ có tối đa một điểm số. Do đó cặp khóa (MaHS, MaMH) là khóa chính của bảng DIEM, xác định duy nhất mỗi dòng dữ liệu điểm.\nd) SAI: Mặc định trong CSDL quan hệ, nếu không thiết lập ràng buộc khóa ngoại với tùy chọn xóa tự động (ON DELETE CASCADE), hệ thống sẽ báo lỗi và ngăn cản việc xóa học sinh trong bảng HOCSINH nếu đang có điểm số tham chiếu trong bảng DIEM (để bảo toàn tính toàn vẹn tham chiếu), hoặc dữ liệu cũ ở DIEM sẽ thành mồ côi chứ không tự động biến mất."
        },
        {
            type: "truefalse",
            question: "(Khoa học Máy tính) Một ứng dụng xem phim sử dụng thuật toán học máy để gợi ý phim cho người dùng dựa trên hành vi của họ. Bảng dữ liệu huấn luyện gồm thông tin của hàng triệu người dùng, mỗi dòng chứa: các bộ phim đã xem, thể loại phim yêu thích (hành động, tình cảm, viễn tưởng), thời gian xem phim và đánh giá (số sao) của người dùng đó cho từng bộ phim.\n\nTrong quá trình xây dựng hệ thống, các kỹ sư đưa ra các nhận định sau:",
            options: [
                "Đầu ra (output) của mô hình này là danh sách các bộ phim mà người dùng có khả năng sẽ thích xem nhất.",
                "Độ chính xác của hệ thống gợi ý sẽ có xu hướng được cải thiện nếu người dùng tích cực để lại đánh giá (số sao) sau mỗi bộ phim họ xem.",
                "Việc máy tự động tìm ra những người dùng có sở thích tương đồng nhau để gợi ý phim là một dạng của học máy.",
                "Nếu một người dùng mới hoàn toàn (chưa xem phim nào, chưa đánh giá phim nào) đăng nhập, hệ thống vẫn có thể dự báo chính xác sở thích cá nhân của họ dựa trên dữ liệu của người khác."
            ],
            correct: { 0: true, 1: true, 2: true, 3: false },
            explanation: "a) ĐÚNG: Mục tiêu chính của hệ gợi ý (Recommendation System) là dự đoán danh sách các phim phù hợp nhất với người dùng dựa trên mô hình học máy.\nb) ĐÚNG: Thuật toán học máy cần dữ liệu phản hồi tường minh (explicit feedback) như đánh giá số sao để tối ưu hóa trọng số. Càng có nhiều đánh giá, độ chính xác dự báo càng được cải thiện.\nc) ĐÚNG: Phương pháp này gọi là Lọc cộng tác (Collaborative Filtering), tìm kiếm các mối tương quan về hành vi giữa các nhóm người dùng có cùng sở thích để đưa ra gợi ý, đây là một nhánh thuật toán học máy phổ biến.\nd) SAI: Đây là hiện tượng 'khởi động lạnh' (Cold Start) trong hệ thống gợi ý. Khi chưa có bất kỳ dữ liệu tương tác nào của người dùng mới, hệ thống không thể xây dựng được hồ sơ sở thích cá nhân hóa cho họ nên không thể dự báo chính xác sở thích của họ ngay lập tức mà phải dùng phương pháp thay thế (ví dụ hiển thị phim phổ biến)."
        },
        {
            type: "truefalse",
            question: "(Khoa học Máy tính) Chọn một trong hai ngôn ngữ Python hoặc C++ để tìm hiểu một hàm cho dưới đây:\n\n*Hàm viết bằng Python*:\n```python\ndef g(A, n):\n    for i in range(n - 1):\n        for j in range(i + 1, n):\n            if A[i] < A[j]:\n                A[i], A[j] = A[j], A[i]\n```\n*Hàm viết bằng C++*:\n```cpp\nvoid g(int A[], int n) {\n    for(int i=0; i < n-1; i++) {\n        for(int j=i+1; j<n; j++) {\n            if(A[i] < A[j]) {\n                swap(A[i], A[j]);\n            }\n        }\n    }\n}\n```\nMột số bạn học sinh nhận xét về hàm trên như sau:",
            options: [
                "Khi thực hiện xong hàm g(A, n), số lần thực hiện câu lệnh đổi chỗ ở dòng trong cùng không lớn hơn n(n-1)/2.",
                "Với bộ dữ liệu A = [3, 1, 4, 1, 5], n = 5, khi thực hiện xong hàm g(A, n) thì số lần thực hiện câu lệnh đổi chỗ là 4.",
                "Hàm trên sử dụng thuật toán sắp xếp chọn (Selection Sort) theo thứ tự giảm dần.",
                "Hàm sử dụng thuật toán có độ phức tạp thời gian là O(n²)."
            ],
            correct: { 0: true, 1: false, 2: false, 3: true },
            explanation: "a) ĐÚNG: Số lần kiểm tra điều kiện so sánh trong hai vòng lặp lồng nhau tối đa là (n-1) + (n-2) + ... + 1 = n(n-1)/2. Lệnh đổi chỗ chỉ xảy ra khi điều kiện IF được thỏa mãn, do đó số lần thực hiện chắc chắn nhỏ hơn hoặc bằng n(n-1)/2.\nb) SAI: Ta chạy khô thuật toán với A = [3, 1, 4, 1, 5] (n=5):\n- i = 0: So sánh A[0] với các phần tử sau. Khi j=2, A[0]=3 < A[2]=4 -> đổi chỗ (mảng thành [4,1,3,1,5], lần đổi thứ 1). Khi j=4, A[0]=4 < A[4]=5 -> đổi chỗ (mảng thành [5,1,3,1,4], lần đổi thứ 2).\n- i = 1: So sánh A[1] với các phần tử sau. Khi j=2, A[1]=1 < A[2]=3 -> đổi chỗ (mảng thành [5,3,1,1,4], lần đổi thứ 3). Khi j=4, A[1]=3 < A[4]=4 -> đổi chỗ (mảng thành [5,4,1,1,3], lần đổi thứ 4).\n- i = 2: So sánh A[2] với các phần tử sau. Khi j=4, A[2]=1 < A[4]=3 -> đổi chỗ (mảng thành [5,4,3,1,1], lần đổi thứ 5).\n- i = 3: Không có thay đổi.\nTổng số lần đổi chỗ thực tế là 5 lần chứ không phải 4 lần.\nc) SAI: Hàm này sử dụng thuật toán sắp xếp đổi chỗ trực tiếp (Interchange Sort). Thuật toán sắp xếp chọn (Selection Sort) chỉ tìm vị trí phần tử lớn nhất/nhỏ nhất rồi mới thực hiện tối đa 1 lần đổi chỗ sau mỗi vòng lặp ngoài, còn ở đây việc đổi chỗ diễn ra liên tục ngay trong vòng lặp trong.\nd) ĐÚNG: Số phép so sánh của hai vòng lặp lồng nhau tỉ lệ thuận với n², do đó độ phức tạp thời gian trong trường hợp trung bình và xấu nhất đều là O(n²)."
        },
        {
            type: "truefalse",
            question: "(Tin học Ứng dụng) Một tổ học sinh xây dựng một website giới thiệu các quán ăn nổi tiếng tại địa phương, trong đó mỗi quán có trang riêng gồm hình ảnh, mô tả, địa chỉ và vị trí trên bản đồ. Website có thanh điều hướng với các mục: Trang chủ, Quán ăn, Đánh giá, Liên hệ. Nhóm sử dụng một phần mềm tạo website có sẵn mẫu giao diện để thiết kế. Trong quá trình thực hiện, các bạn đưa ra các ý kiến sau:",
            options: [
                "Khi chỉnh sửa nội dung mô tả hoặc hình ảnh của một quán ăn trên website, các thay đổi sẽ luôn được hiển thị ngay lập tức trên Internet mà không cần thực hiện thêm thao tác nào khác.",
                "Việc hiển thị vị trí quán ăn trên website có thể thực hiện bằng cách nhúng bản đồ từ một dịch vụ bản đồ trực tuyến vào trang giới thiệu của từng quán.",
                "Để hiển thị hình ảnh các món ăn trên website, nhóm bắt buộc phải sử dụng các hình ảnh có sẵn trong thư viện của phần mềm nhằm đảm bảo khả năng hiển thị.",
                "Khi tạo trang giới thiệu cho từng quán ăn, nhóm có thể thêm trang mới và liên kết các trang này với mục “Quán ăn” trên thanh điều hướng của website."
            ],
            correct: { 0: false, 1: true, 2: false, 3: true },
            explanation: "a) SAI: Khi chỉnh sửa trên phần mềm thiết kế web, chúng ta cần bấm các nút như 'Lưu' (Save) và 'Xuất bản' (Publish) hoặc triển khai (Deploy) thì trang web thực tế trên Internet mới được cập nhật nội dung mới.\nb) ĐÚNG: Bản đồ trực tuyến có cung cấp mã nhúng (ví dụ thẻ <iframe> của Google Maps) giúp chúng ta chèn dễ dàng vị trí quán ăn lên trang web giới thiệu của quán.\nc) SAI: Người thiết kế hoàn toàn có thể tự chụp ảnh và tải hình ảnh món ăn từ máy tính của mình lên trang web hoặc dẫn đường link ảnh trực tuyến, không bị giới hạn trong thư viện phần mềm.\nd) ĐÚNG: Đây là cách quản lý menu và các trang con. Khi tạo trang giới thiệu mới cho quán ăn, ta có thể đặt liên kết trang đó vào danh mục con của mục 'Quán ăn' trên thanh điều hướng."
        },
        {
            type: "truefalse",
            question: "(Tin học Ứng dụng) Để hỗ trợ chuyên môn quản lí phân công giảng dạy của các giáo viên trong trường, một nhóm học sinh đã xây dựng một cơ sở dữ liệu gồm 4 bảng, có cấu trúc như sau:\n- GIAOVIEN (MaGV, Hoten, Ngaysinh, Gioitinh, TDChuyenmon): lưu các thông tin Mã giáo viên, Họ tên, Ngày sinh, Giới tính, Trình độ chuyên môn.\n- MONHOC (MaMH, TenMH): lưu thông tin Mã môn học, Tên môn học.\n- LOP (MaLop, TenLop): lưu thông tin Mã lớp, Tên lớp.\n- GIANGDAY (MaGV, MaMH, MaLop, Tungay, Denngay, Sotiet): lưu thông tin Mã lớp, Mã môn học, Mã giáo viên, Từ ngày, Đến ngày, Số tiết trong một tuần.\n\nSau khi tìm hiểu các phần mềm để quản trị cơ sở dữ liệu trên, một số học sinh trong nhóm có ý kiến nhận xét sau:",
            options: [
                "If lưu trữ cơ sở dữ liệu bằng phần mềm bảng tính (Excel) ta có thể dùng hàm SUMIF để đếm số lượng giáo viên giảng dạy theo từng mã lớp.",
                "Để trích xuất danh sách gồm Họ tên, Tên môn học của những giáo viên đã được phân công giảng dạy tại lớp 11A1 cần thực hiện lệnh truy vấn sau:\n```sql\nSELECT GIAOVIEN.Hoten, MONHOC.TenMH\nFROM GIANGDAY\nINNER JOIN GIAOVIEN ON GIANGDAY.MaGV = GIAOVIEN.MaGV\nINNER JOIN MONHOC ON GIANGDAY.MaMH = MONHOC.MaMH\nWHERE LOP.TenLop = '11A1';\n```",
                "Trong bảng GIANGDAY bộ các thuộc tính MaGV, MaMH, MaLop, Tungay là đủ để xác định duy nhất mỗi bản ghi.",
                "Trường MaGV của bảng GIANGDAY là khóa ngoại tham chiếu đến bảng GIAOVIEN."
            ],
            correct: { 0: false, 1: false, 2: true, 3: true },
            explanation: "a) SAI: Hàm SUMIF trong Excel được dùng để tính tổng các giá trị số thỏa mãn điều kiện, không dùng để đếm số lượng bản ghi. Để đếm số lượng giáo viên giảng dạy theo từng mã lớp ta phải sử dụng hàm COUNTIF hoặc COUNTIFS.\nb) SAI: Trong câu lệnh SQL, điều kiện lọc là `LOP.TenLop = '11A1'`, tuy nhiên trong mệnh đề FROM và JOIN không hề liên kết bảng LOP vào kết quả. Điều này sẽ dẫn đến lỗi hệ thống (không tìm thấy bảng hoặc cột LOP.TenLop). Cần thêm `INNER JOIN LOP ON GIANGDAY.MaLop = LOP.MaLop` hoặc lọc theo `GIANGDAY.MaLop` (nếu mã lớp được dùng trực tiếp làm điều kiện lọc).\nc) ĐÚNG: Trong bảng phân công GIANGDAY, một giáo viên dạy một môn học cụ thể tại một lớp nhất định bắt đầu từ một ngày xác định (Tungay) là duy nhất. Do đó, bộ (MaGV, MaMH, MaLop, Tungay) cấu thành khóa chính giúp phân biệt các bản ghi phân công khác nhau.\nd) ĐÚNG: Thuộc tính MaGV trong GIANGDAY đóng vai trò khóa ngoại liên kết đến khóa chính MaGV trong bảng GIAOVIEN để xác định giáo viên nào đang được phân công."
        }
    ]
};
