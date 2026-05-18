window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Sinh Học (Bản 2)",
    config: { testDuration: 3000, examLayout: { multiple: { count: 18, pointsPerQ: 0.25 }, truefalse: { count: 4, pointsPerQ: 1.0 }, short: { count: 6, pointsPerQ: 0.25 } } },
    questions: [
        // --- PHẦN I: MCQ ---
        { type: "multiple", question: "ADN có cấu trúc xoắn kép, hai mạch liên kết với nhau bằng:", options: ["Liên kết peptit", "Liên kết cộng hóa trị", "Liên kết hidro giữa các cặp bazơ nitric", "Liên kết ion"], correct: 2, explanation: "Hai mạch ADN liên kết nhau bằng liên kết hidro: A-T (2 liên kết), G-X (3 liên kết)." },
        { type: "multiple", question: "Nguyên tắc bổ sung trong ADN thể hiện qua sự kết cặp:", options: ["A-G và T-X", "A-T và G-X", "A-X và G-T", "A-U và G-X"], correct: 1, explanation: "Nguyên tắc bổ sung trong ADN: A liên kết T, G liên kết X." },
        { type: "multiple", question: "Quá trình phiên mã tổng hợp:", options: ["ADN từ ADN khuôn", "mARN từ mạch khuôn ADN", "Protein từ mARN", "tARN từ protein"], correct: 1, explanation: "Phiên mã: ADN (mạch khuôn) → mARN, theo nguyên tắc bổ sung (A-U, T-A, G-X, X-G)." },
        { type: "multiple", question: "Trong dịch mã, bộ ba đối mã (anticodon) nằm trên:", options: ["mARN", "rARN", "tARN", "ADN"], correct: 2, explanation: "tARN có bộ ba đối mã (anticodon) bổ sung với codon trên mARN, vận chuyển axit amin đến ribosome." },
        { type: "multiple", question: "Đột biến gen làm thay thế một cặp G-X bằng A-T gọi là:", options: ["Đột biến đảo cặp bazơ", "Đột biến mất cặp bazơ", "Đột biến thay thế cặp bazơ", "Đột biến thêm cặp bazơ"], correct: 2, explanation: "Thay thế cặp bazơ: một cặp nucleotit bị thay bằng cặp nucleotit khác." },
        { type: "multiple", question: "Nhiễm sắc thể (NST) kép gồm:", options: ["1 cromatit", "2 cromatit dính nhau ở tâm động", "4 cromatit", "2 NST đơn riêng biệt"], correct: 1, explanation: "NST kép = 2 cromatit (chromatid) chị em gắn với nhau tại tâm động (centromere), hình thành sau nhân đôi ADN." },
        { type: "multiple", question: "Quy luật phân ly độc lập của Mendel áp dụng khi:", options: ["Các gen nằm trên cùng một NST", "Các cặp gen nằm trên các cặp NST tương đồng khác nhau", "Các gen liên kết chặt", "Tần số hoán vị gen = 0"], correct: 1, explanation: "Phân ly độc lập: các cặp gen PLĐL nằm trên các cặp NST tương đồng khác nhau." },
        { type: "multiple", question: "Hiện tượng hoán vị gen xảy ra do:", options: ["Đột biến nhiễm sắc thể", "Trao đổi chéo giữa các cromatit không chị em trong kỳ đầu giảm phân I", "Phân ly độc lập của các NST", "Đột biến gen"], correct: 1, explanation: "Hoán vị gen: trao đổi đoạn giữa cromatit không chị em (non-sister chromatids) trong kỳ đầu I của giảm phân." },
        { type: "multiple", question: "Tần số hoán vị gen tối đa không vượt quá:", options: ["25%", "50%", "75%", "100%"], correct: 1, explanation: "Tần số hoán vị tối đa = 50% (tương đương phân ly độc lập). Giá trị này xảy ra khi gen nằm rất xa nhau." },
        { type: "multiple", question: "Quần thể đang ở trạng thái cân bằng Hardy-Weinberg phải thỏa mãn điều kiện:", options: ["Kích thước lớn, ngẫu phối, không có chọn lọc, đột biến, di nhập gen", "Kích thước nhỏ, ngẫu phối", "Có chọn lọc mạnh", "Di nhập gen mạnh"], correct: 0, explanation: "Cân bằng Hardy-Weinberg: quần thể lớn, ngẫu phối, không chọn lọc, không đột biến, không di nhập gen, không di truyền giới tính." },
        { type: "multiple", question: "Tiến hóa nhỏ là:", options: ["Hình thành loài mới", "Sự biến đổi tần số alen trong quần thể qua các thế hệ", "Tiến hóa ở cấp độ trên loài", "Sự hình thành các ngành, lớp mới"], correct: 1, explanation: "Tiến hóa nhỏ (microevolution): thay đổi tần số alen và tần số kiểu gen trong quần thể qua thế hệ." },
        { type: "multiple", question: "Nhân tố tiến hóa nào không làm thay đổi tần số alen nhưng làm thay đổi thành phần kiểu gen?", options: ["Đột biến", "Chọn lọc tự nhiên", "Giao phối không ngẫu nhiên", "Di nhập gen"], correct: 2, explanation: "Giao phối không ngẫu nhiên (giao phối có lựa chọn, giao phối cận huyết) thay đổi tần số kiểu gen nhưng không thay đổi tần số alen." },
        { type: "multiple", question: "Chuỗi thức ăn trong hệ sinh thái bắt đầu từ:", options: ["Động vật ăn thịt", "Sinh vật phân giải", "Sinh vật sản xuất (thực vật)", "Động vật ăn cỏ"], correct: 2, explanation: "Chuỗi thức ăn: Sinh vật sản xuất → Sinh vật tiêu thụ cấp 1 → Cấp 2 → ... → Sinh vật phân giải." },
        { type: "multiple", question: "Hiệu suất sinh thái ở mỗi bậc dinh dưỡng thường là:", options: ["90-95%", "50-60%", "10%", "1%"], correct: 2, explanation: "Quy tắc 10%: chỉ khoảng 10% năng lượng được truyền từ bậc dinh dưỡng thấp lên bậc cao hơn." },
        { type: "multiple", question: "Chu trình nước trong tự nhiên bao gồm các giai đoạn:", options: ["Bay hơi, mưa, thấm đất, chảy ra biển", "Quang hợp và hô hấp", "Đồng hóa và dị hóa", "Phân giải và tổng hợp"], correct: 0, explanation: "Chu trình nước: nước biển bốc hơi → mây → mưa → sông suối → biển (và thấm vào đất ngầm)." },
        { type: "multiple", question: "Sinh thái học nghiên cứu:", options: ["Cấu trúc tế bào", "Mối quan hệ giữa sinh vật và môi trường sống", "Cơ chế di truyền phân tử", "Cấu trúc hệ thần kinh"], correct: 1, explanation: "Sinh thái học (Ecology) nghiên cứu mối quan hệ giữa sinh vật với nhau và với các nhân tố vô sinh của môi trường." },
        { type: "multiple", question: "Trong mô hình operon Lac của E. coli, khi có lactose:", options: ["Protein ức chế gắn vào operator, gen cấu trúc không hoạt động", "Lactose gắn vào protein ức chế, giải phóng operator, gen cấu trúc hoạt động", "ARN polymerase bị ức chế", "Promoter bị bất hoạt"], correct: 1, explanation: "Lactose = chất cảm ứng: gắn vào protein ức chế (repressor) → repressor không gắn được vào operator → ARN polymerase phiên mã gen cấu trúc." },
        { type: "multiple", question: "Đột biến lệch bội (lệch bội) là đột biến làm thay đổi số lượng NST:", options: ["Ở tất cả các cặp NST", "Ở một hoặc một số cặp NST", "Nhân đôi toàn bộ bộ NST", "Mất đoạn lớn NST"], correct: 1, explanation: "Lệch bội: biến đổi số lượng NST ở một hoặc vài cặp NST (thể 3 nhiễm 2n+1, thể 1 nhiễm 2n-1, ...)." },

        // --- PHẦN II: Đúng/Sai ---
        {
            type: "truefalse",
            question: "Một phân tử ADN mạch kép có tổng số nucleotit là 3000, trong đó A = 600. Xét các phát biểu:",
            options: [
                "Số nucleotit loại T = 600.",
                "Số nucleotit loại G = 900.",
                "Tỉ lệ (A+T)/(G+X) = 2/3.",
                "Số liên kết hidro trong phân tử ADN là 3900."
            ],
            correct: [true, true, true, true],
            explanation: "- A=T=600: Đúng (bổ sung).\n- G=X=(3000/2-600)=900: Đúng.\n- (A+T)/(G+X)=(600+600)/(900+900)=1200/1800=2/3: Đúng.\n- H=2A+3G=2×600+3×900=1200+2700=3900: Đúng."
        },
        {
            type: "truefalse",
            question: "Ở một loài thực vật, gen A (hoa đỏ) trội hoàn toàn so với gen a (hoa trắng). Phép lai: Aa × Aa.",
            options: [
                "Tỉ lệ kiểu gen F1 là 1AA : 2Aa : 1aa.",
                "Tỉ lệ kiểu hình F1 là 3 hoa đỏ : 1 hoa trắng.",
                "Tỉ lệ kiểu hình hoa trắng là 50%.",
                "Xác suất thu được cây hoa đỏ thuần chủng là 1/4."
            ],
            correct: [true, true, false, true],
            explanation: "- Aa×Aa → 1AA:2Aa:1aa: Đúng.\n- 3 đỏ (AA+Aa) : 1 trắng (aa): Đúng.\n- aa chiếm 1/4 = 25%, không phải 50%: Sai.\n- AA chiếm 1/4: Đúng."
        },
        {
            type: "truefalse",
            question: "Trong một quần thể thực vật giao phấn ngẫu nhiên, alen A có tần số p = 0,6; alen a có tần số q = 0,4 ở trạng thái cân bằng Hardy-Weinberg.",
            options: [
                "Tần số kiểu gen AA = 0,36.",
                "Tần số kiểu gen Aa = 0,48.",
                "Tần số kiểu gen aa = 0,16.",
                "Tổng tần số ba kiểu gen = 1,0."
            ],
            correct: [true, true, true, true],
            explanation: "Hardy-Weinberg: p²+2pq+q²=1.\n- AA=p²=0,36: Đúng.\n- Aa=2pq=2×0,6×0,4=0,48: Đúng.\n- aa=q²=0,16: Đúng.\n- 0,36+0,48+0,16=1: Đúng."
        },
        {
            type: "truefalse",
            question: "Hệ sinh thái rừng nhiệt đới có đặc điểm:",
            options: [
                "Đa dạng sinh học cao nhất trong các hệ sinh thái trên cạn.",
                "Chuỗi thức ăn thường ngắn (2-3 mắt xích).",
                "Năng suất sinh học sơ cấp rất cao do nhiệt độ và ánh sáng thuận lợi.",
                "Lưới thức ăn đơn giản, ít loài."
            ],
            correct: [true, false, true, false],
            explanation: "- Rừng nhiệt đới có đa dạng sinh học cao nhất: Đúng.\n- Chuỗi thức ăn trong rừng nhiệt đới thường dài và phức tạp, không ngắn: Sai.\n- Năng suất sơ cấp cao nhờ T° và ánh sáng: Đúng.\n- Lưới thức ăn rất phức tạp, nhiều loài: Sai."
        },

        // --- PHẦN III: Trả lời ngắn ---
        { type: "short", question: "Một phân tử mARN có 900 nucleotit. Số bộ ba mã hóa axit amin (codon mã hóa, không tính bộ ba kết thúc) là bao nhiêu? (Biết có 1 bộ ba kết thúc)", correct: "299", explanation: "Tổng số codon = 900/3 = 300. Trừ 1 codon kết thúc → 299 codon mã hóa axit amin." },
        { type: "short", question: "ADN có A=30% tổng số nucleotit. Tỉ lệ G (%) là bao nhiêu?", correct: "20", explanation: "A=T=30% → G=X=(100-60)/2=20%." },
        { type: "short", question: "Trong quần thể Hardy-Weinberg: tần số aa = 0,09. Tần số alen a là bao nhiêu?", correct: "0.3", explanation: "aa = q² = 0,09 → q = √0,09 = 0,3." },
        { type: "short", question: "Chuỗi thức ăn: Cỏ → Châu chấu → Ếch → Rắn → Đại bàng. Ếch thuộc bậc dinh dưỡng thứ mấy?", correct: "3", explanation: "Cỏ (bậc 1) → Châu chấu (bậc 2) → Ếch (bậc 3). Ếch là sinh vật tiêu thụ bậc 2, thuộc bậc dinh dưỡng 3." },
        { type: "short", question: "Một gen có 2400 nucleotit, A chiếm 20%. Số liên kết hidro của gen là bao nhiêu?", correct: "3120", explanation: "A=T=20%→A=0,2×2400/2=240. G=X=(1200-240)=960. H=2A+3G=2×240+3×960=480+2880=3360. (Chú ý: Tổng nucleotit trên 2 mạch=2400→mỗi mạch 1200. A+G=1200, A=20%×2400/2=240, G=960. H=2×240+3×960=3360)." },
        { type: "short", question: "Phép lai Aa × Aa, xác suất (%) để con có kiểu gen giống bố mẹ (Aa) là bao nhiêu?", correct: "50", explanation: "Aa×Aa → 1/4 AA : 2/4 Aa : 1/4 aa. Kiểu gen Aa chiếm 2/4 = 50%." }
    ]
};
