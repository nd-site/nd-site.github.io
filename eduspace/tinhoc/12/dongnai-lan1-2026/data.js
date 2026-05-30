window.quizData = {
    "title": "Đề thi khảo sát chất lượng môn Tin học lớp 12 năm học 2025 – 2026 (Lần 1) – Sở GD&ĐT Đồng Nai",
    "pageTitle": "Tin học 12 – Đề Đồng Nai Lần 1 (2026)",
    "examInfo": {
        "department": "Sở Giáo dục và Đào tạo Đồng Nai",
        "school": "",
        "province": "Đồng Nai",
        "examName": "Kỳ thi khảo sát chất lượng các môn thi tốt nghiệp THPT",
        "attempt": "Lần 1 (Mã đề 0501)",
        "date": "Năm học 2025 - 2026",
        "subject": "Tin học",
        "grade": "Lớp 12"
    },
    "config": {
        "testDuration": 3000,
        "examLayout": {
            "multiple": {
                "count": 24,
                "pointsPerQ": 0.25
            },
            "truefalse": {
                "count": 6,
                "pointsPerQ": 1
            }
        }
    },
    "questions": [
        {
            "type": "multiple",
            "question": "Trong bộ giao thức TCP/IP, nếu một gói tin bị thất lạc trong quá trình truyền tải, giao thức TCP sẽ xử lý theo cách nào sau đây để đảm bảo tính tin cậy?",
            "options": [
                "Yêu cầu toàn bộ hệ thống mạng dừng hoạt động để kiểm tra lỗi.",
                "Yêu cầu phía gửi thực hiện truyền lại gói tin bị thất lạc đó.",
                "Tự động tạo ra một gói tin mới có nội dung ngẫu nhiên để thay thế.",
                "Bỏ qua gói tin bị mất và tiếp tục truyền gói tiếp theo để đảm bảo tốc độ."
            ],
            "correct": 1,
            "explanation": "TCP (Transmission Control Protocol) là giao thức hướng kết nối và đảm bảo truyền dữ liệu tin cậy. Nếu phát hiện gói tin bị mất hoặc lỗi (qua việc hết thời gian chờ - Timeout hoặc nhận phản hồi ACK lặp), TCP sẽ yêu cầu bên gửi gửi lại chính xác gói tin bị thất lạc đó."
        },
        {
            "type": "multiple",
            "question": "Bạn muốn tạo một phần thông tin gồm: Một tiêu đề \"Sản phẩm\", một hình ảnh minh họa và một đoạn mô tả ngắn. Phương án nào sau đây là đoạn mã HTML hợp lý nhất?",
            "options": [
                "<p>Sản phẩm</p> <image src=\"sp.jpg\"> <text>Mô tả</text>",
                "<header>Sản phẩm</header> <img>\"sp.jpg\"</img> <p>Mô tả</p>",
                "<h1>Sản phẩm</h1> <img href=\"sp.jpg\"> <div>Mô tả</div>",
                "<h1>Sản phẩm</h1> <img src=\"sp.jpg\" alt=\"Minh họa\"> <p>Mô tả</p>"
            ],
            "correct": 3,
            "explanation": "Trong HTML chuẩn:\n- Tiêu đề cấp 1 dùng thẻ <h1>.\n- Thẻ chèn hình ảnh là <img> (là thẻ rỗng, không có thẻ đóng) và thuộc tính để chỉ định nguồn ảnh bắt buộc phải là 'src' (không phải 'href'), thuộc tính 'alt' cung cấp văn bản thay thế.\n- Đoạn văn mô tả ngắn dùng thẻ <p>."
        },
        {
            "type": "multiple",
            "question": "Thẻ HTML nào sau đây dùng để tạo tiêu đề cấp lớn nhất trong trang web?",
            "options": [
                "<h1>",
                "<head>",
                "<header>",
                "<title>"
            ],
            "correct": 0,
            "explanation": "Trong HTML, các thẻ tiêu đề (heading) được định nghĩa từ <h1> đến <h6>, trong đó <h1> tạo ra tiêu đề có kích thước lớn nhất và quan trọng nhất trên trang."
        },
        {
            "type": "multiple",
            "question": "Đoạn mã HTML nào sau đây là đúng để tạo ra một bảng có 2 dòng, mỗi dòng 1 ô tiêu đề?",
            "options": [
                "<table><th><tr></tr></th></table>",
                "<table><tr><th></th></tr><tr><th></th></tr></table>",
                "<table><tr><td></td></tr><tr><td></td></tr></table>",
                "<tbl><tr><th></th></tr><tr><th></th></tr></tbl>"
            ],
            "correct": 1,
            "explanation": "Để tạo bảng trong HTML: \n- Bảng bắt đầu và kết thúc bằng thẻ <table>...</table>.\n- Mỗi dòng của bảng được định nghĩa bằng thẻ <tr>...</tr>. Bảng có 2 dòng sẽ có 2 cặp <tr>.\n- Mỗi ô tiêu đề trên dòng dùng thẻ <th>...</th>. \nPhương án C sai vì dùng thẻ <td> (ô dữ liệu thường), phương án D sai vì dùng thẻ không tồn tại <tbl>."
        },
        {
            "type": "multiple",
            "question": "Thiết bị nào sau đây có chức năng biến đổi dữ liệu số thành tín hiệu tương tự để truyền đi qua mạng và ngược lại?",
            "options": [
                "Access Point.",
                "Modem.",
                "Cáp mạng.",
                "Switch."
            ],
            "correct": 1,
            "explanation": "Modem (viết tắt của Modulator/Demodulator - bộ điều chế/giải điều chế) thực hiện chức năng biến đổi tín hiệu số (digital) từ các thiết bị công nghệ thành tín hiệu tương tự (analog) để truyền trên các đường truyền vật lý (như cáp đồng, sóng vô tuyến) và ngược lại."
        },
        {
            "type": "multiple",
            "question": "Phương án nào sau đây nêu đúng điểm khác biệt cơ bản nhất giữa “Trí tuệ nhân tạo hẹp” (ANI) và “Trí tuệ nhân tạo tổng quát” (AGI)?",
            "options": [
                "ANI cần dữ liệu huấn luyện còn AGI có thể hoạt động mà không cần dữ liệu.",
                "AGI có thể tự học và áp dụng tri thức linh hoạt xuyên nhiều lĩnh vực như con người.",
                "ANI có tốc độ xử lý dữ liệu nhanh hơn AGI nhờ thuật toán đơn giản.",
                "AGI chỉ có thể hoạt động trên các siêu máy tính chuyên dụng trong phòng thí nghiệm."
            ],
            "correct": 1,
            "explanation": "Trí tuệ nhân tạo hẹp (ANI - Artificial Narrow Intelligence) chỉ được thiết kế để giải quyết một nhiệm vụ cụ thể, chuyên biệt (như dịch thuật, nhận diện khuôn mặt). Trong khi đó, Trí tuệ nhân tạo tổng quát (AGI - Artificial General Intelligence) hướng tới mục tiêu xây dựng một hệ thống AI có khả năng nhận thức, tự học hỏi và giải quyết linh hoạt mọi vấn đề trí tuệ trên nhiều lĩnh vực khác nhau tương đương với bộ não con người."
        },
        {
            "type": "multiple",
            "question": "Lựa chọn ngôn ngữ Python hoặc C++ để tìm hiểu đoạn chương trình sau:\n\n*Đoạn chương trình Python*:\n```python\na = [2, 1, 1, 1, 5, 9, 8]\nx = 1\nfor i in range(3):\n    x = x + a[i]\nprint(a[x])\n```\n*Đoạn chương trình C++*:\n```cpp\nint a[] = {2, 1, 1, 1, 5, 9, 8};\nint x = 1;\nfor (int i = 0; i < 3; i++)\n    x = x + a[i];\ncout << a[x];\n```\nSau khi thực hiện đoạn chương trình trên, giá trị nào sau đây được in ra màn hình?",
            "options": [
                "4",
                "9",
                "1",
                "5"
            ],
            "correct": 1,
            "explanation": "Ta chạy từng bước vòng lặp với i chạy từ 0 đến 2:\n- Ban đầu: x = 1.\n- Vòng lặp 1 (i = 0): x = x + a[0] = 1 + 2 = 3.\n- Vòng lặp 2 (i = 1): x = x + a[1] = 3 + 1 = 4.\n- Vòng lặp 3 (i = 2): x = x + a[2] = 4 + 1 = 5.\nSau khi kết thúc vòng lặp, giá trị của x là 5. Kết quả in ra là a[x], tức a[5]. Trong mảng a (bắt đầu từ chỉ số 0), phần tử ở chỉ số 5 là 9 (a[0]=2, a[1]=1, a[2]=1, a[3]=1, a[4]=5, a[5]=9)."
        },
        {
            "type": "multiple",
            "question": "Đoạn mã CSS nào sau đây chọn phần tử có id là main, cỡ chữ là 16px?",
            "options": [
                ".main {font-weight: 16px;}",
                ".main {font-size: 16px;}",
                "#main {font-size: 16px;}",
                "#main {font-weight: 16px;}"
            ],
            "correct": 2,
            "explanation": "Trong CSS, để chọn phần tử theo thuộc tính id ta sử dụng ký hiệu thăng (#) đi kèm tên id, tức '#main' (dùng dấu chấm '.' là chọn theo class). Thuộc tính xác định cỡ chữ là 'font-size' (còn 'font-weight' xác định độ đậm nhạt của chữ)."
        },
        {
            "type": "multiple",
            "question": "Bạn của Lan đang bị một nhóm người lạ trên mạng xã hội liên tục gửi tin nhắn đe dọa và đăng tải các thông tin sai sự thật nhằm bêu rếu danh dự. Để giúp đỡ bạn mình một cách an toàn và đúng pháp luật, Lan nên khuyên bạn thực hiện hành động nào sau đây?",
            "options": [
                "Giữ im lặng hoàn toàn và xóa hết các tin nhắn đó để tránh cảm thấy lo âu, sợ hãi.",
                "Giữ lại các bằng chứng (ảnh chụp màn hình) và nhờ người lớn hoặc cơ quan chức năng hỗ trợ.",
                "Rủ thêm nhiều người khác cùng vào nhắn tin chửi bới lại nhóm người kia để trả đũa.",
                "Tìm cách truy cập trái phép vào tài khoản của nhóm người đó để xóa bỏ các bài đăng xấu."
            ],
            "correct": 1,
            "explanation": "Khi bị bắt nạt, đe dọa trên không gian mạng, hành động đúng đắn và an toàn nhất là chụp màn hình làm bằng chứng xác thực, không tự ý giải quyết bằng các biện pháp bạo lực ngôn từ hay vi phạm pháp luật (như xâm nhập tài khoản), mà cần báo cho cha mẹ, thầy cô hoặc các cơ quan chức năng có thẩm quyền can thiệp."
        },
        {
            "type": "multiple",
            "question": "Việc một cá nhân chia sẻ lại các thông tin chưa được kiểm chứng về một vụ tai nạn hoặc thảm họa thiên tai lên trang cá nhân bị coi là hành vi thiếu trách nhiệm vì lý do nào sau đây?",
            "options": [
                "Hành vi này làm tăng quá mức dung lượng lưu trữ trên các máy chủ của nhà cung cấp dịch vụ mạng.",
                "Pháp luật Việt Nam quy định chỉ các cơ quan báo chí mới có quyền đăng tải thông tin về các sự kiện xã hội.",
                "Thông tin sai lệch có thể gây hoang mang dư luận và làm sai lệch các giá trị thông tin thực tế.",
                "Hành động chia sẻ nhanh sẽ gây cản trở công tác cứu hộ trực tiếp của các cơ quan chức năng tại hiện trường."
            ],
            "correct": 2,
            "explanation": "Thông tin chưa kiểm chứng (tin giả, tin sai lệch) được lan truyền nhanh trên mạng xã hội dễ gây tâm lý hoang mang, sợ hãi cho cộng đồng, gây mất trật tự xã hội và ảnh hưởng nghiêm trọng đến danh dự, quyền lợi của những người liên quan."
        },
        {
            "type": "multiple",
            "question": "Đặc trưng nào sau đây của “Trí tuệ nhân tạo” (AI) cho phép máy tính có khả năng cảm nhận, phân tích và hiểu biết môi trường xung quanh thông qua các cảm biến hoặc thiết bị đầu vào (như camera trên xe tự lái)?",
            "options": [
                "Khả năng nhận thức.",
                "Khả năng hiểu ngôn ngữ tự nhiên.",
                "Khả năng suy luận.",
                "Khả năng học."
            ],
            "correct": 0,
            "explanation": "Khả năng nhận thức (Perception) của AI cho phép hệ thống máy tính thu thập thông tin từ thế giới thực qua các cảm biến (camera, âm thanh, radar...) để hiểu và phản ứng với môi trường xung quanh, giống như các giác quan của con người."
        },
        {
            "type": "multiple",
            "question": "Phương án nào sau đây nêu đúng một trong những hạn chế tiêu biểu của giao tiếp trong thế giới ảo?",
            "options": [
                "Không bị giới hạn về khoảng cách địa lí và thời gian.",
                "Tiết kiệm đáng kể chi phí di chuyển và tổ chức.",
                "Thiếu các tín hiệu phi ngôn ngữ như ánh mắt, điệu bộ.",
                "Giúp người khuyết tật xóa bỏ mặc cảm khi kết nối."
            ],
            "correct": 2,
            "explanation": "Một hạn chế lớn của giao tiếp trực tuyến (thế giới ảo) so với trực tiếp là không thể truyền tải đầy đủ các thông điệp phi ngôn ngữ (như ánh mắt, nét mặt, cử chỉ, tông giọng thực tế), từ đó dễ gây ra hiểu lầm về thái độ và cảm xúc của các bên tham gia."
        },
        {
            "type": "multiple",
            "question": "Một hệ thống “Trí tuệ nhân tạo” (AI) hỗ trợ bác sĩ chẩn đoán bệnh có khả năng tự rút kinh nghiệm từ hàng triệu ca bệnh cũ để nâng cao độ chính xác cho bệnh nhân mới được coi là có “Khả năng học”. Khẳng định trên đúng là do hệ thống có đặc điểm nào sau đây?",
            "options": [
                "Có bộ nhớ lưu trữ khổng lồ và kết nối Internet tốc độ cao.",
                "Có thể hiển thị các hình ảnh y khoa lên màn hình cho bác sĩ xem.",
                "Trích xuất thông tin từ dữ liệu để tích lũy tri thức và cải thiện hiệu suất.",
                "Được con người lập trình sẵn tất cả các tình huống bệnh lý có thể xảy ra."
            ],
            "correct": 2,
            "explanation": "Trong lĩnh vực trí tuệ nhân tạo, 'Khả năng học' (Learning) đại diện cho khả năng máy tính tự động tìm kiếm quy luật, trích xuất thông tin hữu ích từ các tập dữ liệu lịch sử để tích lũy tri thức và tự cải thiện hiệu quả thực hiện nhiệm vụ theo thời gian mà không cần lập trình lại."
        },
        {
            "type": "multiple",
            "question": "Phương án nào sau đây nêu đúng một trong những nghiệp vụ chính của nhóm nghề Thiết kế và Lập trình?",
            "options": [
                "Viết mã nguồn (code) và thiết kế giao diện người dùng.",
                "Xây dựng chính sách truy cập và ngăn chặn truy cập trái phép.",
                "Chẩn đoán và sửa chữa các sự cố hỏng hóc linh kiện phần cứng.",
                "Cài đặt và cấu hình các thiết bị mạng như Router, Switch."
            ],
            "correct": 0,
            "explanation": "Nhiệm vụ chính của nhóm nghề Thiết kế và Lập trình phần mềm/website là thiết kế kiến trúc, thiết kế giao diện người dùng (UI/UX) và viết các dòng mã nguồn (coding) để tạo nên các ứng dụng hoạt động được."
        },
        {
            "type": "multiple",
            "question": "Điều gì sau đây đảm bảo cho máy tính và thiết bị mạng có thể giao tiếp được với nhau đúng cách?",
            "options": [
                "Giao thức mạng.",
                "Thiết bị mạng.",
                "Địa chỉ IP.",
                "Băng thông mạng."
            ],
            "correct": 0,
            "explanation": "Giao thức mạng (Network Protocol) là tập hợp các quy tắc, định dạng và quy chuẩn truyền tin đã được thống nhất mà mọi thiết bị trong mạng bắt buộc phải tuân theo để có thể hiểu và trao đổi dữ liệu chính xác với nhau."
        },
        {
            "type": "multiple",
            "question": "Cho đoạn mã CSS sau:\n```css\n.note {color: green; font-style: italic;}\n#title {color: red; font-weight: bold;}\n```\nĐoạn mã HTML nào sau đây sẽ hiển thị văn bản màu xanh lá và in nghiêng?",
            "options": [
                "<p id=\"note\">Nội dung văn bản</p>",
                "<div id=\"title\">Nội dung văn bản</div>",
                "<span class=\"title\">Nội dung văn bản</span>",
                "<p class=\"note\">Nội dung văn bản</p>"
            ],
            "correct": 3,
            "explanation": "Trong CSS, selector bắt đầu bằng dấu chấm đại diện cho class (ở đây là '.note'). Đoạn HTML muốn áp dụng kiểu dáng của class 'note' thì phải khai báo thuộc tính `class=\"note\"` (phương án D). Các phương án dùng `id=\"note\"` hoặc viết sai tên class đều không ăn CSS."
        },
        {
            "type": "multiple",
            "question": "Trong lịch sử phát triển công nghệ, nhân vật nào sau đây được biết đến là người đầu tiên đưa ra thuật ngữ “Trí tuệ nhân tạo” (AI) vào năm 1955?",
            "options": [
                "Bill Gates.",
                "John McCarthy.",
                "Alan Turing.",
                "Steve Jobs."
            ],
            "correct": 1,
            "explanation": "Nhà khoa học máy tính người Mỹ John McCarthy được coi là cha đẻ của ngành Trí tuệ nhân tạo khi ông lần đầu tiên đề xuất thuật ngữ 'Artificial Intelligence' (AI) vào năm 1955 trong bản kế hoạch chuẩn bị cho Hội thảo Dartmouth nổi tiếng tổ chức vào mùa hè năm 1956."
        },
        {
            "type": "multiple",
            "question": "Trong một trung tâm bảo hành máy tính, việc lắp ráp linh kiện, cài đặt hệ điều hành và sửa chữa các lỗi phần cứng cho khách hàng là nhiệm vụ điển hình của nhóm nghề nào sau đây?",
            "options": [
                "Lập trình viên ứng dụng.",
                "Chuyên viên bảo mật.",
                "Quản trị cơ sở dữ liệu.",
                "Kĩ thuật viên công nghệ thông tin."
            ],
            "correct": 3,
            "explanation": "Công việc lắp ráp phần cứng, cài đặt hệ điều hành, trình điều khiển driver, phần mềm thông dụng và hỗ trợ khắc phục sự cố máy tính trực tiếp là các công việc đặc trưng của Kỹ thuật viên công nghệ thông tin (hoặc kỹ thuật viên bảo trì hệ thống)."
        },
        {
            "type": "multiple",
            "question": "Thuộc tính CSS nào sau đây dùng để thay đổi màu nền của phần tử?",
            "options": [
                "color-background",
                "bgcolor",
                "background-color",
                "background-style"
            ],
            "correct": 2,
            "explanation": "Trong CSS, thuộc tính để thay đổi màu nền của phần tử HTML là 'background-color'. Thuộc tính 'color' dùng để thay đổi màu chữ, còn 'bgcolor' là thuộc tính HTML cũ, không phải CSS."
        },
        {
            "type": "multiple",
            "question": "Một học sinh viết đoạn mã HTML để tạo một bài trắc nghiệm chọn đáp án đúng duy nhất như sau:\n```html\n<p>Thủ đô của Việt Nam là:</p>\n<input type=\"radio\" name=\"cau1\" value=\"A\"> TP. Hồ Chí Minh\n<input type=\"radio\" name=\"cau2\" value=\"B\"> Hà Nội\n<input type=\"radio\" name=\"cau3\" value=\"C\"> Đà Nẵng\n```\nTuy nhiên, khi chạy thử, người dùng lại có thể chọn được cả 3 đáp án cùng lúc. Để sửa lỗi này và chỉ cho phép chọn 1 đáp án duy nhất, học sinh đó cần thực hiện thay đổi nào sau đây?",
            "options": [
                "Thay đổi tất cả thuộc tính type=\"radio\" thành type=\"checkbox\".",
                "Thay đổi giá trị của các thuộc tính name giống nhau.",
                "Thêm thẻ <form> bao quanh các thẻ <input>.",
                "Thay đổi các thuộc tính value thành giống nhau."
            ],
            "correct": 1,
            "explanation": "Để các nút chọn một phương án (radio buttons) hoạt động theo cơ chế loại trừ lẫn nhau (chỉ chọn được một nút duy nhất tại một thời điểm), tất cả các nút đó phải được nhóm chung lại bằng cách gán cho chúng cùng một giá trị cho thuộc tính 'name' (ví dụ cùng đặt `name=\"cau1\"`)."
        },
        {
            "type": "multiple",
            "question": "Bạn đang thiết kế một trang tin tức. Bạn muốn tất cả các đoạn văn thuộc lớp \"noidung\" phải có chữ màu xanh, nhưng riêng các đoạn văn nằm trong phần tiêu đề (ID là \"header\") thì phải có chữ gạch chân. Đoạn mã CSS nào sau đây thực hiện đúng yêu cầu trên?",
            "options": [
                "p {color: blue; text-decoration: underline;}",
                "#noidung {color: blue;} .header p {text-decoration: underline;}",
                ".noidung {color: blue;} #header p {text-decoration: underline;}",
                ".noidung {color: blue;} #header {text-style: underline;}"
            ],
            "correct": 2,
            "explanation": "Để giải quyết yêu cầu:\n- Chọn các đoạn văn có class là 'noidung' dùng bộ chọn class: `.noidung {color: blue;}`.\n- Chọn các đoạn văn nằm trong phần có id là 'header' dùng bộ chọn con: `#header p {text-decoration: underline;}` (sử dụng thuộc tính 'text-decoration' để tạo chữ gạch chân)."
        },
        {
            "type": "multiple",
            "question": "Thiết bị nào sau đây dùng để kết nối và chuyển tiếp dữ liệu giữa các thiết bị trong cùng một mạng LAN?",
            "options": [
                "Modem.",
                "Laptop.",
                "Server.",
                "Switch."
            ],
            "correct": 3,
            "explanation": "Switch (thiết bị chuyển mạch) là thiết bị phần cứng mạng trung tâm được sử dụng để kết nối các máy tính, máy in và thiết bị khác trong cùng một mạng LAN, thực hiện chuyển tiếp các khung dữ liệu đến đúng thiết bị đích dựa trên địa chỉ MAC."
        },
        {
            "type": "multiple",
            "question": "Thẻ HTML nào sau đây dùng để chèn hình ảnh vào trang web?",
            "options": [
                "<image>",
                "<picture>",
                "<img>",
                "<src>"
            ],
            "correct": 2,
            "explanation": "Trong HTML, thẻ chèn hình ảnh là <img> (đây là thẻ rỗng, viết tắt của image) với thuộc tính 'src' chỉ ra đường dẫn tệp ảnh."
        },
        {
            "type": "multiple",
            "question": "Người làm nghề Quản trị mạng cần phải am hiểu sâu sắc về các giao thức mạng phổ biến như TCP/IP vì mục đích nào sau đây?",
            "options": [
                "Có thể tự tay sản xuất ra các linh kiện phần cứng và đoạn cáp mạng vật lý.",
                "Thiết lập cấu hình thiết bị đúng chuẩn và xử lý các sự cố mất kết nối dữ liệu một cách hiệu quả.",
                "Trực tiếp thực hiện việc viết mã nguồn cho các phần mềm ứng dụng hoặc trò chơi trực tuyến.",
                "Thay thế hoàn toàn vai trò của các nhà cung cấp dịch vụ Internet (ISP) tại đơn vị."
            ],
            "correct": 1,
            "explanation": "Hiểu biết về TCP/IP và các giao thức mạng giúp chuyên viên quản trị mạng có kiến thức để cấu hình chính xác địa chỉ IP, bảng định tuyến trên Router, cấu hình Switch, đồng thời có cơ sở tư duy để phân tích, khoanh vùng cô lập lỗi và khắc phục các sự cố mất mạng, nghẽn mạng."
        },
        {
            "type": "truefalse",
            "question": "Một văn phòng nhỏ trang bị 5 máy tính và 1 máy in kết nối với nhau thông qua thiết bị Switch. Văn phòng sử dụng một Router để kết nối hệ thống này với Internet nhằm phục vụ công việc.\n\nSau khi thảo luận, một số nhân viên trong văn phòng đã đưa ra các nhận định sau:",
            "options": [
                "Trong mạng cục bộ của văn phòng này, thiết bị đóng vai trò trung tâm để kết nối các máy tính và máy in là Switch.",
                "Nếu tất cả máy tính trong văn phòng vẫn trao đổi dữ liệu nội bộ và in ấn bình thường nhưng đồng loạt không truy cập được Internet, thiết bị có khả năng cao nhất đang gặp lỗi là Router hoặc đường truyền từ nhà cung cấp dịch vụ.",
                "Để tiết kiệm tài nguyên, quản trị viên có thể gán cùng một địa chỉ IP cho hai máy tính khác nhau trong cùng mạng nội bộ này mà không gây ra xung đột dữ liệu.",
                "Khi muốn nhân viên chỉ có quyền xem và tải tài liệu từ máy chủ văn phòng mà không được phép chỉnh sửa hay xóa tệp gốc, quản trị viên cần thiết lập mức quyền \"Read\" cho thư mục chia sẻ."
            ],
            "correct": [
                true,
                true,
                false,
                true
            ],
            "explanation": "a) ĐÚNG: Switch đóng vai trò kết nối vật lý và chuyển mạch dữ liệu giữa các máy tính và máy in trong cùng một mạng LAN.\nb) ĐÚNG: Vì mạng nội bộ vẫn trao đổi file và in ấn bình thường (Switch hoạt động tốt), nhưng không ra được mạng ngoài, lỗi nằm ở khâu định tuyến kết nối Internet của Router hoặc do đường cáp của ISP bị mất tín hiệu.\nc) SAI: Gán trùng địa chỉ IP trong cùng một mạng nội bộ sẽ gây ra lỗi xung đột địa chỉ IP (IP Address Conflict), làm cho một hoặc cả hai thiết bị đó bị ngắt kết nối mạng.\nd) ĐÚNG: Quyền 'Read' cho phép người dùng mở xem và sao chép/tải tệp tin về thiết bị cá nhân mà không được phép sửa đổi hay xóa dữ liệu gốc trên máy chủ.",
            "correctAnswers": [
                true,
                true,
                false,
                true
            ]
        },
        {
            "type": "truefalse",
            "question": "Để hỗ trợ việc quản lý bán hàng tại một cửa hàng, người ta xây dựng một phần mềm với cơ sở dữ liệu quan hệ gồm các bảng sau:\n- KHACHHANG (MaKH, HoTen, DiaChi, SoDienThoai): lưu thông tin mã khách hàng, họ tên, địa chỉ, số điện thoại; mỗi khách hàng có một mã duy nhất.\n- DONHANG (MaHD, MaKH, NgayDatHang, TongTien): lưu thông tin mã hóa đơn, mã khách hàng, ngày đặt hàng, tổng tiền thanh toán.\n\nSau khi tìm hiểu cơ sở dữ liệu trên, một số bạn học sinh đưa ra các nhận xét sau:",
            "options": [
                "Để đảm bảo tính toàn vẹn dữ liệu, cần thiết lập MaKH trong bảng DONHANG là khóa ngoại liên kết với bảng KHACHHANG.",
                "Trong bảng DONHANG, mỗi khách hàng (MaKH) chỉ xuất hiện đúng một lần.",
                "Để tìm họ tên tất cả khách hàng đã mua hàng, người ta chỉ cần sử dụng duy nhất bảng KHACHHANG.",
                "MaKH là khóa chính trong bảng KHACHHANG."
            ],
            "correct": [
                true,
                false,
                false,
                true
            ],
            "explanation": "a) ĐÚNG: Việc thiết lập MaKH trong DONHANG làm khóa ngoại tham chiếu đến bảng KHACHHANG giúp bảo đảm rằng mọi hóa đơn bán ra đều thuộc về một khách hàng hợp lệ có trong hệ thống.\nb) SAI: Một khách hàng có thể thực hiện giao dịch mua sắm nhiều lần tại cửa hàng (tạo ra nhiều đơn hàng khác nhau), do đó MaKH có thể xuất hiện nhiều lần trong bảng DONHANG.\nc) SAI: Bảng KHACHHANG chứa danh sách tất cả các khách hàng đã đăng ký thông tin. Để tìm những khách hàng đã thực sự phát sinh giao dịch mua hàng, ta phải kết nối (JOIN) bảng KHACHHANG với bảng DONHANG để lọc ra các MaKH đã có hóa đơn.\nd) ĐÚNG: MaKH đại diện duy nhất cho mỗi đối tượng khách hàng và đóng vai trò là khóa chính của bảng KHACHHANG.",
            "correctAnswers": [
                true,
                false,
                false,
                true
            ]
        },
        {
            "type": "truefalse",
            "question": "(Khoa học Máy tính) Một công ty thương mại điện tử muốn phân loại người dùng thành các nhóm: “khách hàng tiềm năng”, “khách hàng trung bình” và “khách hàng ít hoạt động” dựa trên lịch sử mua sắm và hành vi truy cập để đưa ra chiến lược marketing phù hợp.\n\nCó 2 bạn học sinh đề xuất phương pháp như sau:\n- Học sinh A: Thu thập dữ liệu người dùng và mời các chuyên gia marketing gán nhãn từng người dùng vào 3 nhóm. Sau đó, sử dụng dữ liệu đã gán nhãn này để huấn luyện mô hình giúp phân loại các người dùng mới.\n- Học sinh B: Sử dụng thuật toán để tự động phân cụm người dùng thành 3 nhóm dựa trên dữ liệu hành vi. Sau đó, mời chuyên gia gán nhãn cho từng cụm tương ứng với các nhóm trên.\n\nMột số học sinh có ý kiến như sau:",
            "options": [
                "Phương pháp phân cụm của học sinh B đã chia đúng số lượng 3 cụm dựa trên dữ liệu hành vi, nên không cần bước gán nhãn của chuyên gia nữa.",
                "Việc thu thập thêm dữ liệu về thời gian truy cập và tần suất mua hàng có thể giúp cải thiện độ chính xác của mô hình.",
                "Phương pháp của học sinh A thuộc mô hình học máy có giám sát.",
                "Phương pháp của học sinh B thuộc mô hình học máy không giám sát."
            ],
            "correct": [
                false,
                true,
                true,
                true
            ],
            "explanation": "a) SAI: Thuật toán phân cụm (Clustering) tự động nhóm các khách hàng có đặc điểm hành vi tương đồng thành 3 cụm ẩn danh, máy tính không thể hiểu ý nghĩa thực tế của từng cụm. Cần có chuyên gia xem xét hành vi đặc trưng của từng cụm để dán nhãn (ví dụ cụm chi tiêu nhiều là khách hàng tiềm năng).\nb) ĐÚNG: Các thuộc tính đầu vào (features) chất lượng như thời gian truy cập và tần suất mua hàng cung cấp thêm nhiều thông tin hữu ích giúp các thuật toán phân cụm hoặc phân loại hoạt động chính xác hơn.\nc) ĐÚNG: Học sinh A huấn luyện mô hình dựa trên tập dữ liệu đã có nhãn được chuẩn bị trước bởi chuyên gia, đây là phương pháp học máy có giám sát (Supervised Learning).\nd) ĐÚNG: Học sinh B sử dụng dữ liệu chưa được gán nhãn và để thuật toán tự khám phá cấu trúc tương đồng để phân cụm, đây là phương pháp học máy không giám sát (Unsupervised Learning).",
            "correctAnswers": [
                false,
                true,
                true,
                true
            ]
        },
        {
            "type": "truefalse",
            "question": "(Khoa học Máy tính) Cho hàm sau đây được viết bằng ngôn ngữ Python và C++:\n\n*Hàm viết bằng Python*:\n```python\ndef F(A, n):\n    for i in range(n-1):\n        for j in range(n-1-i):\n            if A[j] % 2 > A[j+1] % 2:\n                A[j], A[j+1] = A[j+1], A[j]\n```\n*Hàm viết bằng C++*:\n```cpp\nvoid F(int A[], int n) {\n    for (int i = 0; i < n-1; i++)\n        for (int j = 0; j < n-1-i; j++)\n            if (A[j] % 2 > A[j+1] % 2)\n                swap(A[j], A[j+1]);\n}\n```\nSau khi chọn một trong hai ngôn ngữ để tìm hiểu hàm trên, một số bạn học sinh nêu các ý kiến sau:",
            "options": [
                "Thuật toán có độ phức tạp O(n log n).",
                "If A = (5, 2, 3, 4) thì kết quả sau khi thực hiện hàm F là (2, 4, 3, 5).",
                "Hàm sắp xếp mảng sao cho số chẵn đứng trước số lẻ.",
                "Các số chẵn vẫn giữ nguyên thứ tự ban đầu."
            ],
            "correct": [
                false,
                false,
                true,
                true
            ],
            "explanation": "a) SAI: Thuật toán sử dụng cơ chế hai vòng lặp lồng nhau duyệt qua mảng theo kiểu nổi bọt (Bubble Sort), có độ phức tạp thời gian trong trường hợp trung bình và xấu nhất là O(n²).\nb) SAI: Với A = [5, 2, 3, 4] (2 số lẻ: 5, 3 và 2 số chẵn: 2, 4). Số chẵn chia 2 dư 0, số lẻ chia 2 dư 1. Thuật toán sẽ chuyển các số dư 0 lên trước và số dư 1 ra sau. Vì đây là sắp xếp ổn định (Stable Sort), các số chẵn (2, 4) sẽ giữ nguyên thứ tự tương đối là (2, 4); các số lẻ (5, 3) giữ nguyên thứ tự là (5, 3). Do đó, mảng kết quả là (2, 4, 5, 3), chứ không phải (2, 4, 3, 5).\nc) ĐÚNG: Biểu thức so sánh `A[j]%2 > A[j+1]%2` sẽ đúng khi phần tử bên trái là số lẻ (dư 1) và phần tử bên phải là số chẵn (dư 0), dẫn đến đổi chỗ. Kết quả là toàn bộ các số chẵn dồn về đầu mảng, các số lẻ dồn về cuối mảng.\nd) ĐÚNG: Thuật toán nổi bọt chỉ thực hiện đổi chỗ khi `A[j]%2 > A[j+1]%2` (tức là 1 > 0). Khi hai phần tử kế cận nhau đều là số chẵn (0 > 0 -> false) thì thuật toán không đổi chỗ, do đó thứ tự ban đầu của các số chẵn với nhau được bảo toàn.",
            "correctAnswers": [
                false,
                false,
                true,
                true
            ]
        },
        {
            "type": "truefalse",
            "question": "(Tin học Ứng dụng) Một bệnh viện triển khai hệ thống quản lý bệnh nhân bằng cơ sở dữ liệu QuanLyBenhNhan gồm các bảng sau:\n- BENHNHAN (MaBN, HoTen, NgaySinh, GioiTinh, DiaChi): lưu thông mã bệnh nhân, họ tên, ngày sinh, giới tính và địa chỉ; mỗi bệnh nhân có một mã duy nhất.\n- BENH (MaBenh, TenBenh, MoTa): lưu thông tin mã bệnh, tên bệnh và mô tả chi tiết; mỗi bệnh có một mã duy nhất.\n- DIEUTRI (MaBN, MaBenh, NgayNhapVien, NgayRaVien, KetQua): lưu thông mã bệnh nhân, mã bệnh, ngày nhập viện, ngày ra viện và kết quả điều trị.\n\nSau khi tìm hiểu các phần mềm để quản trị cơ sở dữ liệu trên, một số bạn học sinh đưa ra các ý kiến sau:",
            "options": [
                "Khi tạo bảng DIEUTRI, cần tạo khóa ngoại liên kết với bảng BENHNHAN và BENH.",
                "Khi một bệnh nhân ra viện, MaBN của bệnh nhân đó trong bảng BENHNHAN sẽ tự động xóa.",
                "Để hiển thị tên bệnh nhân điều trị bệnh 'Cúm' có kết quả là 'Khỏi', sử dụng lệnh truy vấn:\nSELECT HoTen\nFROM BENHNHAN INNER JOIN DIEUTRI ON BENHNHAN.MaBN = DIEUTRI.MaBN\nINNER JOIN BENH ON DIEUTRI.MaBenh = BENH.MaBenh\nWHERE TenBenh = 'Cúm' AND KetQua = 'Khỏi';",
                "Khi nhập dữ liệu trường MaBN trong bảng BENHNHAN, dữ liệu đó phải tồn tại trong bảng DIEUTRI."
            ],
            "correct": [
                true,
                false,
                true,
                false
            ],
            "explanation": "a) ĐÚNG: Bảng trung gian DIEUTRI ghi nhận quan hệ nhiều-nhiều giữa bệnh nhân và bệnh tật. Trường MaBN và MaBenh trong DIEUTRI lần lượt là các khóa ngoại để thiết lập ràng buộc toàn vẹn tham chiếu đến các bảng BENHNHAN và BENH.\nb) SAI: Khi bệnh nhân ra viện, hệ thống chỉ cập nhật thuộc tính NgayRaVien và KetQua của bản ghi điều trị trong bảng DIEUTRI. Thông tin cá nhân của bệnh nhân trong bảng BENHNHAN vẫn phải được lưu giữ nguyên để phục vụ cho các lần khám chữa bệnh sau này.\nc) ĐÚNG: Truy vấn cần lấy thông tin từ bảng BENHNHAN (trường HoTen) dựa trên các điều kiện lọc ở bảng BENH (TenBenh = 'Cúm') và bảng DIEUTRI (KetQua = 'Khỏi'). Do đó, việc liên kết 3 bảng qua các khóa ngoại như trên là hoàn toàn chính xác.\nd) SAI: Ràng buộc khóa ngoại bắt buộc mọi giá trị MaBN nhập vào bảng DIEUTRI phải tồn tại sẵn ở bảng BENHNHAN (chiều từ DIEUTRI tham chiếu đến BENHNHAN). Chiều ngược lại không bắt buộc, một bệnh nhân mới đăng ký trong bảng BENHNHAN có thể chưa từng phát sinh đợt điều trị nào trong bảng DIEUTRI.",
            "correctAnswers": [
                true,
                false,
                true,
                false
            ]
        },
        {
            "type": "truefalse",
            "question": "(Tin học Ứng dụng) Một nhóm học sinh đang thực hiện dự án thiết kế website cho câu lạc bộ tin học của trường, bao gồm các trang: Giới thiệu về câu lạc bộ, Các hoạt động, Tài Liệu, và Liên hệ. Nhóm học sinh đưa ra một số nhận xét về quy trình thiết kế website bằng phần mềm tạo trang web như sau:",
            "options": [
                "Trang \"Tài liệu\" chỉ có thể chứa các file PDF, Word.",
                "Cần tạo một trang chủ (homepage) để liên kết đến 4 trang web: Giới thiệu về câu lạc bộ, Các hoạt động, Tài liệu, Liên hệ.",
                "Khi sử dụng phần mềm để tạo website, nhóm học sinh phải tự tối ưu hóa giao diện cho các thiết bị.",
                "Có thể tạo giao diện giống nhau cho cả 4 trang web bằng phần mềm tạo trang web."
            ],
            "correct": [
                false,
                true,
                false,
                true
            ],
            "explanation": "a) SAI: Trang 'Tài liệu' của website có thể hiển thị và cung cấp liên kết tải về cho rất nhiều định dạng tệp tin khác nhau như hình ảnh, tệp tin nén (.zip, .rar), mã nguồn phần mềm (.py, .cpp), tệp tin âm thanh hoặc video, chứ không bị giới hạn chỉ ở file PDF và Word.\nb) ĐÚNG: Trang chủ đóng vai trò là điểm xuất phát chính của website, chứa các menu và liên kết điều hướng để người dùng dễ dàng chuyển đến các trang con của hệ thống.\nc) SAI: Hầu hết các phần mềm thiết kế website hiện đại ngày nay (Wix, Google Sites, WordPress...) đều tự động hỗ trợ tính năng thiết kế giao diện đáp ứng (Responsive Web Design), tự động căn chỉnh và tối ưu hóa nội dung hiển thị đẹp mắt trên các thiết bị khác nhau (mobile, tablet, desktop) mà người thiết kế không cần can thiệp thủ công nhiều.\nd) ĐÚNG: Việc đồng bộ giao diện (theme, header, footer) cho tất cả các trang con là rất cần thiết để tạo tính nhất quán thương hiệu. Các phần mềm tạo web luôn hỗ trợ nhân bản trang hoặc sử dụng chung một template giao diện.",
            "correctAnswers": [
                false,
                true,
                false,
                true
            ]
        }
    ]
};
