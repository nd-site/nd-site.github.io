let lcd = document.getElementById("lcd");
let expression = "";

document.querySelectorAll(".btn").forEach(button => {
  button.addEventListener("click", () => {
    const value = button.textContent;

    switch (value) {
      case "AC":
        expression = "";
        break;
      case "DEL":
        expression = expression.slice(0, -1);
        break;
      case "=":
        try {
          expression = eval(expression).toString();
        } catch {
          expression = "ERROR";
        }
        break;
      case "Ans":
        // Tạm thời chưa lưu giá trị Ans, có thể mở rộng sau
        break;
      case "×":
        expression += "*";
        break;
      case "÷":
        expression += "/";
        break;
      case "−":
        expression += "-";
        break;
      case "+":
        expression += "+";
        break;
      default:
        expression += value;
    }

    lcd.textContent = expression || "0";
  });
});
