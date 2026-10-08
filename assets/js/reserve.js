/* =========================================================
   진료 예약 페이지 (sub/reserve.html)
   ========================================================= */
import { initLayout, initMobileMenu } from "./layout.js";
import { validate, clearError, initField, initTimeButtons, initModal, showToast } from "./components.js";

/* =========================================================
   예약 폼
   - 날짜를 고르면 그날 진료시간에 맞는 시간 버튼을 새로 그림
   - 제출하면 모든 칸을 검사하고, 틀린 칸이 있으면 첫 번째 칸으로 포커스
   - 통과하면 (실제 전송 없이) 토스트를 띄우고 폼을 비움
   ========================================================= */
const TIME_SLOTS = {
  weekday: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  saturday: ["10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"],
};

// 오늘 날짜를 "2026-10-08" 형식으로 (toISOString은 UTC라 한국 시간과 날짜가 어긋날 수 있어 직접 만듦)
function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 예시용 마감 규칙: 날짜마다 몇 개의 시간이 마감된 것처럼 보이게 함
function isClosed(dateStr, index) {
  const day = Number(dateStr.slice(-2));
  return (day + index) % 4 === 0;
}

function renderTimeSlots(group, help, dateStr) {
  group.replaceChildren();
  clearError(group);

  if (!dateStr) {
    help.textContent = "날짜를 먼저 골라 주세요.";
    return;
  }

  const day = new Date(`${dateStr}T00:00`).getDay(); // 0: 일요일, 6: 토요일
  if (day === 0) {
    help.textContent = "일요일은 휴진이에요. 다른 날짜를 골라 주세요.";
    return;
  }

  const slots = day === 6 ? TIME_SLOTS.saturday : TIME_SLOTS.weekday;
  slots.forEach((time, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-btn";
    btn.textContent = time;

    if (isClosed(dateStr, index)) {
      btn.disabled = true;
      btn.insertAdjacentHTML("beforeend", '<span class="sr-only"> 마감</span>');
    } else {
      btn.setAttribute("aria-pressed", "false");
    }
    group.append(btn);
  });

  help.textContent = day === 6 ? "토요일은 15:00까지 진료해요." : "";
}

const initReserveForm = () => {
  const form = document.querySelector("[data-reserve-form]");
  if (!form) return;

  const dateInput = form.querySelector('input[type="date"]');
  const timeGroup = form.querySelector("[data-time-slots]");
  const timeHelp = document.getElementById("time-help");
  const memo = form.querySelector("textarea[maxlength]");
  const memoCount = document.getElementById("memo-count");

  // 오늘 이전 날짜는 고를 수 없게
  dateInput.min = todayString();
  renderTimeSlots(timeGroup, timeHelp, "");

  dateInput.addEventListener("change", () => {
    renderTimeSlots(timeGroup, timeHelp, dateInput.value);
  });

  // 글자 수
  const updateCount = () => {
    memoCount.textContent = `${memo.value.length} / ${memo.maxLength}자`;
  };
  memo.addEventListener("input", updateCount);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // filter 안에서 validate가 모든 칸을 검사하고 에러를 표시함
    const invalidList = [...form.querySelectorAll("[data-validate]")].filter((el) => !validate(el));

    if (invalidList.length > 0) {
      const first = invalidList[0];
      // 묶음이면 그 안의 첫 번째로 고를 수 있는 요소로 포커스
      const target = first.matches("input, select, textarea")
        ? first
        : first.querySelector("input:not(:disabled), button:not(:disabled)") || dateInput;
      target.focus();
      return;
    }

    const phone = form.querySelector('[data-format="phone"]').value;
    showToast("예약 신청이 접수됐어요", `${phone}으로 안내 메시지를 보냈어요. 병원에서 확인 후 연락드릴게요.`);

    form.reset();
    renderTimeSlots(timeGroup, timeHelp, "");
    updateCount();
  });
};

initLayout();
initMobileMenu();
initField();
initTimeButtons();
initModal();
initReserveForm();
