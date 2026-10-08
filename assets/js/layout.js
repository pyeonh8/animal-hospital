/* =========================================================
   공통 레이아웃: 헤더 · 푸터 · 하단 고정 바
   - 각 페이지에는 빈 자리만 두고 내용은 여기서 넣음
     <header class="site-header" data-include="header"></header>
     <footer class="site-footer" data-include="footer"></footer>
   - 사이트 루트 주소를 이 파일 위치(assets/js/)에서 계산해서
     메인(루트)과 서브(sub/) 어디서 불러도 링크가 맞게 함
     (import.meta.url = 지금 이 모듈 파일의 주소)
   ========================================================= */
const SITE_ROOT = new URL("../../", import.meta.url).href;

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
  const links = (cls) => NAV_ITEMS.map((item) => `<li><a class="${cls}" href="${url(item.path)}">${item.label}</a></li>`).join("");

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
    <nav class="quick-bar" aria-label="빠른 메뉴">
      <a class="btn btn--secondary" href="tel:${SITE.tel.replace(/\D/g, "")}">전화하기</a>
      <a class="btn btn--primary" href="${url("sub/reserve.html")}">진료 예약</a>
    </nav>`;
}

// 지금 페이지와 주소가 같은 메뉴에 aria-current="page"
// (메인 섹션으로 가는 #링크는 "페이지"가 아니라서 제외)
function markCurrentPage() {
  const normalize = (path) => path.replace(/index\.html$/, "");
  const here = normalize(location.pathname);

  document.querySelectorAll(".gnb__link, .mobile-menu__link, .site-header__cta").forEach((link) => {
    const target = new URL(link.href);
    if (!target.hash && normalize(target.pathname) === here) {
      link.setAttribute("aria-current", "page");
    }
  });
}

export const initLayout = () => {
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
   모바일 메뉴 (<dialog>)
   ========================================================= */
export const initMobileMenu = () => {
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
