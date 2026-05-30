window.quizData = {
    "title": "Đề thi thử tốt nghiệp THPT năm 2026 – Sở GD&ĐT Đà Nẵng (Đề 04)",
    "pageTitle": "Tin học 12 – Đề Đà Nẵng (2026)",
    "examInfo": {
        "department": "Sở GD&ĐT Đà Nẵng",
        "school": "",
        "province": "Đà Nẵng",
        "examName": "Thi thử tốt nghiệp THPT",
        "attempt": "Đề 04",
        "date": "2026",
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
            "question": "Khi sử dụng các nền tảng trực tuyến (mạng xã hội, email, ứng dụng nhắn tin), ưu điểm nào sau đây giúp hình thức giao tiếp này thuận lợi hơn so với giao tiếp trực tiếp?",
            "options": [
                "Giúp tiết kiệm thời gian và chi phí đi lại khi trao đổi thông tin.",
                "Dễ dàng truyền tải cảm xúc một cách đầy đủ và chính xác hơn.",
                "Có thể phản hồi và điều chỉnh ngay trong quá trình giao tiếp.",
                "Có thể quan sát ngôn ngữ cơ thể và biểu cảm của người đối diện."
            ],
            "correct": 0,
            "explanation": "Giao tiếp trực tuyến cho phép kết nối mọi lúc mọi nơi mà không cần gặp mặt vật lý, nhờ đó giúp tiết kiệm đáng kể thời gian di chuyển và chi phí đi lại."
        },
        {
            "type": "multiple",
            "question": "Đoạn mã HTML nào sau đây dùng để tạo một bảng gồm 2 hàng, 3 cột, trong đó ô “Thực hành” chiếm 2 hàng và 2 cột (bên trái), cột bên phải lần lượt là “Bài 1”, “Bài 2”?",
            "options": [
                "<table border=\"1\" style=\"text-align: center;\"> <tr><td rowspan=\"2\">Thực hành</td><td rowspan=\"2\"></td><td>Bài 1</td> </tr> <tr><td>Bài 2</td></tr></table>",
                "<table border=\"1\" style=\"text-align: center;\"> <tr><td>Thực hành</td><td>Bài 1</td><td>Bài 2</td></tr> <tr><td colspan=\"2\">Thực hành</td></tr> </table>",
                "<table border=\"1\" style=\"text-align: center;\"> <tr><td rowspan=\"2\" colspan=\"2\">Thực hành</td><td>Bài 1</td></tr> <tr><td>Bài 2</td></tr> </table>",
                "<table border=\"1\" style=\"text-align: center;\"> <tr><td colspan=\"2\">Thực hành</td><td>Bài 1</td></tr> <tr><td colspan=\"2\"></td><td>Bài 2</td></tr> </table>"
            ],
            "correct": 2,
            "explanation": "Để một ô chiếm 2 hàng ta dùng thuộc tính `rowspan=\"2\"`, chiếm 2 cột ta dùng `colspan=\"2\"`. Ô \"Thực hành\" chiếm cả 2 hàng và 2 cột nên khai báo `<td rowspan=\"2\" colspan=\"2\">Thực hành</td>`. Do ô này đã chiếm 2 cột ở hàng 1 và 2 cột ở hàng 2, nên ở hàng 1 chỉ cần khai báo thêm 1 ô \"Bài 1\", ở hàng 2 khai báo thêm 1 ô \"Bài 2\" để tạo thành bảng 3 cột."
        },
        {
            "type": "multiple",
            "question": "Trong tên miền https://www.danang.edu.vn, thành phần nào sau đây là tên miền cấp 2?",
            "options": [
                "danang",
                "www",
                "edu",
                "vn"
            ],
            "correct": 2,
            "explanation": "Tên miền được phân cấp từ phải qua trái, cách nhau bởi dấu chấm. Ở đây: `.vn` là tên miền quốc gia (cấp 1/cao nhất), `.edu` đứng liền trước nên là tên miền cấp 2, `.danang` đứng trước tiếp là tên miền cấp 3."
        },
        {
            "type": "multiple",
            "question": "Thuộc tính controls trong HTML dùng để thiết lập nội dung nào sau đây?",
            "options": [
                "Tải trước nội dung.",
                "Hiển thị thanh điều khiển.",
                "Thiết lập mức âm lượng.",
                "Tự động phát nội dung."
            ],
            "correct": 1,
            "explanation": "Thuộc tính `controls` trong các thẻ đa phương tiện (`<video>`, `<audio>`) của HTML dùng để hiển thị giao diện điều khiển (như nút phát, tạm dừng, thanh trượt âm lượng) cho người dùng tương tác."
        },
        {
            "type": "multiple",
            "question": "Thuộc tính CSS nào sau đây dùng để thiết lập độ đậm nhạt của văn bản?",
            "options": [
                "text-indent",
                "text-align",
                "font-weight",
                "font-style"
            ],
            "correct": 2,
            "explanation": "Thuộc tính `font-weight` trong CSS dùng để định dạng độ đậm nhạt của chữ (ví dụ: bold, normal, 400, 700). Thuộc tính `font-style` dùng để in nghiêng."
        },
        {
            "type": "multiple",
            "question": "Lĩnh vực nào sau đây của Trí tuệ nhân tạo có khả năng tạo ra nội dung mới như văn bản, hình ảnh hoặc âm thanh?",
            "options": [
                "Xử lí ngôn ngữ tự nhiên.",
                "Thị giác máy tính.",
                "Học máy.",
                "AI tạo sinh."
            ],
            "correct": 3,
            "explanation": "Trí tuệ nhân tạo tạo sinh (Generative AI) là phân nhóm AI tập trung vào việc tạo ra dữ liệu hoặc nội dung mới (như ChatGPT tạo văn bản, Midjourney tạo hình ảnh) dựa trên tập dữ liệu đã học."
        },
        {
            "type": "multiple",
            "question": "Chọn một trong hai ngôn ngữ Python hoặc C++ để xem xét đoạn chương trình sau:\n*Python*:\n```python\ns = \"Thithu2324042026Tinhoc\"\nc = 0\nfor i in s:\n    if \"0\" <= i <= \"9\" and int(i) % 2 == 0:\n        c = c + 1\nprint(c)\n```\n*C++*:\n```cpp\nstring s = \"Thithu2324042026Tinhoc\";\nint c = 0;\nfor (char i : s) {\n    if (i >= '0' && i <= '9' && (i - '0') % 2 == 0)\n        c = c + 1;\n}\ncout << c;\n```\nSau khi thực hiện đoạn chương trình trên, kết quả nào sau đây được hiển thị trên màn hình?",
            "options": [
                "7.",
                "1.",
                "10.",
                "9."
            ],
            "correct": 3,
            "explanation": "Chương trình thực hiện đếm số chữ số chẵn xuất hiện trong chuỗi `s`. Các chữ số trong chuỗi `s` là: `2, 3, 2, 4, 0, 4, 2, 0, 2, 6`. Các chữ số chẵn gồm: 2, 2, 4, 0, 4, 2, 0, 2, 6 (tổng cộng có 9 chữ số chẵn). Số 3 là chữ số lẻ nên không được đếm. Do đó biến c tăng lên 9."
        },
        {
            "type": "multiple",
            "question": "Thiết bị nào sau đây dùng để kết nối máy tính với mạng Internet thông qua đường truyền của nhà cung cấp dịch vụ?",
            "options": [
                "Router.",
                "Switch.",
                "Modem.",
                "Hub."
            ],
            "correct": 2,
            "explanation": "Modem là thiết bị điều chế và giải điều chế tín hiệu vật lý của nhà cung cấp dịch vụ Internet (ISP) truyền trên đường dây cáp viễn thông thành tín hiệu số của máy tính và ngược lại, là thiết bị bắt buộc để đi Internet."
        },
        {
            "type": "multiple",
            "question": "Trong nhóm lớp trên mạng xã hội, một bạn chia sẻ về hoàn cảnh khó khăn nên có thể không tham gia một số hoạt động của lớp nhưng bị một số bạn trêu đùa. Nếu là thành viên trong nhóm, hành động nào sau đây thể hiện ứng xử nhân văn?",
            "options": [
                "Không phản hồi vì đó là chuyện riêng của bạn đăng bài.",
                "Tham gia bình luận hài hước để không khí bớt căng thẳng.",
                "Nhắc mọi người dừng trêu đùa và tôn trọng hoàn cảnh của bạn.",
                "Chụp lại bài viết rồi chia sẻ sang nhóm khác để bàn luận."
            ],
            "correct": 2,
            "explanation": "Thể hiện ứng xử nhân văn và văn minh trên mạng xã hội yêu cầu sự đồng cảm, chia sẻ và can thiệp để bảo vệ bạn bè khỏi những lời trêu đùa thiếu nhạy cảm, xây dựng môi trường mạng tích cực."
        },
        {
            "type": "multiple",
            "question": "Chọn một trong hai ngôn ngữ Python hoặc C++ để xem xét đoạn chương trình sau:\n*Python*:\n```python\ndef h(a, b):\n    if b == 4: return a*a*a\n    else: return b*b\nkq = (h(2, 4) + h(4, 3))\nprint(kq)\n```\n*C++*:\n```cpp\nint h(int a, int b) {\n    if (b == 4) return a*a*a;\n    else return b*b;\n}\nint main() {\n    int kq = h(2, 4) + h(4, 3);\n    cout << kq;\n}\n```\nPhương án nào sau đây là giá trị của biến kq sau khi thực hiện đoạn chương trình trên?",
            "options": [
                "20.",
                "24.",
                "17.",
                "73."
            ],
            "correct": 2,
            "explanation": "- Lần gọi `h(2, 4)`: b = 4 nên thỏa mãn điều kiện `b == 4`, trả về `a*a*a` = `2*2*2` = 8.\n- Lần gọi `h(4, 3)`: b = 3 nên không thỏa mãn điều kiện, nhảy vào `else` trả về `b*b` = `3*3` = 9.\n- `kq = h(2, 4) + h(4, 3)` = `8 + 9` = 17."
        },
        {
            "type": "multiple",
            "question": "Một phần tử <h1> được áp dụng CSS như sau: `h1 {height: 40px; border: 2px solid red; padding: ?;}`. Biết tổng chiều cao hiển thị của phần tử (không tính margin) là 60px. Giá trị padding nào sau đây là phù hợp?",
            "options": [
                "padding: 8px 10px 8px;",
                "padding: 10px 8px 8px;",
                "padding: 10px 8px 10px;",
                "padding: 8px 8px 10px;"
            ],
            "correct": 0,
            "explanation": "Theo chuẩn Box Model:\nTổng chiều cao hiển thị = height (40px) + border-top (2px) + border-bottom (2px) + padding-top + padding-bottom.\n=> 60px = 40px + 4px + padding-top + padding-bottom\n=> padding-top + padding-bottom = 16px.\nỞ đáp án A, cú pháp 3 thành phần của padding là: `padding: top right-left bottom;`. Do đó padding-top = 8px, padding-bottom = 8px. Tổng là 16px, thỏa mãn công thức."
        },
        {
            "type": "multiple",
            "question": "Hành vi nào sau đây thể hiện ứng xử nhân văn khi đăng thông tin trên mạng xã hội?",
            "options": [
                "Chia sẻ lại thông tin càng nhanh càng tốt.",
                "Kiểm tra độ chính xác của thông tin trước khi chia sẻ.",
                "Đăng ngay thông tin vừa nhận để thu hút sự chú ý.",
                "Chỉ cần hỏi ý kiến bạn bè trước khi đăng."
            ],
            "correct": 1,
            "explanation": "Hành vi có trách nhiệm và nhân văn nhất trên không gian mạng là xác minh và kiểm chứng độ trung thực, chính xác của thông tin trước khi đăng tải/chia sẻ để tránh lan truyền tin giả."
        },
        {
            "type": "multiple",
            "question": "Trong HTML, thẻ nào sau đây dùng để tạo siêu liên kết?",
            "options": [
                "<href></href>",
                "<link></link>",
                "<a></a>",
                "<url></url>"
            ],
            "correct": 2,
            "explanation": "Thẻ neo `<a>` (Anchor) là thẻ chuẩn trong HTML dùng để liên kết trang web hiện tại với các trang web hoặc phần tử khác thông qua thuộc tính `href`."
        },
        {
            "type": "multiple",
            "question": "Trong HTML, khi tạo một lựa chọn cho phép người dùng chọn và có thể bỏ chọn bằng một thẻ <input>, nên sử dụng thuộc tính type nào sau đây?",
            "options": [
                "type=\"submit\"",
                "type=\"button\"",
                "type=\"radio\"",
                "type=\"checkbox\""
            ],
            "correct": 3,
            "explanation": "Thuộc tính `type=\"checkbox\"` tạo ra các hộp kiểm, cho phép người dùng chọn và click lại một lần nữa để bỏ chọn. Nút `radio` khi đã chọn thì không thể tự click để bỏ chọn trực tiếp."
        },
        {
            "type": "multiple",
            "question": "Cho danh sách có thứ tự như sau:\n```\nf. HTML\ng. CSS\n```\nĐoạn mã HTML nào sau đây được dùng để tạo danh sách trên?",
            "options": [
                "<ol type=\"a\" start=\"6\"><li>HTML</li><li>CSS</li></ol>",
                "<ol type=\"f\" start=\"6\"><li>HTML</li><li>CSS</li></ol>",
                "<ol type=\"a\" start=\"f\"><li>HTML</li><li>CSS</li></ol>",
                "<ol type=\"1\" start=\"f\"><li>HTML</li><li>CSS</li></ol>"
            ],
            "correct": 0,
            "explanation": "Chữ cái in thường 'f' là chữ cái thứ 6 trong bảng chữ cái. Để bắt đầu bằng chữ cái thường ta khai báo `type=\"a\"`, và bắt đầu ở vị trí thứ 6 nên ta dùng `start=\"6\"` (thuộc tính start luôn nhận giá trị dạng số nguyên)."
        },
        {
            "type": "multiple",
            "question": "Phương án nào sau đây thể hiện khả năng học từ dữ liệu trong quá trình hoạt động của Trí tuệ nhân tạo?",
            "options": [
                "Gợi ý nội dung dựa trên hành vi người dùng.",
                "Tra cứu nghĩa của từ theo dữ liệu có sẵn.",
                "Nhận dạng khuôn mặt để mở khóa điện thoại.",
                "Tự động tưới nước theo độ ẩm đo được của đất."
            ],
            "correct": 0,
            "explanation": "Hệ thống AI gợi ý nội dung (như trên TikTok, YouTube) liên tục phân tích hành vi lịch sử xem video của bạn để cập nhật và tinh chỉnh thuật toán đề xuất, đây là ví dụ điển hình của việc học hỏi tự động từ dữ liệu."
        },
        {
            "type": "multiple",
            "question": "Yêu cầu nào sau đây cần có để người làm nghề sửa chữa và bảo trì máy tính làm việc hiệu quả lâu dài?",
            "options": [
                "Có khả năng tự học và thích nghi với công nghệ mới.",
                "Có kinh nghiệm sử dụng nhiều hệ điều hành và phần mềm.",
                "Có thể thao tác sửa chữa trên các thiết bị khác nhau.",
                "Làm việc nhanh, chính xác trong quá trình sửa chữa."
            ],
            "correct": 0,
            "explanation": "Công nghệ phần cứng và phần mềm máy tính liên tục thay đổi và nâng cấp theo thời gian, do đó khả năng tự học và thích nghi là yếu tố cốt lõi giúp người thợ bảo trì không bị tụt hậu."
        },
        {
            "type": "multiple",
            "question": "Khi tìm hiểu về giao thức UDP, phát biểu nào sau đây mô tả đúng đặc điểm của giao thức này?",
            "options": [
                "Truyền dữ liệu không cần thiết lập kết nối trước.",
                "Dữ liệu được truyền kèm cơ chế xác nhận giữa hai bên.",
                "Có cơ chế kiểm soát lỗi trong quá trình truyền.",
                "Đảm bảo dữ liệu được truyền chính xác và đầy đủ."
            ],
            "correct": 0,
            "explanation": "UDP (User Datagram Protocol) là giao thức hướng không kết nối, truyền gói tin đi nhanh nhất có thể mà không cần bắt tay thiết lập kết nối trước, không có cơ chế xác nhận phản hồi hay kiểm soát lỗi như TCP."
        },
        {
            "type": "multiple",
            "question": "Ứng dụng nào sau đây thể hiện rõ việc sử dụng Trí tuệ nhân tạo trong giáo dục?",
            "options": [
                "Lưu trữ tài liệu học tập trên nền tảng trực tuyến.",
                "Phân tích kết quả học tập để đánh giá năng lực người học.",
                "Tổ chức thi trực tuyến và chấm điểm tự động.",
                "Quản lí hồ sơ và theo dõi quá trình học tập của học sinh."
            ],
            "correct": 1,
            "explanation": "Ứng dụng AI giúp phân tích mẫu kết quả, điểm số, điểm mạnh/yếu của học sinh để đưa ra nhận xét đánh giá cá nhân hóa năng lực học tập và đề xuất lộ trình phù hợp."
        },
        {
            "type": "multiple",
            "question": "Phát biểu nào sau đây không phải là cảnh báo khi ứng dụng Trí tuệ nhân tạo trong thực tế?",
            "options": [
                "Nguy cơ bị lộ hoặc lạm dụng dữ liệu cá nhân.",
                "Tăng khả năng hỗ trợ con người trong công việc.",
                "Tạo ra thông tin sai lệch hoặc gây hiểu nhầm.",
                "Làm giảm nhu cầu lao động ở một số ngành nghề."
            ],
            "correct": 1,
            "explanation": "\"Tăng khả năng hỗ trợ con người trong công việc\" là lợi ích, tác động tích cực của AI, không phải là lời cảnh báo rủi ro hay tác động tiêu cực."
        },
        {
            "type": "multiple",
            "question": "Nghề nào sau đây không thuộc nhóm nghề ứng dụng công nghệ thông tin trong ngành khác?",
            "options": [
                "Nhà phân tích dữ liệu.",
                "Kĩ sư GIS.",
                "Chuyên viên công nghệ tài chính.",
                "Kiểm thừ viên."
            ],
            "correct": 3,
            "explanation": "Kiểm thử viên (Tester) là ngành nghề CNTT thuần túy thuộc chu trình phát triển phần mềm, không phải ứng dụng CNTT cho một lĩnh vực liên ngành khác như Bản đồ (GIS), Tài chính (Fintech)."
        },
        {
            "type": "multiple",
            "question": "Trong giờ thực hành, một học sinh thực hiện các thao tác để kết nối máy tính với Switch của phòng máy nhằm truy cập Internet như sau:\n1. Chuẩn bị dây cáp mạng có hai đầu RJ45;\n2. Cắm một đầu dây vào cổng LAN của máy tính;\n3. Mở trình duyệt web để kiểm tra kết nối Internet;\n4. Cắm đầu còn lại vào cổng LAN của Switch.\n\nTại bước 3, máy tính không truy cập được Internet. Nguyên nhân nào sau đây giải thích đúng nhất?",
            "options": [
                "Dây mạng có đầu RJ45 chỉ dùng để kết nối trực tiếp giữa hai máy tính.",
                "Học sinh kiểm tra kết nối khi chưa hoàn tất việc kết nối vật lý.",
                "Switch không hỗ trợ máy tính truy cập Internet trong mạng.",
                "Máy tính phải cấu hình địa chỉ IP thủ công khi kết nối với Switch."
            ],
            "correct": 1,
            "explanation": "Học sinh thực hiện kiểm tra mạng ở bước 3, trong khi bước 4 mới là cắm đầu cáp còn lại vào Switch. Do đó, việc kết nối vật lý chưa hoàn thành thì máy tính chắc chắn chưa có mạng."
        },
        {
            "type": "multiple",
            "question": "Người quản trị và bảo trì hệ thống không thực hiện công việc chính nào sau đây?",
            "options": [
                "Lập kế hoạch chiến lược để đảm bảo an toàn thông tin.",
                "Sửa chữa những lỗ hổng an toàn thông tin trong hệ thống.",
                "Cài đặt phần cứng và phần mềm cho hệ thống mạng.",
                "Tối ưu hoá và thường xuyên đánh giá hoạt động của hệ thống."
            ],
            "correct": 1,
            "explanation": "Sửa chữa các lỗ hổng an toàn thông tin thuộc trách nhiệm của chuyên gia bảo mật/an ninh mạng chuyên sâu, chuyên gia quản trị hệ thống chỉ cài đặt, phân quyền và duy trì vận hành."
        },
        {
            "type": "multiple",
            "question": "Cho đoạn mã HTML và CSS sau:\n*Đoạn mã HTML*:\n```html\n<body>\n  <ul>\n    <li>Đà Nẵng</li>\n  </ul>\n</body>\n```\n*Đoạn mã CSS*:\n```css\nbody {color: blue; text-align: right; font-style: italic;}\nul {color: green; text-align: center;}\nli {text-align: right;}\n```\nKhi hiển thị trên trình duyệt, nội dung của phần tử `<li>` có định dạng nào sau đây?",
            "options": [
                "Chữ màu xanh lá, căn phải, bình thường.",
                "Chữ màu xanh lá, căn giữa, in nghiêng.",
                "Chữ màu xanh dương, căn phải, in nghiêng.",
                "Chữ màu xanh lá, căn phải, in nghiêng."
            ],
            "correct": 3,
            "explanation": "- Màu sắc: `li` nằm trong `ul`, `ul` có `color: green` ghi đè `color: blue` của `body`. Do đó chữ có màu xanh lá.\n- Căn lề: `li` có `text-align: right` trực tiếp nên ghi đè `text-align: center` của `ul` -> căn phải.\n- Kiểu chữ: thuộc tính `font-style: italic` từ `body` được thừa hưởng kế thừa xuống `ul` và `li` -> in nghiêng."
        },
        {
            "type": "truefalse",
            "question": "Một công ty có 4 phòng làm việc. Mỗi phòng được trang bị một Switch 16 cổng để kết nối các máy tính tạo thành mạng nội bộ. Switch của một phòng được sử dụng làm Switch trung tâm, kết nối với ba Switch còn lại. Tại phòng đặt Switch trung tâm, một máy tính được kết nối với máy in và chia sẻ cho các máy khác trong mạng; đồng thời một Access Point được kết nối vào Switch này để phục vụ việc truy cập mạng trong toàn công ty. Sau khi thảo luận, một số nhân viên đưa ra các ý kiến sau:",
            "options": [
                "Access Point cho phép các thiết bị như điện thoại thông minh và máy tính xách tay kết nối vào mạng nội bộ của công ty thông qua kết nối không dây.",
                "Các máy tính ở các phòng khác nhau không thể trao đổi dữ liệu với nhau vì mỗi phòng sử dụng một Switch riêng.",
                "Các máy tính trong mạng chỉ có thể sử dụng máy in khi đã cài phần mềm điều khiển máy in được chia sẻ từ máy kết nối trực tiếp với máy in đó.",
                "Với cách bố trí trên, tối đa công ty có thể kết nối 56 máy tính vào mạng nội bộ."
            ],
            "correct": [
                true,
                false,
                true,
                false
            ],
            "explanation": "a) ĐÚNG: Access Point đóng vai trò phát Wi-Fi cho các thiết bị di động kết nối không dây vào mạng nội bộ LAN.\nb) SAI: Các Switch phòng phụ đều kết nối về Switch trung tâm nên tạo thành một mạng thông suốt, các máy tính ở các phòng hoàn toàn có thể trao đổi dữ liệu.c) ĐÚNG: Để sử dụng máy in chia sẻ qua mạng, các máy trạm cần cài đặt Driver (phần mềm điều khiển máy in) tương thích.\nd) SAI: Switch trung tâm (16 cổng): dùng 3 cổng nối 3 switch kia, 1 cổng cắm AP, 1 cổng cắm máy tính nối máy in -> còn dư 11 cổng. Mỗi Switch phụ (16 cổng): dùng 1 cổng nối Switch trung tâm -> còn dư 15 cổng. Tổng số cổng trống để cắm máy tính = 11 + 15 * 3 = 56 cổng. Tuy nhiên, tính cả máy tính nối trực tiếp với máy in (đã cắm 1 cổng ở switch trung tâm) thì tổng số máy kết nối là 57 máy.",
            "correctAnswers": [
                true,
                false,
                true,
                false
            ]
        },
        {
            "type": "truefalse",
            "question": "Dữ liệu về quản lý suất chiếu tại một rạp chiếu phim được lưu trữ trong hệ thống cơ sở dữ liệu. Nguồn dữ liệu này phục vụ cho việc theo dõi lịch chiếu, quản lý phòng chiếu và thông tin phim. Để lưu trữ và khai thác dữ liệu, có thể tạo cơ sở dữ liệu quan hệ với các bảng sau:\n- PHIM (MaPhim, TenPhim, ThoiLuong, DaoDien): lưu thông tin mã phim, tên phim, thời lượng và đạo diễn.\n- PHONG_CHIEU (MaPhong, TenPhong, SucChua): lưu thông tin mã phòng, tên phòng và sức chứa.\n- LICH_CHIEU (MaSuat, MaPhim, MaPhong, NgayChieu, GioBatDau): lưu thông tin mã suất chiếu, mã phim, mã phòng, ngày chiếu và giờ bắt đầu.\n\nSau khi tìm hiểu cơ sở dữ liệu quan hệ trên, một số bạn học sinh đưa ra các ý kiến sau:",
            "options": [
                "MaSuat là khóa chính của bảng LICH_CHIEU, đảm bảo mỗi suất chiếu là định danh duy nhất.",
                "Với hệ thống trên, việc triển khai cơ sở dữ liệu theo mô hình phân tán là phù hợp để tối ưu hiệu suất truy cập dữ liệu.",
                "Để xác định số suất chiếu của mỗi phòng trong một ngày cụ thể, phải sử dụng dữ liệu từ 3 bảng trên.",
                "Để kiểm tra một phòng chiếu có hai suất chiếu bắt đầu cùng thời điểm hay không, chỉ cần xét các bản ghi trong bảng LICH_CHIEU có cùng MaPhong, NgayChieu và GioBatDau."
            ],
            "correct": [
                true,
                false,
                false,
                true
            ],
            "explanation": "a) ĐÚNG: `MaSuat` định danh duy nhất cho mỗi suất chiếu nên làm khóa chính là hoàn toàn chính xác.\nb) SAI: Quy mô quản lý của rạp chiếu phim thông thường là tập trung, không có dữ liệu khổng lồ hay phân tán địa lý phức tạp để phải sử dụng mô hình CSDL phân tán.\nc) SAI: Để đếm số suất chiếu của từng phòng trong một ngày, ta chỉ cần sử dụng bảng `LICH_CHIEU` vì bảng này đã có đủ thông tin `MaPhong` và `NgayChieu`.\nd) ĐÚNG: Để phát hiện trùng lịch phòng, ta chỉ cần quét các bản ghi trong bảng `LICH_CHIEU` để tìm xem có suất chiếu nào có cùng phòng (`MaPhong`), cùng ngày (`NgayChieu`) và trùng giờ (`GioBatDau`) hay không.",
            "correctAnswers": [
                true,
                false,
                false,
                true
            ]
        },
        {
            "type": "truefalse",
            "question": "(Khoa học Máy tính) Khi sử dụng các ứng dụng mạng xã hội, người dùng thường thấy các video được đề xuất ngày càng phù hợp với sở thích của mình, ngay cả khi không chủ động tìm kiếm. Điều này là nhờ một hệ thống học máy sử dụng các thông tin như thời gian xem mỗi video, việc bỏ qua và lượt thích để dự đoán và hiển thị nội dung phù hợp. Để huấn luyện mô hình, hệ thống sử dụng dữ liệu hành vi của người dùng, trong đó các video được xem lâu hoặc có tương tác tích cực được gán nhãn là “phù hợp”, còn các video bị bỏ qua nhanh được gán nhãn là “không phù hợp”. Trong khi thảo luận, một số bạn học sinh đưa ra các nhận định sau:",
            "options": [
                "Các thông tin như thời gian xem video, việc bỏ qua và lượt thích được sử dụng làm dữ liệu đầu vào cho mô hình học máy.",
                "Hệ thống trên sử dụng phương pháp học không giám sát để nhóm các video có nội dung tương tự nhau.",
                "Việc đánh giá hiệu quả của mô hình có thể được thực hiện bằng cách sử dụng cùng một tập dữ liệu đã dùng để huấn luyện.",
                "Nếu mô hình được huấn luyện chủ yếu từ dữ liệu của một nhóm người dùng có thói quen tương tự nhau, thì khi áp dụng cho những người dùng có hành vi khác biệt, kết quả đề xuất có thể giảm độ chính xác."
            ],
            "correct": [
                true,
                false,
                false,
                true
            ],
            "explanation": "a) ĐÚNG: Các số liệu đo lường hành vi trực quan của người dùng đóng vai trò là các đặc trưng (features) đầu vào cho mô hình.\nb) SAI: Vì dữ liệu huấn luyện đã có nhãn được gán rõ ràng ('phù hợp' / 'không phù hợp'), đây thuộc phương pháp học có giám sát (Supervised Learning).\nc) SAI: Đánh giá mô hình trên chính tập huấn luyện sẽ gây ra hiện tượng overfitting, không đánh giá được khả năng tổng quát hóa thực tế của mô hình.\nd) ĐÚNG: Dữ liệu huấn luyện bị lệch (bias) sẽ làm giảm độ chính xác của các dự đoán khi áp dụng cho tập đối tượng người dùng mới có hành vi khác biệt.",
            "correctAnswers": [
                true,
                false,
                false,
                true
            ]
        },
        {
            "type": "truefalse",
            "question": "(Khoa học Máy tính) Cho hàm sau đây được viết bằng ngôn ngữ lập trình Python và C++:\n*Python*:\n```python\ndef S(A):\n    for i in range(len(A) - 1):\n        m = i\n        for j in range(i + 1, len(A)):\n            if not (A[m] >= A[j]):\n                m = j\n        if m != i:\n            A[i], A[m] = A[m], A[i]\n    return (A[0] + A[len(A)-2])\n```\n*C++*:\n```cpp\nfloat S(int A[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        int m = i;\n        for (int j = i + 1; j < n; j++) {\n            if (!(A[m] >= A[j])) {\n                m = j;\n            }\n        }\n        if (m != i) {\n            swap(A[m], A[i]);\n        }\n    }\n    return (A[0] + A[n-2]);\n}\n```\nSau khi tìm hiểu hàm trên, một số bạn học sinh đã nêu các ý kiến sau:",
            "options": [
                "Đoạn mã được mô tả bằng hàm S trên là thuật toán sắp xếp nổi bọt.",
                "Thuật toán trên luôn thực hiện đầy đủ số lần lặp của các vòng for ngay cả khi danh sách ban đầu đã được sắp xếp.",
                "Thuật toán trên sử dụng phương pháp tìm kiếm tuần tự để xác định vị trí của phần tử A[m] trong mỗi lần lặp.",
                "Nếu dữ liệu đầu vào là n=10 và mảng A là (8 4 5 2 7 9 10 14 15 12) thì hàm trả về giá trị 16."
            ],
            "correct": [
                false,
                true,
                true,
                false
            ],
            "explanation": "a) SAI: Thuật toán trên là thuật toán sắp xếp chọn (Selection Sort) để sắp xếp mảng theo thứ tự giảm dần.\nb) ĐÚNG: Thuật toán Selection Sort có độ phức tạp thời gian cố định O(n^2), luôn lặp đủ số lần mà không dừng sớm.\nc) ĐÚNG: Vòng lặp j duyệt qua từng phần tử từ i+1 đến hết để tìm phần tử lớn nhất, đây chính là cơ chế tìm kiếm tuần tự.\nd) SAI: Sắp xếp giảm dần ta được A = [15, 14, 12, 10, 9, 8, 7, 5, 4, 2]. Khi đó A[0] = 15, A[n-2] = A[8] = 4. Hàm trả về: 15 + 4 = 19, không phải 16.",
            "correctAnswers": [
                false,
                true,
                true,
                false
            ]
        },
        {
            "type": "truefalse",
            "question": "(Tin học Ứng dụng) Một nhóm học sinh đang thiết kế website giới thiệu câu lạc bộ Tin học của trường bằng phần mềm tạo trang web. Website gồm các trang: Trang chủ, Hoạt động, Thành viên, Đăng kí và Liên hệ. Để thuận tiện cho việc sử dụng, trên mỗi trang đều có phần đầu trang chứa thanh điều hướng giúp người dùng dễ dàng chuyển đến các trang khác. Trong quá trình thảo luận xây dựng website, các bạn học sinh đã đưa ra một số ý kiến sau:",
            "options": [
                "Mỗi trang trong website cần được lưu thành một tệp có phần mở rộng là .html.",
                "Nếu mỗi trang sử dụng một bố cục thanh điều hướng khác nhau thì vẫn đảm bảo trải nghiệm người dùng.",
                "Để tạo liên kết từ Trang chủ đến trang Hoạt động, có thể sử dụng văn bản để gắn liên kết (hyperlink), không thể sử dụng hình ảnh.",
                "Khi thiết kế trang “Đăng kí” với biểu mẫu trực tuyến, nếu người dùng nhập đầy đủ thông tin vào các trường thì dữ liệu sẽ được gửi thành công."
            ],
            "correct": [
                true,
                false,
                false,
                false
            ],
            "explanation": "a) ĐÚNG: Các trang web tĩnh được lưu dưới dạng file mở rộng .html để trình duyệt đọc và hiển thị.\nb) SAI: Sự thiếu nhất quán trong bố cục thanh điều hướng giữa các trang con sẽ làm người dùng bối rối, giảm trải nghiệm sử dụng.\nc) SAI: Trong HTML, ta có thể bọc thẻ hình ảnh `<img>` bên trong thẻ `<a>` để biến hình ảnh đó thành một siêu liên kết có thể nhấp chuột.\nd) SAI: Việc gửi dữ liệu thành công hay không còn phụ thuộc vào trạng thái hoạt động của máy chủ (server), kết nối Internet và các ràng buộc dữ liệu tại hệ thống.",
            "correctAnswers": [
                true,
                false,
                false,
                false
            ]
        },
        {
            "type": "truefalse",
            "question": "(Tin học Ứng dụng) Dữ liệu về quản lý cửa hàng trang sức được lưu trữ trong hệ thống cơ sở dữ liệu nhằm phục vụ việc theo dõi loại vàng, sản phẩm và các phiếu bán hàng. Để lưu trữ và khai thác dữ liệu, có thể tạo cơ sở dữ liệu quan hệ với các bảng sau:\n- LOAI_VANG (MaLoai, TenLoai, GiaNiemYet): lưu thông tin mã loại vàng, tên loại vàng và giá niêm yết.\n- SAN_PHAM (MaSP, TenSP, MaLoai, TrongLuong): lưu thông tin mã sản phẩm, tên sản phẩm, mã loại vàng và trọng lượng.\n- PHIEU_BAN (SoPhieu, MaSP, NgayBan, GiaThucTe): lưu thông tin số phiếu bán, mã sản phẩm, ngày bán và giá bán thực tế.\n\nSau khi tìm hiểu cơ sở dữ liệu quan hệ trên, một số học sinh đưa ra các ý kiến sau:",
            "options": [
                "Mỗi giá trị của trường MaLoai trong bảng SAN_PHAM phải tồn tại trong bảng LOAI_VANG.",
                "Trong cơ sở dữ liệu quan hệ này, mỗi loại vàng có thể liên kết với nhiều sản phẩm, nhưng mỗi sản phẩm chỉ thuộc một loại vàng.",
                "Giá niêm yết của các sản phẩm đã bán có thể xác định từ mối liên hệ giữa bảng SAN_PHAM và LOAI_VANG.",
                "Để đưa ra mã loại vàng, tên loại vàng và tổng giá bán thực tế của các sản phẩm đã bán theo từng loại vàng, thực hiện truy vấn sau:\n```sql\nSELECT LOAI_VANG.MaLoai, LOAI_VANG.TenLoai, COUNT(PHIEU_BAN.GiaThucTe) AS TongTien\nFROM PHIEU_BAN INNER JOIN SAN_PHAM ON PHIEU_BAN.MaSP = SAN_PHAM.MaSP\nINNER JOIN LOAI_VANG ON SAN_PHAM.MaLoai = LOAI_VANG.MaLoai\nGROUP BY LOAI_VANG.MaLoai, LOAI_VANG.TenLoai;\n```"
            ],
            "correct": [
                true,
                true,
                false,
                false
            ],
            "explanation": "a) ĐÚNG: Khóa ngoại `MaLoai` trong bảng `SAN_PHAM` tham chiếu đến khóa chính `MaLoai` của bảng `LOAI_VANG` nên phải tồn tại để đảm bảo tính toàn vẹn tham chiếu.\nb) ĐÚNG: Một loại vàng (như vàng 24k) có thể làm ra nhiều sản phẩm trang sức, nhưng mỗi sản phẩm trang sức chỉ có 1 loại vàng duy nhất.\nc) SAI: Giá niêm yết của sản phẩm nằm ở bảng `LOAI_VANG`, để tìm giá niêm yết của sản phẩm đã bán (ở bảng `PHIEU_BAN`), ta cần liên kết bảng `PHIEU_BAN` với `SAN_PHAM` rồi tiếp tục liên kết với bảng `LOAI_VANG` (liên kết cả 3 bảng chứ không chỉ 2 bảng).\nd) SAI: Trong câu SQL, để tính \"tổng giá bán thực tế\" ta phải sử dụng hàm tính tổng `SUM(PHIEU_BAN.GiaThucTe)` chứ không dùng hàm đếm `COUNT(PHIEU_BAN.GiaThucTe)`.",
            "correctAnswers": [
                true,
                true,
                false,
                false
            ]
        }
    ]
};
