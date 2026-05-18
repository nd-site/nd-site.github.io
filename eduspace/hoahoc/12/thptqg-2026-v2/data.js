window.quizData = {
    title: "Đề thi thử tốt nghiệp THPT 2026 - Môn Hóa Học (Bản 2)",
    config: {
        testDuration: 3000,
        examLayout: {
            multiple: { count: 18, pointsPerQ: 0.25 },
            truefalse: { count: 4, pointsPerQ: 1.0 },
            short: { count: 6, pointsPerQ: 0.25 }
        }
    },
    questions: [
        // --- PHẦN I: Trắc nghiệm nhiều lựa chọn (18 câu - 4,5 điểm) ---
        {
            type: "multiple",
            question: "Este vinyl axetat có công thức phân tử là:",
            options: ["C4H8O2", "C4H6O2", "C3H6O2", "C5H8O2"],
            correct: 1,
            explanation: "Vinyl axetat là CH3COOCH=CH2, có CTPT C4H6O2 (M=86)."
        },
        {
            type: "multiple",
            question: "Phản ứng thủy phân este trong môi trường kiềm được gọi là:",
            options: ["phản ứng este hóa", "phản ứng xà phòng hóa", "phản ứng trùng hợp", "phản ứng trùng ngưng"],
            correct: 1,
            explanation: "Thủy phân este trong môi trường kiềm gọi là phản ứng xà phòng hóa - phản ứng một chiều."
        },
        {
            type: "multiple",
            question: "Chất béo là trieste của glixerol với:",
            options: ["axit vô cơ", "axit cacboxylic mạch ngắn", "axit béo (axit cacboxylic mạch dài)", "ancol mạch dài"],
            correct: 2,
            explanation: "Chất béo là trieste tạo từ glixerol và các axit béo (axit cacboxylic mạch dài, từ C15 trở lên)."
        },
        {
            type: "multiple",
            question: "Saccarozơ có thể tham gia phản ứng nào sau đây?",
            options: ["Phản ứng tráng bạc", "Hòa tan Cu(OH)2 tạo dung dịch xanh lam", "Phản ứng cộng H2/Ni, t°", "Phản ứng với dung dịch Br2"],
            correct: 1,
            explanation: "Saccarozơ là poliancol, hòa tan Cu(OH)2 tạo phức màu xanh lam. Không có nhóm -CHO nên không tráng bạc."
        },
        {
            type: "multiple",
            question: "Tinh bột và xenlulozơ đều có công thức chung là:",
            options: ["(C6H10O5)n", "C6H12O6", "(C12H22O11)n", "C12H22O11"],
            correct: 0,
            explanation: "Tinh bột và xenlulozơ đều là polisaccarit có công thức (C6H10O5)n nhưng cấu trúc và giá trị n khác nhau."
        },
        {
            type: "multiple",
            question: "Trong số alanin, lysin, axit glutamic, glyxin - số chất làm quỳ tím chuyển sang màu xanh là:",
            options: ["1", "2", "3", "0"],
            correct: 0,
            explanation: "Chỉ lysin (2 nhóm -NH2, 1 nhóm -COOH) làm quỳ xanh. Axit glutamic (2 -COOH) làm quỳ đỏ. Alanin, glyxin không đổi màu."
        },
        {
            type: "multiple",
            question: "Phát biểu nào sau đây về protein là đúng?",
            options: [
                "Protein chỉ tan trong nước lạnh",
                "Tất cả protein đều bị kết tủa khi đun nóng",
                "Protein có phản ứng màu biure với Cu(OH)2/NaOH cho màu tím đặc trưng",
                "Protein không bị thủy phân trong môi trường axit"
            ],
            correct: 2,
            explanation: "Phản ứng biure: protein + Cu(OH)2 trong NaOH → màu tím đặc trưng. Đây là phản ứng nhận biết protein."
        },
        {
            type: "multiple",
            question: "Tơ nilon-6 được điều chế bằng phản ứng trùng hợp monome nào?",
            options: ["Caprolactam", "Hexametylendiamin và axit ađipic", "Axit ε-aminocaproic", "Vinyl clorua"],
            correct: 0,
            explanation: "Nilon-6 điều chế từ trùng hợp caprolactam (vòng lactam 7 cạnh). Nilon-6,6 mới dùng hexametylendiamin + axit ađipic."
        },
        {
            type: "multiple",
            question: "Cao su buna-S là sản phẩm đồng trùng hợp của buta-1,3-đien với:",
            options: ["Stiren", "Acrilonitrin", "Isopren", "Vinyl clorua"],
            correct: 0,
            explanation: "Cao su buna-S (SBR) là đồng polime của buta-1,3-đien và stiren (C6H5CH=CH2)."
        },
        {
            type: "multiple",
            question: "Kim loại nào sau đây có thể tan trong dung dịch NaOH loãng?",
            options: ["Fe", "Cu", "Ag", "Al"],
            correct: 3,
            explanation: "Al tan trong NaOH loãng: 2Al + 2NaOH + 2H2O → 2NaAlO2 + 3H2↑."
        },
        {
            type: "multiple",
            question: "Trong lò cao luyện gang, chất khử chính để khử oxit sắt là:",
            options: ["C (coke)", "CO", "CaCO3", "SiO2"],
            correct: 1,
            explanation: "CO là chất khử chính trong lò cao: Fe2O3 + 3CO → 2Fe + 3CO2 (ở ~700°C)."
        },
        {
            type: "multiple",
            question: "Điện phân dung dịch NaCl bão hòa có màng ngăn xốp, sản phẩm thu được tại catot là:",
            options: ["Cl2", "NaOH và H2", "H2", "Na"],
            correct: 2,
            explanation: "Tại catot: 2H2O + 2e⁻ → H2↑ + 2OH⁻. Tại anot: 2Cl⁻ → Cl2↑ + 2e⁻. NaOH sinh ra ở phía catot trong dung dịch."
        },
        {
            type: "multiple",
            question: "Nguyên tắc của phương pháp thủy luyện điều chế kim loại là:",
            options: [
                "Khử oxit kim loại bằng chất khử ở nhiệt độ cao",
                "Kim loại mạnh đẩy kim loại yếu ra khỏi dung dịch muối",
                "Điện phân dung dịch muối",
                "Nhiệt phân muối kim loại"
            ],
            correct: 1,
            explanation: "Thủy luyện: Fe + CuSO4 → FeSO4 + Cu↓. Kim loại mạnh hơn đẩy kim loại yếu hơn khỏi dung dịch muối."
        },
        {
            type: "multiple",
            question: "Cr2O3 có tính chất hóa học đặc trưng là:",
            options: ["Chỉ có tính bazơ", "Chỉ có tính axit", "Có tính lưỡng tính", "Trơ về mặt hóa học"],
            correct: 2,
            explanation: "Cr2O3 là oxit lưỡng tính: tan trong HCl → CrCl3 và tan trong NaOH đặc nóng → NaCrO2."
        },
        {
            type: "multiple",
            question: "Điều kiện đủ để xảy ra ăn mòn điện hóa học là:",
            options: [
                "Chỉ cần hai kim loại khác nhau tiếp xúc nhau trong không khí ẩm",
                "Hai điện cực khác chất, tiếp xúc nhau, cùng nhúng vào dung dịch chất điện li",
                "Một kim loại và một phi kim, không cần tiếp xúc với dung dịch điện li",
                "Hai kim loại cùng loại nhúng vào dung dịch axit"
            ],
            correct: 1,
            explanation: "Ăn mòn điện hóa cần: 2 điện cực khác chất + tiếp xúc nhau + cùng nhúng vào dung dịch chất điện li."
        },
        {
            type: "multiple",
            question: "Để bảo vệ vỏ tàu biển bằng thép (phần chìm dưới nước biển), người ta gắn vào vỏ tàu những tấm kim loại:",
            options: ["Cu", "Ag", "Zn", "Sn"],
            correct: 2,
            explanation: "Gắn Zn (kim loại mạnh hơn Fe) làm anot hy sinh. Zn bị ăn mòn thay cho Fe, bảo vệ vỏ tàu."
        },
        {
            type: "multiple",
            question: "Trong pin điện hóa Zn-Cu, quá trình oxi hóa xảy ra tại:",
            options: ["Cực Zn (anot)", "Cực Cu (catot)", "Cả hai cực đồng thời", "Dung dịch điện li"],
            correct: 0,
            explanation: "Tại anot (cực âm của pin) - Cực Zn: Zn → Zn²⁺ + 2e⁻ (oxi hóa). Tại catot - Cực Cu: Cu²⁺ + 2e⁻ → Cu (khử)."
        },
        {
            type: "multiple",
            question: "Hợp chất nào sau đây vừa tác dụng được với dung dịch HCl, vừa tác dụng được với dung dịch NaOH?",
            options: ["CH3COOC2H5", "H2N-CH2-COOH", "CH3NH2", "CH3COOH"],
            correct: 1,
            explanation: "Glyxin (H2N-CH2-COOH) có -NH2 phản ứng HCl, có -COOH phản ứng NaOH - hợp chất lưỡng tính."
        },

        // --- PHẦN II: Trắc nghiệm Đúng/Sai (4 câu - 4,0 điểm) ---
        {
            type: "truefalse",
            question: "Cho sơ đồ: Xenlulozơ $\\xrightarrow{H_2SO_4 loãng, t°}$ X $\\xrightarrow{\\text{men rượu}}$ Y $\\xrightarrow{\\text{lên men giấm}}$ Z. Biết X, Y, Z là hợp chất hữu cơ.",
            options: [
                "Chất X là glucozơ (C6H12O6).",
                "Chất Y là ancol etylic (C2H5OH).",
                "Chất Z là axit axetic (CH3COOH).",
                "Phản ứng X → Y cần xúc tác là H2SO4 loãng."
            ],
            correct: [true, true, true, false],
            explanation: "- Xenlulozơ thủy phân → Glucozơ (X): Đúng.\n- Glucozơ lên men rượu → Ancol etylic (Y): Đúng.\n- Ancol etylic lên men giấm → Axit axetic (Z): Đúng.\n- X→Y dùng men rượu, không phải H2SO4 loãng: Sai."
        },
        {
            type: "truefalse",
            question: "Tiến hành thí nghiệm tráng bạc: Cho AgNO3/NH3 vào ống nghiệm sạch, thêm dung dịch glucozơ 1%, đun cách thủy 60-70°C.",
            options: [
                "Dung dịch AgNO3/NH3 là phức [Ag(NH3)2]OH.",
                "Lớp bạc sáng bóng bám thành ống là sản phẩm phản ứng oxi hóa - khử.",
                "Thay glucozơ bằng saccarozơ vẫn quan sát được kết tủa bạc.",
                "Phản ứng chứng minh glucozơ có tính khử."
            ],
            correct: [true, true, false, true],
            explanation: "- Phức bạc amoniac [Ag(NH3)2]OH: Đúng.\n- Ag tạo ra do oxi hóa - khử (glucozơ bị oxi hóa, Ag⁺ bị khử): Đúng.\n- Saccarozơ không có -CHO nên không tráng bạc: Sai.\n- Tráng bạc chứng minh glucozơ có tính khử: Đúng."
        },
        {
            type: "truefalse",
            question: "Cho luồng khí H2 dư qua hỗn hợp bột CuO, Fe2O3, Al2O3, MgO đun nóng ở nhiệt độ cao. Sau phản ứng hoàn toàn.",
            options: [
                "CuO bị khử hoàn toàn thành kim loại Cu.",
                "Fe2O3 bị khử hoàn toàn thành kim loại Fe.",
                "Al2O3 bị khử thành kim loại Al.",
                "MgO bị khử thành kim loại Mg."
            ],
            correct: [true, true, false, false],
            explanation: "- H2 khử CuO → Cu: Đúng (Cu đứng sau H trong dãy điện hóa).\n- H2 khử Fe2O3 → Fe: Đúng (Fe đứng sau H).\n- Al2O3 không bị H2 khử - Al đứng trước H: Sai.\n- MgO không bị H2 khử - Mg hoạt động mạnh hơn H: Sai."
        },
        {
            type: "truefalse",
            question: "Cho 11,2 gam Fe tác dụng vừa đủ với dung dịch HNO3 loãng, thu được muối Fe(NO3)3 và khí NO (sản phẩm khử duy nhất, đktc). Biết M(Fe)=56, M(Fe(NO3)3)=242.",
            options: [
                "Số mol Fe phản ứng là 0,2 mol.",
                "Số mol NO thu được là 0,2 mol.",
                "Thể tích khí NO ở đktc là 4,48 lít.",
                "Khối lượng muối Fe(NO3)3 thu được là 48,4 gam."
            ],
            correct: [true, true, true, true],
            explanation: "- nFe = 11,2/56 = 0,2 mol: Đúng.\n- Fe → Fe³⁺ + 3e⁻: ne = 0,6 mol. NO3⁻ + 4H⁺ + 3e⁻ → NO: nNO = 0,6/3 = 0,2 mol: Đúng.\n- VNO = 0,2×22,4 = 4,48 lít: Đúng.\n- mFe(NO3)3 = 0,2×242 = 48,4 gam: Đúng."
        },

        // --- PHẦN III: Trắc nghiệm trả lời ngắn (6 câu - 1,5 điểm) ---
        {
            type: "short",
            question: "Để tổng hợp Aspirin (axit axetylsalicilic, dùng làm thuốc giảm đau), người ta cho axit salixilic ($o-HOC_6H_4COOH$) phản ứng với anhiđrit axetic. Từ 13,8 kg axit salixilic có thể điều chế được tối đa bao nhiêu kilogam Aspirin, biết hiệu suất phản ứng đạt 80%? (Cho khối lượng mol: axit salixilic = 138; Aspirin = 180). (Làm tròn kết quả đến hàng phần mười, chỉ điền số)",
            correct: "14.4",
            explanation: "Số mol axit salixilic là: $n = 13,8 / 138 = 0,1$ kmol. Phương trình phản ứng: $HOC_6H_4COOH + (CH_3CO)_2O \\rightarrow CH_3COOC_6H_4COOH \\text{ (Aspirin)} + CH_3COOH$. Theo phương trình, số mol Aspirin lý thuyết là 0,1 kmol. Khối lượng Aspirin thu được theo lý thuyết: $m_{\\text{LT}} = 0,1 \\cdot 180 = 18,0$ kg. Vì hiệu suất phản ứng đạt 80%, nên khối lượng Aspirin thực tế thu được là: $m_{\\text{TT}} = 18,0 \\cdot 80\\% = 14,4$ kg."
        },
        {
            type: "short",
            question: "Cho 9,0 gam glucozơ (C6H12O6) tác dụng hoàn toàn với dung dịch AgNO3/NH3 (đun nóng). Khối lượng Ag kết tủa thu được là bao nhiêu gam? (M: C6H12O6=180; Ag=108)",
            correct: "10.8",
            explanation: "nGlucozơ = 9,0/180 = 0,05 mol. C6H12O6 + 2[Ag(NH3)2]OH → C6H12O7 + 2Ag↓ + 4NH3 + H2O. nAg = 2×0,05 = 0,1 mol. mAg = 0,1×108 = 10,8 gam."
        },
        {
            type: "short",
            question: "Đốt cháy hoàn toàn metan ($CH_4$) và etan ($C_2H_6$) tỏa ra lượng nhiệt lần lượt là 890 kJ/mol và 1560 kJ/mol. Một loại khí thiên nhiên chứa 95% metan và 5% etan về thể tích. Tính lượng nhiệt tỏa ra (theo đơn vị MJ, làm tròn đến hàng phần mười) khi đốt cháy hoàn toàn 11,2 m³ khí thiên nhiên trên ở điều kiện tiêu chuẩn (đktc).",
            correct: "461.8",
            explanation: "Đổi 11,2 m³ = 11200 lít khí. Tổng số mol khí thiên nhiên là: $n = 11200 / 22,4 = 500$ mol. Vì tỉ lệ thể tích bằng tỉ lệ số mol nên: - Số mol $CH_4$: $n_{CH_4} = 500 \\cdot 95\\% = 475$ mol. - Số mol $C_2H_6$: $n_{C_2H_6} = 500 \\cdot 5\\% = 25$ mol. Tổng nhiệt lượng tỏa ra khi đốt cháy hỗn hợp khí là: $Q = 475 \\cdot 890 + 25 \\cdot 1560 = 461750$ kJ. Quy đổi sang đơn vị MJ ($1 \\text{ MJ} = 1000 \\text{ kJ}$): $Q = 461750 / 1000 = 461,75$ MJ $\\approx 461,8$ MJ (làm tròn đến hàng phần mười)."
        },
        {
            type: "short",
            question: "Điện phân dung dịch CuSO4 với điện cực trơ bằng dòng điện 5A trong 3860 giây. Khối lượng Cu bám vào catot là bao nhiêu gam? (M: Cu=64; F=96500 C/mol)",
            correct: "6.4",
            explanation: "ne = I×t/F = 5×3860/96500 = 0,2 mol. Catot: Cu²⁺ + 2e⁻ → Cu. nCu = 0,2/2 = 0,1 mol. mCu = 0,1×64 = 6,4 gam."
        },
        {
            type: "short",
            question: "Quặng hematit chứa thành phần chính là $Fe_2O_3$ (còn lại là tạp chất trơ). Khử hoàn toàn 10 tấn quặng hematit trên bằng khí CO dư trong lò cao, thu được 5,6 tấn sắt kim loại. Tính phần trăm (%) khối lượng của $Fe_2O_3$ tinh khiết trong mẫu quặng đó. (Cho khối lượng mol: Fe = 56; Fe2O3 = 160. Chỉ điền số)",
            correct: "80",
            explanation: "Sơ đồ chuyển hóa: $Fe_2O_3 \\rightarrow 2Fe$. Ta có: 160 tấn $Fe_2O_3$ tạo ra 112 tấn Fe. Vậy để tạo ra 5,6 tấn Fe thì khối lượng $Fe_2O_3$ tinh khiết cần dùng là: $m_{Fe_2O_3} = \\frac{5,6 \\cdot 160}{112} = 8$ tấn. Phần trăm khối lượng $Fe_2O_3$ tinh khiết trong quặng hematit là: $\\%m_{Fe_2O_3} = \\frac{8}{10} \\cdot 100\\% = 80\\%$. (Chỉ điền số 80)."
        },
        {
            type: "short",
            question: "Để trung hòa hoàn toàn 8,9 gam một amino axit no, đơn chức (1 nhóm -NH2, 1 nhóm -COOH) cần vừa đủ 100 ml dung dịch NaOH 1M. Phân tử khối của amino axit này là bao nhiêu? (Làm tròn đến số nguyên)",
            correct: "89",
            explanation: "nNaOH = 0,1 mol = naxit amin. M = 8,9/0,1 = 89. Đây là alanin (CH3CH(NH2)COOH, M=89)."
        }
    ]
};
