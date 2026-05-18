window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Tiếng Anh (Bản 3)",
    config: {
        testDuration: 3000,
        examLayout: {
            multiple: { count: 40, pointsPerQ: 0.25 }
        }
    },
    questions: [
        // --- READ AND COMPLETE ANNOUNCEMENTS (6 questions: 1 - 6) ---
        {
            type: "multiple",
            question: "<b>Read the announcement and choose the best option for (1):</b><br><br><b>ANNOUNCEMENT: ANNUAL YOUTH SCIENCE FAIR</b><br>The school board is pleased to (1) ______ the upcoming Annual Youth Science Fair, which will be held in the school exhibition hall next Friday.<br>",
            options: ["announce", "announcement", "announcing", "announced"],
            correct: 0,
            explanation: "Cấu trúc 'is pleased to + V-bare' (rất hân hạnh được thông báo...). Do đó chọn động từ nguyên thể 'announce'."
        },
        {
            type: "multiple",
            question: "<b>Read the announcement and choose the best option for (2):</b><br><br>All high school students are eligible (2) ______ participate in this creative event.<br>",
            options: ["to", "for", "in", "at"],
            correct: 0,
            explanation: "Tính từ 'eligible' đi kèm với cấu trúc 'eligible to do something' (có đủ điều kiện/tư cách để làm gì)."
        },
        {
            type: "multiple",
            question: "<b>Read the announcement and choose the best option for (3):</b><br><br>Interested participants must submit their project abstracts (3) ______ than October 15th.<br>",
            options: ["no later", "not late", "latest", "more late"],
            correct: 0,
            explanation: "Cụm từ cố định 'no later than + [mốc thời gian]' mang ý nghĩa 'muộn nhất là/không muộn hơn...'."
        },
        {
            type: "multiple",
            question: "<b>Read the announcement and choose the best option for (4):</b><br><br>The projects will be judged based on their (4) ______ and scientific methods.<br>",
            options: ["original", "originality", "originally", "originate"],
            correct: 1,
            explanation: "Sau tính từ sở hữu 'their' cần một danh từ. 'originality' (tính độc đáo, tính nguyên bản) là danh từ phù hợp nhất."
        },
        {
            type: "multiple",
            question: "<b>Read the announcement and choose the best option for (5):</b><br><br>Winners will receive certificates and valuable prizes (5) ______ by local tech sponsors.<br>",
            options: ["sponsored", "sponsoring", "sponsor", "sponsors"],
            correct: 0,
            explanation: "Dùng mệnh đề quan hệ rút gọn ở dạng bị động: 'valuable prizes (which are) sponsored by...'."
        },
        {
            type: "multiple",
            question: "<b>Read the announcement and choose the best option for (6):</b><br><br>We look forward to (6) ______ your innovative ideas at the fair!<br>",
            options: ["see", "saw", "seeing", "seen"],
            correct: 2,
            explanation: "Cấu trúc quen thuộc 'look forward to + V-ing' (mong đợi làm việc gì đó)."
        },

        // --- READ AND COMPLETE LEAFLET/ADVERTISEMENT (6 questions: 7 - 12) ---
        {
            type: "multiple",
            question: "<b>Read the advertisement and choose the best option for (7):</b><br><br><b>LIFELONG LEARNING CENTER - UNLOCK YOUR POTENTIAL</b><br>Are you ready to elevate your career? Join our Lifelong Learning Center today and explore our wide range of (7) ______ courses.<br>",
            options: ["professional", "profession", "professionally", "professionalism"],
            correct: 0,
            explanation: "Trước danh từ 'courses' cần một tính từ bổ nghĩa. 'professional' (chuyên nghiệp) là tính từ phù hợp."
        },
        {
            type: "multiple",
            question: "<b>Read the advertisement and choose the best option for (8):</b><br><br>Our highly flexible classes are designed to be online and hybrid, (8) ______ you to balance work and study easily.<br>",
            options: ["enabling", "enable", "enabled", "enables"],
            correct: 0,
            explanation: "Dùng phân từ hiện tại (V-ing) 'enabling' để tạo mệnh đề lược bỏ kết quả (giúp cho ai có thể làm gì)."
        },
        {
            type: "multiple",
            question: "<b>Read the advertisement and choose the best option for (9):</b><br><br>You will learn from experienced instructors who are top experts in (9) ______ respective fields.<br>",
            options: ["their", "its", "our", "his"],
            correct: 0,
            explanation: "Tính từ sở hữu 'their' thay thế cho danh từ số nhiều 'instructors' đứng trước đó."
        },
        {
            type: "multiple",
            question: "<b>Read the advertisement and choose the best option for (10):</b><br><br>We offer both night and weekend classes to suit your busy (10) ______.<br>",
            options: ["schedule", "scheduling", "scheduled", "schedules"],
            correct: 0,
            explanation: "Cụm từ danh từ quen thuộc 'busy schedule' (lịch trình bận rộn). Chọn danh từ số ít 'schedule' phù hợp nhất."
        },
        {
            type: "multiple",
            question: "<b>Read the advertisement and choose the best option for (11):</b><br><br>Register now and get a (11) ______ fee waiver of $50 for the first month.<br>",
            options: ["registration", "register", "registered", "registering"],
            correct: 0,
            explanation: "Cụm danh từ ghép 'registration fee' (lệ phí đăng ký)."
        },
        {
            type: "multiple",
            question: "<b>Read the advertisement and choose the best option for (12):</b><br><br>Don't let this opportunity slip away. Make a smart (12) ______ in your future today!<br>",
            options: ["investment", "invest", "investing", "invested"],
            correct: 0,
            explanation: "Sau mạo từ 'a' và tính từ 'smart' cần một danh từ. 'investment' (sự đầu tư) là danh từ phù hợp nhất."
        },

        // --- ARRANGE DIALOGUE/PARAGRAPH (5 questions: 13 - 17) ---
        {
            type: "multiple",
            question: "<b>Choose the best arrangement of the sentences to make a coherent dialogue:</b><br><br>a. Sure, I'd like a grilled chicken salad and a bottle of mineral water.<br>b. Good evening! Are you ready to order now?<br>c. Perfect. I will bring your food out in about ten minutes.<br>d. Yes, thank you. What do you recommend?<br>e. Our chef's special tonight is the grilled chicken salad, which is highly recommended.<br>",
            options: ["b - d - e - a - c", "b - a - c - d - e", "a - b - c - d - e", "c - b - a - d - e"],
            correct: 0,
            explanation: "Trình tự hợp lý của hội thoại gọi món: Phục vụ hỏi (b) -> Khách trả lời và hỏi gợi ý (d) -> Phục vụ gợi ý món đặc biệt (e) -> Khách đồng ý đặt món gợi ý (a) -> Phục vụ xác nhận thời gian chuẩn bị (c)."
        },
        {
            type: "multiple",
            question: "<b>Choose the best arrangement of the sentences to write a letter/email paragraph:</b><br><br>a. Thank you again for your time, and I look forward to hearing from you.<br>b. Dear Hiring Manager,<br>c. I am writing to apply for the position of Marketing Assistant at your company.<br>d. My resume is attached to this email for your review.<br>e. With three years of experience in digital marketing, I believe I can contribute greatly to your team.<br>",
            options: ["b - c - e - d - a", "b - a - c - d - e", "b - c - d - e - a", "c - b - e - d - a"],
            correct: 0,
            explanation: "Trình tự viết thư xin việc chuẩn: Lời chào mở đầu (b) -> Lý do viết thư ứng tuyển (c) -> Giới thiệu kinh nghiệm và năng lực bản thân (e) -> Đề cập tài liệu đính kèm (d) -> Lời cảm ơn và mong chờ phản hồi (a)."
        },
        {
            type: "multiple",
            question: "<b>Choose the best arrangement of the sentences to make a paragraph about the benefits of sleep:</b><br><br>a. Firstly, adequate sleep improves concentration, productivity, and brain function.<br>b. In conclusion, prioritizing sleep is vital for maintaining a healthy and happy life.<br>c. Sleep plays an essential role in our overall health and well-being.<br>d. Secondly, it helps repair heart and blood vessels, reducing the risk of chronic diseases.<br>e. Conversely, chronic sleep deprivation can lead to serious physical and mental health issues.<br>",
            options: ["c - a - d - e - b", "c - d - a - e - b", "a - d - c - e - b", "c - a - e - d - b"],
            correct: 0,
            explanation: "Trình tự lô-gíc của đoạn văn: Giới thiệu vai trò của giấc ngủ (c) -> Lợi ích thứ nhất (a) -> Lợi ích thứ hai (d) -> Mặt ngược lại nếu thiếu ngủ (e) -> Kết luận tầm quan trọng (b)."
        },
        {
            type: "multiple",
            question: "<b>Choose the best arrangement of the sentences to make a paragraph about reducing plastic waste:</b><br><br>a. Consequently, using reusable shopping bags and water bottles can make a massive difference.<br>b. Finally, raising community awareness through educational programs is crucial.<br>c. Plastic pollution is currently one of the most pressing environmental crises.<br>d. To begin with, individuals should cut down on their daily consumption of single-use plastics.<br>e. Furthermore, recycling programs should be implemented and strictly followed.<br>",
            options: ["c - d - a - e - b", "c - a - d - e - b", "d - a - c - e - b", "c - d - e - a - b"],
            correct: 0,
            explanation: "Trình tự lập luận bảo vệ môi trường: Đưa ra vấn đề ô nhiễm nhựa (c) -> Giải pháp cá nhân bắt đầu từ (d) -> Kết quả của giải pháp cá nhân (a) -> Giải pháp hệ thống/tái chế (e) -> Giải pháp nâng cao nhận thức cộng đồng (b)."
        },
        {
            type: "multiple",
            question: "<b>Choose the best arrangement of the sentences to make a dialogue about preparing for a test:</b><br><br>a. Have you studied all the key chapters for the upcoming history test?<br>b. I've finished the first three, but the last two chapters are quite difficult for me.<br>c. Don't worry! We can study together this afternoon if you'd like.<br>d. That would be incredibly helpful, thanks a lot!<br>e. No problem. Let's meet at the school library at 2 PM.<br>",
            options: ["a - b - c - d - e", "a - c - b - d - e", "b - a - c - d - e", "a - b - d - c - e"],
            correct: 0,
            explanation: "Trình tự cuộc hội thoại ôn thi: Lan hỏi Nam đã học chưa (a) -> Nam chia sẻ tiến độ và khó khăn (b) -> Lan động viên và rủ học chung (c) -> Nam bày tỏ sự cảm kích (d) -> Lan hẹn địa điểm và thời gian (e)."
        },

        // --- READ AND FILL GAPS (5 questions: 18 - 22) ---
        {
            type: "multiple",
            question: "<b>Choose the best word to fill in the blank (18) in the passage:</b><br><br>Digital transformation in education has revolutionized how students learn and teachers instruct. With the integration of advanced technologies, traditional classrooms are being replaced by smart learning environments. One of the main advantages of this shift is the (18) ______ flexibility it offers.<br>",
            options: ["unparalleled", "insignificant", "decreased", "limited"],
            correct: 0,
            explanation: "'unparalleled' (vô song, chưa từng có) là tính từ mạnh thể hiện lợi ích to lớn của sự linh hoạt mà chuyển đổi số đem lại."
        },
        {
            type: "multiple",
            question: "<b>Choose the best word to fill in the blank (19) in the passage:</b><br><br>However, this transition also presents challenges, such as the digital divide, (19) ______ refers to the gap between those who have access to technology and those who do not.<br>",
            options: ["which", "who", "whose", "where"],
            correct: 0,
            explanation: "Dùng đại từ quan hệ không giới hạn 'which' đứng sau dấu phẩy để bổ nghĩa cho khái niệm 'the digital divide' (khoảng cách số)."
        },
        {
            type: "multiple",
            question: "<b>Choose the best word to fill in the blank (20) in the passage:</b><br><br>(20) ______ these hurdles, schools and governments are working together to bridge the gap by providing digital tools and infrastructure.<br>",
            options: ["Despite", "Because of", "Instead of", "In spite"],
            correct: 0,
            explanation: "Dùng giới từ 'Despite' (Mặc dù) đứng trước danh từ 'these hurdles' để chỉ sự tương phản."
        },
        {
            type: "multiple",
            question: "<b>Choose the best word to fill in the blank (21) in the passage:</b><br><br>Moreover, teachers must receive adequate training to (21) ______ implement these new methods.<br>",
            options: ["effectively", "effective", "effectiveness", "effect"],
            correct: 0,
            explanation: "Cần một trạng từ 'effectively' bổ nghĩa cho động từ 'implement' (triển khai một cách hiệu quả)."
        },
        {
            type: "multiple",
            question: "<b>Choose the best word to fill in the blank (22) in the passage:</b><br><br>(22) ______ conclusion, while digital education has immense potential, ensuring equal access for all students is key to its ultimate success.<br>",
            options: ["In", "On", "At", "By"],
            correct: 0,
            explanation: "Cụm từ nối cố định kết luận đoạn văn: 'In conclusion' (Tóm lại/Kết luận lại)."
        },

        // --- READING COMPREHENSION 1 (8 questions: 23 - 30) ---
        {
            type: "multiple",
            question: "<b>Passage 1:</b><br>Biodiversity refers to the variety of life on Earth, encompassing all plants, animals, and microorganisms, as well as the ecosystems they form. It is the foundation of ecosystem services to which human well-being is intimately linked. Healthy ecosystems with high biodiversity are more resilient to environmental disturbances, such as climate change and natural disasters. For instance, biodiverse forests can recover much faster from wild fires than single-species tree plantations. Moreover, biodiversity provides humans with essential resources, including food, clean water, and raw materials for medicine. Indeed, a significant portion of modern prescription drugs is derived from wild plants. Despite its immense value, biodiversity is currently threatened at an unprecedented rate, largely due to human activities like deforestation, overfishing, and pollution. Conserving our planet's biodiversity is not just an environmental obligation; it is critical for securing our own survival.<br><br><b>What is the primary focus of the passage?</b>",
            options: ["The definition of ecosystem services", "The threats and importance of biodiversity", "How modern drugs are made from plants", "The resilience of forests to wild fires"],
            correct: 1,
            explanation: "Đoạn văn chủ yếu nhấn mạnh về tầm quan trọng của đa dạng sinh học đối với hệ sinh thái/con người và các mối đe dọa từ con người đối với nó."
        },
        {
            type: "multiple",
            question: "<b>According to the passage, healthy ecosystems with high biodiversity:</b>",
            options: ["are more vulnerable to environmental disturbances", "can recover faster from natural disasters", "consist only of single-species tree plantations", "are not connected to human well-being"],
            correct: 1,
            explanation: "Thông tin trong bài: 'Healthy ecosystems with high biodiversity are more resilient to environmental disturbances... biodiverse forests can recover much faster from wild fires...'"
        },
        {
            type: "multiple",
            question: "<b>The word 'resilient' in the passage is closest in meaning to:</b>",
            options: ["fragile", "adaptable", "stagnant", "sensitive"],
            correct: 1,
            explanation: "'resilient' mang nghĩa là kiên cường, có khả năng phục hồi nhanh chóng/đàn hồi $\\approx$ 'adaptable' (dễ thích nghi, phục hồi tốt)."
        },
        {
            type: "multiple",
            question: "<b>According to the passage, where do many modern prescription drugs come from?</b>",
            options: ["Synthetic laboratory chemicals", "Wild plants", "Animal cloning", "Microscopic sea organisms"],
            correct: 1,
            explanation: "Thông tin trong bài: 'Indeed, a significant portion of modern prescription drugs is derived from wild plants.'"
        },
        {
            type: "multiple",
            question: "<b>The word 'intimately' in the passage is closest in meaning to:</b>",
            options: ["distantly", "closely", "rarely", "slightly"],
            correct: 1,
            explanation: "'intimately' mang nghĩa là mật thiết, sâu sắc $\\approx$ 'closely' (một cách chặt chẽ, mật thiết)."
        },
        {
            type: "multiple",
            question: "<b>Which of the following is NOT mentioned as a threat to biodiversity?</b>",
            options: ["Deforestation", "Overfishing", "Pollution", "Climate adaptation"],
            correct: 3,
            explanation: "Bài viết liệt kê phá rừng (deforestation), đánh bắt quá mức (overfishing), ô nhiễm (pollution) là các mối đe dọa. 'Climate adaptation' (Thích ứng khí hậu) không phải mối đe dọa."
        },
        {
            type: "multiple",
            question: "<b>The word 'it' in the last sentence refers to:</b>",
            options: ["human activity", "conserving biodiversity", "environmental obligation", "our planet"],
            correct: 1,
            explanation: "'Conserving our planet's biodiversity is not just an environmental obligation; it is critical...' -> 'it' thay thế cho việc bảo tồn đa dạng sinh học (conserving biodiversity)."
        },
        {
            type: "multiple",
            question: "<b>What is the author's tone in the last paragraph?</b>",
            options: ["indifferent", "urgent", "optimistic", "sarcastic"],
            correct: 1,
            explanation: "Tác giả nhấn mạnh mối đe dọa ở mức độ chưa từng có và sự sinh tồn của loài người, thể hiện một giọng văn khẩn thiết, cấp bách (urgent)."
        },

        // --- READING COMPREHENSION 2 (10 questions: 31 - 40) ---
        {
            type: "multiple",
            question: "<b>Passage 2:</b><br>As the global population continues to urbanize, the concept of 'smart cities' has gained significant momentum. A smart city uses digital technology, information networks, and Internet of Things (IoT) sensors to improve the quality of life for its citizens, optimize urban services, and reduce resource consumption.<br><br>For example, smart traffic management systems analyze real-time data from cameras and road sensors to adjust traffic signals, thereby reducing congestion and vehicle emissions. Smart grids manage energy distribution more efficiently by predicting energy demand and integrating renewable sources like solar and wind power. Additionally, smart waste bins can transmit alerts when they are full, allowing collection trucks to optimize their routes and save fuel.<br><br>However, transforming a conventional city into a smart one is not without obstacles. The primary concern is data security and privacy. Since smart cities rely on the continuous gathering and analysis of vast amounts of personal and public data, they are vulnerable to cyberattacks. If hackers gain access to critical infrastructure, such as power grids or water systems, the consequences could be catastrophic. Furthermore, the financial cost of installing and maintaining high-tech infrastructure is exorbitant, making it difficult for developing nations to adopt.<br><br>To build a successful and sustainable smart city, urban planners must prioritize cybersecurity alongside technological innovation. They must also ensure that the technology implemented serves all segments of society, preventing a technological divide where only wealthy residents benefit. Ultimately, the true measure of a smart city lies not in its sophisticated gadgets, but in how effectively it improves the daily lives of its citizens while preserving the environment for future generations.<br><br><b>Which of the following would be the most suitable title for the passage?</b>",
            options: [
                "The History of Global Urbanization",
                "Smart Cities: Innovations, Challenges, and Future Prospects",
                "Cyberattacks: The Greatest Threat to Modern Technology",
                "The Financial Exorbitance of Smart Infrastructure"
            ],
            correct: 1,
            explanation: "Tiêu đề bao quát đầy đủ nhất nội dung bài viết về cả các đổi mới đột phá của đô thị thông minh, những thách thức đi kèm và định hướng tương lai."
        },
        {
            type: "multiple",
            question: "<b>According to the passage, how do smart traffic management systems reduce vehicle emissions?</b>",
            options: [
                "By replacing gasoline cars with electric ones",
                "By adjusting traffic signals based on real-time data to decrease congestion",
                "By charging drivers extra fees during peak hours",
                "By banning vehicles from major downtown streets"
            ],
            correct: 1,
            explanation: "Thông tin dòng 1 đoạn 2: 'smart traffic management systems analyze real-time data... to adjust traffic signals, thereby reducing congestion and vehicle emissions.'"
        },
        {
            type: "multiple",
            question: "<b>The word 'exorbitant' in paragraph 3 is closest in meaning to:</b>",
            options: ["extremely high", "quite reasonable", "rapidly decreasing", "unpredictable"],
            correct: 0,
            explanation: "'exorbitant' nghĩa là quá cao, đắt đỏ vượt mức $\\approx$ 'extremely high' (cực kỳ cao)."
        },
        {
            type: "multiple",
            question: "<b>What is one way smart waste bins save fuel?</b>",
            options: [
                "They are powered by solar panels on top",
                "They automatically compress plastic bottles",
                "They alert collection trucks only when they are full to optimize routes",
                "They incinerate waste inside the bin"
            ],
            correct: 2,
            explanation: "Thông tin cuối đoạn 2: 'smart waste bins can transmit alerts when they are full, allowing collection trucks to optimize their routes and save fuel.'"
        },
        {
            type: "multiple",
            question: "<b>The word 'they' in paragraph 3 refers to:</b>",
            options: ["smart cities", "vast amounts", "data security", "urban services"],
            correct: 0,
            explanation: "'Since smart cities rely on... they are vulnerable...' -> 'they' ở đây thay thế cho các thành phố thông minh (smart cities)."
        },
        {
            type: "multiple",
            question: "<b>According to the passage, why are smart cities particularly vulnerable to cyberattacks?</b>",
            options: [
                "They do not use modern firewalls",
                "They depend on collecting and analyzing massive amounts of data",
                "Their citizens are not trained in computer safety",
                "They use outdated operating systems"
            ],
            correct: 1,
            explanation: "Thông tin đoạn 3: 'Since smart cities rely on the continuous gathering and analysis of vast amounts of personal and public data, they are vulnerable to cyberattacks.'"
        },
        {
            type: "multiple",
            question: "<b>Which of the following is NOT mentioned as a feature of smart cities in the passage?</b>",
            options: [
                "Smart grids for energy distribution",
                "Smart waste bins that transmit alerts",
                "Smart traffic management systems",
                "Smart flying taxis for public transport"
            ],
            correct: 3,
            explanation: "Lưới điện thông minh (smart grids), thùng rác thông minh (smart waste bins) và quản lý giao thông thông minh đều được nhắc tới ở đoạn 2. Taxi bay (flying taxis) không được đề cập."
        },
        {
            type: "multiple",
            question: "<b>The word 'sophisticated' in the last paragraph is closest in meaning to:</b>",
            options: ["expensive", "simple", "advanced", "ancient"],
            correct: 2,
            explanation: "'sophisticated' nghĩa là tinh vi, phức tạp, cao cấp $\\approx$ 'advanced' (tiên tiến, cao cấp)."
        },
        {
            type: "multiple",
            question: "<b>What can be inferred about developing nations from the passage?</b>",
            options: [
                "They do not have any urbanization issues",
                "They may struggle to implement smart cities due to high financial costs",
                "They prioritize cybersecurity over technological innovations",
                "They do not want to use renewable energy"
            ],
            correct: 1,
            explanation: "Thông tin cuối đoạn 3: 'Furthermore, the financial cost of installing... is exorbitant, making it difficult for developing nations to adopt.' Suy ra các nước đang phát triển sẽ gặp khó khăn tài chính khi triển khai."
        },
        {
            type: "multiple",
            question: "<b>What is the author's main message in the final paragraph?</b>",
            options: [
                "Governments should stop building smart cities immediately.",
                "Technology should only be used to create wealthy neighborhoods.",
                "A smart city should focus on enhancing citizens' lives and protecting the environment.",
                "Cybersecurity is the only factor that matters in urban planning."
            ],
            correct: 2,
            explanation: "Thông điệp chính ở đoạn kết: thước đo thực sự của đô thị thông minh nằm ở việc cải thiện đời sống hàng ngày của người dân một cách hiệu quả đi đôi với bảo vệ môi trường bền vững."
        }
    ]
};
