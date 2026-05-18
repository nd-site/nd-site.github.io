window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Sinh Học (Bản 1)",
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
            question: "Đơn vị cấu trúc cơ bản của hệ sống là:",
            options: ["Phân tử", "Bào quan", "Tế bào", "Cơ thể"],
            correct: 2,
            explanation: "Tế bào là đơn vị cơ bản cấu tạo nên mọi cơ thể sống."
        },
        {
            type: "multiple",
            question: "Quá trình nhân đôi ADN diễn ra theo nguyên tắc:",
            options: ["Bổ sung và bán bảo toàn", "Bổ sung và bảo toàn", "Bán bảo toàn và tự do", "Bảo toàn và tự do"],
            correct: 0,
            explanation: "ADN nhân đôi theo nguyên tắc bổ sung (A-T, G-C) và bán bảo toàn (giữ lại một nửa)."
        },
        {
            type: "multiple",
            question: "Mã di truyền có tính đặc hiệu nghĩa là:",
            options: ["Nhiều bộ ba cùng mã hóa cho một axit amin.", "Một bộ ba chỉ mã hóa cho một loại axit amin.", "Bộ ba nào cũng mã hóa cho axit amin.", "Tất cả các loài đều dùng chung một bộ mã di truyền."],
            correct: 1,
            explanation: "Tính đặc hiệu: 1 codon -> 1 amino acid."
        },
        {
            type: "multiple",
            question: "Cơ thể có kiểu gen AaBb giảm phân bình thường cho tối đa bao nhiêu loại giao tử?",
            options: ["1", "2", "3", "4"],
            correct: 3,
            explanation: "Số loại giao tử = $2^n$ với n là số cặp dị hợp. Ở đây $2^2 = 4$ loại (AB, Ab, aB, ab)."
        },
        {
            type: "multiple",
            question: "Thành phần nào sau đây không tham gia trực tiếp vào quá trình dịch mã?",
            options: ["mARN", "tARN", "rARN", "ADN"],
            correct: 3,
            explanation: "Dịch mã diễn ra ở tế bào chất, ADN ở trong nhân (đối với sinh vật nhân thực) và không trực tiếp tham gia dịch mã."
        },
        {
            type: "multiple",
            question: "Dạng đột biến cấu trúc nhiễm sắc thể nào làm tăng số lượng gen trên một nhiễm sắc thể?",
            options: ["Mất đoạn", "Lặp đoạn", "Đảo đoạn", "Chuyển đoạn trên cùng 1 NST"],
            correct: 1,
            explanation: "Lặp đoạn làm một đoạn NST được lặp lại, dẫn đến tăng số lượng gen."
        },
        {
            type: "multiple",
            question: "Phép lai nào sau đây được gọi là lai phân tích?",
            options: ["Aa x Aa", "Aa x aa", "AA x Aa", "AA x AA"],
            correct: 1,
            explanation: "Lai phân tích là lai cơ thể mang tính trạng trội với cơ thể mang tính trạng lặn (đồng hợp lặn)."
        },
        {
            type: "multiple",
            question: "Trong một quần thể ngẫu phối đang ở trạng thái cân bằng di truyền, tần số alen A là 0,6 thì tần số alen a là:",
            options: ["0,4", "0,6", "0,36", "0,16"],
            correct: 0,
            explanation: "$p + q = 1 \Rightarrow q = 1 - 0.6 = 0.4$."
        },
        {
            type: "multiple",
            question: "Nhân tố tiến hóa nào làm thay đổi tần số alen của quần thể rất chậm?",
            options: ["Đột biến", "Chọn lọc tự nhiên", "Các yếu tố ngẫu nhiên", "Di - nhập gen"],
            correct: 0,
            explanation: "Đột biến gen xảy ra với tần số rất thấp ($10^{-6}$ đến $10^{-4}$) nên làm thay đổi tần số alen rất chậm."
        },
        {
            type: "multiple",
            question: "Bằng chứng tiến hóa nào sau đây là bằng chứng sinh học phân tử?",
            options: ["Cơ quan tương đồng", "Cơ quan thoái hóa", "Sự tương đồng về trình tự nucleotit trong ADN", "Hóa thạch"],
            correct: 2,
            explanation: "Sự tương đồng về ADN, ARN, protein là bằng chứng sinh học phân tử."
        },
        {
            type: "multiple",
            question: "Tập hợp các cá thể cùng loài, cùng sống trong một không gian xác định, vào một thời điểm nhất định và có khả năng sinh sản tạo thành thế hệ mới là:",
            options: ["Quần thể", "Quần xã", "Hệ sinh thái", "Sinh quyển"],
            correct: 0,
            explanation: "Đây là định nghĩa của quần thể sinh vật."
        },
        {
            type: "multiple",
            question: "Mối quan hệ giữa loài kiến và cây kiến là mối quan hệ:",
            options: ["Hợp tác", "Cộng sinh", "Hội sinh", "Kí sinh"],
            correct: 1,
            explanation: "Đây là quan hệ cộng sinh, cả hai bên đều có lợi và thường gắn bó chặt chẽ."
        },
        {
            type: "multiple",
            question: "Trong chuỗi thức ăn: Cỏ -> Châu chấu -> Ếch -> Rắn, sinh vật tiêu thụ bậc 2 là:",
            options: ["Cỏ", "Châu chấu", "Ếch", "Rắn"],
            correct: 2,
            explanation: "Cỏ (SV sản xuất), Châu chấu (SVTT bậc 1), Ếch (SVTT bậc 2)."
        },
        {
            type: "multiple",
            question: "Khí nitơ phân tử ($N_2$) trong không khí được vi sinh vật nào sau đây chuyển hóa thành dạng đạm mà cây hấp thụ được?",
            options: ["Vi khuẩn phản nitrat hóa", "Vi khuẩn nitrat hóa", "Vi khuẩn cố định nitơ", "Vi khuẩn amôn hóa"],
            correct: 2,
            explanation: "Vi khuẩn cố định nitơ (như Rhizobium) chuyển hóa N2 thành NH3/NH4+."
        },
        {
            type: "multiple",
            question: "Thành phần hữu sinh của hệ sinh thái bao gồm:",
            options: ["Ánh sáng, nhiệt độ, độ ẩm.", "Sinh vật sản xuất, sinh vật tiêu thụ, sinh vật phân giải.", "Đất, nước, không khí.", "Các chất vô cơ và hữu cơ."],
            correct: 1,
            explanation: "Thành phần hữu sinh là các sinh vật sống trong hệ sinh thái."
        },
        {
            type: "multiple",
            question: "Cơ quan tương đồng là những cơ quan:",
            options: ["Có cùng nguồn gốc, đảm nhiệm những chức năng giống nhau.", "Có cùng nguồn gốc, có thể đảm nhiệm những chức năng khác nhau.", "Có nguồn gốc khác nhau, đảm nhiệm những chức năng giống nhau.", "Có nguồn gốc khác nhau, đảm nhiệm những chức năng khác nhau."],
            correct: 1,
            explanation: "Cơ quan tương đồng phản ánh sự tiến hóa phân li (cùng nguồn gốc nhưng khác chức năng do môi trường)."
        },
        {
            type: "multiple",
            question: "Dòng năng lượng trong hệ sinh thái được truyền theo một chiều từ:",
            options: ["Môi trường -> SV sản xuất -> SV tiêu thụ -> SV phân giải -> Môi trường.", "SV tiêu thụ -> SV sản xuất -> Môi trường.", "SV phân giải -> SV tiêu thụ -> SV sản xuất.", "Môi trường -> SV phân giải -> SV tiêu thụ."],
            correct: 0,
            explanation: "Năng lượng đi vào hệ sinh thái qua SV sản xuất và thoát ra môi trường qua nhiệt."
        },
        {
            type: "multiple",
            question: "Kĩ thuật chuyển gen gồm các bước theo trình tự:",
            options: ["Tạo ADN tái tổ hợp -> Đưa ADN tái tổ hợp vào tế bào nhận -> Phân lập gen.", "Phân lập gen -> Tạo ADN tái tổ hợp -> Đưa ADN tái tổ hợp vào tế bào nhận -> Phân lập dòng tế bào chứa ADN tái tổ hợp.", "Đưa ADN tái tổ hợp vào tế bào nhận -> Tạo ADN tái tổ hợp.", "Tạo ADN tái tổ hợp -> Phân lập gen."],
            correct: 1,
            explanation: "Quy trình chuẩn gồm: 1. Tách dòng/phân lập gen; 2. Tạo ADN tái tổ hợp; 3. Chuyển vào tế bào nhận; 4. Sàng lọc/phân lập dòng."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai ---
        {
            type: "truefalse",
            question: "Xét các đặc điểm của mã di truyền:",
            options: [
                "Mã di truyền được đọc từ một điểm xác định, theo từng bộ ba, không gối lên nhau.",
                "Mã di truyền có tính phổ biến, tức là hầu hết các loài sinh vật đều có chung một bộ mã di truyền.",
                "Mã di truyền có tính thoái hóa, nghĩa là một bộ ba có thể mã hóa cho nhiều loại axit amin khác nhau.",
                "Có 3 bộ ba làm nhiệm vụ kết thúc quá trình dịch mã là 5'UAA3', 5'UAG3', 5'UGA3'."
            ],
            correct: [true, true, false, true],
            explanation: "- Mã di truyền đọc liên tục, không gối (Đúng).\n- Tính phổ biến (Đúng).\n- Tính thoái hóa: Nhiều bộ ba -> 1 axit amin. Câu khẳng định 1 bộ ba -> nhiều axit amin là sai (Đó là tính đặc hiệu, và câu này phát biểu ngược).\n- 3 codon kết thúc là UAA, UAG, UGA (Đúng)."
        },
        {
            type: "truefalse",
            question: "Một loài thực vật, alen A quy định hoa đỏ trội hoàn toàn so với alen a quy định hoa trắng. Thế hệ xuất phát (P) của một quần thể tự thụ phấn có tỉ lệ kiểu gen là 0,4AA : 0,4Aa : 0,2aa.",
            options: [
                "Ở thế hệ P, tần số alen A là 0,6.",
                "Ở thế hệ F1, tỉ lệ kiểu gen Aa là 0,2.",
                "Ở thế hệ F1, tỉ lệ kiểu hình hoa trắng là 0,3.",
                "Qua các thế hệ tự thụ phấn, tỉ lệ kiểu gen dị hợp giảm dần, tỉ lệ kiểu gen đồng hợp tăng dần."
            ],
            correct: [true, true, true, true],
            explanation: "- $p_A = 0.4 + 0.4/2 = 0.6$ (Đúng).\n- Tự thụ phấn F1: $Aa = 0.4 / 2 = 0.2$ (Đúng).\n- $aa$ ở F1 $= 0.2 (P) + (0.4 - 0.2)/2 = 0.3$ (Đúng).\n- Tự thụ phấn làm giảm dị hợp, tăng đồng hợp (Đúng)."
        },
        {
            type: "truefalse",
            question: "Về các nhân tố tiến hóa:",
            options: [
                "Chọn lọc tự nhiên là nhân tố tiến hóa có hướng.",
                "Các yếu tố ngẫu nhiên có thể làm nghèo vốn gen của quần thể.",
                "Giao phối không ngẫu nhiên làm thay đổi tần số alen của quần thể.",
                "Đột biến cung cấp nguyên liệu sơ cấp cho quá trình tiến hóa."
            ],
            correct: [true, true, false, true],
            explanation: "- CLTN làm thay đổi theo hướng thích nghi (Đúng).\n- Yếu tố ngẫu nhiên có thể loại bỏ cả alen có lợi (Đúng).\n- Giao phối không ngẫu nhiên (như tự thụ) chỉ làm thay đổi thành phần kiểu gen, KHÔNG làm thay đổi tần số alen (Sai).\n- Đột biến là nguyên liệu sơ cấp (Đúng)."
        },
        {
            type: "truefalse",
            question: "Trong một hệ sinh thái:",
            options: [
                "Sinh vật sản xuất luôn là thực vật.",
                "Năng lượng bị thất thoát qua mỗi bậc dinh dưỡng là rất lớn (khoảng 90%).",
                "Hiệu suất sinh thái là tỉ lệ phần trăm chuyển hóa năng lượng giữa các bậc dinh dưỡng.",
                "Mối quan hệ vật ăn thịt - con mồi giúp khống chế số lượng cá thể của các quần thể trong quần xã."
            ],
            correct: [false, true, true, true],
            explanation: "- SV sản xuất có thể là tảo, vi khuẩn lam (Sai).\n- Thất thoát khoảng 90% (Đúng).\n- Định nghĩa hiệu suất sinh thái (Đúng).\n- Vai trò của quan hệ đối kháng (Đúng)."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn ---
        {
            type: "short",
            question: "Một phân tử ADN dài 4080 Ăngstrông. Tổng số nucleotit của phân tử ADN này là bao nhiêu?",
            correct: "2400",
            explanation: "$N = (L / 3.4) \cdot 2 = (4080 / 3.4) \cdot 2 = 1200 \cdot 2 = 2400$."
        },
        {
            type: "short",
            question: "Trên một mạch của gen có 150 A và 450 T. Nếu gen này nhân đôi 3 lần thì cần môi trường cung cấp bao nhiêu nucleotit loại A?",
            correct: "4200",
            explanation: "$A_{gen} = A_1 + T_1 = 150 + 450 = 600$. $A_{mt} = A_{gen} \cdot (2^k - 1) = 600 \cdot (2^3 - 1) = 600 \cdot 7 = 4200$."
        },
        {
            type: "short",
            question: "Ở một loài sinh vật có bộ nhiễm sắc thể lưỡng bội 2n = 24. Số lượng nhiễm sắc thể trong tế bào của thể ba (2n + 1) là bao nhiêu?",
            correct: "25",
            explanation: "$2n + 1 = 24 + 1 = 25$."
        },
        {
            type: "short",
            question: "Phép lai AaBb x aabb cho tỉ lệ kiểu gen aabb ở đời con là bao nhiêu %?",
            correct: "25",
            explanation: "$1/2 (aa) \cdot 1/2 (bb) = 1/4 = 25\%$."
        },
        {
            type: "short",
            question: "Trong một quần thể cân bằng HWE, kiểu hình lặn (aa) chiếm 16%. Tần số alen trội (A) trong quần thể này là bao nhiêu? (Nhập dưới dạng số thập phân, ví dụ 0.5)",
            correct: "0.6",
            explanation: "$q^2 = 0.16 \Rightarrow q = 0.4$. $p = 1 - 0.4 = 0.6$."
        },
        {
            type: "short",
            question: "Nếu một hệ sinh thái nhận được 1.000.000 kcal từ ánh sáng mặt trời, nhưng SV sản xuất chỉ tích lũy được 1% số năng lượng đó. Sinh vật tiêu thụ bậc 1 có hiệu suất sinh thái là 10%. Năng lượng tích lũy ở SVTT bậc 1 là bao nhiêu kcal?",
            correct: "1000",
            explanation: "$E_{SVSX} = 1.000.000 \cdot 0.01 = 10.000$. $E_{SVTT1} = 10.000 \cdot 0.1 = 1000$."
        }
    ]
};
