// data.js – KIỂM TRA CUỐI KÌ II – NGỮ VĂN 10 (KNTT) – 2025-2026
// Chương trình GDPT 2018 | Sách Kết Nối Tri Thức với Cuộc Sống
// Cấu trúc: 100% Tự luận (Đọc hiểu 4,0đ - Viết 6,0đ) | 90 phút

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Ngữ Văn 10 (Kết nối tri thức) 2025-2026",
    config: {
        testDuration: 5400, // 90 phút
        examLayout: {
            essay: { count: 2, pointsPerQ: 5.0, pointsList: { "0": 4.0, "1": 6.0 } }
        }
    },
    questions: [
        {
            type: "essay",
            question: "**PHẦN I. ĐỌC HIỂU (4,0 điểm)**\nĐọc đoạn trích sau và thực hiện các yêu cầu:\n\n*\"Ta đi trọn kiếp con người\nCũng không đi hết mấy lời mẹ ru.\nBao la rặng núi mây mù\nTrời chiều bát ngát mấy thu lại về.\nNẻo đời cát bụi sơn khê\nMẹ cho con vắt trăng thề làm tin.\"*\n(Trích *Ngồi buồn nhớ mẹ ta xưa*, Nguyễn Duy)\n\n**Câu 1 (1,0 điểm):** Xác định thể thơ của đoạn trích.\n**Câu 2 (1,0 điểm):** Chỉ ra những hình ảnh thiên nhiên được nhắc đến trong đoạn thơ.\n**Câu 3 (1,0 điểm):** Nêu hiệu quả của biện pháp tu từ được sử dụng trong hai câu thơ đầu.\n**Câu 4 (1,0 điểm):** Thông điệp ý nghĩa nhất anh/chị rút ra từ đoạn trích là gì? Vì sao?",
            suggested: "Câu 1: Thể thơ lục bát.\nCâu 2: Hình ảnh thiên nhiên: rặng núi, mây mù, trời chiều, cát bụi, sơn khê, trăng thề.\nCâu 3: Biện pháp tu từ: Đối lập/Nói quá (đi trọn kiếp - không đi hết). Hiệu quả: Nhấn mạnh sự sâu sắc, rộng lớn, bao la của tình mẹ, những lời răn dạy của mẹ theo con đi suốt cuộc đời.\nCâu 4: Thông điệp: Tình mẫu tử là tình cảm thiêng liêng, lớn lao nhất; con cái phải biết trân trọng, ghi nhớ công ơn sinh thành dưỡng dục của mẹ.",
            points: 40, // 4.0 điểm x 10 = 40 (hoặc hệ thống tự chia theo config)
            explanation: "AI chấm điểm dựa trên: 1đ thể thơ lục bát, 1đ hình ảnh thiên nhiên, 1đ biện pháp tu từ và hiệu quả, 1đ thông điệp hợp lý."
        },
        {
            type: "essay",
            question: "**PHẦN II. LÀM VĂN (6,0 điểm)**\n\nHãy viết một bài văn nghị luận xã hội (khoảng 500 chữ) trình bày suy nghĩ của anh/chị về ý nghĩa của sự đồng cảm và sẻ chia trong cuộc sống hiện đại.",
            suggested: "Yêu cầu:\n1. Đảm bảo cấu trúc bài văn nghị luận (Mở bài, Thân bài, Kết bài).\n2. Xác định đúng vấn đề nghị luận: Ý nghĩa của sự đồng cảm và sẻ chia.\n3. Triển khai vấn đề nghị luận:\n- Giải thích: Đồng cảm là biết rung động trước niềm vui, nỗi buồn của người khác; sẻ chia là hành động san sẻ về vật chất hoặc tinh thần.\n- Phân tích ý nghĩa:\n  + Giúp những người gặp khó khăn vượt qua nghịch cảnh.\n  + Gắn kết con người, tạo dựng một xã hội nhân văn, tốt đẹp.\n  + Người biết đồng cảm, sẻ chia sẽ nhận được sự tôn trọng, tâm hồn thanh thản.\n- Phản đề: Phê phán lối sống ích kỷ, vô cảm.\n- Bài học nhận thức và hành động.\n4. Sáng tạo và chính tả: Lập luận chặt chẽ, dẫn chứng thuyết phục, không mắc lỗi chính tả.",
            points: 60,
            explanation: "AI chấm điểm dựa trên cấu trúc (1đ), giải thích và phân tích sâu sắc (3.5đ), dẫn chứng thực tế (1đ), sáng tạo và chính tả (0.5đ)."
        }
    ]
};
