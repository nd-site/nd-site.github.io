window.quizData = {
    title: "Đề thi thử TN THPT 2026 – Cụm 7 trường phía Đông Hải Phòng (Đợt 2)",
    pageTitle: "Tin học 12 – Đề Hải Phòng Cụm 7 Lần 2 (2026)",
    examInfo: {
        department: "",
        school: "Cụm 7 trường THPT phía Đông",
        province: "Hải Phòng",
        examName: "Thi thử tốt nghiệp THPT",
        attempt: "Đợt 2",
        date: "2026",
        subject: "Tin học",
        grade: "Lớp 12"
    },
    config: {
        testDuration: 3000,
        examLayout: {
            multiple: { count: 24, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 }
        }
    },
    questions: [
        // =============================================
        // PHẦN I – Trắc nghiệm 4 lựa chọn (24 câu)
        // =============================================
        {
            type: "multiple",
            question: "Trí tuệ nhân tạo (AI) là",
            options: [
                "Khả năng của máy tính thực hiện các công việc cơ học.",
                "Khả năng của máy tính thực hiện các công việc trí tuệ của con người.",
                "Khả năng của máy tính chơi trò chơi.",
                "Khả năng của máy tính xử lý dữ liệu nhanh hơn."
            ],
            correct: 1,
            explanation: "Trí tuệ nhân tạo (AI) là lĩnh vực khoa học máy tính tập trung vào việc tạo ra các hệ thống có khả năng thực hiện các nhiệm vụ đòi hỏi trí tuệ của con người như học hỏi, lý luận, giải quyết vấn đề, nhận thức và ngôn ngữ."
        },
        {
            type: "multiple",
            question: "AI được sử dụng trong tài chính ngân hàng để làm gì?",
            options: [
                "Thiết kế logo.",
                "Phát hiện các giao dịch đáng ngờ và gian lận.",
                "Quản lý kho hàng.",
                "Tối ưu hóa quảng cáo."
            ],
            correct: 1,
            explanation: "Trong lĩnh vực tài chính – ngân hàng, AI được ứng dụng chủ yếu để phân tích hành vi giao dịch bất thường và phát hiện gian lận trong thời gian thực, bảo vệ tài khoản khách hàng."
        },
        {
            type: "multiple",
            question: "Nhận định nào sau đây là SAI khi nói về sự ảnh hưởng của AI trong tương lai?",
            options: [
                "AI tăng cường sự tự động hóa trong các công việc.",
                "AI có thể thay thế con người trong một số lĩnh vực.",
                "AI tạo ra nguy cơ về an ninh mạng và quyền riêng tư.",
                "AI luôn an toàn và có lợi cho con người."
            ],
            correct: 3,
            explanation: "AI không luôn luôn an toàn và có lợi. AI có thể bị sử dụng sai mục đích, tạo ra deepfake, xâm phạm quyền riêng tư, hoặc gây ra rủi ro an ninh mạng. Do đó nhận định \"AI luôn an toàn và có lợi cho con người\" là SAI."
        },
        {
            type: "multiple",
            question: "Lĩnh vực nào liên quan đến việc thu nhận và phân tích nhận dạng hình ảnh?",
            options: [
                "Học máy.",
                "Xử lý ngôn ngữ tự nhiên.",
                "Thị giác máy tính.",
                "AI tạo sinh."
            ],
            correct: 2,
            explanation: "Thị giác máy tính (Computer Vision) là lĩnh vực AI chuyên về việc giúp máy tính \"nhìn\" và hiểu thế giới qua hình ảnh và video – bao gồm nhận diện đối tượng, phân tích cảnh quay và phân loại hình ảnh."
        },
        {
            type: "multiple",
            question: "Thiết bị nào sau đây được coi là thiết bị đầu cuối?",
            options: [
                "Switch.",
                "Router.",
                "Máy tính cá nhân.",
                "Modem."
            ],
            correct: 2,
            explanation: "Thiết bị đầu cuối (End device) là thiết bị trực tiếp phục vụ người dùng như máy tính cá nhân, điện thoại thông minh, máy in... Còn Switch, Router, Modem là các thiết bị mạng trung gian dùng để kết nối và định tuyến dữ liệu."
        },
        {
            type: "multiple",
            question: "Thiết bị nào trong mạng LAN có nhiệm vụ chuyển tiếp dữ liệu giữa các thiết bị?",
            options: [
                "Router.",
                "Modem.",
                "Switch.",
                "Access Point."
            ],
            correct: 2,
            explanation: "Switch (bộ chuyển mạch) là thiết bị kết nối các thiết bị trong cùng một mạng LAN và chuyển tiếp dữ liệu đến đúng thiết bị đích dựa trên địa chỉ MAC."
        },
        {
            type: "multiple",
            question: "Chức năng nào sau đây của hệ điều hành hỗ trợ người dùng trao đổi dữ liệu?",
            options: [
                "Kiểm soát các hoạt động thực thi ứng dụng.",
                "Quản lý bộ nhớ.",
                "Kiểm soát hiệu suất hệ thống.",
                "Chức năng mạng."
            ],
            correct: 3,
            explanation: "Chức năng mạng (Networking) của hệ điều hành giúp kết nối các máy tính với nhau và với Internet, cho phép người dùng trao đổi, chia sẻ dữ liệu trong mạng."
        },
        {
            type: "multiple",
            question: "Cách làm nào sau đây là đúng khi muốn chia sẻ ổ đĩa cho người dùng khác trong cùng một mạng để đọc, xem dữ liệu?",
            options: [
                "Nháy phải chuột vào ổ đĩa cần chia sẻ/Properties/Advanced Sharing, chọn nhóm hoặc tên người dùng cần chia sẻ, chọn mức phân quyền Full Control.",
                "Nháy phải chuột vào ổ đĩa cần chia sẻ/Properties/Advanced Sharing, chọn nhóm hoặc tên người dùng cần chia sẻ, chọn mức phân quyền Change.",
                "Nháy phải chuột vào ổ đĩa cần chia sẻ/Properties/Advanced Sharing, chọn nhóm hoặc tên người dùng cần chia sẻ, chọn mức phân quyền Read.",
                "Nháy phải chuột vào ổ đĩa cần chia sẻ/Properties/Advanced Sharing, chọn nhóm hoặc tên người dùng cần chia sẻ, chọn cả 3 mức phân quyền (Full Control, Change, Read)."
            ],
            correct: 2,
            explanation: "Khi chỉ muốn người dùng đọc/xem dữ liệu (không được sửa hay xóa), ta chọn mức phân quyền **Read** (Đọc). Full Control cho phép mọi thao tác; Change cho phép thêm/sửa/xóa."
        },
        {
            type: "multiple",
            question: "Phần tử nào được sử dụng để xác định phần đầu của một tài liệu HTML?",
            options: [
                "<body>",
                "<footer>",
                "<head>",
                "<header>"
            ],
            correct: 2,
            explanation: "Thẻ `<head>` trong HTML chứa các thông tin meta về tài liệu như tiêu đề trang, liên kết CSS, script... Không hiển thị trực tiếp ra màn hình. Còn `<header>` là phần tử semantic của nội dung trang."
        },
        {
            type: "multiple",
            question: "Phương án nào sau đây mô tả đúng về HTML?",
            options: [
                "Ngôn ngữ lập trình.",
                "Ngôn ngữ soạn thảo văn bản.",
                "Là bộ quy tắc dùng để trình bày cấu trúc, nội dung và hình thức trang Web.",
                "Ngôn ngữ liên kết dữ liệu."
            ],
            correct: 2,
            explanation: "HTML (HyperText Markup Language) không phải là ngôn ngữ lập trình mà là ngôn ngữ đánh dấu định nghĩa cấu trúc và nội dung của trang web. HTML sử dụng các thẻ để mô tả các phần tử như tiêu đề, đoạn văn, liên kết, hình ảnh..."
        },
        {
            type: "multiple",
            question: "Thuộc tính của phần tử HTML KHÔNG có đặc điểm nào sau đây?",
            options: [
                "Nằm trong thẻ mở.",
                "Mỗi phần tử bắt buộc phải có một thuộc tính.",
                "Mỗi phần tử có thể có một hoặc nhiều thuộc tính.",
                "Có phần tử không có thuộc tính nào."
            ],
            correct: 1,
            explanation: "Không phải mọi phần tử HTML đều bắt buộc phải có thuộc tính. Ví dụ: `<br>`, `<hr>` không có thuộc tính bắt buộc. Thuộc tính là tùy chọn và luôn nằm trong thẻ mở."
        },
        {
            type: "multiple",
            question: "Trong các khai báo Cascading Style Sheets (CSS), khai báo nào là đúng cú pháp?",
            options: [
                "h1 {color: Blue;}",
                "h1 color: Blue;",
                "h1= {color: Blue}",
                "h1(color: Blue;)"
            ],
            correct: 0,
            explanation: "Cú pháp CSS chuẩn là: **selector { thuộc-tính: giá-trị; }**. Do đó `h1 {color: Blue;}` là đúng. Các lựa chọn còn lại thiếu dấu ngoặc nhọn hoặc sai cú pháp."
        },
        {
            type: "multiple",
            question: "Nếu muốn đoạn văn bản có nội dung \"Thông tin liên hệ\" chữ màu xanh dương thì đoạn mã HTML nào sau đây là đúng?",
            options: [
                "<p style=\"color: blue;\">Thông tin liên hệ</p>",
                "<p style color=\"blue\">Thông tin liên hệ </p>",
                "<p style=color: \"blue\";>Thông tin liên hệ </p>",
                "<p style=\"color: \"blue\";\">Thông tin liên hệ </p>"
            ],
            correct: 0,
            explanation: "Inline CSS trong HTML phải theo cú pháp: `style=\"thuộc-tính: giá-trị;\"`. Đáp án A là đúng cú pháp. Đáp án B thiếu dấu `=`, C thiếu dấu nháy bao ngoài, D có nháy kép lồng vào nhau không hợp lệ."
        },
        {
            type: "multiple",
            question: "Trong phần thông tin đăng nhập trên trang web được viết bằng HTML, nơi nhập mật khẩu của người dùng chỉ cho phép hiển thị dấu chấm tròn thì thuộc tính type của phần tử input ta cần gán giá trị nào sau đây?",
            options: [
                "\"password\"",
                "\"radio\"",
                "\"button\"",
                "\"text\""
            ],
            correct: 0,
            explanation: "Thuộc tính `type=\"password\"` của thẻ `<input>` làm cho các ký tự nhập vào hiển thị dưới dạng dấu chấm tròn (●) hoặc dấu sao (*) để bảo mật thông tin mật khẩu."
        },
        {
            type: "multiple",
            question: "Nội dung phần body trong tệp home.html có đoạn HTML như sau: `<h2 id=\"dautrang\"> Đầu trang </h2>`. Phương án nào dưới đây là đúng khi khai báo siêu liên kết đến phần tử h2 thông qua định danh \"dautrang\" trong cùng một trang web?",
            options: [
                "<a href=\"dautrang\"> Về đầu trang </a>",
                "<a href=\"#dautrang\"> Về đầu trang </a>",
                "<a href=\"dautrang.html\"> Về đầu trang </a>",
                "<a href=\"https://www.dautrang.vn\"> Về đầu trang </a>"
            ],
            correct: 1,
            explanation: "Để tạo neo (anchor) đến một phần tử trong cùng trang web, ta dùng ký hiệu `#` trước giá trị của thuộc tính id. Cú pháp: `<a href=\"#idPhantử\">`. Do đó đáp án đúng là `<a href=\"#dautrang\">`."
        },
        {
            type: "multiple",
            question: "Để hiển thị nội dung của trang Thongtin.html trong trang web Index.html, thì trong trang Index.html ta sẽ sử dụng câu lệnh nào trong các câu lệnh sau đây?",
            options: [
                "<a href=\"Thongtin.html\" target=\"_blank\"> Thông tin </a>",
                "<a href=\"Thongtin.html\" target=\"_self\"> Thông tin </a>",
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"Thongtin.html\">",
                "<iframe src=\"Thongtin.html\" width=\"300\" height=\"300\"></iframe>"
            ],
            correct: 3,
            explanation: "Thẻ `<iframe>` dùng để nhúng (hiển thị trực tiếp) nội dung của một trang web khác vào trong trang web hiện tại. Các thẻ `<a>` chỉ tạo liên kết điều hướng, không hiển thị nội dung trong trang."
        },
        {
            type: "multiple",
            question: "Muốn định dạng phần văn bản \"Nội dung\" của danh sách có thứ tự bắt đầu bằng kí tự \"C\" ta sử dụng câu lệnh nào trong các câu lệnh sau đây là đúng?",
            options: [
                "<ol type=\"A\" start=\"3\"><li>Nội dung</li></ol>",
                "<ol type=\"A\" start=\"C\"><li>Nội dung</li></ol>",
                "<ol type=\"C\"><li>Nội dung</li></ol>",
                "<ul type=\"A\" start=\"C\"><li>Nội dung</li></ul>"
            ],
            correct: 0,
            explanation: "Để danh sách bắt đầu từ \"C\" (chữ cái thứ 3 trong bảng chữ cái), ta dùng `type=\"A\"` (kiểu chữ cái in hoa) và `start=\"3\"` (bắt đầu từ số thứ 3, tương ứng với C). Đáp án B sai vì `start` nhận giá trị số, không nhận chữ."
        },
        {
            type: "multiple",
            question: "Sau khi thực hiện đoạn chương trình sau:\n```\nS=10\nfor i in range (1, 5) :\n    S=S+i\nprint (S)\n```\nGiá trị của biến S bằng bao nhiêu?",
            options: [
                "20",
                "14",
                "10",
                "0"
            ],
            correct: 0,
            explanation: "Vòng lặp `range(1, 5)` chạy với i = 1, 2, 3, 4.\n- i=1: S = 10+1 = 11\n- i=2: S = 11+2 = 13\n- i=3: S = 13+3 = 16\n- i=4: S = 16+4 = 20\n\nVậy kết quả in ra là **20**."
        },
        {
            type: "multiple",
            question: "Ứng xử nhân văn trên không gian mạng có thể góp phần tạo ra điều gì?",
            options: [
                "Một môi trường mạng tiêu cực.",
                "Sự gia tăng của hành vi bắt nạt trực tuyến.",
                "Một xã hội mạng tích cực.",
                "Tăng nguy cơ lừa đảo trực tuyến."
            ],
            correct: 2,
            explanation: "Ứng xử nhân văn trên không gian mạng – tôn trọng, chia sẻ thông tin tích cực, không phát tán thông tin sai lệch – sẽ góp phần tạo ra một xã hội mạng tích cực, lành mạnh."
        },
        {
            type: "multiple",
            question: "Em dùng mạng xã hội trên máy tính công cộng nhưng quên không thoát đăng nhập. Một người khác đã dùng tài khoản của em nhắn tin cho bạn bè với lời lẽ không hay. Em sẽ làm gì?",
            options: [
                "Đăng lên mạng xã hội để chửi mắng người bạn này.",
                "Nhắn tin lên án, phê bình gay gắt bạn.",
                "Gặp trực tiếp hoặc nhắn tin giải thích và xin lỗi với những người bị nhắn.",
                "Bình luận vào bài của mình để chỉ trích bạn đó."
            ],
            correct: 2,
            explanation: "Cách xử lý nhân văn và có trách nhiệm nhất là gặp trực tiếp hoặc nhắn tin để giải thích sự việc và xin lỗi với những người đã bị nhắn tin không hay. Việc chửi mắng hay lên án công khai đều không giải quyết được vấn đề và làm tình hình tệ hơn."
        },
        {
            type: "multiple",
            question: "Bạn A đọc được một bài viết về bạn B trong lớp. Bạn A rất thích thú với nội dung này. Bạn A đã kiểm tra tính chính xác của thông tin, đảm bảo thông tin không bị cấm. Sau đó bạn A chia sẻ bài viết đó với mọi người để giúp bạn B được nhiều người biết tới. Trong tình huống trên, tính nhân văn thể hiện ở biểu hiện nào dưới đây?",
            options: [
                "Bạn A đã chia sẻ cảm xúc tích cực của bản thân.",
                "Bạn A đã kiểm chứng đảm bảo thông tin đúng sự thật trước khi đăng tải.",
                "Bạn A đã chia sẻ bài viết giúp bạn B được nhiều người biết đến hơn, không cần bạn B đồng ý.",
                "Bạn A đã kiểm chứng đảm bảo các thông tin đúng sự thật và không bị cấm trước khi đăng tải."
            ],
            correct: 3,
            explanation: "Tính nhân văn thể hiện rõ nhất ở việc: kiểm chứng thông tin đúng sự thật VÀ đảm bảo thông tin không bị cấm trước khi chia sẻ. Đây là hành vi có trách nhiệm và tôn trọng cộng đồng mạng."
        },
        {
            type: "multiple",
            question: "Kĩ thuật viên công nghệ thông tin không thực hiện công việc nào sau đây?",
            options: [
                "Lắp đặt thiết bị phần cứng và thiết lập kết nối mạng.",
                "Quản lí thiết bị mạng và điều chỉnh hiệu năng mạng.",
                "Khắc phục lỗi máy tính cho khách hàng.",
                "Cài đặt và nâng cấp phần mềm trên máy tính của nhân viên."
            ],
            correct: 1,
            explanation: "Quản lí thiết bị mạng và điều chỉnh hiệu năng mạng là công việc của kĩ sư/quản trị mạng (Network Administrator/Engineer), không phải kĩ thuật viên CNTT (IT Technician). Kĩ thuật viên CNTT tập trung vào hỗ trợ kĩ thuật, lắp đặt phần cứng, cài đặt phần mềm."
        },
        {
            type: "multiple",
            question: "Để trở thành một kĩ sư quản trị mạng, cần có kiến thức về:",
            options: [
                "Tài chính và kế toán.",
                "Phần cứng máy tính, hệ thống mạng và an toàn thông tin.",
                "Thiết kế đồ họa.",
                "Lập trình di động."
            ],
            correct: 1,
            explanation: "Kĩ sư quản trị mạng cần nắm vững kiến thức về phần cứng máy tính (thiết bị mạng), hệ thống mạng (giao thức, cấu hình) và an toàn thông tin (bảo mật mạng, tường lửa, mã hóa)."
        },
        {
            type: "multiple",
            question: "Em thích công việc thiết kế, xử lí và biên tập âm thanh, hình ảnh cho những sản phẩm số nhưng không đam mê lập trình thì nên chọn nghề nào?",
            options: [
                "Thiết kế truyền thông đa phương tiện.",
                "Thiết kế đồ họa.",
                "Thiết kế web.",
                "Thiết kế giao diện người dùng."
            ],
            correct: 0,
            explanation: "Thiết kế truyền thông đa phương tiện (Multimedia) bao gồm xử lý âm thanh, hình ảnh, video, hoạt hình... Phù hợp với người yêu thích sáng tạo nội dung số mà không cần kĩ năng lập trình sâu như thiết kế web hay UI/UX."
        },

        // =============================================
        // PHẦN II – Đúng/Sai (4 câu, mỗi câu 4 ý)
        // Phần chung (2 câu)
        // =============================================
        {
            type: "truefalse",
            question: "Mạng không dây là loại mạng máy tính sử dụng sóng điện từ để truyền dữ liệu giữa các thiết bị mà không cần sử dụng cáp mạng. Trong mạng cục bộ không dây (Wi-Fi), thiết bị Access Point (AP) có nhiệm vụ cung cấp kết nối không dây cho các thiết bị trong phạm vi phủ sóng của nó. Xét các nhận định sau:",
            options: [
                "Wi-Fi là công nghệ được sử dụng xây dựng mạng cục bộ không dây (WLAN).",
                "Trong mạng Wi-Fi, dữ liệu giữa các thiết bị được truyền thông qua sóng điện tử.",
                "Trong phòng thực hành của trường, nếu hệ thống mạng chỉ có các máy tính để bàn kết nối với Switch bằng cáp mạng thì các thiết bị như điện thoại thông minh hoặc máy tính bảng vẫn có thể kết nối Wi-Fi vào mạng đó mà không cần thêm thiết bị mạng nào khác.",
                "Một học sinh mang máy tính xách tay đến trường và thiết bị nhận được tín hiệu Wi-Fi của trường. Khi đó học sinh chắc chắn có thể truy cập Internet thông qua mạng Wi-Fi này."
            ],
            correct: { 0: true, 1: false, 2: false, 3: false },
            explanation: "a) ĐÚNG: Wi-Fi là công nghệ chuẩn cho mạng cục bộ không dây (WLAN).\nb) SAI: Wi-Fi dùng sóng điện từ (radio) – cụ thể là sóng vô tuyến, không phải \"sóng điện tử\".\nc) SAI: Nếu chỉ có Switch có dây, cần thêm Access Point mới có thể cung cấp sóng Wi-Fi.\nd) SAI: Nhận được tín hiệu Wi-Fi không đảm bảo truy cập được Internet – cần xác thực, mật khẩu, và AP phải kết nối Internet."
        },
        {
            type: "truefalse",
            question: "Trí tuệ nhân tạo đang cách mạng hóa quá trình học tập bằng cách tận dụng học máy, xử lí ngôn ngữ tự nhiên và nhận dạng hình ảnh. Xét các nhận định về việc ứng dụng AI trong giáo dục:",
            options: [
                "Trí tuệ nhân tạo có thể phân tích dữ liệu học tập của học sinh để đề xuất nội dung và lộ trình học tập phù hợp với từng cá nhân.",
                "Để triển khai các hệ thống ứng dụng trí tuệ nhân tạo trong giáo dục, nhà trường nhất thiết phải xây dựng và vận hành hệ thống máy chủ riêng tại trường.",
                "Thông qua hệ thống LAN, từ máy tính đặt tại phòng thực hành, học sinh có thể truy cập vào kho dữ liệu đám mây của nhà trường để tải về các chương trình học được xây dựng riêng cho mình.",
                "Các nhà sư phạm hoàn toàn có thể tin tưởng vào khả năng xây dựng chương trình học tập thông minh của trí tuệ nhân tạo, tự động hóa và cá nhân hóa quá trình học tập của học sinh."
            ],
            correct: { 0: true, 1: false, 2: true, 3: false },
            explanation: "a) ĐÚNG: AI học máy có thể cá nhân hóa lộ trình học tập dựa trên phân tích dữ liệu.\nb) SAI: Nhà trường có thể sử dụng dịch vụ AI đám mây (Cloud AI) mà không cần xây máy chủ riêng.\nc) ĐÚNG: Mạng LAN kết nối với Internet cho phép truy cập kho dữ liệu đám mây của nhà trường.\nd) SAI: AI hiện tại vẫn cần sự giám sát và định hướng của các nhà sư phạm, không thể hoàn toàn tin tưởng tự động."
        },

        // Phần B1 – Khoa học máy tính
        {
            type: "truefalse",
            question: "Học máy đóng vai trò quan trọng trong việc phân tích thị trường. Xét các phát biểu sau về vai trò của học máy trong phân tích thị trường:",
            options: [
                "Học máy có khả năng dự đoán xu hướng và hành vi của người tiêu dùng, cũng như phản ứng của thị trường đối với việc điều chỉnh giá sản phẩm.",
                "Học máy chủ yếu áp dụng trong phòng thí nghiệm hoặc các mô hình ảo, chưa ứng dụng trong thực tế.",
                "Học máy có vai trò quan trọng trong phân tích thị trường, giúp các tổ chức hiểu rõ hơn về thị trường để có thể đưa ra quyết định hợp lí.",
                "Một doanh nghiệp thu thập dữ liệu về lịch sử mua hàng của khách hàng và sử dụng mô hình học máy để phân nhóm khách hàng theo hành vi tiêu dùng, từ đó xây dựng các chương trình khuyến mại phù hợp cho từng nhóm."
            ],
            correct: { 0: true, 1: false, 2: true, 3: true },
            explanation: "a) ĐÚNG: Học máy dùng dữ liệu lịch sử để dự đoán xu hướng và phản ứng thị trường.\nb) SAI: Học máy đã và đang được ứng dụng rộng rãi trong thực tế: gợi ý sản phẩm, phát hiện gian lận, dự báo chuỗi cung ứng...\nc) ĐÚNG: Học máy giúp phân tích dữ liệu lớn để đưa ra quyết định kinh doanh.\nd) ĐÚNG: Đây là ứng dụng phân cụm khách hàng (clustering) điển hình của học máy."
        },

        // Phần B2 – Tin học ứng dụng
        {
            type: "truefalse",
            question: "Để xây dựng phần mềm quản lí thông tin trường học, lập trình viên đã khởi tạo CSDL gồm:\n- GIAOVIEN(MaGV, HoTenGV) – Khóa chính: MaGV\n- LOP(MaLop, TenLop, MaGVChuNhiem) – Khóa chính: MaLop; Khóa ngoại: MaGVChuNhiem\n- HOCSINH(MaSo, HoTen, MaLop) – Khóa chính: MaSo; Khóa ngoại: MaLop\n\nXét các nhận định sau:",
            options: [
                "Để biết họ tên giáo viên chủ nhiệm của lớp có mã lớp \"12A1\", cần sử dụng các bảng LOP và GIAOVIEN.",
                "Để biết tên lớp của học sinh có mã số 12, cần sử dụng các bảng HOCSINH và LOP.",
                "Để in danh sách học sinh gồm các cột MaSo, HoTen, TenLop, HoTenGV, cần sử dụng các bảng HOCSINH, LOP và GIAOVIEN.",
                "Để in danh sách học sinh gồm các cột MaSo, HoTen, HoTenGV, chỉ cần sử dụng các bảng HOCSINH và GIAOVIEN."
            ],
            correct: { 0: true, 1: true, 2: true, 3: false },
            explanation: "a) ĐÚNG: Từ LOP lấy MaGVChuNhiem → tra GIAOVIEN lấy HoTenGV.\nb) ĐÚNG: Từ HOCSINH lấy MaLop → tra LOP lấy TenLop.\nc) ĐÚNG: Cần join 3 bảng: HOCSINH→LOP (TenLop) và LOP→GIAOVIEN (HoTenGV).\nd) SAI: Bảng HOCSINH không liên kết trực tiếp với GIAOVIEN. Phải đi qua bảng LOP (qua MaLop và MaGVChuNhiem)."
        }
    ]
};
