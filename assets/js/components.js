/* =========================================================
   공통 컴포넌트: 입력 검사, 시간 버튼, 탭, 토스트, 모달
   - 각 페이지 파일(main.js, reserve.js, guide.js)에서 필요한 것만 import해서 씀
   ========================================================= */

/* =========================================================
   입력 필드 검사
   - 검사할 요소에 data-validate="규칙이름"을 붙이면 됨
   - 에러 문구 요소(.field__error)는 aria-describedby로 연결
   - 문구를 바꾸고 싶으면 data-message="..."
   - 규칙은 요소 자체를 받아서 검사 (입력칸, 라디오 묶음, 체크박스 모두)
   ========================================================= */
const validators = {
  required: {
    test: (el) => el.value.trim() !== "",
    message: "필수 입력 항목이에요.",
  },
  phone: {
    test: (el) => el.value.replace(/\D/g, "").length === 11,
    message: "연락처를 끝까지 입력해 주세요. 예: 010-0000-0000",
  },
  date: {
    // input[type=date]의 값은 "2026-10-08" 형식이라 글자 비교로 날짜 앞뒤를 알 수 있음
    test: (el) => el.value !== "" && (!el.min || el.value >= el.min),
    message: "오늘 이후 날짜를 골라 주세요.",
  },
  choice: {
    // 묶음 안에서 고른 것이 하나라도 있는지 (라디오, 시간 버튼)
    test: (el) => el.querySelector('input:checked, [aria-pressed="true"]') !== null,
    message: "하나를 골라 주세요.",
  },
  checked: {
    test: (el) => el.checked,
    message: "동의해 주세요.",
  },
};

// aria-describedby에 도움말과 에러 문구가 함께 연결될 수 있어서, 그중 에러 문구를 찾음
function getErrorEl(el) {
  const ids = (el.getAttribute("aria-describedby") || "").split(" ");
  return ids
    .map((id) => document.getElementById(id))
    .find((node) => node && node.classList.contains("field__error"));
}

export function showError(el, message) {
  el.setAttribute("aria-invalid", "true");
  const errorEl = getErrorEl(el);
  if (errorEl) errorEl.textContent = message;
}

export function clearError(el) {
  el.removeAttribute("aria-invalid");
  const errorEl = getErrorEl(el);
  if (errorEl) errorEl.textContent = "";
}

// 검사하고 결과를 화면에 반영. 통과하면 true
export function validate(el) {
  const rule = validators[el.dataset.validate];
  if (!rule) return true;

  if (rule.test(el)) {
    clearError(el);
    return true;
  }
  showError(el, el.dataset.message || rule.message);
  return false;
}

// 숫자만 남겨서 010-0000-0000 형식으로
function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const isInvalid = (el) => el.getAttribute("aria-invalid") === "true";

export const initField = () => {
  document.querySelectorAll("[data-validate]").forEach((el) => {
    const isGroup = !el.matches("input, select, textarea");

    // 라디오 묶음, 시간 버튼 묶음: 고르는 순간 검사 (고르면 에러가 사라짐)
    if (isGroup) {
      el.addEventListener("change", () => validate(el));
      return;
    }

    // 체크박스: 바뀔 때마다 검사
    if (el.type === "checkbox") {
      el.addEventListener("change", () => validate(el));
      return;
    }

    // 입력칸: 쓰다가 벗어날 때 검사.
    // 비어 있는 채로 Tab만 눌러 지나가면 에러를 띄우지 않음 (빈 칸 검사는 제출할 때)
    el.addEventListener("blur", () => {
      if (el.value !== "") validate(el);
    });

    // 이미 에러가 뜬 칸은 고치는 즉시 다시 검사
    el.addEventListener("input", () => {
      if (el.dataset.format === "phone") el.value = formatPhone(el.value);
      if (isInvalid(el)) validate(el);
    });

    // 셀렉트, 날짜는 input보다 change가 확실함
    el.addEventListener("change", () => {
      if (isInvalid(el)) validate(el);
    });
  });
};

