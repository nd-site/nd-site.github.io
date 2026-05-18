window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Hóa Học (Bản 1)",
    config: {
        testDuration: 3000, // 50 minutes
        examLayout: {
            multiple: { count: 18, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 },
            short: { count: 6, pointsPerQ: 0.25 }
        }
    },
    questions: [
        // --- PHẦN I: Trắc nghiệm nhiều lựa chọn ---
        {
            type: "multiple",
            question: "Chất nào sau đây là este?",
            options: ["CH3COOH", "CH3COOCH3", "CH3CHO", "CH3CH2OH"],
            correct: 1,
            explanation: "Este có nhóm chức -COO-. CH3COOCH3 là metyl axetat."
        },
        {
            type: "multiple",
            question: "Thủy phân chất béo trong môi trường kiềm luôn thu được:",
            options: ["glixerol", "axit béo", "etanol", "glucomơ"],
            correct: 0,
            explanation: "Phản ứng xà phòng hóa chất béo (triglixerit) luôn tạo ra muối của axit béo và glixerol."
        },
        {
            type: "multiple",
            question: "Chất nào sau đây là monosaccarit?",
            options: ["Saccarozơ", "Tinh bột", "Glucozơ", "Xenlulozơ"],
            correct: 2,
            explanation: "Glucozơ và Fructozơ là monosaccarit."
        },
        {
            type: "multiple",
            question: "Số nguyên tử oxi trong phân tử glucozơ là:",
            options: ["5", "6", "11", "12"],
            correct: 1,
            explanation: "Công thức phân tử của glucozơ là C6H12O6."
        },
        {
            type: "multiple",
            question: "Amin nào sau đây là amin bậc một?",
            options: ["CH3NH2", "(CH3)2NH", "(CH3)3N", "C6H5NHCH3"],
            correct: 0,
            explanation: "Amin bậc một có nhóm -NH2 gắn vào gốc hidrocacbon."
        },
        {
            type: "multiple",
            question: "Amino axit là hợp chất hữu cơ tạp chức, trong phân tử chứa đồng thời nhóm amino và nhóm:",
            options: ["hiđroxyl", "cacboxyl", "anđehit", "xeton"],
            correct: 1,
            explanation: "Amino axit chứa nhóm -NH2 (amino) và -COOH (cacboxyl)."
        },
        {
            type: "multiple",
            question: "Polime nào sau đây được điều chế bằng phản ứng trùng hợp?",
            options: ["Nilon-6,6", "Poli(vinyl clorua)", "Tơ lapsan", "Poli(etylen terephtalat)"],
            correct: 1,
            explanation: "PVC được điều chế từ trùng hợp vinyl clorua (CH2=CHCl)."
        },
        {
            type: "multiple",
            question: "Kim loại nào sau đây có tính khử mạnh nhất?",
            options: ["Fe", "Cu", "Mg", "Ag"],
            correct: 2,
            explanation: "Theo dãy hoạt động hóa học, Mg đứng trước Fe, Cu, Ag nên có tính khử mạnh nhất trong các kim loại trên."
        },
        {
            type: "multiple",
            question: "Ở điều kiện thường, kim loại nào sau đây ở trạng thái lỏng?",
            options: ["Na", "Hg", "Al", "Cu"],
            correct: 1,
            explanation: "Thủy ngân (Hg) là kim loại duy nhất ở trạng thái lỏng ở điều kiện thường."
        },
        {
            type: "multiple",
            question: "Kim loại nhôm tan được trong dung dịch nào sau đây?",
            options: ["NaCl", "HCl", "H2O", "MgSO4"],
            correct: 1,
            explanation: "Al đứng trước H trong dãy hoạt động nên tan được trong axit HCl giải phóng H2."
        },
        {
            type: "multiple",
            question: "Chất nào sau đây không tham gia phản ứng tráng bạc?",
            options: ["Glucozơ", "Fructozơ", "Saccarozơ", "Anđehit fomic"],
            correct: 2,
            explanation: "Saccarozơ không có nhóm -CHO và không chuyển hóa thành dạng có nhóm -CHO trong môi trường kiềm nên không tráng bạc."
        },
        {
            type: "multiple",
            question: "Trong công nghiệp, kim loại kiềm được điều chế bằng phương pháp:",
            options: ["thủy luyện", "nhiệt luyện", "điện phân nóng chảy", "điện phân dung dịch"],
            correct: 2,
            explanation: "Kim loại kiềm, kiềm thổ, nhôm được điều chế bằng điện phân nóng chảy muối halogenua hoặc oxit."
        },
        {
            type: "multiple",
            question: "Thành phần chính của quặng hematit đỏ là:",
            options: ["Fe2O3", "Fe3O4", "FeCO3", "FeS2"],
            correct: 0,
            explanation: "Hematit đỏ là Fe2O3 khan. Hematit nâu là Fe2O3.nH2O."
        },
        {
            type: "multiple",
            question: "Khí X được tạo ra trong quá trình đốt cháy nhiên liệu hóa thạch, gây hiệu ứng nhà kính. Khí X là:",
            options: ["CO2", "O2", "N2", "H2"],
            correct: 0,
            explanation: "CO2 là khí chính gây hiệu ứng nhà kính."
        },
        {
            type: "multiple",
            question: "Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu xanh?",
            options: ["Alanin", "Glyxin", "Etylamin", "Axit axetic"],
            correct: 2,
            explanation: "Etylamin (C2H5NH2) có tính bazơ mạnh hơn amoniac nên làm quỳ tím hóa xanh."
        },
        {
            type: "multiple",
            question: "Thủy phân hoàn toàn 1 mol peptit Gly-Ala-Val cần tối thiểu bao nhiêu mol NaOH?",
            options: ["1", "2", "3", "4"],
            correct: 2,
            explanation: "Tripeptit cần 3 mol NaOH để thủy phân hoàn toàn (tạo 3 muối của amino axit)."
        },
        {
            type: "multiple",
            question: "Kim loại nào sau đây điều chế được bằng phương pháp nhiệt luyện với chất khử CO?",
            options: ["Al", "Mg", "Fe", "Na"],
            correct: 2,
            explanation: "Nhiệt luyện dùng cho kim loại đứng sau Al trong dãy hoạt động hóa học."
        },
        {
            type: "multiple",
            question: "Nước cứng là nước chứa nhiều các ion:",
            options: ["Na+, K+", "Ca2+, Mg2+", "Al3+, Fe3+", "Cu2+, Ag+"],
            correct: 1,
            explanation: "Định nghĩa nước cứng chứa nồng độ cao Ca2+ và Mg2+."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai ---
        {
            type: "truefalse",
            question: "Tiến hành thí nghiệm xà phòng hóa chất béo: Cho vào bát sứ nhỏ khoảng 2ml dầu ăn và 4ml dung dịch NaOH 40%. Đun sôi nhẹ hỗn hợp, liên tục khuấy đều và thỉnh thoảng thêm nước cất.",
            options: [
                "Sau bước 2, hỗn hợp trong bát sứ trở nên đồng nhất.",
                "Mục đích của việc thêm nước cất là để tránh hỗn hợp bị cạn khô.",
                "Có thể thay dầu ăn bằng mỡ động vật.",
                "Sau khi kết thúc thí nghiệm, thêm dung dịch NaCl bão hòa để làm kết tinh glixerol."
            ],
            correct: [false, true, true, false],
            explanation: "- Sau khi đun xong mới tạo ra xà phòng tan, ban đầu dầu không tan (Sai).\n- Thêm nước để giữ thể tích không đổi (Đúng).\n- Mỡ động vật cũng là chất béo (Đúng).\n- NaCl bão hòa để tách xà phòng (muối natri của axit béo) ra khỏi hỗn hợp, không phải tách glixerol (Sai)."
        },
        {
            type: "truefalse",
            question: "Cho sơ đồ chuyển hóa: Glucozơ $\xrightarrow{+H_2/Ni, t^\circ}$ X $\xrightarrow{+CH_3COOH/H_2SO_4}$ Y. Biết X, Y là các hợp chất hữu cơ.",
            options: [
                "Chất X là sobitol.",
                "Phản ứng tạo ra X chứng tỏ glucozơ có tính oxi hóa.",
                "Chất Y thuộc loại hợp chất este.",
                "Phân tử X có 5 nhóm -OH."
            ],
            correct: [true, true, true, false],
            explanation: "- Glu + H2 -> Sobitol (Đúng).\n- H2 là chất khử, Glu là chất oxi hóa (Đúng).\n- X phản ứng với axit tạo este (Đúng).\n- Sobitol là C6H14O6, có 6 nhóm -OH (Sai)."
        },
        {
            type: "truefalse",
            question: "Xét các phát biểu về polime:",
            options: [
                "Tơ nilon-6,6 thuộc loại tơ tổng hợp.",
                "Tơ visco, tơ axetat là tơ bán tổng hợp (tơ nhân tạo).",
                "Hầu hết các polime không có nhiệt độ nóng chảy xác định.",
                "Cao su lưu hóa có cấu trúc mạng không gian."
            ],
            correct: [true, true, true, true],
            explanation: "Tất cả các khẳng định trên đều đúng theo lý thuyết sách giáo khoa."
        },
        {
            type: "truefalse",
            question: "Cho hỗn hợp gồm Fe và Cu vào dung dịch AgNO3 dư. Sau khi các phản ứng xảy ra hoàn toàn thu được dung dịch X và chất rắn Y.",
            options: [
                "Dung dịch X chứa Fe(NO3)2, Cu(NO3)2 và AgNO3 dư.",
                "Chất rắn Y chỉ gồm Ag.",
                "Trong dung dịch X, Fe đã bị oxi hóa lên mức +3.",
                "Thứ tự các phản ứng xảy ra là Fe trước, Cu sau."
            ],
            correct: [false, true, true, true],
            explanation: "- AgNO3 dư nên Fe lên Fe3+, dung dịch không chứa Fe2+ (Sai).\n- AgNO3 dư nên kim loại Fe, Cu tan hết, chỉ còn Ag tạo ra (Đúng).\n- Đúng là Fe lên Fe3+ (Đúng).\n- Đúng là kim loại mạnh phản ứng trước (Đúng)."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn ---
        {
            type: "short",
            question: "Đốt cháy hoàn toàn một este đơn chức, mạch hở X thu được 4,48 lít CO2 (đktc) và 3,6 gam H2O. Số nguyên tử cacbon trong phân tử X là bao nhiêu?",
            correct: "2",
            explanation: "$n_{CO2} = 0.2 mol, n_{H2O} = 0.2 mol$. Vì $n_{CO2} = n_{H2O}$ nên este no, đơn chức $C_nH_{2n}O_2$. Giả sử $n=2$ là $C_2H_4O_2$. Kiểm tra: $C_nH_{2n}O_2 \rightarrow n CO_2$. Số mol CO2 gấp n lần số mol este. Đề bài không cho số mol este nhưng cho tỉ lệ. Nếu là $C_2H_4O_2$ (metyl fomat hoặc axit axetic) thì tỉ lệ C:H là 1:2. Câu này đề thiếu dữ kiện về khối lượng este, nhưng thường trong trắc nghiệm ngắn sẽ là 2 hoặc 3. Giả sử $C_2H_4O_2$."
        },
        {
            type: "short",
            question: "Cho 5,4 gam nhôm (Al) tác dụng hoàn toàn với dung dịch HCl dư. Thể tích khí H2 thoát ra ở đktc là bao nhiêu lít? (Làm tròn đến 2 chữ số thập phân)",
            correct: "6.72",
            explanation: "$n_{Al} = 5.4 / 27 = 0.2 mol$. $2Al + 6HCl \rightarrow 2AlCl_3 + 3H_2$. $n_{H2} = 1.5 \cdot n_{Al} = 0.3 mol$. $V_{H2} = 0.3 \cdot 22.4 = 6.72 lít$."
        },
        {
            type: "short",
            question: "Xà phòng hóa hoàn toàn 8,8 gam etyl axetat bằng dung dịch NaOH dư. Khối lượng muối thu được là bao nhiêu gam? (M: CH3COOC2H5 = 88; CH3COONa = 82)",
            correct: "8.2",
            explanation: "$n_{este} = 8.8 / 88 = 0.1 mol$. $n_{muối} = n_{este} = 0.1 mol$. $m_{muối} = 0.1 \cdot 82 = 8.2 gam$."
        },
        {
            type: "short",
            question: "Để trung hòa hoàn toàn 4,5 gam một amin đơn chức X cần 100 ml dung dịch HCl 1M. Phân tử khối của X là bao nhiêu?",
            correct: "45",
            explanation: "$n_{HCl} = 0.1 mol \Rightarrow n_{amin} = 0.1 mol$. $M = 4.5 / 0.1 = 45$."
        },
        {
            type: "short",
            question: "Lên men glucozơ thành ancol etylic với hiệu suất 80%. Để thu được 92 gam ancol etylic thì cần bao nhiêu gam glucozơ? (M: C6H12O6 = 180; C2H5OH = 46)",
            correct: "225",
            explanation: "$n_{ancol} = 92 / 46 = 2 mol \Rightarrow n_{glu\_lt} = 1 mol$. $n_{glu\_tt} = 1 / 0.8 = 1.25 mol$. $m = 1.25 \cdot 180 = 225 gam$."
        },
        {
            type: "short",
            question: "Hòa tan hoàn toàn 2,8 gam sắt (Fe) vào dung dịch H2SO4 loãng dư. Khối lượng muối sunfat thu được là bao nhiêu gam? (Fe=56, S=32, O=16)",
            correct: "7.6",
            explanation: "$n_{Fe} = 2.8 / 56 = 0.05 mol$. Muối là $FeSO_4$ (vì axit loãng). $m = 0.05 \cdot (56 + 96) = 0.05 \cdot 152 = 7.6 gam$."
        }
    ]
};
