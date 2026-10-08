/* =========================================================
   공통 레이아웃: 헤더 · 푸터 · 하단 고정 바
   - 각 페이지에는 빈 자리만 두고 내용은 여기서 넣음
     <header class="site-header" data-include="header"></header>
     <footer class="site-footer" data-include="footer"></footer>
   - 사이트 루트 주소를 이 파일 위치(assets/js/)에서 계산해서
     메인(루트)과 서브(sub/) 어디서 불러도 링크가 맞게 함
   ========================================================= */
const SITE_ROOT = new URL("../../", document.currentScript.src).href;

const SITE = {
  name: "멍냥 동물병원",
  tel: "02-000-0000",
  todayHours: "09:00 – 19:00",
};

const NAV_ITEMS = [
  { label: "병원 소개", path: "index.html#about" },
  { label: "진료과목", path: "index.html#dept" },
  { label: "의료진", path: "index.html#staff" },
  { label: "공지사항", path: "sub/notice.html" },
  { label: "오시는 길", path: "index.html#map" },
];

const url = (path) => SITE_ROOT + path;

const PAW_ICON = `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="12" r="2.6"/><circle cx="16" cy="8" r="2.6"/><circle cx="23" cy="12" r="2.6"/><path d="M10 23c0-4 3-7 6-7s6 3 6 7c0 2-2 3-6 3s-6-1-6-3z"/></svg>`;

function headerTemplate() {
  const links = (cls) =>
    NAV_ITEMS.map((item) => `<li><a class="${cls}" href="${url(item.path)}">${item.label}</a></li>`).join("");

  return `
    <div class="site-header__inner container">
      <a class="site-header__logo" href="${url("index.html")}">${PAW_ICON}<span>${SITE.name}</span></a>
      <nav class="gnb" aria-label="주 메뉴">
        <ul class="gnb__list">${links("gnb__link")}</ul>
      </nav>
      <a class="btn btn--primary site-header__cta" href="${url("sub/reserve.html")}">진료 예약</a>
      <button type="button" class="site-header__menu-btn" aria-label="메뉴 열기" aria-haspopup="dialog"
        aria-expanded="false" aria-controls="mobile-menu" data-menu-open>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h18M4 13h18M4 19h18"/></svg>
      </button>
    </div>

    <dialog class="mobile-menu" id="mobile-menu" aria-label="전체 메뉴">
      <div class="mobile-menu__head">
        <a class="site-header__logo" href="${url("index.html")}">${PAW_ICON}<span>${SITE.name}</span></a>
        <button type="button" class="mobile-menu__close" aria-label="메뉴 닫기" data-menu-close autofocus>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l14 14M20 6L6 20"/></svg>
        </button>
      </div>
      <nav class="mobile-menu__nav" aria-label="주 메뉴">
        <ul>${links("mobile-menu__link")}</ul>
      </nav>
      <div class="mobile-menu__foot">
        <dl class="mobile-menu__today">
          <dt>오늘 진료</dt>
          <dd>${SITE.todayHours}</dd>
        </dl>
        <div class="mobile-menu__actions">
          <a class="btn btn--light" href="tel:${SITE.tel.replace(/\D/g, "")}">전화하기</a>
          <a class="btn btn--primary" href="${url("sub/reserve.html")}">진료 예약</a>
        </div>
      </div>
    </dialog>`;
}

function footerTemplate() {
  return `
    <div class="site-footer__inner container">
      <address class="site-footer__info">
        <p class="site-footer__name">${SITE.name}</p>
        <p>대표 김멍냥 · 사업자등록번호 000-00-00000</p>
        <p>서울시 ○○구 ○○로 00, 2층 · 전화 ${SITE.tel}</p>
        <p>© 2026 ${SITE.name}. 포트폴리오용 가상 사이트입니다.</p>
      </address>
      <nav class="site-footer__nav" aria-label="하단 메뉴">
        <ul>
          <li><a href="${url("sub/notice.html")}">공지사항</a></li>
          <li><a href="${url("sub/reserve.html")}">진료 예약</a></li>
          <li><a href="${url("index.html#map")}">오시는 길</a></li>
        </ul>
      </nav>
    </div>`;
}

