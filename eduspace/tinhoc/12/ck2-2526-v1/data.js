// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Không có trả lời ngắn (MCQ, TF, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Tin Học 12 (Kết nối tri thức) 2025-2026",
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
            question: "Mạng máy tính (Computer Network) là gì?",
            options: [
                "Là hai hay nhiều máy tính được kết nối với nhau để chia sẻ tài nguyên và thông tin",
                "Là phần mềm dùng để lướt web",
                "Là một hệ thống lưu trữ dữ liệu trực tuyến",
                "Là một thiết bị phần cứng để phát sóng Wi-Fi"
            ],
            correct: 0,
            explanation: "Mạng máy tính là tập hợp các thiết bị kết nối để chia sẻ dữ liệu và tài nguyên (máy in, internet...)."
        },
        {
            type: "multiple",
            question: "Giao thức TCP/IP là gì?",
            options: [
                "Một phần mềm diệt virus",
                "Bộ giao thức nền tảng của Internet dùng để truyền tải dữ liệu giữa các máy tính",
                "Một ngôn ngữ lập trình mạng",
                "Chuẩn cáp mạng phổ biến nhất"
            ],
            correct: 1,
            explanation: "TCP/IP (Transmission Control Protocol/Internet Protocol) là bộ giao thức chuẩn của Internet."
        },
        {
            type: "multiple",
            question: "Địa chỉ IP (IPv4) có định dạng như thế nào?",
            options: [
                "Gồm 4 nhóm số phân cách bởi dấu chấm, mỗi số từ 0 đến 255",
                "Gồm chữ cái và số xen kẽ, phân cách bằng dấu gạch ngang",
                "Chỉ gồm các chữ cái viết hoa",
                "Là tên miền của một website (ví dụ: google.com)"
            ],
            correct: 0,
            explanation: "IPv4 gồm 32 bit, chia thành 4 octet (0-255), ví dụ: 192.168.1.1."
        },
        {
            type: "multiple",
            question: "Dịch vụ DNS (Domain Name System) có vai trò gì trên Internet?",
            options: [
                "Bảo vệ máy tính khỏi các phần mềm độc hại",
                "Tăng tốc độ truy cập mạng",
                "Phân giải tên miền (dễ nhớ) thành địa chỉ IP (để máy tính hiểu)",
                "Cung cấp địa chỉ IP động cho các thiết bị"
            ],
            correct: 2,
            explanation: "DNS hoạt động như một 'danh bạ điện thoại', dịch từ tên miền sang IP."
        },
        {
            type: "multiple",
            question: "Thiết bị Router (Bộ định tuyến) có chức năng chính là gì?",
            options: [
                "Hiển thị hình ảnh từ máy tính lên màn hình lớn",
                "Kết nối nhiều mạng khác nhau và chỉ đường (định tuyến) cho các gói tin đi đúng hướng",
                "Lưu trữ dữ liệu thay cho ổ cứng",
                "Kết nối các máy tính trong cùng một phòng"
            ],
            correct: 1,
            explanation: "Router (bộ định tuyến) dùng để kết nối các mạng (như mạng LAN với Internet) và định tuyến gói tin."
        },
        {
            type: "multiple",
            question: "Điện toán đám mây (Cloud Computing) là mô hình cung cấp tài nguyên máy tính qua:",
            options: [
                "Mạng LAN",
                "Internet",
                "Bluetooth",
                "Cáp quang biển"
            ],
            correct: 1,
            explanation: "Cloud computing cung cấp dịch vụ (lưu trữ, phần mềm, máy chủ) qua Internet."
        },
        {
            type: "multiple",
            question: "Web server (Máy chủ web) sử dụng giao thức nào để truyền tải các trang web đến trình duyệt của người dùng?",
            options: [
                "FTP",
                "HTTP/HTTPS",
                "SMTP",
                "POP3"
            ],
            correct: 1,
            explanation: "HTTP (Hypertext Transfer Protocol) và HTTPS (bảo mật) dùng để truyền tải nội dung web."
        },
        {
            type: "multiple",
            question: "HTML là viết tắt của từ gì?",
            options: [
                "Hyper Text Markup Language",
                "High Tech Machine Language",
                "Hyperlinks and Text Markup Language",
                "Home Tool Markup Language"
            ],
            correct: 0,
            explanation: "HTML là Ngôn ngữ đánh dấu siêu văn bản."
        },
        {
            type: "multiple",
            question: "Trong HTML, thẻ nào dùng để tạo ra một liên kết (Hyperlink)?",
            options: [
                "<link>",
                "<a>",
                "<href>",
                "<url>"
            ],
            correct: 1,
            explanation: "Thẻ `<a>` (anchor) kết hợp với thuộc tính `href` để tạo liên kết."
        },
        {
            type: "multiple",
            question: "Đâu là cú pháp đúng để chèn một hình ảnh trong HTML?",
            options: [
                "<img href='image.jpg' alt='MyImage'>",
                "<image src='image.jpg' alt='MyImage'>",
                "<img src='image.jpg' alt='MyImage'>",
                "<picture source='image.jpg'>"
            ],
            correct: 2,
            explanation: "Thẻ `<img>` với thuộc tính `src` (source) chỉ định đường dẫn ảnh và `alt` (văn bản thay thế)."
        },
        {
            type: "multiple",
            question: "CSS (Cascading Style Sheets) được sử dụng để làm gì trong phát triển web?",
            options: [
                "Tạo ra các cơ sở dữ liệu trên máy chủ",
                "Quy định cấu trúc nội dung của trang web",
                "Trang trí, định dạng kiểu dáng (màu sắc, font chữ, bố cục) cho trang web",
                "Thực hiện các phép toán logic trên trình duyệt"
            ],
            correct: 2,
            explanation: "HTML tạo khung xương (cấu trúc), CSS đắp da thịt (định dạng, kiểu dáng)."
        },
        {
            type: "multiple",
            question: "Để chọn phần tử có `id='header'` trong CSS, cú pháp nào sau đây đúng?",
            options: [
                ".header",
                "#header",
                "*header",
                "header"
            ],
            correct: 1,
            explanation: "Trong CSS, dấu `#` đại diện cho `id`, dấu `.` đại diện cho `class`."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Thuộc tính CSS nào dùng để thay đổi màu chữ của phần tử?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "text-color",
                "font-color",
                "color",
                "background-color"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "`color` dùng cho màu chữ, `background-color` dùng cho màu nền."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Malware (Phần mềm độc hại) bao gồm những loại nào?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Chỉ bao gồm Virus",
                "Virus, Trojan, Worm, Ransomware, Spyware...",
                "Các phần mềm hết hạn sử dụng",
                "Các hệ điều hành cũ"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Malware là thuật ngữ chung chỉ các phần mềm gây hại (Virus, Mã độc tống tiền, Gián điệp...)."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Phishing (Tấn công giả mạo) là hình thức tấn công nhằm mục đích gì?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Làm sập hệ thống mạng của một công ty",
                "Lừa đảo người dùng cung cấp thông tin nhạy cảm (mật khẩu, thẻ tín dụng) bằng cách giả mạo một thực thể uy tín",
                "Cài đặt phần mềm diệt virus vào máy tính",
                "Tăng cường bảo mật cho mạng LAN"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Phishing thường dùng email giả mạo hoặc website giả để lừa người dùng nhập thông tin."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Mã hóa dữ liệu (Data Encryption) có tác dụng gì?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Nén dữ liệu để giảm dung lượng lưu trữ",
                "Làm cho máy tính chạy nhanh hơn",
                "Biến đổi dữ liệu thành dạng không thể đọc được nếu không có khóa giải mã, giúp bảo mật thông tin",
                "Sao lưu dữ liệu tự động lên đám mây"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Mã hóa đảm bảo tính bảo mật (Confidentiality) của dữ liệu."
        },
        {
            type: "essay",
            question: "Trình bày sự khác biệt cơ bản giữa địa chỉ IP (IP address) và địa chỉ MAC (MAC address).",
            suggested: "- Địa chỉ MAC: Là địa chỉ vật lý, được nhà sản xuất gán cố định (thường không đổi) vào card mạng (NIC) của thiết bị. Dùng để giao tiếp trong mạng cục bộ (LAN).\n- Địa chỉ IP: Là địa chỉ logic (như địa chỉ nhà), do mạng cung cấp (thường là Router cấp qua DHCP) và có thể thay đổi khi thiết bị di chuyển sang mạng khác. Dùng để định tuyến gói tin trên Internet.",
            points: 25,
            explanation: "AI chấm: MAC là địa chỉ vật lý / cố định / dùng trong LAN (12đ). IP là địa chỉ logic / thay đổi được / dùng để định tuyến trên Internet (13đ)."
        },
        {
            type: "essay",
            question: "Hãy viết đoạn mã HTML kết hợp CSS (Inline CSS hoặc Internal CSS) để tạo một tiêu đề (Heading 1) có nội dung 'Chào mừng đến với môn Tin học' với màu chữ là Đỏ (red) và nằm ở chính giữa trang (center).",
            suggested: "Cách 1 (Inline CSS):\n<h1 style=\"color: red; text-align: center;\">Chào mừng đến với môn Tin học</h1>\n\nCách 2 (Internal CSS):\n<style>\n  h1 { color: red; text-align: center; }\n</style>\n<h1>Chào mừng đến với môn Tin học</h1>",
            points: 25,
            explanation: "AI chấm: Sử dụng đúng thẻ `<h1>` (5đ), thuộc tính `color: red` (10đ), thuộc tính `text-align: center` (10đ)."
        },
        {
            type: "essay",
            question: "Em nhận được một email từ một người xưng là nhân viên ngân hàng, yêu cầu em click vào một đường link và nhập mật khẩu tài khoản để 'xác thực bảo mật' nếu không tài khoản sẽ bị khóa.\n\nHãy chỉ ra rủi ro trong tình huống này và nêu cách xử lý an toàn nhất.",
            suggested: "Rủi ro: Đây là một hình thức lừa đảo Phishing (tấn công giả mạo). Nếu click vào link và nhập mật khẩu, thông tin tài khoản sẽ bị đánh cắp, dẫn đến mất tiền.\n\nCách xử lý: \n1. Tuyệt đối KHÔNG click vào đường link trong email lạ.\n2. KHÔNG cung cấp mật khẩu, OTP cho bất kỳ ai (kể cả người tự xưng là nhân viên ngân hàng).\n3. Liên hệ trực tiếp với tổng đài chính thức của ngân hàng để xác minh hoặc đăng nhập vào App ngân hàng qua điện thoại để kiểm tra thông báo.",
            points: 25,
            explanation: "AI chấm: Chỉ ra được rủi ro lừa đảo lấy thông tin (10đ). Nêu được cách xử lý (không click, không nhập mật khẩu, liên hệ trực tiếp ngân hàng) (15đ)."
        }
    ]
};
