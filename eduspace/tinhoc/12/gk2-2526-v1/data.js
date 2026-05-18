window.quizData = {
    "title": "Kiểm tra Giữa Học Kì II – Tin học 12 (KNTT) – 2025-2026",
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
            "question": "HTML là viết tắt của cụm từ nào?",
            "options": [
                "Hyper Text Markup Language.",
                "High Tech Modern Language.",
                "Hyper Tool Multi Language.",
                "Home Tool Markup Link."
            ],
            "correct": 0,
            "explanation": "HTML là ngôn ngữ đánh dấu siêu văn bản, dùng để tạo cấu trúc cho trang web."
        },
        {
            "type": "multiple",
            "question": "Thẻ nào sau đây dùng để tạo một liên kết (hyperlink) trong HTML?",
            "options": ["<link>", "<a>", "<href>", "<url>"],
            "correct": 1,
            "explanation": "Thẻ <a> (anchor) kết hợp với thuộc tính href dùng để tạo liên kết."
        },
        {
            "type": "multiple",
            "question": "Trong CSS, thuộc tính nào dùng để thay đổi màu chữ của một phần tử?",
            "options": ["font-color", "text-color", "color", "background-color"],
            "correct": 2,
            "explanation": "Thuộc tính 'color' dùng để định dạng màu sắc cho văn bản."
        },
        {
            "type": "multiple",
            "question": "Giao thức nào được sử dụng để truyền tải các trang web trên Internet?",
            "options": ["FTP", "SMTP", "HTTP/HTTPS", "IP"],
            "correct": 2,
            "explanation": "HTTP (Hypertext Transfer Protocol) và phiên bản bảo mật HTTPS là giao thức chuẩn của web."
        },
        {
            "type": "multiple",
            "question": "Thiết bị nào dùng để kết nối các máy tính trong một mạng nội bộ (LAN) và chuyển tiếp dữ liệu đến đúng địa chỉ đích?",
            "options": ["Modem", "Switch", "Repeater", "Card mạng"],
            "correct": 1,
            "explanation": "Switch là thiết bị mạng thông minh giúp tối ưu hóa việc truyền dữ liệu trong LAN."
        },
        {
            "type": "multiple",
            "question": "Địa chỉ IPv4 gồm bao nhiêu bit?",
            "options": ["16 bit.", "32 bit.", "64 bit.", "128 bit."],
            "correct": 1,
            "explanation": "IPv4 gồm 4 nhóm số, mỗi nhóm 8 bit, tổng cộng là 32 bit."
        },
        {
            "type": "multiple",
            "question": "Thẻ HTML nào dùng để chèn một hình ảnh vào trang web?",
            "options": ["<image>", "<img>", "<picture>", "<src>"],
            "correct": 1,
            "explanation": "Thẻ <img> dùng thuộc tính src để chỉ định đường dẫn hình ảnh."
        },
        {
            "type": "multiple",
            "question": "Trong CSS, để căn giữa một khối văn bản, ta dùng giá trị nào cho thuộc tính 'text-align'?",
            "options": ["left", "right", "center", "justify"],
            "correct": 2,
            "explanation": "text-align: center; dùng để căn giữa văn bản."
        },
        {
            "type": "multiple",
            "question": "Tên miền (Domain Name) có vai trò gì?",
            "options": [
                "Lưu trữ toàn bộ nội dung trang web.",
                "Là địa chỉ dễ nhớ thay thế cho địa chỉ IP khó nhớ của máy chủ.",
                "Tăng tốc độ truy cập Internet.",
                "Bảo mật thông tin người dùng."
            ],
            "correct": 1,
            "explanation": "Ví dụ: google.com thay thế cho dãy số IP của máy chủ Google."
        },
        {
            "type": "multiple",
            "question": "Thẻ nào dùng để tạo một danh sách không thứ tự (bullet points)?",
            "options": ["<ol>", "<ul>", "<li>", "<list>"],
            "correct": 1,
            "explanation": "<ul> (Unordered List) dùng cho danh sách không đánh số."
        },
        {
            "type": "multiple",
            "question": "Phần mềm nào sau đây là một trình duyệt web?",
            "options": ["Microsoft Word", "Google Chrome", "Adobe Photoshop", "Windows Explorer"],
            "correct": 1,
            "explanation": "Trình duyệt web dùng để hiển thị nội dung các trang web từ file HTML."
        },
        {
            "type": "multiple",
            "question": "Cấu trúc mạng hình sao (Star Topology) có đặc điểm gì?",
            "options": [
                "Các máy tính nối tiếp nhau thành một vòng tròn.",
                "Tất cả các máy tính nối vào một thiết bị trung tâm (như Hub/Switch).",
                "Tất cả các máy tính dùng chung một đường dây trục duy nhất.",
                "Mỗi máy tính nối trực tiếp với tất cả các máy khác."
            ],
            "correct": 1,
            "explanation": "Mạng hình sao phổ biến nhất hiện nay vì dễ quản lý và sửa chữa."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Xét các phát biểu sau về thiết kế trang web:",
            "options": [
                "HTML quy định cấu trúc nội dung, còn CSS quy định cách hiển thị (định dạng).",
                "Thẻ <head> chứa các thông tin không hiển thị trực tiếp trên trang web như tiêu đề, từ khóa.",
                "Có thể viết CSS trực tiếp trong thẻ HTML bằng thuộc tính 'style'.",
                "Mọi thẻ HTML đều bắt buộc phải có thẻ đóng tương ứng."
            ],
            "correct": [true, true, true, false],
            "explanation": "Một số thẻ như <img>, <br>, <hr> là các thẻ tự đóng, không cần thẻ đóng riêng biệt."
        },
        {
            "type": "truefalse",
            "question": "Về mạng máy tính và bảo mật:",
            "options": [
                "Mạng Internet là mạng diện rộng (WAN) lớn nhất thế giới.",
                "Địa chỉ IPv6 được tạo ra để giải quyết tình trạng cạn kiệt địa chỉ IPv4.",
                "Tường lửa (Firewall) chỉ là một thiết bị phần cứng, không có dạng phần mềm.",
                "Wifi sử dụng sóng vô tuyến để truyền dữ liệu không dây."
            ],
            "correct": [true, true, false, true],
            "explanation": "Tường lửa có cả dạng phần cứng chuyên dụng và phần mềm cài trên máy tính."
        },
        {
            "type": "truefalse",
            "question": "Về HTML nâng cao và đa phương tiện:",
            "options": [
                "Thẻ <table> dùng để tạo bảng dữ liệu trên web.",
                "Định dạng ảnh .png hỗ trợ nền trong suốt (transparent).",
                "Không thể nhèn video từ Youtube vào trang web cá nhân.",
                "Thẻ <meta charset='UTF-8'> giúp trình duyệt hiển thị đúng tiếng Việt."
            ],
            "correct": [true, true, false, true],
            "explanation": "Có thể chèn video từ Youtube thông qua thẻ <iframe>."
        },
        {
            "type": "truefalse",
            "question": "Về quy trình xây dựng website:",
            "options": [
                "Thiết kế giao diện (UI) là bước đầu tiên cần làm trước khi viết code.",
                "Hosting là dịch vụ cho thuê không gian trên máy chủ để lưu trữ website.",
                "Một website chỉ cần file HTML là đủ để hiển thị đẹp mắt và chuyên nghiệp.",
                "SEO là các biện pháp giúp website có thứ hạng cao trên công cụ tìm kiếm."
            ],
            "correct": [true, true, false, true],
            "explanation": "Chỉ có HTML trang web sẽ rất thô sơ, cần CSS để đẹp hơn và Javascript để tương tác."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Viết tên thẻ HTML dùng để tạo tiêu đề lớn nhất (cấp 1).",
            "correct": "h1",
            "explanation": "Thẻ <h1> định dạng tiêu đề chính của trang."
        },
        {
            "type": "short",
            "question": "Thuộc tính nào của thẻ <img> dùng để mô tả văn bản thay thế khi hình ảnh không hiển thị được?",
            "correct": "alt",
            "explanation": "alt (Alternative text) quan trọng cho SEO và người khiếm thị."
        },
        {
            "type": "short",
            "question": "Trong CSS, ký hiệu nào dùng để định dạng cho một phần tử theo ID của nó?",
            "correct": "#",
            "explanation": "Dấu thăng (#) dùng cho ID, dấu chấm (.) dùng cho Class."
        },
        {
            "type": "short",
            "question": "Tên viết tắt của đơn vị cung cấp dịch vụ Internet là gì?",
            "correct": "ISP",
            "explanation": "ISP (Internet Service Provider) như VNPT, FPT, Viettel."
        },
        {
            "type": "short",
            "question": "Cổng mặc định của giao thức HTTP là cổng số mấy?",
            "correct": "80",
            "explanation": "HTTP dùng cổng 80, HTTPS dùng cổng 443."
        },
        {
            "type": "short",
            "question": "Phần mở rộng của file CSS thường là gì? (Ví dụ: .html)",
            "correct": ".css",
            "explanation": "File định dạng kiểu dáng có đuôi .css."
        }
    ]
};