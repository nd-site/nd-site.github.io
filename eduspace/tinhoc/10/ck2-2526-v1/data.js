// FILE DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA THEO CẤU TRÚC GDPT 2018 (CV 7991)
// Nhóm môn: Không có trả lời ngắn (MCQ, TF, Essay)

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Tin Học 10 (Kết nối tri thức) 2025-2026",
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
            question: "Trong Python, để khai báo biến số nguyên, cách viết nào sau đây ĐÚNG?",
            options: [
                "int x = 5",
                "x = 5",
                "x := 5",
                "x == 5"
            ],
            correct: 1,
            explanation: "Python không cần khai báo kiểu dữ liệu một cách tường minh, chỉ cần gán giá trị: x = 5."
        },
        {
            type: "multiple",
            question: "Kết quả của phép toán `15 // 4` trong Python là:",
            options: [
                "3.75",
                "4",
                "3",
                "15/4"
            ],
            correct: 2,
            explanation: "`//` là phép chia lấy phần nguyên. 15 chia 4 được 3 dư 3, nên phần nguyên là 3."
        },
        {
            type: "multiple",
            question: "Để nhập một số nguyên từ bàn phím, ta dùng lệnh nào?",
            options: [
                "input()",
                "int(input())",
                "float(input())",
                "print(input())"
            ],
            correct: 1,
            explanation: "`input()` trả về chuỗi (string), cần dùng `int()` để chuyển sang số nguyên."
        },
        {
            type: "multiple",
            question: "Tên biến nào sau đây hợp lệ trong Python?",
            options: [
                "1_dem",
                "dem so",
                "dem_1",
                "class"
            ],
            correct: 2,
            explanation: "Tên biến không được bắt đầu bằng số, không chứa dấu cách, không trùng từ khóa."
        },
        {
            type: "multiple",
            question: "Kiểu dữ liệu của biểu thức `5.0 + 2` là:",
            options: [
                "int",
                "float",
                "str",
                "bool"
            ],
            correct: 1,
            explanation: "Số thực cộng số nguyên sẽ ra số thực (`float`)."
        },
        {
            type: "multiple",
            question: "Cú pháp câu lệnh điều kiện rẽ nhánh trong Python là:",
            options: [
                "if <điều kiện> then <câu lệnh>",
                "if <điều kiện>: <câu lệnh>",
                "if (<điều kiện>) { <câu lệnh> }",
                "if <điều kiện>; <câu lệnh>"
            ],
            correct: 1,
            explanation: "Cú pháp Python dùng dấu hai chấm `:` sau điều kiện và thụt lề cho khối lệnh."
        },
        {
            type: "multiple",
            question: "Đoạn lệnh sau in ra kết quả gì?\n```python\nx = 5\nif x % 2 == 0:\n    print('A')\nelse:\n    print('B')\n```",
            options: [
                "A",
                "B",
                "Không in gì",
                "Lỗi"
            ],
            correct: 1,
            explanation: "5 chia 2 dư 1 (khác 0), nên lệnh chuyển sang nhánh `else` in ra B."
        },
        {
            type: "multiple",
            question: "Phép toán logic 'VÀ' trong Python được viết là:",
            options: [
                "&&",
                "AND",
                "and",
                "&"
            ],
            correct: 2,
            explanation: "Python dùng từ khóa viết thường `and`, `or`, `not` cho logic."
        },
        {
            type: "multiple",
            question: "Đoạn lệnh sau bị lỗi ở đâu?\n```python\nif x > 0\n    print('Dương')\n```",
            options: [
                "Không có ngoặc đơn ở điều kiện",
                "Thiếu dấu `:` sau điều kiện",
                "Sai chữ print",
                "Không có lỗi"
            ],
            correct: 1,
            explanation: "Lệnh `if` trong Python bắt buộc phải kết thúc bằng dấu `:`."
        },
        {
            type: "multiple",
            question: "Hàm `range(5)` sẽ tạo ra dãy số nào?",
            options: [
                "1, 2, 3, 4, 5",
                "0, 1, 2, 3, 4",
                "0, 1, 2, 3, 4, 5",
                "1, 2, 3, 4"
            ],
            correct: 1,
            explanation: "`range(n)` tạo dãy từ 0 đến n-1."
        },
        {
            type: "multiple",
            question: "Vòng lặp `for i in range(1, 6, 2): print(i)` in ra:",
            options: [
                "1 2 3 4 5",
                "1 3 5",
                "2 4",
                "1 4"
            ],
            correct: 1,
            explanation: "Bắt đầu từ 1, bước nhảy là 2, kết thúc trước 6. Kết quả: 1, 3, 5."
        },
        {
            type: "multiple",
            question: "Lệnh nào dùng để thoát khỏi vòng lặp ngay lập tức?",
            options: [
                "continue",
                "exit",
                "break",
                "return"
            ],
            correct: 2,
            explanation: "`break` kết thúc vòng lặp hiện tại, `continue` bỏ qua bước lặp hiện tại để sang bước tiếp theo."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Vòng lặp `while` sẽ dừng khi nào?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "Khi số lần lặp đạt mức tối đa",
                "Khi điều kiện của while trở thành False",
                "Khi lặp đủ 10 lần",
                "Khi nhấn phím Enter"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Vòng lặp `while` lặp chừng nào điều kiện còn `True`, và dừng khi `False`."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Để khởi tạo một danh sách (list) rỗng, ta viết:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "A = ()",
                "A = []",
                "A = {}",
                "A = list"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "List trong Python được định nghĩa bằng cặp ngoặc vuông `[]`."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Cho list `A = [10, 20, 30, 40]`. Giá trị của `A[1]` là:. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "10",
                "20",
                "30",
                "40"
            ],
            correct: [
                false,
                true,
                false,
                false
            ],
            explanation: "Chỉ số mảng bắt đầu từ 0. `A[0]`=10, `A[1]`=20."
        },
        {
            type: "truefalse",
            question: "Xét nhận định sau: Phương thức nào dùng để thêm một phần tử vào cuối danh sách?. Các phát biểu dưới đây đúng hay sai?",
            options: [
                "add()",
                "insert()",
                "append()",
                "push()"
            ],
            correct: [
                false,
                false,
                true,
                false
            ],
            explanation: "Trong Python, dùng phương thức `append(giá_trị)` để thêm vào cuối list."
        },
        {
            type: "essay",
            question: "Viết chương trình Python nhập vào một số nguyên n từ bàn phím. Kiểm tra và in ra màn hình thông báo số n là số chẵn hay số lẻ.",
            suggested: "Sử dụng hàm input() và int(). Dùng cấu trúc if-else và phép chia lấy dư (%).\n\nCode mẫu:\nn = int(input('Nhập số n: '))\nif n % 2 == 0:\n    print(n, 'là số chẵn')\nelse:\n    print(n, 'là số lẻ')",
            points: 25,
            explanation: "AI chấm: Đọc đúng số nguyên (10đ), dùng đúng lệnh if-else và n % 2 == 0 (15đ)."
        },
        {
            type: "essay",
            question: "Viết một hàm `def TinhTong(n)` nhận đầu vào là số nguyên dương n và trả về tổng các số tự nhiên từ 1 đến n (S = 1 + 2 + ... + n).\n\nSau đó viết lệnh gọi hàm để tính và in ra tổng với n = 10.",
            suggested: "Code mẫu:\ndef TinhTong(n):\n    S = 0\n    for i in range(1, n + 1):\n        S += i\n    return S\n\nprint('Tổng là:', TinhTong(10))",
            points: 25,
            explanation: "AI chấm: Định nghĩa đúng hàm `def`, vòng lặp tính tổng `range(1, n+1)` (15đ), dùng từ khóa `return` và gọi hàm đúng (10đ)."
        },
        {
            type: "essay",
            question: "Cho một mảng (list) các số nguyên: `A = [5, 12, 7, 20, 8, 3]`.\nViết chương trình Python (hoặc chỉ đoạn lệnh) duyệt qua danh sách A và in ra màn hình các số lớn hơn 10 có trong danh sách.",
            suggested: "Dùng vòng lặp for duyệt list A và lệnh if.\n\nCode mẫu:\nA = [5, 12, 7, 20, 8, 3]\nfor x in A:\n    if x > 10:\n        print(x)\n\n# Kết quả in ra: 12, 20",
            points: 25,
            explanation: "AI chấm: Duyệt list đúng `for x in A:` hoặc `for i in range(len(A)):` (10đ), điều kiện so sánh `> 10` đúng (15đ)."
        }
    ]
};
