const initField = () => {
  function getErrorEl(input) {
    return document.getElementById(input.getAttribute("aria-describedby"));
  }

  // 에러 표시
  function showError(input, message) {
    input.setAttribute("aria-invalid", true);
    getErrorEl(input).textContent = message;
  }

  // 에러 해제
  function clearError(input) {
    input.removeAttribute("aria-invalid");
    getErrorEl(input).textContent = "";
  }

  // 유효성 검사
  function isValidPhone(value) {
    return value.replace(/\D/g, "").length === 11;
  }

  document.querySelectorAll("input[aria-describedby]").forEach((input) => {
    // 포커스를 벗어날 때 검사
    input.addEventListener("blur", () => {
      const value = input.value;
      if (isValidPhone(value)) {
        clearError(input);
      } else {
        showError(input, "연락처를 끝까지 입력해 주세요.");
      }
    });

    // 작성 중 검사
    input.addEventListener("input", () => {
      const value = input.value;
      if (input.getAttribute("aria-invalid") === "true") {
        if (isValidPhone(value)) clearError(input);
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initField();
});
