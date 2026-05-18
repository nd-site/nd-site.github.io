window.quizData = {
    "title": "Kiểm tra Giữa Học Kì II – Tin học 10 (KNTT) – 2025-2026",
    "config": {
        "testDuration": 2700,
        "examLayout": {
            "multiple": { "count": 12, "pointsPerQ": 0.25 },
            "truefalse": { "count": 4, "pointsPerQ": 1.0, "partialScoring": [0.1, 0.25, 0.5, 1.0] },
            "short": { "count": 6, "pointsPerQ": 0.5 }
        }
    },
    "questions": [
        // --- PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN ---
        {
            "type": "multiple",
            "question": "Python là ngôn ngữ lập trình thuộc loại nào sau đây?",
            "options": [
                "Ngôn ngữ máy.",
                "Hợp ngữ.",
                "Ngôn ngữ lập trình bậc cao.",
                "Ngôn ngữ kịch bản cổ điển."
            ],
            "correct": 2,
            "explanation": "Python là ngôn ngữ lập trình bậc cao, dễ học, dễ đọc và có tính ứng dụng rất rộng rãi."
        },
        {
            "type": "multiple",
            "question": "Trong Python, tên biến nào sau đây là **hợp lệ**?",
            "options": ["1_variable", "my-variable", "_myVariable", "class"],
            "correct": 2,
            "explanation": "Tên biến không bắt đầu bằng số, không chứa dấu gạch nối và không được trùng với từ khóa (như 'class')."
        },
        {
            "type": "multiple",
            "question": "Lệnh nào dùng để nhập dữ liệu từ bàn phím trong Python?",
            "options": ["print()", "input()", "read()", "write()"],
            "correct": 1,
            "explanation": "Hàm input() dùng để nhận dữ liệu nhập vào từ người dùng dưới dạng chuỗi (string)."
        },
        {
            "type": "multiple",
            "question": "Kết quả của biểu thức `10 % 3` trong Python là:",
            "options": ["3", "3.33", "1", "0"],
            "correct": 2,
            "explanation": "Toán tử `%` là toán tử chia lấy phần dư. 10 chia 3 dư 1."
        },
        {
            "type": "multiple",
            "question": "Để in ra màn hình dòng chữ 'Hello World', ta dùng lệnh nào?",
            "options": [
                "print('Hello World')",
                "echo 'Hello World'",
                "write('Hello World')",
                "console.log('Hello World')"
            ],
            "correct": 0,
            "explanation": "Hàm print() là hàm chuẩn để xuất dữ liệu ra màn hình trong Python."
        },
        {
            "type": "multiple",
            "question": "Câu lệnh rẽ nhánh dạng thiếu trong Python có cấu trúc là:",
            "options": [
                "if <điều kiện> then:",
                "if <điều kiện> :",
                "if <điều kiện> do:",
                "if (<điều kiện>)"
            ],
            "correct": 1,
            "explanation": "Cấu trúc đúng là: `if <điều kiện>:` (phải có dấu hai chấm)."
        },
        {
            "type": "multiple",
            "question": "Câu lệnh nào dùng để tạo vòng lặp với số lần lặp biết trước?",
            "options": ["if", "while", "for", "else"],
            "correct": 2,
            "explanation": "Vòng lặp `for` thường dùng để duyệt qua các phần tử trong một vùng (range) hoặc danh sách."
        },
        {
            "type": "multiple",
            "question": "Kết quả của lệnh `print(range(5))` là một dãy số từ:",
            "options": ["1 đến 5", "0 đến 5", "0 đến 4", "1 đến 4"],
            "correct": 2,
            "explanation": "Hàm range(n) tạo ra dãy số từ 0 đến n-1."
        },
        {
            "type": "multiple",
            "question": "Trong Python, kiểu dữ liệu `float` dùng để biểu diễn:",
            "options": ["Số nguyên.", "Số thực.", "Xâu kí tự.", "Kiểu đúng/sai."],
            "correct": 1,
            "explanation": "Float là kiểu số có dấu phẩy động (số thực)."
        },
        {
            "type": "multiple",
            "question": "Để kiểm tra hai giá trị có bằng nhau không, ta dùng toán tử nào?",
            "options": ["=", "==", "===", "!="],
            "correct": 1,
            "explanation": "Toán tử `==` dùng để so sánh bằng, còn `=` dùng để gán giá trị."
        },
        {
            "type": "multiple",
            "question": "Đoạn mã sau in ra gì? \n`x = 5 \nif x > 3: \n  print('A') \nelse: \n  print('B')`",
            "options": ["A", "B", "AB", "Không in gì"],
            "correct": 0,
            "explanation": "Vì 5 > 3 là True nên khối lệnh sau if sẽ được thực hiện."
        },
        {
            "type": "multiple",
            "question": "Để thoát khỏi vòng lặp ngay lập tức, ta dùng lệnh nào?",
            "options": ["stop", "exit", "break", "continue"],
            "correct": 2,
            "explanation": "Lệnh `break` dùng để kết thúc vòng lặp hiện tại."
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ---
        {
            "type": "truefalse",
            "question": "Xét các phát biểu sau về ngôn ngữ Python:",
            "options": [
                "Python phân biệt chữ hoa và chữ thường khi đặt tên biến.",
                "Tất cả các dòng lệnh trong Python đều phải kết thúc bằng dấu chấm phẩy (;).",
                "Khối lệnh trong Python được xác định bằng cách lùi đầu dòng (indentation).",
                "Python là ngôn ngữ thông dịch."
            ],
            "correct": [true, false, true, true],
            "explanation": "Python không bắt buộc dấu chấm phẩy và sử dụng khoảng trắng/tab để phân cấp khối lệnh."
        },
        {
            "type": "truefalse",
            "question": "Về các kiểu dữ liệu và toán tử:",
            "options": [
                "Biểu thức `5 // 2` trả về kết quả là 2.5.",
                "Xâu kí tự trong Python có thể đặt trong cặp dấu nháy đơn hoặc nháy kép.",
                "Toán tử `and` trả về True nếu ít nhất một điều kiện là đúng.",
                "Hàm `int('10')` sẽ chuyển chuỗi '10' thành số nguyên 10."
            ],
            "correct": [false, true, false, true],
            "explanation": "Toán tử `//` là chia lấy phần nguyên (5 // 2 = 2). Toán tử `and` cần cả hai đúng."
        },
        {
            "type": "truefalse",
            "question": "Về cấu trúc lặp:",
            "options": [
                "Vòng lặp `while` sẽ lặp lại chừng nào điều kiện còn đúng.",
                "Có thể lồng các vòng lặp vào nhau.",
                "Lệnh `range(2, 5)` sẽ tạo ra các số 2, 3, 4, 5.",
                "Lệnh `continue` dùng để bỏ qua các câu lệnh còn lại trong vòng lặp và bắt đầu một lần lặp mới."
            ],
            "correct": [true, true, false, true],
            "explanation": "range(2, 5) chỉ gồm 2, 3, 4 (không bao gồm 5)."
        },
        {
            "type": "truefalse",
            "question": "Về lỗi trong chương trình:",
            "options": [
                "Lỗi cú pháp (Syntax Error) được phát hiện trước khi chương trình chạy.",
                "Lỗi ngữ nghĩa (Logic Error) làm chương trình chạy sai kết quả nhưng không báo lỗi.",
                "Chia một số cho 0 sẽ gây ra lỗi Runtime Error.",
                "Viết sai tên hàm (ví dụ: `prnt()`) là một lỗi logic."
            ],
            "correct": [true, true, true, false],
            "explanation": "Viết sai tên hàm là lỗi cú pháp (hoặc NameError tại thời điểm chạy)."
        },

        // --- PHẦN III: TRẢ LỜI NGẮN ---
        {
            "type": "short",
            "question": "Cho đoạn mã: `s = 0 \nfor i in range(1, 4): \n  s = s + i \nprint(s)`. Kết quả in ra là bao nhiêu?",
            "correct": "6",
            "explanation": "i chạy qua 1, 2, 3. Tổng s = 1 + 2 + 3 = 6."
        },
        {
            "type": "short",
            "question": "Kết quả của biểu thức `2**3` trong Python là bao nhiêu?",
            "correct": "8",
            "explanation": "`**` là toán tử lũy thừa. 2 mũ 3 bằng 8."
        },
        {
            "type": "short",
            "question": "Để chuyển một số thực x thành số nguyên, ta dùng hàm gì? (Viết tên hàm)",
            "correct": "int",
            "explanation": "Hàm int() dùng để ép kiểu về số nguyên."
        },
        {
            "type": "short",
            "question": "Cho `a = 10, b = 20`. Lệnh `a, b = b, a` sẽ làm giá trị của `a` trở thành bao nhiêu?",
            "correct": "20",
            "explanation": "Đây là cách hoán đổi giá trị biến nhanh trong Python."
        },
        {
            "type": "short",
            "question": "Hàm `len('EduSpace')` trả về kết quả là bao nhiêu?",
            "correct": "8",
            "explanation": "Hàm len() trả về độ dài của xâu (8 kí tự)."
        },
        {
            "type": "short",
            "question": "Giá trị của x sau lệnh `x = 10; x += 5` là bao nhiêu?",
            "correct": "15",
            "explanation": "`x += 5` tương đương với `x = x + 5`."
        }
    ]
};