function quickBarTemplate() {
  return `
    <div class="quick-bar">
      <a class="btn btn--secondary" href="tel:${SITE.tel.replace(/\D/g, "")}">전화하기</a>
      <a class="btn btn--primary" href="${url("sub/reserve.html")}">진료 예약</a>
    </div>`;
}

// 지금 페이지와 주소가 같은 메뉴에 aria-current="page"
// (메인 섹션으로 가는 #링크는 "페이지"가 아니라서 제외)
function markCurrentPage() {
  const normalize = (path) => path.replace(/index\.html$/, "");
  const here = normalize(location.pathname);

  document.querySelectorAll(".gnb__link, .mobile-menu__link").forEach((link) => {
    const target = new URL(link.href);
    if (!target.hash && normalize(target.pathname) === here) {
      link.setAttribute("aria-current", "page");
    }
  });
}

const initLayout = () => {
  const header = document.querySelector('[data-include="header"]');
  const footer = document.querySelector('[data-include="footer"]');
  if (!header && !footer) return;

  if (header) header.innerHTML = headerTemplate();
  if (footer) {
    footer.innerHTML = footerTemplate();
    footer.insertAdjacentHTML("afterend", quickBarTemplate());
  }
  markCurrentPage();
};

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

/* =========================================================
   모바일 메뉴 (<dialog>)
   ========================================================= */
const initMobileMenu = () => {
  const menu = document.getElementById("mobile-menu");
  const openBtn = document.querySelector("[data-menu-open]");
  if (!menu || !openBtn) return;

  openBtn.addEventListener("click", () => {
    menu.showModal();
    openBtn.setAttribute("aria-expanded", "true");
  });

  // Esc로 닫혀도 "close" 이벤트는 발생하므로 여기서 상태를 되돌림
  menu.addEventListener("close", () => {
    openBtn.setAttribute("aria-expanded", "false");
  });

  // 닫기 버튼, 또는 메뉴 안의 링크를 누르면 닫음 (같은 페이지 섹션 이동 대비)
  menu.addEventListener("click", (e) => {
    if (e.target.closest("[data-menu-close]") || e.target.closest("a")) menu.close();
  });

  // 메뉴를 연 채로 화면을 PC 폭으로 늘리면 닫음
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches && menu.open) menu.close();
  });
};

/* =========================================================
   슬라이더 (의료진)
   - 넘기는 동작은 CSS 스크롤 스냅이 하고,
     JS는 화살표 버튼으로 한 장씩 스크롤만 함
   - 처음/끝에서는 화살표를 aria-disabled로 비활성
     (disabled를 쓰면 누르던 버튼에서 포커스가 사라짐)
   ========================================================= */
const initSlider = () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const list = slider.querySelector("[data-slider-list]");
    const prev = slider.querySelector("[data-slider-prev]");
    const next = slider.querySelector("[data-slider-next]");
    if (!list || !prev || !next) return;

    // 카드 한 장 너비 + 카드 사이 간격 = 한 번에 넘길 거리
    function stepSize() {
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      return list.firstElementChild.offsetWidth + gap;
    }

    function update() {
      const max = list.scrollWidth - list.clientWidth - 1;
      prev.setAttribute("aria-disabled", String(list.scrollLeft <= 1));
      next.setAttribute("aria-disabled", String(list.scrollLeft >= max));
    }

    function move(direction, btn) {
      if (btn.getAttribute("aria-disabled") === "true") return;
      list.scrollBy({
        left: direction * stepSize(),
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    }

    prev.addEventListener("click", () => move(-1, prev));
    next.addEventListener("click", () => move(1, next));
    list.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initLayout();
  initMobileMenu();
  initSlider();
  initField();
  initTimeButtons();
  initTabs();
  initToast();
  initModal();
});
