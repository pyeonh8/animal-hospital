/* =========================================================
   입력 필드 검사
   - 검사할 입력에 data-validate="규칙이름"을 붙이면 됨
   - 에러 문구 요소는 입력의 aria-describedby로 연결
   ========================================================= */
const validators = {
  phone: {
    test: (value) => value.replace(/\D/g, "").length === 11,
    message: "연락처를 끝까지 입력해 주세요.",
  },
};

const initField = () => {
  function getErrorEl(input) {
    return document.getElementById(input.getAttribute("aria-describedby"));
  }

  // 에러 표시
  function showError(input, message) {
    input.setAttribute("aria-invalid", "true");
    getErrorEl(input).textContent = message;
  }

  // 에러 해제
  function clearError(input) {
    input.removeAttribute("aria-invalid");
    getErrorEl(input).textContent = "";
  }

  document.querySelectorAll("[data-validate]").forEach((input) => {
    const rule = validators[input.dataset.validate];
    if (!rule) return;

    // 포커스를 벗어날 때 검사
    input.addEventListener("blur", () => {
      if (rule.test(input.value)) {
        clearError(input);
      } else {
        showError(input, rule.message);
      }
    });

    // 이미 에러가 뜬 상태라면, 고치는 즉시 에러를 지움
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && rule.test(input.value)) {
        clearError(input);
      }
    });
  });
};

/* =========================================================
   시간 버튼: 한 그룹 안에서 하나만 선택
   ========================================================= */
const initTimeButtons = () => {
  document.querySelectorAll("[data-time-group]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".time-btn");
      if (!btn || btn.disabled) return;

      group.querySelectorAll(".time-btn").forEach((item) => {
        item.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");
    });
  });
};

/* =========================================================
   탭
   - 선택된 탭만 Tab 키로 들어갈 수 있고(tabindex 0),
     나머지는 방향키로 이동 (tabindex -1)
   ========================================================= */
const initTabs = () => {
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

function showToast(title, desc = "") {
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

const initToast = () => {
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
const initModal = () => {
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

document.addEventListener("DOMContentLoaded", () => {
  initField();
  initTimeButtons();
  initTabs();
  initToast();
  initModal();
});