/* =========================================================
   시간 버튼: 한 그룹 안에서 하나만 선택
   ========================================================= */
export const initTimeButtons = () => {
  document.querySelectorAll("[data-time-group]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".time-btn");
      if (!btn || btn.disabled) return;

      group.querySelectorAll(".time-btn").forEach((item) => {
        item.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");

      // 버튼에는 change 이벤트가 없어서 직접 알려 줌
      group.dispatchEvent(new Event("change"));
    });
  });
};

/* =========================================================
   탭
   - 선택된 탭만 Tab 키로 들어갈 수 있고(tabindex 0),
     나머지는 방향키로 이동 (tabindex -1)
   ========================================================= */
export const initTabs = () => {
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const tabList = tabs.querySelectorAll('[role="tab"]');

    function selectTab(tab) {
      tabList.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
      });
    }

    tabs.addEventListener("click", (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) selectTab(tab);
    });

    tabs.addEventListener("keydown", (e) => {
      const current = e.target.closest('[role="tab"]');
      if (!current) return;

      const list = [...tabList];
      const index = list.indexOf(current);
      let next;

      if (e.key === "ArrowRight") next = list[(index + 1) % list.length];
      else if (e.key === "ArrowLeft") next = list[(index - 1 + list.length) % list.length];
      else if (e.key === "Home") next = list[0];
      else if (e.key === "End") next = list[list.length - 1];
      else return;

      e.preventDefault();
      selectTab(next);
      next.focus();
    });
  });
};

/* =========================================================
   토스트
   - 화면에 항상 있는 빈 영역(.toast-region, role="status")에
     토스트를 넣으면 스크린리더가 내용을 읽어 줌
   - 6초 뒤 자동으로 사라지고, 마우스를 올리거나 포커스가 있으면 멈춤
   ========================================================= */
const TOAST_DURATION = 6000;

export function showToast(title, desc = "") {
  const region = document.querySelector(".toast-region");
  if (!region) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast__icon" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#3B2314" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l5 5 9-10"/></svg>
    </span>
    <div class="toast__body">
      <p class="toast__title"></p>
      <p class="toast__desc"></p>
    </div>
    <button type="button" class="toast__close" aria-label="알림 닫기">
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l12 12M17 5L5 17"/></svg>
    </button>`;

  // 글자는 textContent로 넣어 HTML로 해석되지 않게 함
  toast.querySelector(".toast__title").textContent = title;
  toast.querySelector(".toast__desc").textContent = desc;

  region.replaceChildren(toast);

  let timer;
  const hide = () => {
    clearTimeout(timer);
    toast.classList.add("is-hiding");
    setTimeout(() => toast.remove(), 200);
  };
  const start = () => (timer = setTimeout(hide, TOAST_DURATION));
  const pause = () => clearTimeout(timer);

  toast.querySelector(".toast__close").addEventListener("click", hide);
  toast.addEventListener("mouseenter", pause);
  toast.addEventListener("mouseleave", start);
  toast.addEventListener("focusin", pause);
  toast.addEventListener("focusout", start);
  start();
}

export const initToast = () => {
  document.querySelectorAll("[data-toast-title]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast(btn.dataset.toastTitle, btn.dataset.toastDesc);
    });
  });
};

/* =========================================================
   모달 (<dialog>)
   - showModal(): 뒤 배경 막기, Esc 닫기, 포커스 가두기를 브라우저가 처리
   - 닫히면 포커스가 연 버튼으로 돌아감
   ========================================================= */
export const initModal = () => {
  document.querySelectorAll("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.modalOpen)?.showModal();
    });
  });

  document.querySelectorAll("dialog.modal").forEach((dialog) => {
    dialog.addEventListener("click", (e) => {
      // 닫기 버튼
      if (e.target.closest("[data-modal-close]")) dialog.close();
      // 바깥 어두운 영역(= dialog 자신)을 눌렀을 때
      if (e.target === dialog) dialog.close();
    });
  });
};
