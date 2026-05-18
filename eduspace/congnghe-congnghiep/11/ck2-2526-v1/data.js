// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Không có trả lời ngắn (MCQ, TF, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Công nghệ 11 Cơ khí động lực (Kết nối tri thức) 2025-2026",
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
            question: "Nhiệm vụ chính của hệ thống bôi trơn trong động cơ đốt trong là gì?",
            options: [
                "Cung cấp nhiên liệu cho động cơ",
                "Đưa dầu bôi trơn đến các bề mặt ma sát của các chi tiết để giảm hao mòn, làm mát và tẩy rửa",
                "Khởi động động cơ",
                "Tạo tia lửa điện"
            ],
            correct: 1,
            explanation: "Hệ thống bôi trơn có tác dụng giảm ma sát, làm mát, tẩy rửa mạt kim loại và bao kín khe hở."
        },
        {
            type: "multiple",
            question: "Trong hệ thống bôi trơn cưỡng bức, chi tiết nào có nhiệm vụ tạo ra áp suất để đẩy dầu đi bôi trơn?",
            options: [
                "Cacte dầu",
                "Bầu lọc dầu",
                "Bơm dầu",
                "Két làm mát dầu"
            ],
            correct: 2,
            explanation: "Bơm dầu (thường dẫn động từ trục khuỷu) hút dầu từ cacte và nén với áp suất cao đưa vào các đường ống."
        },
        {
            type: "multiple",
            question: "Van an toàn trong hệ thống bôi trơn có tác dụng gì?",
            options: [
                "Mở ra khi áp suất dầu trong hệ thống vượt quá giới hạn cho phép, cho một phần dầu chảy về cacte",
                "Ngăn không cho dầu chảy ngược lại",
                "Làm mát dầu trước khi đi bôi trơn",
                "Mở ra khi bầu lọc dầu bị tắc"
            ],
            correct: 0,
            explanation: "Van an toàn bảo vệ hệ thống không bị phá hỏng do áp suất quá cao (ví dụ khi dầu đặc lúc mới khởi động)."
        },
        {
            type: "multiple",
            question: "Nhiệm vụ của hệ thống làm mát là gì?",
            options: [
                "Giữ cho nhiệt độ của các chi tiết động cơ không vượt quá giới hạn cho phép, đảm bảo động cơ làm việc bình thường",
                "Làm đông đặc dầu bôi trơn",
                "Cung cấp không khí lạnh vào xilanh",
                "Hâm nóng nhiên liệu"
            ],
            correct: 0,
            explanation: "Nếu không làm mát, nhiệt độ cao sẽ làm các chi tiết bị giãn nở, bó kẹt, cháy nổ."
        },
        {
            type: "multiple",
            question: "Trong hệ thống làm mát bằng nước tuần hoàn cưỡng bức, van hằng nhiệt có vai trò gì?",
            options: [
                "Bơm nước đi khắp động cơ",
                "Làm nguội nước",
                "Điều khiển đường đi của nước (qua két hoặc không qua két làm mát) dựa vào nhiệt độ của nước, giúp động cơ nhanh chóng đạt nhiệt độ làm việc",
                "Báo nhiệt độ lên bảng táp-lô"
            ],
            correct: 2,
            explanation: "Khi động cơ mới khởi động (nước nguội), van đóng lại không cho nước ra két làm mát để động cơ mau nóng. Khi nước nóng, van mở để nước ra két tản nhiệt."
        },
        {
            type: "multiple",
            question: "Bộ phận nào của hệ thống làm mát bằng không khí có tác dụng tăng diện tích tiếp xúc với không khí để tản nhiệt nhanh hơn?",
            options: [
                "Quạt gió",
                "Cánh tản nhiệt đúc trên thân xilanh và nắp máy",
                "Két nước",
                "Bơm nước"
            ],
            correct: 1,
            explanation: "Các cánh tản nhiệt làm tăng diện tích bề mặt, giúp truyền nhiệt từ vách xilanh ra không khí tốt hơn (xe máy thường dùng loại này)."
        },
        {
            type: "multiple",
            question: "Ở động cơ xăng dùng bộ chế hòa khí, hòa khí (hỗn hợp xăng và không khí) được hình thành ở đâu?",
            options: [
                "Trong xilanh động cơ",
                "Ở bầu lọc gió",
                "Tại bộ chế hòa khí (trên đường ống nạp)",
                "Ở vòi phun xăng"
            ],
            correct: 2,
            explanation: "Bộ chế hòa khí hòa trộn xăng và không khí theo tỉ lệ thích hợp tạo thành hòa khí trước khi nạp vào xilanh."
        },
        {
            type: "multiple",
            question: "Hệ thống phun xăng điện tử (EFI) có ưu điểm nổi bật nào so với bộ chế hòa khí?",
            options: [
                "Kết cấu đơn giản, dễ sửa chữa",
                "Giá thành rẻ hơn",
                "Tạo hòa khí có tỉ lệ chính xác hơn theo từng chế độ làm việc, tiết kiệm nhiên liệu và giảm ô nhiễm môi trường",
                "Không cần dùng điện"
            ],
            correct: 2,
            explanation: "Hệ thống phun xăng điều khiển bằng điện tử (ECU) giúp phun nhiên liệu tơi, chính xác và sạch hơn."
        },
        {
            type: "multiple",
            question: "Trong hệ thống cung cấp nhiên liệu động cơ Diesel, nhiên liệu được phun vào xilanh ở thời điểm nào?",
            options: [
                "Đầu kì nạp",
                "Giữa kì nén",
                "Cuối kì nén",
                "Đầu kì xả"
            ],
            correct: 2,
            explanation: "Ở động cơ Diesel, chỉ có không khí được nạp vào. Cuối kì nén, bơm cao áp mới phun dầu diesel dưới áp suất cao vào xilanh để tự bốc cháy."
        },
        {
            type: "multiple",
            question: "Bộ phận tạo ra áp suất rất cao để phun tơi nhiên liệu Diesel vào xilanh là:",
            options: [
                "Bơm chuyển nhiên liệu",
                "Bơm cao áp",
                "Bầu lọc tinh",
                "Bầu lọc thô"
            ],
            correct: 1,
            explanation: "Bơm cao áp nén dầu lên áp suất rất lớn (vài trăm bar) để vòi phun phun dầu tơi như sương."
        },
        {
            type: "multiple",
            question: "Hệ thống đánh lửa được trang bị trên loại động cơ nào?",
            options: [
                "Động cơ Diesel",
                "Động cơ Xăng",
                "Cả động cơ xăng và Diesel",
                "Động cơ điện"
            ],
            correct: 1,
            explanation: "Động cơ xăng cần bugi để bật tia lửa điện đốt cháy hòa khí. Động cơ Diesel thì tự bốc cháy do nén ở áp suất và nhiệt độ cao."
        },
        {
            type: "multiple",
            question: "Nhiệm vụ của bugi trong hệ thống đánh lửa là gì?",
            options: [
                "Biến đổi dòng điện hạ áp thành dòng điện cao áp",
                "Tạo ra tia lửa điện ở khe hở bugi để châm cháy hòa khí trong xilanh vào cuối kì nén",
                "Cung cấp điện nguồn cho hệ thống",
                "Chia điện áp cao đến các xilanh"
            ],
            correct: 1,
            explanation: "Bugi nhận điện cao áp từ bô bin và phóng tia lửa điện giữa 2 điện cực."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Chi tiết nào trong hệ thống đánh lửa có chức năng biến dòng điện một chiều điện áp thấp (12V) thành các xung điện cao áp (hàng chục nghìn vôn)?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Bugi",
                "Ắc quy",
                "Bô bin (Cuộn dây đánh lửa)",
                "Đĩa từ"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Bô bin hoạt động như một máy biến áp để tăng áp lực điện lên mức đủ lớn để phóng tia lửa qua khe hở bugi."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Hệ thống khởi động bằng động cơ điện (củ đề) hoạt động dựa vào nguồn năng lượng nào?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Nhiên liệu xăng",
                "Năng lượng khí nén",
                "Điện năng từ ắc quy (dòng điện một chiều)",
                "Sức người"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Động cơ khởi động trên ô tô, xe máy sử dụng điện từ bình ắc quy để làm quay trục khuỷu."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Cơ cấu truyền động của máy khởi động điện có đặc điểm gì?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Bánh răng khởi động luôn luôn ăn khớp với vành răng bánh đà",
                "Chỉ ăn khớp truyền động một chiều từ máy khởi động sang vành răng bánh đà khi khởi động, sau đó tự động tách ra",
                "Truyền động bằng dây đai",
                "Truyền động bằng xích"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Khớp truyền động một chiều (khớp bendix) giúp động cơ điện làm quay trục khuỷu, nhưng khi nổ máy thì trục khuỷu quay nhanh hơn không truyền ngược lại làm hỏng động cơ điện."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Hệ thống truyền lực trên ô tô có nhiệm vụ gì?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Cung cấp năng lượng điện cho xe",
                "Truyền mômen quay từ động cơ tới các bánh xe chủ động",
                "Điều khiển hướng chuyển động của xe",
                "Giảm xóc khi xe đi qua đường gồ ghề"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Hệ thống truyền lực (gồm li hợp, hộp số, truyền lực các đăng, truyền lực chính, vi sai...) đưa công suất từ động cơ xuống bánh xe để xe chạy."
        },
        {
            type: "essay",
            question: "Nêu nhiệm vụ của hệ thống bôi trơn trên động cơ đốt trong. Trình bày đường đi của dầu bôi trơn trong hệ thống bôi trơn cưỡng bức ở trạng thái hoạt động bình thường.",
            suggested: "1. Nhiệm vụ: Đưa dầu bôi trơn đến các bề mặt ma sát của các chi tiết để giảm ma sát, giảm mài mòn, làm mát, tẩy rửa mạt kim loại và bao kín.\n2. Đường đi của dầu (khi động cơ hoạt động bình thường, dầu không quá nóng, bầu lọc không tắc):\nCacte (chứa dầu) -> Bơm dầu hút lên -> Bầu lọc dầu (để lọc sạch cặn bẩn) -> Đường dầu chính -> Đi đến các bề mặt ma sát (cổ biên, trục khuỷu, trục cam...) để bôi trơn -> Dầu rơi tự do trở lại Cacte.",
            points: 25,
            explanation: "AI chấm: Nêu đủ 4 nhiệm vụ của dầu (giảm ma sát, làm mát, tẩy rửa, bao kín) (10đ). Nêu đúng đường đi cơ bản (Cacte -> bơm -> lọc dầu -> đường dầu chính -> các bề mặt ma sát -> cacte) (15đ)."
        },
        {
            type: "essay",
            question: "Tại sao ở động cơ Diesel không có hệ thống đánh lửa (bugi) như ở động cơ xăng? Vậy làm thế nào để nhiên liệu Diesel bốc cháy sinh công?",
            suggested: "1. Không có hệ thống đánh lửa vì: Động cơ Diesel hoạt động dựa trên nguyên lí tự bốc cháy của nhiên liệu khi được phun vào môi trường không khí có áp suất và nhiệt độ rất cao, không cần tia lửa điện mồi.\n2. Cách sinh công: \n- Ở kì nạp, động cơ chỉ hút không khí thuần túy vào xilanh.\n- Ở kì nén, không khí bị nén với tỉ số nén rất lớn (cao hơn động cơ xăng nhiều), làm nhiệt độ không khí tăng vọt lên khoảng 700-900 độ C.\n- Cuối kì nén, bơm cao áp phun tơi nhiên liệu Diesel qua vòi phun vào xilanh. Gặp không khí cực nóng, nhiên liệu hòa trộn và lập tức tự bốc cháy, sinh ra áp suất lớn đẩy piston đi xuống sinh công.",
            points: 25,
            explanation: "AI chấm: Giải thích đúng cơ chế tự bốc cháy (10đ). Trình bày được quá trình nén không khí (tạo nhiệt độ cao) và phun nhiên liệu tơi ở cuối kì nén để tự bốc cháy (15đ)."
        },
        {
            type: "essay",
            question: "Hệ thống truyền lực trên ô tô làm nhiệm vụ gì? Vẽ sơ đồ khối (hoặc nêu tên theo thứ tự) các bộ phận chính của hệ thống truyền lực từ động cơ đến bánh xe chủ động.",
            suggested: "1. Nhiệm vụ: Truyền, biến đổi mômen quay (cả về chiều và trị số) từ động cơ tới các bánh xe chủ động, giúp ô tô chuyển động, dừng đỗ hoặc đi lùi.\n2. Sơ đồ khối/Thứ tự các bộ phận truyền lực (xe cầu sau chủ động):\nĐộng cơ  ->  Li hợp (Côn)  ->  Hộp số  ->  Truyền lực các đăng  ->  Truyền lực chính và Bộ Vi sai (cầu sau)  ->  Bán trục (trục truyền động)  ->  Bánh xe chủ động.",
            points: 25,
            explanation: "AI chấm: Nêu đúng nhiệm vụ truyền và biến đổi mô men (10đ). Nêu đúng thứ tự ít nhất 5 thành phần cốt lõi: Động cơ -> Li hợp -> Hộp số -> Các đăng -> Truyền lực chính/Vi sai -> Bánh xe (15đ)."
        }
    ]
};
