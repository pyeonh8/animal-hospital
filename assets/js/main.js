/* =========================================================
   메인 페이지 (index.html)
   - 모듈은 HTML을 다 읽은 뒤 실행돼서(defer와 같음) DOMContentLoaded가 필요 없음
   ========================================================= */
import { initLayout, initMobileMenu } from "./layout.js";

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

initLayout();
initMobileMenu();
initSlider();
