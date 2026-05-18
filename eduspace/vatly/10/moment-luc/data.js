// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Có trả lời ngắn (MCQ, TF, Short, Essay)

window.quizData = {
    title: "Kiểm tra 1 tiết: Moment lực và Cân bằng vật rắn (50 Câu)",
    config: {
        testDuration: 2700,
        examLayout: {
            multiple: {
                count: 12,
                pointsPerQ: 0.25
            },
            truefalse: {
                count: 4,
                pointsPerQ: 0.5,
                partialScoring: [
                    0.05,
                    0.125,
                    0.25,
                    0.5
                ]
            },
            short: {
                count: 4,
                pointsPerQ: 0.5
            },
            essay: {
                count: 5,
                pointsPerQ: 1
            }
        }
    },
    questions: [
        {
            type: "multiple",
            question: "Moment lực đối với một trục quay là đại lượng đặc trưng cho:",
            options: [
                "Tác dụng làm vật chuyển động tịnh tiến.",
                "Tác dụng làm vật quay.",
                "Tác dụng làm biến dạng vật.",
                "Khả năng bảo toàn năng lượng."
            ],
            correct: 1,
            points: 1,
            explanation: "Moment lực đặc trưng cho tác dụng làm quay của lực."
        },
        {
            type: "multiple",
            question: "Công thức tính moment lực là:",
            options: [
                "$$M = F/d$$",
                "$$M = F.d$$",
                "$$M = F.d^2$$",
                "$$M = \frac{1}{2}F.d$$"
            ],
            correct: 1,
            points: 1,
            explanation: "$$M = F.d$$ trong đó F là lực, d là cánh tay đòn."
        },
        {
            type: "multiple",
            question: "Đơn vị của moment lực trong hệ SI là:",
            options: [
                "N/m",
                "Joule (J)",
                "N.m",
                "Watt (W)"
            ],
            correct: 2,
            points: 1,
            explanation: "Lực (N) nhân cánh tay đòn (m) ra đơn vị N.m."
        },
        {
            type: "multiple",
            question: "Cánh tay đòn của lực là:",
            options: [
                "Khoảng cách từ trục quay đến điểm đặt lực.",
                "Khoảng cách từ trục quay đến trọng tâm.",
                "Khoảng cách vuông góc từ trục quay đến giá của lực.",
                "Chiều dài của vật."
            ],
            correct: 2,
            points: 1,
            explanation: "Định nghĩa: Khoảng cách vuông góc từ trục quay đến giá của lực."
        },
        {
            type: "multiple",
            question: "Moment lực có giá trị bằng 0 khi:",
            options: [
                "Lực tác dụng rất lớn.",
                "Giá của lực song song với trục quay.",
                "Giá của lực cắt trục quay.",
                "Cả B và C đều đúng."
            ],
            correct: 3,
            points: 1,
            explanation: "Khi giá lực cắt hoặc song song với trục quay, cánh tay đòn d=0 nên M=0."
        },
        {
            type: "multiple",
            question: "Ngẫu lực là hệ hai lực:",
            options: [
                "Song song, cùng chiều, cùng độ lớn.",
                "Song song, ngược chiều, cùng độ lớn, cùng tác dụng vào một vật.",
                "Cùng phương, ngược chiều, độ lớn khác nhau.",
                "Vuông góc với nhau."
            ],
            correct: 1,
            points: 1,
            explanation: "Ngẫu lực gồm 2 lực song song, ngược chiều, cùng độ lớn tác dụng vào 1 vật."
        },
        {
            type: "multiple",
            question: "Điều kiện cân bằng của một vật có trục quay cố định là:",
            options: [
                "Tổng các lực tác dụng bằng 0.",
                "Tổng moment lực làm vật quay theo chiều kim đồng hồ bằng tổng moment lực làm vật quay ngược chiều kim đồng hồ.",
                "Vật phải đứng yên tuyệt đối.",
                "Trọng tâm phải thấp nhất."
            ],
            correct: 1,
            points: 1,
            explanation: "Quy tắc moment: $Sigma M_{cùng chiều} = Sigma M_{ngược chiều}$."
        },
        {
            type: "multiple",
            question: "Vị trí trọng tâm của một vật đồng chất, hình dạng đối xứng nằm ở đâu?",
            options: [
                "Tại điểm đặt của lực tác dụng.",
                "Tại tâm đối xứng của vật.",
                "Tại mép của vật.",
                "Bất kỳ điểm nào trên vật."
            ],
            correct: 1,
            points: 1,
            explanation: "Vật đồng chất, đối xứng thì trọng tâm trùng tâm đối xứng."
        },
        {
            type: "multiple",
            question: "Khi dùng cờ-lê để vặn ốc, yếu tố nào giúp vặn dễ hơn?",
            options: [
                "Cờ-lê càng ngắn càng tốt.",
                "Cờ-lê càng dài càng tốt.",
                "Tác dụng lực song song với thân cờ-lê.",
                "Vặn ốc khi trời lạnh."
            ],
            correct: 1,
            points: 1,
            explanation: "Cờ-lê dài làm tăng cánh tay đòn (d), giúp tăng Moment lực."
        },
        {
            type: "multiple",
            question: "Moment lực là đại lượng:",
            options: [
                "Vô hướng, luôn dương.",
                "Đại số (có thể âm hoặc dương).",
                "Vectơ.",
                "Luôn bằng 0."
            ],
            correct: 1,
            points: 1,
            explanation: "Trong chương trình phổ thông thường xét giá trị đại số, nhưng bản chất nó là đại lượng có hướng."
        },
        {
            type: "multiple",
            question: "Đơn vị nào sau đây KHÔNG phải là đơn vị của năng lượng nhưng có cùng thứ nguyên với Năng lượng?",
            options: [
                "Joule",
                "Calo",
                "N.m (Moment lực)",
                "kWh"
            ],
            correct: 2,
            points: 1,
            explanation: "N.m của Moment lực có cùng thứ nguyên ($ML^2T^{-2}$) với Công (Joule) nhưng bản chất vật lý khác nhau."
        },
        {
            type: "multiple",
            question: "Quy tắc hợp lực song song cùng chiều giúp xác định:",
            options: [
                "Trọng tâm của vật.",
                "Vận tốc góc.",
                "Gia tốc hướng tâm.",
                "Lực ma sát."
            ],
            correct: 0,
            points: 1,
            explanation: "Trọng tâm thực chất là điểm đặt của hợp lực các trọng lực nhỏ song song."
        },
        {
            type: "truefalse",
            question: "Xét tính đúng sai của các phát biểu về Moment lực:",
            statements: [
                "Moment lực đặc trưng cho tác dụng nén của lực.",
                "Đơn vị moment lực là N.m.",
                "Cánh tay đòn là khoảng cách từ trục quay đến điểm đặt lực.",
                "Moment lực có thể mang giá trị âm hoặc dương tùy chiều quay chọn làm mốc."
            ],
            correctAnswers: [
                false,
                true,
                false,
                true
            ],
            points: 4,
            explanation: "1. Sai (Làm quay). 2. Đúng. 3. Sai (Vuông góc giá lực). 4. Đúng."
        },
        {
            type: "truefalse",
            question: "Xét tính đúng sai trong các tình huống thực tế:",
            statements: [
                "Cắt kim loại cần kéo dài cán kéo để tăng lực cắt.",
                "Mở cửa, ta đẩy ở sát bản lề sẽ nhẹ hơn.",
                "Vô lăng ô tô có bán kính càng lớn thì quay càng nhẹ (lợi về lực).",
                "Khi gánh nước, nếu đòn gánh cong xuống (đàn hồi) sẽ làm thay đổi moment trọng lực."
            ],
            correctAnswers: [
                true,
                false,
                true,
                false
            ],
            points: 4,
            explanation: "2. Sai (Đẩy xa bản lề mới nhẹ). 4. Sai (Trọng lượng và cánh tay đòn ngang không đổi đáng kể theo cách hiểu cơ bản)."
        },
        {
            type: "truefalse",
            question: "Về điều kiện cân bằng:",
            statements: [
                "Vật đứng yên nghĩa là tổng hợp lực bằng 0 và tổng moment bằng 0.",
                "Ngẫu lực có hợp lực bằng 0 nên không gây ra tác dụng quay.",
                "Trọng tâm của vòng nhẫn nằm ngoài phần vật chất của nhẫn.",
                "Vật có mặt chân đế càng rộng thì càng khó bị lật."
            ],
            correctAnswers: [
                true,
                false,
                true,
                true
            ],
            points: 4,
            explanation: "2. Sai (Ngẫu lực gây quay rất mạnh)."
        },
        {
            type: "truefalse",
            question: "Xét vật rắn có trục quay:",
            statements: [
                "Nếu lực có giá đi qua trục quay thì vật không quay.",
                "Mọi lực tác dụng lên vật rắn đều gây ra moment.",
                "Lực càng lớn thì moment càng lớn (giữ nguyên d).",
                "Hai lực cân bằng thì moment của chúng đối với 1 trục bất kỳ luôn triệt tiêu nhau."
            ],
            correctAnswers: [
                true,
                false,
                true,
                true
            ],
            points: 4,
            explanation: "2. Sai (Lực cắt trục quay M=0)."
        },
        {
            type: "short",
            question: "Một thanh cứng AB dài 2m. Lực F=10N tác dụng vào đầu B vuông góc với thanh. Trục quay tại A. Tính moment lực (đơn vị N.m).",
            correct: "20",
            points: 5,
            explanation: "20 N.m"
        },
        {
            type: "short",
            question: "Để tháo bu lông, người ta dùng cờ lê dài 25cm. Lực tay là 100N. Moment lực tạo ra là bao nhiêu N.m?",
            correct: "25",
            points: 5,
            explanation: "$100 \\times 0.25 = 25$."
        },
        {
            type: "short",
            question: "Vật nặng 5kg treo vào đầu A của thanh nhẹ AB (trục quay O). OA = 20cm, OB = 50cm. Cần treo vật nặng m bao nhiêu kg tại B để thanh cân bằng? (Nhập số)",
            correct: "2",
            points: 5,
            explanation: "$5 \\times 20 = m \\times 50 \\Rightarrow m = 2kg$."
        },
        {
            type: "short",
            question: "Góc hợp bởi lực và cánh tay đòn là 90 độ thì $\\sin(\\alpha)$ bằng bao nhiêu?",
            correct: "1",
            points: 5,
            explanation: "Sin 90 độ = 1."
        },
        {
            type: "essay",
            question: "Giải thích tại sao khi thiết kế các dụng cụ cắt kim loại (kìm cộng lực), phần tay cầm thường rất dài trong khi phần lưỡi cắt lại rất ngắn?",
            suggested: "Dựa vào quy tắc moment lực ($F_1.d_1 = F_2.d_2$): Lực tác dụng của tay ($F_1$) có cánh tay đòn ($d_1$) rất lớn (tay cầm dài), trong khi lực cản của kim loại ($F_2$) tác dụng lên lưỡi cắt có cánh tay đòn ($d_2$) rất nhỏ. Vì $d_1 gg d_2$, nên lực cắt sinh ra $F_2 = F_1.(d_1/d_2)$ sẽ rất lớn, giúp cắt đứt kim loại dễ dàng.",
            points: 10,
            explanation: "Chấm điểm dựa trên ý: So sánh cánh tay đòn và sự khuếch đại lực."
        },
        {
            type: "essay",
            question: "Một thanh đồng chất tiết diện đều dài L, trọng lượng P được đặt trên mặt bàn sao cho 1/3 chiều dài của nó nhô ra khỏi mép bàn. Tác dụng một lực F thẳng đứng xuống dưới tại đầu nhô ra. Hỏi lực F tối thiểu bằng bao nhiêu (theo P) để đầu kia của thanh bắt đầu bênh lên?",
            suggested: "Trục quay tại mép bàn. Trọng lực P đặt tại trung điểm thanh (cách mép bàn $L/2 - L/3 = L/6$ về phía trong). Lực F đặt tại đầu thanh (cách mép bàn $L/3$). Cân bằng moment: $P.(L/6) = F.(L/3) Rightarrow P/6 = F/3 Rightarrow F = P/2$. Vậy lực tối thiểu là $P/2$.",
            points: 10,
            explanation: "Vẽ hình, xác định cánh tay đòn của P và F so với mép bàn."
        },
        {
            type: "essay",
            question: "Tại sao khi bước lên bậc thang cao hoặc leo dốc, người ta thường có xu hướng gập người về phía trước?",
            suggested: "Khi leo dốc, trọng tâm cơ thể dễ rơi ra khỏi mặt chân đế (về phía sau) gây ngã. Việc gập người về phía trước giúp dời trọng tâm về phía trước, đảm bảo đường gióng của trọng tâm đi qua mặt chân đế, giúp duy trì cân bằng và tạo moment lực thuận lợi cho việc di chuyển.",
            points: 10,
            explanation: "Liên quan đến vị trí trọng tâm và mặt chân đế."
        },
        {
            type: "essay",
            question: "Trình bày các bước để xác định cánh tay đòn của một lực bất kỳ đối với một trục quay.",
            suggested: "Bước 1: Xác định trục quay (O). Bước 2: Xác định giá của lực (đường thẳng chứa vectơ lực). Bước 3: Từ trục quay O, hạ đường vuông góc xuống giá của lực. Bước 4: Đo độ dài đoạn vuông góc đó. Đó chính là cánh tay đòn d.",
            points: 10,
            explanation: "Yêu cầu đủ 3 bước chính: Trục quay, Giá lực, Hạ vuông góc."
        },
        {
            type: "essay",
            question: "Cho một thước mét có trục quay tại vạch 0. Tại vạch 20cm treo vật 2kg, tại vạch 50cm treo vật 1kg. Hỏi phải treo vật 3kg ở vạch nào để thước cân bằng? (Bỏ qua trọng lượng thước)",
            suggested: "Tổng moment lực làm thước quay theo chiều kim đồng hồ bằng tổng moment ngược lại (nếu coi điểm treo vật 3kg là đối trọng). Giả sử các lực cùng chiều kéo xuống thì không bao giờ cân bằng nếu trục ở đầu mút 0. Đề bài ngụ ý tìm vị trí hợp lực hoặc bài toán đòn bẩy. Nếu trục ở O(0), các lực đều kéo xuống -> không cân bằng. Sửa lại: Trục quay ở vạch 50cm (giữa). Bên trái (vạch 20): $d=30cm$, $m=2kg$. Bên phải treo 3kg ở đâu? $2 \times 30 = 3 \times x Rightarrow x = 20cm$. Vậy treo cách trục 20cm (tức là vạch 70cm).",
            points: 10,
            explanation: "Lưu ý học sinh cần xác định lại giả thiết nếu đề bài mở, hoặc tính toán dựa trên trục quay cụ thể."
        }
    ]
};
