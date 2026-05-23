window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT năm 2026 – Cụm chuyên môn số 8 Sở GD&ĐT Đắk Lắk",
    pageTitle: "Tin học 12 – Đề Đắk Lắk Cụm 8 (2026)",
    examInfo: {
        department: "Sở GD&ĐT Đắk Lắk",
        school: "Cụm chuyên môn số 8",
        province: "Đắk Lắk",
        examName: "Thi thử tốt nghiệp THPT",
        attempt: "Lần 1",
        date: "2026",
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
            question: "Chọn một trong hai ngôn ngữ Python hoặc C++ để xem xét đoạn chương trình sau:\n*Python*:\n```python\na = 10\nb = 20\na = a + b\nb = a - b\na = a - b\nprint(a, b)\n```\n*C++*:\n```cpp\nint a = 10, b = 20;\na = a + b;\nb = a - b;\na = a - b;\ncout << a << \" \" << b;\n```\nKết quả in ra màn hình của đoạn mã trên là:",
            options: [
                "10 20",
                "20 10",
                "20 30",
                "30 10"
            ],
            correct: 1,
            explanation: "Đây là thuật toán tráo đổi giá trị 2 biến không dùng biến trung gian:\n- a = a + b = 10 + 20 = 30\n- b = a - b = 30 - 20 = 10 (b lấy giá trị ban đầu của a)\n- a = a - b = 30 - 10 = 20 (a lấy giá trị ban đầu của b)\nVậy kết quả in ra là `20 10`."
        },
        {
            type: "multiple",
            question: "Khai báo nào sau đây là đúng để liên kết với một tệp CSS bên ngoài?",
            options: [
                "<script src = \"fit.css\" value = \"stylesheet\">",
                "<source href = \"fit.css\" style = \"stylesheet\">",
                "<a href = \"fit.css\" style = \"stylesheet\">",
                "<link href = \"fit.css\" rel = \"stylesheet\">"
            ],
            correct: 3,
            explanation: "Để liên kết tệp CSS bên ngoài, ta dùng thẻ tự đóng `<link>` với thuộc tính `href` chỉ đường dẫn đến file CSS và `rel=\"stylesheet\"` để xác định mối quan hệ."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây KHÔNG phải là ưu điểm của giao tiếp trong thế giới ảo?",
            options: [
                "Giao tiếp trong thế giới ảo giúp thuận tiện trong việc truyền tải cảm xúc.",
                "Giao tiếp trong thế giới ảo có thể diễn ra mọi lúc, mọi nơi.",
                "Giao tiếp trong thế giới ảo giúp tạo điều kiện thuận lợi cho việc lưu trữ thông tin.",
                "Giao tiếp trong thế giới ảo cung cấp nhiều công cụ giao tiếp đa dạng."
            ],
            correct: 0,
            explanation: "Giao tiếp trong thế giới ảo qua tin nhắn, email... thường bị hạn chế trong việc truyền tải các sắc thái cảm xúc tinh tế, tông giọng, cử chỉ phi ngôn ngữ so với giao tiếp trực tiếp. Do đó, đây không phải là ưu điểm."
        },
        {
            type: "multiple",
            question: "Khi tham gia mua sắm trực tuyến, phương án nào sau đây có thể là nhược điểm của hình thức này?",
            options: [
                "Không có dịch vụ chăm sóc khách hàng khi mua sắm trực tuyến.",
                "Không được kiểm tra và đánh giá sản phẩm khi nhận hàng.",
                "Nguy cơ bị lừa đảo hoặc mất thông tin cá nhân khi thực hiện thanh toán trực tuyến.",
                "Sự khó khăn trong việc tìm kiếm sản phẩm và so sánh giá cả."
            ],
            correct: 2,
            explanation: "Một trong những rủi ro lớn nhất khi mua sắm trực tuyến là các mối đe dọa về an ninh mạng, rò rỉ dữ liệu thẻ ngân hàng hoặc bị lừa đảo bởi các trang web giả mạo."
        },
        {
            type: "multiple",
            question: "Cho đoạn mã lệnh:\n*Python*:\n```python\nC = 0\nfor k in range (1, 10):\n    if k % 3 == 0:\n        C = C + k\nprint(C)\n```\n*C++*:\n```cpp\nint C = 0;\nfor (int k = 1; k < 10; k++) {\n    if (k % 3 == 0) {\n        C = C + k;\n    }\n}\ncout << C;\n```\nPhương án nào sau đây nêu đúng giá trị của C sau khi thực hiện đoạn chương trình trên?",
            options: [
                "55",
                "3",
                "45",
                "18"
            ],
            correct: 3,
            explanation: "Vòng lặp duyệt k từ 1 đến 9. Các giá trị k chia hết cho 3 là 3, 6, 9. Biến C tích lũy tổng các giá trị này: C = 3 + 6 + 9 = 18."
        },
        {
            type: "multiple",
            question: "Cú pháp HTML nào sau đây là đúng để tạo ra một bảng có 2 dòng, mỗi dòng 1 ô?",
            options: [
                "<tbl><tr><th></th></tr><tr><td></td></tr></tbl>",
                "<tbl><tr><td></td><td></td></tr></tbl>",
                "<table><tr><th></th></tr><tr><td></td></tr></table>",
                "<table><tr><td></td><td></td></tr></table>"
            ],
            correct: 2,
            explanation: "Thẻ tạo bảng là `<table>`. Mỗi hàng là `<tr>`, mỗi ô là `<td>` hoặc `<th>` (ô tiêu đề). Ở đáp án C, có 2 thẻ `<tr>` lồng nhau tương ứng 2 dòng, và mỗi dòng chứa đúng 1 ô (`<th>` ở dòng 1 và `<td>` ở dòng 2)."
        },
        {
            type: "multiple",
            question: "Thẻ nào sau đây có thể xuất hiện nhiều hơn một lần trong một trang web?",
            options: [
                "<body>",
                "<html>",
                "<head>",
                "<p>"
            ],
            correct: 3,
            explanation: "Thẻ `<p>` dùng để định nghĩa các đoạn văn bản khác nhau trên trang web, do đó nó có thể xuất hiện nhiều lần. Các thẻ `<html>`, `<head>`, `<body>` là các thành phần cấu trúc cơ bản và chỉ được phép xuất hiện duy nhất 1 lần trong mỗi tài liệu HTML."
        },
        {
            type: "multiple",
            question: "Ứng dụng nào sau đây KHÔNG là ví dụ của AI hẹp?",
            options: [
                "Máy chấm công bằng nhận diện khuôn mặt",
                "Hệ chuyên gia MYCIN tư vấn trong lĩnh vực y tế",
                "Chương trình chơi cờ AlphaGo",
                "Quản lí điểm của học sinh bằng sổ điểm điện tử"
            ],
            correct: 3,
            explanation: "Phần mềm quản lý điểm học sinh bằng sổ điểm điện tử là phần mềm quản lý dữ liệu và tính toán thông thường, không tích hợp các đặc trưng trí tuệ nhân tạo như tự học hỏi, nhận thức hay suy luận. Các phương án còn lại đều là những hệ thống AI chuyên biệt (AI hẹp)."
        },
        {
            type: "multiple",
            question: "Thẻ HTML nào sau đây cho phép xác định nơi viết các lệnh CSS trong nội bộ một trang web?",
            options: [
                "<stylesheet>",
                "<style>",
                "<link>",
                "<script>"
            ],
            correct: 1,
            explanation: "Thẻ `<style>` dùng để định nghĩa CSS nội bộ (Internal CSS) đặt trong phần `<head>` của trang web. Thẻ `<link>` dùng kết nối tệp CSS ngoài, còn `<script>` dùng cho JavaScript."
        },
        {
            type: "multiple",
            question: "Cú pháp CSS nào sau đây là đúng để tất cả các màu nền của thẻ tiêu đề h1 đều có màu xanh?",
            options: [
                "h1 {background-color: \"blue\";}",
                "h1. * {background-color: blue; }",
                "all.h1 {background-color: blue; }",
                "h1 {background-color: blue; }"
            ],
            correct: 3,
            explanation: "Cú pháp định nghĩa thuộc tính CSS đúng là `selector { thuộc-tính: giá-trị; }`. Đối với giá trị màu sắc từ khóa như `blue`, ta không đặt trong dấu nháy kép. Do đó `h1 {background-color: blue; }` là chính xác."
        },
        {
            type: "multiple",
            question: "Lĩnh vực nào sau đây KHÔNG được phát triển mạnh nhờ ứng dụng của Trí tuệ nhân tạo (AI)?",
            options: [
                "Sản xuất thiết bị tiện ích thông minh",
                "Điều khiển tự động",
                "Xây dựng nhà, đường, cầu",
                "Tài chính ngân hàng"
            ],
            correct: 2,
            explanation: "Ngành xây dựng phần thô (xây nhà, đường, cầu) chủ yếu dựa vào kỹ thuật xây dựng, vật lý kết cấu và cơ khí nặng, sức lao động trực tiếp. AI ít tác động tạo nên sự phát triển đột phá trực tiếp ở lĩnh vực thi công này so với các ngành tự động hóa, tài chính hay thiết bị thông minh."
        },
        {
            type: "multiple",
            question: "Thành phần nào của biểu mẫu cho phép chọn được nhiều giá trị trong số nhiều lựa chọn?",
            options: [
                "radio",
                "select",
                "textbox",
                "checkbox"
            ],
            correct: 3,
            explanation: "Hộp kiểm `checkbox` cho phép người dùng đánh dấu chọn nhiều mục độc lập cùng một lúc. Nút chọn `radio` chỉ cho phép chọn duy nhất 1 mục trong nhóm."
        },
        {
            type: "multiple",
            question: "Thẻ HTML nào sau đây được sử dụng để liệt kê các danh mục trong một danh sách?",
            options: [
                "<li>",
                "<item>",
                "<ol>",
                "<ul>"
            ],
            correct: 0,
            explanation: "Thẻ `<li>` (List Item) dùng để định nghĩa từng mục con trong danh sách. Thẻ `<ol>` và `<ul>` dùng để bọc ngoài để chỉ định loại danh sách có thứ tự hay không thứ tự."
        },
        {
            type: "multiple",
            question: "Phương án nào sau đây là kĩ năng KHÔNG cần thiết đối với nhân lực trong nghề bảo mật hệ thống thông tin?",
            options: [
                "Kĩ năng phát hiện và phòng ngừa các cuộc tấn công mạng.",
                "Kĩ năng phân tích và đánh giá các rủi ro bảo mật.",
                "Kĩ năng phân tích dữ liệu và phát hiện lỗ hổng bảo mật.",
                "Kĩ năng phân tích và quản trị CSDL."
            ],
            correct: 3,
            explanation: "Kĩ năng phân tích và quản trị CSDL là chuyên môn sâu của kỹ sư CSDL (DBA), không phải là kĩ năng cốt lõi bắt buộc đối với nhân sự chuyên trách về an toàn thông tin và bảo mật mạng."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây là đúng về giao thức FTP?",
            options: [
                "Là giao thức để duyệt web",
                "Là giao thức để gửi email",
                "Là giao thức để truyền tải tập tin giữa máy tính và máy chủ",
                "Là giao thức để chia sẻ dữ liệu giữa các máy tính trong cùng mạng LAN"
            ],
            correct: 2,
            explanation: "FTP (File Transfer Protocol) là giao thức chuẩn mạng máy tính dùng để sao chép, truyền tải tập tin giữa máy khách (client) và máy chủ (server) trên mạng."
        },
        {
            type: "multiple",
            question: "Mệnh đề nào sau đây là SAI khi nói về việc kết nối máy tính và Access Point?",
            options: [
                "Tất cả Access Point khi truy cập đều cần mật khẩu.",
                "Access Point có thể cung cấp kết nối Internet cho nhiều máy tính cùng lúc.",
                "Máy tính có thể kết nối với Access Point bằng cáp Ethernet hoặc Wi-fi.",
                "Access Point cần được kết nối với Router hoặc Modem để cung cấp truy cập Internet."
            ],
            correct: 0,
            explanation: "Không phải mọi Access Point đều yêu cầu mật khẩu. Có những mạng Wi-Fi công cộng mở (Open AP) cho phép truy cập trực tiếp không cần nhập mật khẩu bảo mật."
        },
        {
            type: "multiple",
            question: "Thuộc tính nào sau đây được sử dụng để hiển thị các nút điều khiển start, stop và tăng giảm âm lượng cho một video?",
            options: [
                "start, stop và control",
                "controls",
                "start và volume",
                "start, stop và volume"
            ],
            correct: 1,
            explanation: "Trong thẻ `<video>`, thuộc tính `controls` được dùng để hiển thị giao diện điều khiển đa phương tiện chuẩn của trình duyệt (gồm nút phát/tạm dừng, thanh trượt thời gian, nút âm lượng và toàn màn hình)."
        },
        {
            type: "multiple",
            question: "Thiết bị nào sau đây có chức năng cung cấp kết nối không dây cho các thành phần trong một mạng?",
            options: [
                "Hub",
                "Switch",
                "Access Point",
                "Router"
            ],
            correct: 2,
            explanation: "Access Point (điểm truy cập không dây) đóng vai trò làm cầu nối phát sóng vô tuyến Wi-Fi cho các thiết bị đầu cuối không dây kết nối vào mạng nội bộ."
        },
        {
            type: "multiple",
            question: "Đối với nhóm nghề Sửa chữa và bảo trì máy tính, yêu cầu cần có kiến thức và kĩ năng gì?",
            options: [
                "Hiểu biết về lập trình máy tính và thành thạo một ngôn ngữ lập trình.",
                "Nắm vững về quản lí dự án công nghệ thông tin.",
                "Kĩ năng sửa chữa và thay thế linh kiện phần cứng máy tính.",
                "Kiến thức về phân tích dữ liệu."
            ],
            correct: 2,
            explanation: "Nhóm nghề sửa chữa và bảo trì máy tính tập trung vào kỹ năng chẩn đoán lỗi phần cứng, tháo lắp, thay thế linh kiện hỏng và cài đặt nâng cấp hệ thống phần mềm cơ bản."
        },
        {
            type: "multiple",
            question: "Trong một cuộc họp trực tuyến, bạn Sơn nhận ra rằng một số người tham gia đang bị gián đoạn bởi tiếng ồn từ môi trường xung quanh. Phương án nào sau đây là hành động phù hợp để gìn giữ tính nhân văn và tôn trọng người khác?",
            options: [
                "Gửi một email sau cuộc họp nhắc nhở về vấn đề này.",
                "Phản ứng bằng cách nâng giọng lên để yêu cầu mọi người lắng nghe.",
                "Gửi tin nhắn riêng đề nghị họ tắt mic trong lúc không phát biểu.",
                "Gửi tin nhắn công khai nhắc nhở tất cả mọi người về vấn đề này."
            ],
            correct: 2,
            explanation: "Gửi tin nhắn riêng (private message) cho cá nhân phát ra tiếng ồn là giải pháp tinh tế, tôn trọng quyền riêng tư của họ, không làm họ ngượng ngùng trước cả phòng họp mà vẫn giải quyết được vấn đề tiếng ồn hiệu quả."
        },
        {
            type: "multiple",
            question: "Nhiệm vụ nào sau đây là công việc chính của một kĩ sư quản trị mạng?",
            options: [
                "Xây dựng các hệ thống quản lí CSDL trên mạng để lưu trữ thông tin quan trọng của doanh nghiệp.",
                "Cài đặt phần cứng và phần mềm cho hệ thống mạng.",
                "Phát triển và triển khai các biện pháp bảo mật mạng để ngăn chặn các cuộc tấn công từ hacker.",
                "Phân tích và xác định nhu cầu về hệ thống thông tin của tổ chức."
            ],
            correct: 1,
            explanation: "Công việc cốt lõi của một kĩ sư quản trị mạng (Network Administrator) bao gồm thiết kế sơ đồ, kéo dây, đấu nối thiết bị phần cứng (switch, router) và cài đặt cấu hình các phần mềm điều khiển, quản trị lưu lượng mạng."
        },
        {
            type: "multiple",
            question: "Cổng nào trên một thiết bị máy tính được dùng để cắm trực tiếp dây cáp mạng có đầu RJ45?",
            options: [
                "Cổng USB",
                "Cổng Ethernet",
                "Cổng HDMI",
                "Cổng nguồn"
            ],
            correct: 1,
            explanation: "Cổng Ethernet (thường gọi là cổng LAN) trên máy tính là giao tiếp vật lý chuẩn thiết kế vừa vặn để cắm đầu cắm mạng RJ45 của dây cáp xoắn đôi."
        },
        {
            type: "multiple",
            question: "Có một tệp ảnh kích thước 600x800. Đoạn lệnh sau đây sẽ hiển thị ảnh có kích thước là bao nhiêu trên trình duyệt?\n`<img src = \"hnue.jpeg\" alt = \"hnue\" width = \"300\"/>`",
            options: [
                "400x300",
                "300x400",
                "300x600",
                "600x800"
            ],
            correct: 1,
            explanation: "Khi chỉ định một chiều kích thước (ở đây là `width = \"300\"`), trình duyệt sẽ tự động điều chỉnh chiều còn lại (`height`) theo đúng tỷ lệ khung hình gốc (aspect ratio) của tệp ảnh để tránh làm ảnh bị méo mó. Tỷ lệ gốc width/height = 600/800 = 3/4. Do đó height mới = 300 / (3/4) = 400. Kích thước hiển thị là 300x400 (rộng 300, cao 400)."
        },
        {
            type: "multiple",
            question: "Phương án nào sau đây không là ứng dụng của AI?",
            options: [
                "OneDrive của Microsoft",
                "Siri của Apple",
                "ChatGPT",
                "Google Assistant của Google"
            ],
            correct: 0,
            explanation: "OneDrive là dịch vụ lưu trữ dữ liệu đám mây trực tuyến thông thường của Microsoft. Các ứng dụng Siri, Google Assistant (trợ lý ảo điều khiển bằng giọng nói) và ChatGPT (mô hình ngôn ngữ lớn) đều là các sản phẩm ứng dụng công nghệ trí tuệ nhân tạo."
        },

        // =============================================
        // PHẦN II – Đúng/Sai (6 câu)
        // =============================================
        {
            type: "truefalse",
            question: "Gia đình bạn Kiên cần lắp đặt hệ thống mạng Internet để các thành viên trong nhà (diện tích 70 m2) có nhu cầu sử dụng bao gồm 03 máy tính để bàn và một số điện thoại thông minh. Ngoài ra, 03 máy tính này cần được kết nối với nhau để có thể truyền dữ liệu ngay cả khi không có Internet. Sau đây là một số nhận xét của bạn Kiên sau khi hệ thống đã được lắp đặt:",
            options: [
                "Có thể sử dụng cáp xoắn đôi để kết nối các máy tính thành một mạng LAN.",
                "Có thể sử dụng một Access Point để cho phép truy cập Internet không dây.",
                "Sử dụng mạng không dây sẽ có tốc độ nhanh hơn sử dụng cáp xoắn đôi khi thực hiện chia sẻ các tệp trong trường hợp không có Internet.",
                "Có thể sử dụng một Switch để kết nối giữa các máy tính với nhau và giữa các máy tính với Internet."
            ],
            correct: { 0: true, 1: true, 2: false, 3: true },
            explanation: "a) ĐÚNG: Cáp xoắn đôi (cáp mạng mạng LAN thông dụng) giúp liên kết vật lý trực tiếp tốc độ cao giữa các máy để bàn.\nb) ĐÚNG: Cần thêm Access Point để phát Wi-Fi cho các thiết bị di động (điện thoại thông minh).\nc) SAI: Kết nối có dây bằng cáp xoắn đôi (thường là Gigabit Ethernet) luôn mang lại tốc độ truyền file nội bộ nhanh và ổn định hơn so với sóng Wi-Fi không dây.\nd) ĐÚNG: Switch đóng vai trò bộ chuyển mạch trung tâm kết nối 3 máy tính để bàn lại với nhau tạo mạng nội bộ LAN, đồng thời kết nối ra modem/router để truy cập Internet."
        },
        {
            type: "truefalse",
            question: "Một nhóm học sinh sử dụng phần mềm hệ quản trị CSDL để tạo lập một CSDL bán hàng bao gồm bảng CHI_TIẾT_HÓA_ĐƠN lưu thông tin chi tiết về các mặt hàng và số lượng được mua trong các đơn hàng. Trong đó, trường Ma_hoa_don là khóa chính của bảng HÓA_ĐƠN (lưu thông tin chung của hóa đơn). Trường Ma_mat_hang là khóa chính của bảng MẶT_HÀNG (lưu thông tin về các mặt hàng). Trong một hóa đơn có thể có nhiều mặt hàng được mua, một mặt hàng có thể được mua trong nhiều đơn hàng. Xét các nhận định sau:",
            options: [
                "Định nghĩa trường Ma_hoa_don và trường Ma_mat_hang với tên là ma_hoa_don, Ma_mat_hang và kiểu dữ liệu là chuỗi kí tự.",
                "Do hai trường Ma_hoa_don và Ma_mat_hang là khóa chính của các bảng khác nên chọn hai trường này và thiết đặt làm khóa chính cho bảng.",
                "Bảng này lưu trữ thông tin về đơn hàng nên chọn trường Ma_hoa_don và thiết đặt làm khóa chính cho bảng.",
                "Chọn hai trường Ma_hoa_don, Ma_mat_hang và thiết đặt chúng thành khóa của bảng."
            ],
            correct: { 0: true, 1: false, 2: false, 3: true },
            explanation: "a) ĐÚNG: Các trường mã định danh thường được chọn kiểu ký tự (chuỗi ký tự) để linh hoạt lưu trữ các định dạng mã có chữ và số.\nb) SAI: Việc chọn cả 2 trường làm khóa chính (khóa phức hợp) cho bảng chi tiết hóa đơn là vì sự kết hợp của chúng giúp định danh duy nhất mỗi bản ghi mặt hàng trong hóa đơn đó, không phải đơn giản vì chúng là khóa chính ở bảng khác.\nc) SAI: Một hóa đơn có thể mua nhiều mặt hàng. Nếu chỉ chọn duy nhất `Ma_hoa_don` làm khóa chính thì mỗi hóa đơn chỉ có thể lưu tối đa 1 mặt hàng (vi phạm tính duy nhất của khóa chính khi có mặt hàng thứ 2 trong cùng hóa đơn).\nd) ĐÚNG: Khóa chính của bảng liên kết n-n (CHI_TIET_HOA_DON) phải là khóa phức hợp tạo bởi tổ hợp hai trường `Ma_hoa_don` và `Ma_mat_hang`."
        },
        {
            type: "truefalse",
            question: "(Khoa học Máy tính) Cho hàm tìm giá trị lớn nhất trong mảng A gồm n phần tử bằng Python và C++:\n*Python*:\n```python\ndef FindMax(A, n):\n    max_val = A[0]\n    for i in range(1, n):\n        if A[i] > max_val:\n            max_val = A[i]\n    return max_val\n```\n*C++*:\n```cpp\nint FindMax (int A[], int n) {\n    int max_val = A[0];\n    for (int i = 1; i < n; i ++) {\n        if (A[i] > max_val) {\n            max_val = A[i];\n        }\n    }\n    return max_val;\n}\n```\nXét các nhận định về đoạn chương trình trên:",
            options: [
                "Thuật toán này có độ phức tạp thời gian phụ thuộc vào số lượng phần tử n trong mảng.",
                "Vòng lặp for thực hiện việc duyệt qua từng phần tử của mảng từ chỉ số 1 đến n-1.",
                "Nếu dữ liệu đầu vào là A = [3, 8, 2, 9, 5], biến max_val sẽ cập nhật giá trị mới 3 lần trong suốt quá trình chạy.",
                "Đoạn mã trên thực hiện thuật toán sắp xếp mảng theo thứ tự tăng dần."
            ],
            correct: { 0: true, 1: true, 2: false, 3: false },
            explanation: "a) ĐÚNG: Vòng lặp chạy n-1 lần, số thao tác so sánh tăng tuyến tính theo kích thước mảng n, độ phức tạp thời gian là O(n).\nb) ĐÚNG: Biến chạy i duyệt từ 1 đến n-1 (range(1, n) trong Python, i < n trong C++).\nc) SAI: Ban đầu max_val = A[0] = 3. Khi duyệt mảng:\n- i=1 (A[1]=8 > 3): cập nhật max_val = 8 (lần 1)\n- i=2 (A[2]=2 < 8): không cập nhật\n- i=3 (A[3]=9 > 8): cập nhật max_val = 9 (lần 2)\n- i=4 (A[4]=5 < 9): không cập nhật\nTổng cộng max_val chỉ cập nhật giá trị mới 2 lần, không phải 3 lần.\nd) SAI: Thuật toán chỉ tìm kiếm giá trị lớn nhất trong mảng, không thay đổi vị trí các phần tử để sắp xếp mảng."
        },
        {
            type: "truefalse",
            question: "(Khoa học Máy tính) Một nhóm học sinh được giáo viên yêu cầu tìm hiểu và thảo luận về nhận dạng chữ viết tay trong học máy. Sau đây là một số ý kiến của nhóm học sinh về nhận dạng chữ viết tay:",
            options: [
                "Việc thu thập dữ liệu chữ viết tay có thể thực hiện thông qua việc quét các tài liệu giấy và chuyển chúng thành dữ liệu số để xử lí.",
                "Việc trích xuất ra các đặc trưng là bước không cần thiết trong quá trình nhận dạng chữ viết tay vì máy tính có thể nhận dạng trực tiếp từ hình ảnh.",
                "Các thuật toán nhận dạng chữ viết tay không cần phải được huấn luyện trên một lượng lớn dữ liệu vì chúng đã được thiết kế để nhận dạng mọi loại chữ viết.",
                "Một số thuật toán được sử dụng trong nhận dạng chữ viết tay là HOG (Histogram of Oriented Gradient), SVM (Support Vector Machine)."
            ],
            correct: { 0: true, 1: false, 2: false, 3: true },
            explanation: "a) ĐÚNG: Quét và số hóa tài liệu giấy là phương pháp phổ biến để xây dựng bộ dữ liệu ảnh chữ viết tay đầu vào.\nb) SAI: Trích xuất đặc trưng (như đường nét, hình dáng) là bước cốt lõi giúp chuyển đổi ảnh thô thành dạng thông tin biểu diễn cô đọng để giải thuật học máy có thể phân loại chính xác.\nc) SAI: Chữ viết tay của mỗi người rất khác nhau. Các giải thuật học máy cần lượng dữ liệu huấn luyện khổng lồ và đa dạng phong cách nét viết để đảm bảo độ chính xác cao.\nd) ĐÚNG: HOG là kỹ thuật trích xuất đặc trưng hình ảnh hiệu quả, còn SVM là giải thuật học máy phân lớp mạnh mẽ thường được kết hợp để nhận dạng chữ viết."
        },
        {
            type: "truefalse",
            question: "(Tin học Ứng dụng) Một nhóm học sinh sử dụng phần mềm hệ quản trị CSDL để tạo lập một CSDL quản lí nhân viên trong một công ty bao gồm bảng NHAN_VIEN lưu thông tin về các nhân viên. Trong đó, mỗi nhân viên có một mã nhân viên khác nhau theo quy định riêng của công ty. Mỗi nhân viên có một số thẻ căn cước công dân duy nhất. Xét các nhận định sau:",
            options: [
                "Mỗi nhân viên có một mã nhân viên duy nhất và có số căn cước công dân riêng nên hai trường Ma_nhan_vien và Can_cuoc_cong_dan phải là khóa chính của bảng NHAN_VIEN.",
                "Trường Can_cuoc_cong_dan có thể chọn làm khóa chính của bảng NHAN_VIEN vì mỗi nhân viên có số thẻ căn cước công dân khác nhau.",
                "Định nghĩa trường Can_cuoc_cong_dan và So_dien_thoai với tên là Can_cuoc_cong_dan, So_dien_thoai và kiểu dữ liệu là số nguyên.",
                "Định nghĩa trường Ma_nhan_vien với tên Ma_nhan_vien, có kiểu dữ liệu là kiểu kí tự có độ dài cố định và thiết đặt làm khóa chính cho bảng."
            ],
            correct: { 0: false, 1: true, 2: false, 3: true },
            explanation: "a) SAI: Chỉ cần chọn một trong hai trường duy nhất làm khóa chính của bảng (thông thường là `Ma_nhan_vien`). Không bắt buộc cả hai cùng làm khóa chính đồng thời (khóa chính phức hợp).\nb) ĐÚNG: Số CCCD là duy nhất và không rỗng cho mỗi nhân viên, do đó về mặt lý thuyết hoàn toàn có thể chọn làm khóa chính.\nc) SAI: Số CCCD và Số điện thoại tuy gồm các chữ số nhưng không dùng để tính toán toán học và có thể bắt đầu bằng chữ số `0`. Do đó chúng cần được định nghĩa kiểu chuỗi kí tự (text/varchar) thay vì kiểu số nguyên.\nd) ĐÚNG: Mã nhân viên thường được thiết kế theo quy chuẩn có độ dài cố định (ví dụ CHAR(5) cho mã như NV001) và làm khóa chính là thiết kế tối ưu."
        },
        {
            type: "truefalse",
            question: "(Tin học Ứng dụng) Lớp em có dự án bán hàng trực tuyến một số sản phẩm thủ công để có kinh phí giúp trẻ em ở một huyện vùng cao có bữa ăn đủ dinh dưỡng. Nhóm phụ trách xây dựng website đã thực hiện tham khảo từ Internet và đưa ra một số báo cáo trong buổi họp nhóm như sau:",
            options: [
                "Các phần mềm tạo website miễn phí không cho phép tạo website để bán hàng trực tuyến.",
                "Tại đầu trang của trang chủ bắt buộc phải có logo, tên của website và kèm theo khẩu hiệu của dự án.",
                "Tại trang chủ, nhóm xây dựng website muốn hiển thị nhiều hình ảnh minh họa và kèm chú thích tình hình bữa ăn không đảm bảo dinh dưỡng của các em. Có từ 7 đến 10 hình ảnh tự động luân phiên thay đổi sau mỗi khoảng 3 giây. Nhóm xây dựng website có thể sử dụng đối tượng thanh trượt hình ảnh trong phần mềm tạo website để thực hiện yêu cầu này.",
                "Tại trang nhận đơn hàng, sử dụng biểu mẫu để khách điền thông tin họ tên, địa chỉ nhận hàng, số điện thoại liên hệ, các sản phẩm cần mua và số lượng. Sử dụng đối tượng ô đánh dấu để cho khách hàng lựa chọn “Không cần gọi điện xác nhận đơn hàng”."
            ],
            correct: { 0: false, 1: false, 2: true, 3: true },
            explanation: "a) SAI: Rất nhiều nền tảng xây dựng website miễn phí hiện nay hỗ trợ sẵn các mô-đun tạo cửa hàng thương mại điện tử cơ bản.\nb) SAI: Không có quy định kỹ thuật bắt buộc phải có đầy đủ cả 3 yếu tố này ở đầu trang chủ, mặc dù bố cục này rất phổ biến và chuyên nghiệp.\nc) ĐÚNG: Đối tượng thanh trượt hình ảnh (Image Carousel/Slider) là cấu phần giao diện lý tưởng để tự động xoay vòng trình chiếu các bức ảnh theo thời gian định sẵn.\nd) ĐÚNG: Ô đánh dấu (checkbox) là đối tượng biểu mẫu hoàn hảo cho các tùy chọn bật/tắt (như đồng ý điều khoản, yêu cầu xác nhận đơn hàng)."
        }
    ]
};
