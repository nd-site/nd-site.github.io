const quizData = {
  config: {
    subject: "Giáo dục Quốc phòng - An ninh 10",
    info: "63 câu - HKI 25-26 ver1"
  },
  questions: [
    {
      type: "multiple",
      question: "Hệ thống văn bản quy phạm pháp luật về trật tự an toàn giao thông do chủ thể nào ban hành?",
      options: ["Các tổ chức xã hội","Nhà nước","Lực lượng công an","Các trường học"],
      correct: 1,
      explanation: "Nhà nước là chủ thể ban hành văn bản pháp luật."
    },
    {
      type: "multiple",
      question: "Pháp luật về trật tự an toàn giao thông điều chỉnh hoạt động trên các loại hình giao thông nào?",
      options: [
        "Đường bộ, đường sắt, đường thủy, đường hàng không",
        "Đường bộ, đường sắt, đường biển, đường vũ trụ",
        "Đường bộ, đường hầm, đường thủy nội địa, đường hàng không",
        "Đường bộ, đường sắt, đường ống, đường hàng không"
      ],
      correct: 0,
      explanation: "Pháp luật điều chỉnh trên 4 loại hình chính."
    },
    {
      type: "multiple",
      question: "Theo nội dung bài học, vi phạm pháp luật về trật tự an toàn giao thông là hành vi trái pháp luật, có lỗi và do người có năng lực nào thực hiện?",
      options: ["Năng lực tài chính","Năng lực thể chất","Năng lực trách nhiệm pháp lý","Năng lực chuyên môn"],
      correct: 2,
      explanation: "Chỉ người có năng lực trách nhiệm pháp lý mới bị coi là vi phạm."
    },
    {
      type: "multiple",
      question: "Đâu không phải là một dấu hiệu để xác định hành vi vi phạm pháp luật về trật tự an toàn giao thông?",
      options: [
        "Hành vi trái với quy định của pháp luật",
        "Có lỗi của người thực hiện hành vi",
        "Người thực hiện phải có thu nhập cao",
        "Hành vi của người tham gia giao thông có thể nhận biết được"
      ],
      correct: 2,
      explanation: "Thu nhập cao không liên quan đến việc xác định vi phạm."
    },
    {
      type: "multiple",
      question: "Hoạt động hướng đến việc triệt tiêu các nguyên nhân, điều kiện của vi phạm pháp luật về trật tự an toàn giao thông được gọi là gì?",
      options: ["Đấu tranh chống vi phạm","Phòng ngừa vi phạm","Xử lý vi phạm","Cưỡng chế thi hành"],
      correct: 1,
      explanation: "Phòng ngừa là nhằm loại bỏ nguyên nhân, điều kiện vi phạm."
    },
    {
      type: "multiple",
      question: "Hoạt động nào sau đây thuộc về 'Đấu tranh chống vi phạm pháp luật về trật tự an toàn giao thông'?",
      options: [
        "Tuyên truyền giáo dục pháp luật",
        "Giảng dạy luật giao thông trong trường học",
        "Áp dụng các biện pháp xử lý hành vi vi phạm",
        "Vận động người thân đội mũ bảo hiểm"
      ],
      correct: 2,
      explanation: "Đấu tranh là xử lý hành vi đã xảy ra."
    },
    {
      type: "multiple",
      question: "Một trong những trách nhiệm của học sinh khi tham gia giao thông là gì?",
      options: [
        "Tự ý thay đổi kết cấu xe để đi nhanh hơn",
        "Tuyên truyền, vận động người thân tham gia phòng ngừa vi phạm",
        "Tham gia điều tiết giao thông thay cho cảnh sát",
        "Truy đuổi người vi phạm giao thông trên đường"
      ],
      correct: 1,
      explanation: "Học sinh có trách nhiệm tuyên truyền, vận động người thân."
    },
    {
      type: "multiple",
      question: "Người tham gia giao thông phải đảm bảo điều kiện nào về mặt nhận thức theo quy định?",
      options: [
        "Có trình độ đại học trở lên",
        "Không mắc bệnh tâm thần và nhận thức được hậu quả hành vi",
        "Đã từng tham gia các khóa huấn luyện quân sự",
        "Phải là người đứng đầu hộ gia đình"
      ],
      correct: 1,
      explanation: "Điều kiện là không mắc bệnh tâm thần và nhận thức được hành vi."
    },
    {
      type: "multiple",
      question: "Biển báo hiệu giao thông đường bộ thuộc về nhóm thiết bị nào trong dạy học?",
      options: ["Học liệu","Thiết bị dạy học","Tài liệu tham khảo","Văn bản pháp luật"],
      correct: 1,
      explanation: "Biển báo là thiết bị dạy học trực quan."
    },
    {
      type: "multiple",
      question: "Đối tượng tuyên truyền về an toàn giao thông của học sinh bao gồm những ai?",
      options: [
        "Chỉ các bạn cùng lớp",
        "Chỉ bố mẹ và anh chị em",
        "Người thân trong gia đình và bạn bè",
        "Lực lượng cảnh sát giao thông"
      ],
      correct: 2,
      explanation: "Đối tượng tuyên truyền là người thân và bạn bè."
    },
    {
      type: "multiple",
      question: "Sự khác biệt cơ bản nhất giữa 'Phòng ngừa' và 'Đấu tranh' trong vi phạm trật tự an toàn giao thông là gì?",
      options: [
        "Phòng ngừa là việc của công an, đấu tranh là việc của học sinh",
        "Phòng ngừa tập trung vào triệt tiêu nguyên nhân, Đấu tranh tập trung vào xử lý hành vi đã xảy ra",
        "Phòng ngừa dùng vũ lực, Đấu tranh dùng lời nói",
        "Cả hai hoạt động đều giống hệt nhau về phương pháp"
      ],
      correct: 1,
      explanation: "Phòng ngừa loại bỏ nguyên nhân, đấu tranh xử lý hành vi đã xảy ra."
    },
    {
      type: "multiple",
      question: "Tại sao người thực hiện hành vi vi phạm giao thông phải là người 'có lỗi'?",
      options: [
        "Vì nếu không có lỗi (do sự kiện bất khả kháng) thì không coi là vi phạm hành chính",
        "Vì người có lỗi mới có tiền nộp phạt",
        "Vì lỗi là yếu tố duy nhất cấu thành vi phạm",
        "Vì pháp luật chỉ phạt những người cố ý vi phạm"
      ],
      correct: 0,
      explanation: "Nếu không có lỗi thì không cấu thành vi phạm."
    },
    {
      type: "multiple",
      question: "Hành vi nào sau đây thể hiện 'Văn hóa giao thông' của học sinh?",
      options: [
        "Bấm còi liên tục để xin đường khi tắc đường",
        "Giúp đỡ người già và trẻ em khi qua đường",
        "Đi hàng ba để nói chuyện cho vui",
        "Vượt đèn vàng để tiết kiệm thời gian"
      ],
      correct: 1,
      explanation: "Giúp đỡ người già, trẻ em thể hiện văn hóa giao thông."
    },
    {
      type: "multiple",
      question: "Câu nào giải thích đúng về 'Hành vi có thể nhận biết được' trong các dấu hiệu vi phạm?",
      options: [
        "Là hành vi suy nghĩ trong đầu của người lái xe",
        "Là hành vi thể hiện ra bên ngoài thế giới khách quan (như vượt đèn đỏ, lạng lách)",
        "Là hành vi được ghi lại trong sách giáo khoa",
        "Là hành vi dự định sẽ làm trong tương lai"
      ],
      correct: 1,
      explanation: "Hành vi phải biểu hiện ra bên ngoài mới nhận biết được."
    },
    {
      type: "multiple",
      question: "Việc học sinh nhắc nhở người thân đội mũ bảo hiểm khi đi xe máy có ý nghĩa gì?",
      options: [
        "Giúp người thân tránh bị công an bắt",
        "Thể hiện quyền lực của học sinh trong gia đình",
        "Là biện pháp phòng ngừa, góp phần giảm thiểu rủi ro và vi phạm",
        "Là hành động đấu tranh trấn áp tội phạm"
      ],
      correct: 2,
      explanation: "Đây là biện pháp phòng ngừa, giảm rủi ro."
    },
    {
      type: "multiple",
      question: "Theo bài học, tại sao cần phải phối hợp với các lực lượng chức năng?",
      options: [
        "Để được miễn trừ trách nhiệm khi vi phạm",
        "Để bảo đảm trật tự an toàn giao thông hiệu quả hơn",
        "Để lấy thành tích thi đua cho lớp",
        "Để được nổi tiếng trên mạng xã hội"
      ],
      correct: 1,
      explanation: "Phối hợp giúp đảm bảo hiệu quả hơn."
    },
    {
      type: "multiple",
      question: "Biện pháp nào dưới đây là hình thức 'Sân khấu hóa' trong tuyên truyền giao thông?",
      options: [
        "Phát tờ rơi tại ngã tư",
        "Dán áp phích lên tường",
        "Diễn kịch, hò, vè về chủ đề an toàn giao thông",
        "Đọc loa phát thanh của xã"
      ],
      correct: 2,
      explanation: "Sân khấu hóa là diễn kịch, hò, vè."
    },
    {
      type: "multiple",
      question: "Tại sao học sinh cần 'mặc trang phục phù hợp, gọn gàng' khi tham gia giao thông?",
      options: [
        "Để tránh vướng víu, đảm bảo khả năng quan sát và điều khiển phương tiện an toàn",
        "Để đẹp đội hình khi đi cùng các bạn",
        "Để người đi đường chú ý đến mình",
        "Để thể hiện phong cách thời trang cá nhân"
      ],
      correct: 0,
      explanation: "Trang phục gọn gàng giúp an toàn khi điều khiển phương tiện."
    },
    {
      type: "multiple",
      question: "Nội dung nào phản ánh đúng mối quan hệ giữa các quy định pháp luật và hành vi của người tham gia giao thông?",
      options: [
        "Hành vi của người dân luôn đúng, pháp luật phải chạy theo hành vi",
        "Pháp luật điều chỉnh hành vi, hành vi trái pháp luật sẽ bị xử lý",
        "Pháp luật chỉ mang tính chất tham khảo, không bắt buộc",
        "Hành vi giao thông không liên quan đến pháp luật"
      ],
      correct: 1,
      explanation: "Pháp luật điều chỉnh hành vi, trái pháp luật sẽ bị xử lý."
    },
    {
      type: "multiple",
      question: "Ý nghĩa của việc 'Tự giác tuân thủ quy định pháp luật' đối với học sinh là gì?",
      options: [
        "Giúp học sinh không phải học bài môn GDQP",
        "Hình thành thói quen tốt, bảo vệ tính mạng bản thân và cộng đồng",
        "Để đối phó với sự kiểm tra của thầy cô giáo",
        "Để chứng tỏ mình hiểu biết hơn các bạn khác"
      ],
      correct: 1,
      explanation: "Tự giác tuân thủ giúp hình thành thói quen tốt và bảo vệ an toàn."
    },
    {
      type: "multiple",
      question: "Trên đường đi học về, bạn A thấy một nhóm thanh niên đang tổ chức đua xe trái phép. Hành động đúng đắn nhất của A là gì?",
      options: [
        "Đứng lại cổ vũ và quay video đăng lên Facebook",
        "Tham gia đua cùng cho vui",
        "Tránh xa khu vực nguy hiểm và báo ngay cho cơ quan công an hoặc người lớn tin cậy",
        "Chạy ra giữa đường chặn xe để khuyên ngăn"
      ],
      correct: 2,
      explanation: "Tránh xa và báo cho cơ quan chức năng là hành động an toàn, đúng đắn."
    },
    {
      type: "essay",
      question: "Bạn B đi xe đạp điện đến trường nhưng quên không đội mũ bảo hiểm. Khi bị C nhắc nhở, B nói: 'Gần đến trường rồi, không sao đâu'. Nếu là C, em sẽ xử lý tình huống này như thế nào để thể hiện trách nhiệm học sinh?",
      suggested: "Giải thích cho B hiểu về nguy hiểm và quy định pháp luật, khuyên B nên đội mũ."
    },
    {
      type: "multiple",
      question: "Trong một buổi sinh hoạt lớp, giáo viên yêu cầu đề xuất một hoạt động để hưởng ứng tháng An toàn giao thông. Em sẽ chọn phương án nào?",
      options: [
        "Tổ chức cuộc thi 'Rung chuông vàng' tìm hiểu Luật Giao thông đường bộ",
        "Yêu cầu tất cả học sinh nghỉ học để đi diễu hành",
        "Đề nghị nhà trường cấm học sinh đi xe đến trường",
        "Tổ chức thu tiền phạt các bạn vi phạm để làm quỹ lớp"
      ],
      correct: 0,
      explanation: "Cuộc thi kiến thức là hình thức thiết thực, hiệu quả."
    },
    {
      type: "multiple",
      question: "Tuyệt đối không thực hiện các hành vi nào dưới đây?",
      options: [
        "Đe dọa, lừa đảo, trộm cắp, hủy hoại tài sản người khác",
        "Mượn, vay của bạn bè tiền bạc để tiêu xài cá nhân",
        "Viết giấy mời họp, đưa thư cho người thân",
        "Giúp đỡ người khác làm bài tập"
      ],
      correct: 0,
      explanation: "Đe dọa, lừa đảo, trộm cắp là hành vi vi phạm pháp luật."
    },
    {
      type: "multiple",
      question: "Phạm quyển nào có thể xử lý kịp thời vi phạm pháp luật về an ninh trật tự?",
      options: [
        "Pháp luật về an ninh trật tự",
        "Quyết định của chính quyền địa phương",
        "Tất cả các câu trên",
        "Không câu nào đúng"
      ],
      correct: 0,
      explanation: "Pháp luật về an ninh trật tự là cơ sở xử lý vi phạm."
    },
    {
      type: "multiple",
      question: "Hành vi nào dưới đây vi phạm pháp luật?",
      options: ["Ăn trộm","Học tập nghiêm túc","Tham gia bảo vệ môi trường","Giúp đỡ người khác"],
      correct: 0,
      explanation: "Ăn trộm là hành vi vi phạm pháp luật."
    },
    {
      type: "multiple",
      question: "Công an nhân dân thực hiện nhiệm vụ gì?",
      options: ["Áp dụng pháp luật","Công an nhân dân","Dân quân tự vệ","Kiểm lâm"],
      correct: 0,
      explanation: "Công an nhân dân áp dụng pháp luật để bảo vệ trật tự."
    },
    {
      type: "multiple",
      question: "Cảnh sát biển, công an nhân dân làm nhiệm vụ gì?",
      options: ["Chiến tranh cứu hộ","Điện biến hòa bình","Bạo loạn xã hội","Xâm lược vũ trang"],
      correct: 3,
      explanation: "Nhiệm vụ là chống xâm lược vũ trang, bảo vệ chủ quyền."
    },
    {
      type: "multiple",
      question: "Trong hệ thống chính trị, chủ thể nào có trách nhiệm đề ra đường lối, chính sách và lãnh đạo công tác bảo vệ an ninh quốc gia?",
      options: ["Nhà nước","Đảng Cộng sản Việt Nam","Mặt trận Tổ quốc","Các tổ chức xã hội"],
      correct: 1,
      explanation: "Đảng Cộng sản Việt Nam lãnh đạo công tác bảo vệ an ninh quốc gia."
    },
    {
      type: "multiple",
      question: "Nhà nước thực hiện vai trò gì trong công tác bảo vệ an ninh quốc gia và bảo đảm trật tự, an toàn xã hội?",
      options: [
        "Lãnh đạo tuyệt đối",
        "Quản lý xã hội bằng pháp luật",
        "Trực tiếp chiến đấu vũ trang",
        "Tuyên truyền miệng"
      ],
      correct: 1,
      explanation: "Nhà nước quản lý xã hội bằng pháp luật."
    },
    {
      type: "multiple",
      question: "Lực lượng nào làm nòng cốt cùng toàn dân đánh giặc ở địa phương, cơ sở khi có chiến tranh?",
      options: ["Bộ đội chủ lực","Công an nhân dân","Dân quân tự vệ","Bộ đội biên phòng"],
      correct: 2,
      explanation: "Dân quân tự vệ là lực lượng nòng cốt tại cơ sở."
    },
    {
      type: "multiple",
      question: "Một trong những nhiệm vụ cụ thể của công dân là phát hiện và cung cấp kịp thời thông tin liên quan đến hoạt động xâm phạm an ninh quốc gia cho ai?",
      options: ["Bạn bè và người thân","Chính quyền hoặc cơ quan chuyên trách nơi gần nhất","Các trang mạng xã hội","Báo chí nước ngoài"],
      correct: 1,
      explanation: "Công dân phải báo cho chính quyền hoặc cơ quan chuyên trách."
    },
    {
      type: "multiple",
      question: "Hoạt động phòng ngừa, phát hiện, đấu tranh, ngăn chặn làm thất bại các hoạt động xâm phạm an ninh quốc gia được gọi là gì?",
      options: ["Bảo đảm trật tự xã hội","Bảo vệ an ninh quốc gia","Giữ gìn trật tự công cộng","Phòng chống tệ nạn xã hội"],
      correct: 1,
      explanation: "Đây là hoạt động bảo vệ an ninh quốc gia."
    },
    {
      type: "multiple",
      question: "Tại sao tình hình bảo vệ an ninh quốc gia hiện nay được đánh giá là diễn biến phức tạp?",
      options: [
        "Do các nước trên thế giới đã ngừng giao thương với nhau",
        "Do các thế lực thù địch tìm mọi cách xóa bỏ vai trò lãnh đạo của Đảng và chế độ XHCN",
        "Do dân số thế giới giảm mạnh",
        "Do không còn xung đột vũ trang trên thế giới"
      ],
      correct: 1,
      explanation: "Các thế lực thù địch chống phá chế độ XHCN."
    },
    {
      type: "multiple",
      question: "Đặc điểm nổi bật về phương thức hoạt động của các loại tội phạm hiện nay là gì?",
      options: [
        "Hoạt động công khai, không che giấu",
        "Chỉ hoạt động ở vùng sâu, vùng xa",
        "Thủ đoạn ngày càng tinh vi, xảo quyệt",
        "Giảm dần về số lượng và mức độ nguy hiểm"
      ],
      correct: 2,
      explanation: "Tội phạm ngày càng tinh vi, xảo quyệt."
    },
    {
      type: "multiple",
      question: "Nhiệm vụ của Dân quân tự vệ khác với Quân đội nhân dân ở điểm cơ bản nào?",
      options: [
        "Dân quân tự vệ trang bị vũ khí",
        "Dân quân tự vệ hoạt động bảo vệ Đảng, chính quyền và tài sản địa phương, cơ sở",
        "Dân quân tự vệ chỉ làm nhiệm vụ kinh tế",
        "Dân quân tự vệ không chịu sự lãnh đạo của Đảng"
      ],
      correct: 1,
      explanation: "Dân quân tự vệ bảo vệ Đảng, chính quyền và tài sản tại cơ sở."
    },
    {
      type: "multiple",
      question: "Hành động nào sau đây KHÔNG phải là trách nhiệm của học sinh trong việc bảo vệ an ninh quốc gia?",
      options: [
        "Tham gia tuyên truyền chống phá Nhà nước",
        "Phát hiện, báo cáo hành vi vi phạm",
        "Tuân thủ pháp luật",
        "Góp phần giữ gìn trật tự xã hội"
      ],
      correct: 0,
      explanation: "Học sinh không được tham gia tuyên truyền chống phá."
    },
    {
      type: "multiple",
      question: "Ý nghĩa của việc công dân kiểm ngưới với chính quyền khắc phục sơ hở, thiếu sót trong thực hiện pháp luật là gì?",
      options: [
        "Để gây khó khăn cho cơ quan nhà nước",
        "Từ đó thể hiện các hành vi vi phạm pháp luật",
        "Không thực hiện các hành vi vi phạm pháp luật",
        "Ngăn chặn hành vi vi phạm pháp luật của bạn bè"
      ],
      correct: 2,
      explanation: "Giúp ngăn chặn vi phạm pháp luật."
    },
    {
      type: "multiple",
      question: "Sự khác biệt giữa 'Bảo vệ an ninh quốc gia' và 'Bảo đảm trật tự, an toàn xã hội' nằm ở đối tượng đấu tranh chủ yếu nào?",
      options: [
        "An ninh quốc gia tập trung chống xâm lược và chống phá chế độ; trật tự an toàn xã hội tập trung xử lý vi phạm pháp luật xã hội",
        "Để được nhận tiến thưởng",
        "An ninh quốc gia là việc của quân đội; trật tự xã hội là việc của người dân",
        "An ninh quốc gia chỉ lo về biên giới; trật tự xã hội là việc giao thông"
      ],
      correct: 0,
      explanation: "Khác biệt nằm ở đối tượng đấu tranh."
    },
    {
      type: "multiple",
      question: "Khi phát hiện một nhóm người đang tuyên truyền các nội dung sai lệch, chống phá Nhà nước trên mạng xã hội, hành động đúng đắn của học sinh là gì?",
      options: [
        "Chia sẻ bài viết để mọi người cùng biết",
        "Vào bình luận tranh cãi gay gắt",
        "Tố cáo hành vi này với cơ quan chức năng hoặc thầy cô giáo, bố mẹ",
        "Không quan tâm vì không ảnh hưởng đến mình"
      ],
      correct: 2,
      explanation: "Phải báo cho cơ quan chức năng hoặc người có trách nhiệm."
    },
    {
      type: "multiple",
      question: "Theo nội dung bài học, 'An ninh quốc gia' được hiểu là sự ổn định và phát triển bền vững của chế độ nào?",
      options: ["Chế độ phong kiến","Chế độ tư bản chủ nghĩa","Chế độ xã hội chủ nghĩa","Chế độ quân chủ"],
      correct: 2,
      explanation: "An ninh quốc gia gắn với sự ổn định của chế độ XHCN."
    },
    {
      type: "multiple",
      question: "Trạng thái xã hội có trật tự, kỷ cương, trong đó mọi người được sống yên ổn trên cơ sở các quy phạm pháp luật và chuẩn mực đạo đức được gọi là gì?",
      options: ["An ninh quốc gia","Trật tự, an toàn xã hội","Trật tự công cộng","Phòng chống tệ nạn"],
      correct: 1,
      explanation: "Đây là khái niệm trật tự, an toàn xã hội."
    },
    {
      type: "multiple",
      question: "Lực lượng nào được xác định là nòng cốt trong việc bảo vệ an ninh quốc gia và bảo đảm trật tự, an toàn xã hội?",
      options: ["Công an nhân dân","Quân đội nhân dân","Dân quân tự vệ","Mặt trận Tổ quốc"],
      correct: 0,
      explanation: "Công an nhân dân là lực lượng nòng cốt."
    },
    {
      type: "multiple",
      question: "Đâu là lực lượng nòng cốt bảo vệ sự bất khả xâm phạm độc lập, chủ quyền, thống nhất toàn vẹn lãnh thổ của Tổ quốc?",
      options: ["Công an nhân dân","Quân đội nhân dân","Dân quân tự vệ","Cảnh sát biển"],
      correct: 1,
      explanation: "Quân đội nhân dân bảo vệ chủ quyền lãnh thổ."
    },
    {
      type: "multiple",
      question: "Chiến lược mà các thế lực thù địch, phản động đang thực hiện để chống phá nước ta được nhắc đến trong bài là gì?",
      options: ["Chiến tranh kinh tế","Diễn biến hòa bình","Hợp tác quốc tế","Bảo vệ môi trường"],
      correct: 1,
      explanation: "Chiến lược chống phá là 'Diễn biến hòa bình'."
    },
    {
      type: "multiple",
      question: "An ninh mạng được định nghĩa là sự bảo đảm hoạt động trên không gian mạng không gây ra điều gì cho an ninh quốc gia, trật tự, an toàn xã hội?",
      options: ["Ảnh hưởng","Thiệt hại","Nguy hại","Biến động"],
      correct: 2,
      explanation: "An ninh mạng là không gây nguy hại cho quốc gia, xã hội."
    },
    {
      type: "multiple",
      question: "Khái niệm 'Mạng' theo bài học dùng để chỉ hệ thống nào sau đây?",
      options: ["Mạng lưới giao thông","Mạng lưới điện quốc gia","Hệ thống cơ sở hạ tầng thông tin","Mạng lưới kênh rạch"],
      correct: 2,
      explanation: "Mạng là hệ thống cơ sở hạ tầng thông tin."
    },
    {
      type: "multiple",
      question: "Hành vi nào sau đây được xem là vi phạm pháp luật về an ninh mạng?",
      options: ["Đăng ảnh cá nhân lên Facebook","Tham gia các diễn đàn học thuật","Tuyên truyền, xuyên tạc lịch sử","Tra cứu tài liệu trên Google"],
      correct: 2,
      explanation: "Tuyên truyền, xuyên tạc lịch sử là hành vi vi phạm."
    },
    {
      type: "multiple",
      question: "Mục đích của việc các thế lực thù địch sử dụng không gian mạng là để thực hiện chiến lược gì?",
      options: ["Chiến tranh kinh tế","Diễn biến hòa bình","Hợp tác quốc tế","Bảo vệ môi trường"],
      correct: 1,
      explanation: "Mục đích là thực hiện chiến lược 'Diễn biến hòa bình'."
    },
    {
      type: "multiple",
      question: "Mục tiêu cơ bản của Luật An ninh mạng là bảo vệ an ninh quốc gia và đảm bảo điều gì?",
      options: ["An toàn giao thông","An toàn thông tin","An ninh lương thực","An ninh biên giới"],
      correct: 1,
      explanation: "Luật An ninh mạng nhằm bảo vệ an ninh quốc gia và an toàn thông tin."
    },
    {
      type: "multiple",
      question: "Khi sử dụng mạng xã hội, công dân có trách nhiệm gì đối với thông tin cá nhân của mình?",
      options: [
        "Công khai tất cả thông tin để mọi người biết",
        "Cung cấp mật khẩu cho bạn bè thân thiết",
        "Bảo mật thông tin cá nhân",
        "Bán thông tin cá nhân cho các công ty quảng cáo"
      ],
      correct: 2,
      explanation: "Công dân phải bảo mật thông tin cá nhân."
    },
    {
      type: "multiple",
      question: "Đâu là một trong những loại hình nội dung bị Luật An ninh mạng nghiêm cấm?",
      options: [
        "Truyền bá văn hóa ẩm thực",
        "Thông tin có nội dung khiêu dâm, bạo lực",
        "Chia sẻ bài giảng trực tuyến",
        "Đăng tải kết quả học tập"
      ],
      correct: 1,
      explanation: "Luật nghiêm cấm nội dung khiêu dâm, bạo lực."
    },
    {
      type: "multiple",
      question: "Các đối tượng sử dụng mạng để truyền bá, lôi kéo học sinh tham gia tệ nạn xã hội nhằm mục đích gì?",
      options: [
        "Gây dựng phong trào văn nghệ",
        "Làm tha hóa đạo đức, lối sống, gây mất trật tự an toàn xã hội",
        "Tăng cường kỹ năng sống cho học sinh",
        "Giúp học sinh giải tỏa căng thẳng"
      ],
      correct: 1,
      explanation: "Mục đích là làm tha hóa đạo đức, gây mất trật tự."
    },
    {
      type: "multiple",
      question: "Việc làm nào sau đây giúp học sinh tự bảo vệ thông tin cá nhân trên mạng?",
      options: [
        "Chia sẻ mật khẩu với bạn bè",
        "Đăng công khai số CMND",
        "Đưa thông tin cá nhân lên mạng xã hội",
        "Không bao giờ cung cấp mật khẩu, mã OTP cho bất kỳ ai"
      ],
      correct: 3,
      explanation: "Không cung cấp mật khẩu, mã OTP cho ai để bảo vệ thông tin."
    },
    {
      type: "multiple",
      question: "Tại sao các đối tượng phạm tội lại tập trung vào việc lôi kéo, kích động học sinh tham gia các hoạt động vi phạm pháp luật?",
      options: [
        "Vì học sinh có nhiều tiền",
        "Vì học sinh là lứa tuổi dễ bị kích động, thiếu kinh nghiệm xã hội và nhận thức chưa đầy đủ",
        "Vì học sinh có quyền lực xã hội",
        "Vì học sinh có khả năng lãnh đạo"
      ],
      correct: 1,
      explanation: "Học sinh dễ bị kích động, thiếu kinh nghiệm và nhận thức chưa đầy đủ."
    },
    {
      type: "multiple",
      question: "Hành vi nào sau đây được gọi là 'xâm phạm thông tin cá nhân' theo Luật An ninh mạng?",
      options: [
        "Chia sẻ thông tin với sự đồng ý",
        "Lén lút thu thập, sử dụng thông tin cá nhân của người khác khi chưa được sự đồng ý",
        "Đăng ảnh cá nhân lên mạng",
        "Tra cứu tài liệu học tập"
      ],
      correct: 1,
      explanation: "Thu thập, sử dụng trái phép thông tin cá nhân là xâm phạm."
    },
    {
      type: "multiple",
      question: "Khi nhận được một tin nhắn lạ yêu cầu cung cấp mật khẩu ngân hàng để 'nhận thưởng', em nên làm gì?",
      options: [
        "Cung cấp ngay để nhận thưởng",
        "Chia sẻ với bạn bè",
        "Tuyệt đối không cung cấp và xóa tin nhắn, đồng thời báo cáo cho cơ quan chức năng",
        "Đăng lên mạng xã hội cho vui"
      ],
      correct: 2,
      explanation: "Không cung cấp, xóa tin nhắn và báo cáo cho cơ quan chức năng."
    },
    {
      type: "multiple",
      question: "Biện pháp nào sau đây thể hiện tinh thần 'phòng, chống' hành vi vi phạm pháp luật trên không gian mạng?",
      options: [
        "Tin theo mọi thông tin trên mạng",
        "Chủ động cảnh giác, không tin theo, không chia sẻ thông tin xấu độc, tuyên truyền cho bạn bè",
        "Đăng tải thông tin sai lệch",
        "Phớt lờ mọi cảnh báo"
      ],
      correct: 1,
      explanation: "Phòng chống bằng cách cảnh giác, không chia sẻ thông tin xấu."
    },
    {
      type: "multiple",
      question: "Việc công dân phải 'cung cấp thông tin cá nhân và thông tin có liên quan đến việc sử dụng không gian mạng' cho cơ quan chức năng khi cần thiết có ý nghĩa gì?",
      options: [
        "Để quảng bá bản thân",
        "Là cơ sở để phục vụ điều tra, xử lý các hành vi vi phạm pháp luật",
        "Để được nổi tiếng",
        "Để tham gia mạng xã hội"
      ],
      correct: 1,
      explanation: "Cung cấp thông tin giúp cơ quan chức năng điều tra, xử lý vi phạm."
    },
    {
      type: "multiple",
      question: "Học sinh không nên tin tưởng tuyệt đối vào thông tin từ nguồn nào khi liên quan đến các vấn đề chính trị, xã hội nhạy cảm?",
      options: [
        "Trang web chính thống",
        "Sách giáo khoa",
        "Các tài khoản mạng xã hội ẩn danh, không rõ nguồn gốc",
        "Thông tin từ thầy cô"
      ],
      correct: 2,
      explanation: "Không nên tin vào tài khoản ẩn danh, không rõ nguồn gốc."
    },
    {
      type: "multiple",
      question: "Hành vi sử dụng không gian mạng để xúi giục, lôi kéo, kích động người khác phạm tội bị nghiêm cấm vì nó xâm hại đến lợi ích nào của đất nước?",
      options: [
        "An toàn giao thông",
        "An ninh lương thực",
        "An ninh quốc gia, trật tự an toàn xã hội",
        "An ninh biên giới"
      ],
      correct: 2,
      explanation: "Hành vi này xâm hại an ninh quốc gia, trật tự xã hội."
    },
    {
      type: "multiple",
      question: "Khi tham gia vào các hoạt động trên mạng, yếu tố nào giúp học sinh tự bảo vệ bản thân và tránh trở thành đối tượng bị lợi dụng?",
      options: [
        "Tin mọi thông tin",
        "Có khả năng nhận diện, phân biệt đúng - sai, thật - giả",
        "Chia sẻ mật khẩu",
        "Đăng thông tin cá nhân công khai"
      ],
      correct: 1,
      explanation: "Khả năng nhận diện đúng - sai giúp tự bảo vệ bản thân."
    },
    {
      type: "multiple",
      question: "Việc tự ý sửa đổi, sao chép, chia sẻ, truyền bá thông tin riêng của người khác mà chưa được phép sẽ gây ra hậu quả chủ yếu gì?",
      options: [
        "Tăng uy tín cho người khác",
        "Xâm phạm quyền riêng tư và gây thiệt hại về uy tín, tinh thần cho người khác",
        "Giúp lan truyền thông tin nhanh hơn",
        "Không gây hậu quả gì"
      ],
      correct: 1,
      explanation: "Hành vi này xâm phạm quyền riêng tư, gây thiệt hại tinh thần."
    },
    {
    type: "essay",
    question: "Bạn A vô tình chia sẻ một bài viết trên Facebook có nội dung xuyên tạc, bịa đặt về một vấn đề chính trị trong nước. Bài viết này đến từ một tài khoản ẩn danh, không rõ nguồn gốc. Em đã biết đây là thông tin sai sự thật. Với vai trò là một công dân có trách nhiệm và dựa trên tinh thần của Luật An ninh mạng, em sẽ làm gì để xử lý tình huống này một cách hợp lý và hiệu quả nhất?",
    suggested: "- Hành động tức thời (Ngăn chặn): Nhắn tin hoặc nói chuyện trực tiếp với bạn A, giải thích rõ ràng đây là tin giả, thông tin xấu độc và có nội dung vi phạm pháp luật (xuyên tạc, chống phá Nhà nước). Yêu cầu bạn A gỡ bỏ bài viết ngay lập tức và không tiếp tục chia sẻ.\n\n- Phòng ngừa cho bản thân và cộng đồng: Báo cáo (report) bài viết đó với nền tảng mạng xã hội (Facebook) là vi phạm chính sách hoặc tin giả. Tuyên truyền, cảnh báo cho các bạn khác trong nhóm hoặc lớp về nguồn tin đó và cách nhận biết thông tin sai lệch để không bị lôi kéo.\n\n- Tuyên truyền, vận dụng luật: Giải thích cho bạn A hiểu rõ trách nhiệm của công dân trên không gian mạng và các quy định của Luật An ninh mạng về việc không được truyền bá thông tin sai sự thật, tránh bị xử phạt."
    },
    {
    type: "essay",
    question: "Việc học sinh sử dụng tài khoản mạng xã hội (Facebook, TikTok,...) để thường xuyên đăng tải chi tiết lịch trình học tập, địa điểm check-in, hình ảnh kèm vị trí GPS có thể dẫn đến những nguy cơ tiềm ẩn nào đối với an toàn thông tin cá nhân và trật tự, an toàn xã hội? Hãy nêu ít nhất 03 nguy cơ và giải pháp phòng tránh.",
    suggested: "+) Nguy cơ tiềm ẩn:\n- Nguy cơ bị lộ lọt, lạm dụng thông tin cá nhân: Thông tin bị tội phạm mạng thu thập để tạo hồ sơ giả mạo, lừa đảo người thân, hoặc sử dụng vào mục đích xấu.\n- Nguy cơ bị theo dõi, rình rập: Việc công khai địa điểm, lịch trình (ví dụ: đang đi học, vắng nhà) tạo điều kiện cho kẻ xấu (trộm cắp, bắt cóc, quấy rối) nắm bắt được thời gian và không gian hoạt động.\n- Nguy cơ bị bạo lực mạng, bắt nạt: Kẻ xấu lợi dụng các hình ảnh, nội dung đăng tải để chế giễu, bôi nhọ, đe dọa, làm tổn hại đến tinh thần của học sinh.\n\n+) Giải pháp phòng tránh:\n- Hạn chế chia sẻ thông tin cá nhân quá chi tiết: Tắt tính năng định vị (GPS) khi đăng ảnh. Không công khai số điện thoại, địa chỉ nhà, số CMND/CCCD.\n- Thiết lập quyền riêng tư: Chỉ chia sẻ thông tin ở chế độ 'Bạn bè' hoặc 'Chỉ mình tôi' (hoặc những người được tin cậy).\n- Cảnh giác với người lạ: Không chấp nhận lời mời kết bạn từ tài khoản lạ hoặc tài khoản đáng ngờ."
    },
    {
    type: "essay",
    question: "Việc học sinh sử dụng tài khoản mạng xã hội (Facebook, TikTok,...) để thường xuyên đăng tải chi tiết lịch trình học tập, địa điểm check-in, hình ảnh kèm vị trí GPS có thể dẫn đến những nguy cơ tiềm ẩn nào đối với an toàn thông tin cá nhân và trật tự, an toàn xã hội? Hãy nêu ít nhất 03 nguy cơ và giải pháp phòng tránh.",
    suggested: "+) Nguy cơ tiềm ẩn:\n- Nguy cơ bị lộ lọt, lạm dụng thông tin cá nhân: Thông tin bị tội phạm mạng thu thập để tạo hồ sơ giả mạo, lừa đảo người thân, hoặc sử dụng vào mục đích xấu.\n- Nguy cơ bị theo dõi, rình rập: Việc công khai địa điểm, lịch trình (ví dụ: đang đi học, vắng nhà) tạo điều kiện cho kẻ xấu (trộm cắp, bắt cóc, quấy rối) nắm bắt được thời gian và không gian hoạt động.\n- Nguy cơ bị bạo lực mạng, bắt nạt: Kẻ xấu lợi dụng các hình ảnh, nội dung đăng tải để chế giễu, bôi nhọ, đe dọa, làm tổn hại đến tinh thần của học sinh.\n\n+) Giải pháp phòng tránh:\n- Hạn chế chia sẻ thông tin cá nhân quá chi tiết: Tắt tính năng định vị (GPS) khi đăng ảnh. Không công khai số điện thoại, địa chỉ nhà, số CMND/CCCD.\n- Thiết lập quyền riêng tư: Chỉ chia sẻ thông tin ở chế độ 'Bạn bè' hoặc 'Chỉ mình tôi' (hoặc những người được tin cậy).\n- Cảnh giác với người lạ: Không chấp nhận lời mời kết bạn từ tài khoản lạ hoặc tài khoản đáng ngờ."
    }
  ]
};