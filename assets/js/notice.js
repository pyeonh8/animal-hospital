/* =========================================================
   공지사항 게시판 (sub/notice.html)
   - 검색어·페이지·글 번호는 주소에 실림: notice.html?type=title&q=휴진&page=2&id=15
     → 검색 폼은 평범한 GET 폼, 페이지 번호는 진짜 링크라서
       뒤로 가기와 주소 공유가 그대로 됨
   - 이 파일은 주소를 읽고 → 목록을 고르고 → 화면에 그리기만 함
   ========================================================= */
import { initLayout, initMobileMenu } from "./layout.js";
import { initModal } from "./components.js";
import { NOTICES } from "./notice-data.js";

const PAGE_SIZE = 6; // 한 페이지에 보여 줄 일반 글 수 (고정 공지는 따로)

// 검색 조건별로 어떤 글자를 뒤질지
const SEARCH_TARGETS = {
  title: (n) => n.title,
  content: (n) => [...n.body, ...(n.after || [])].join(" "),
  all: (n) => [n.title, ...n.body, ...(n.after || [])].join(" "),
};

const formatDate = (date) => date.replaceAll("-", ".");

/* ---------- 1. 주소 읽기 ---------- */
function readQuery() {
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  return {
    type: type in SEARCH_TARGETS ? type : "title",
    q: (params.get("q") || "").trim(),
    page: Number(params.get("page")) || 1,
    id: Number(params.get("id")) || null,
  };
}

// 지금 검색 조건을 유지한 채 다른 페이지로 가는 주소
function pageHref(query, page) {
  const params = new URLSearchParams();
  if (query.q) {
    params.set("type", query.type);
    params.set("q", query.q);
  }
  if (page > 1) params.set("page", page);
  const search = params.toString();
  return `notice.html${search ? `?${search}` : ""}#board`;
}

/* ---------- 2. 보여 줄 글 고르기 ---------- */
function getList(query) {
  const sorted = [...NOTICES].sort((a, b) => b.date.localeCompare(a.date));

  // 검색 중이면 고정 공지도 일반 글처럼 결과에 섞음
  if (query.q) {
    const keyword = query.q.toLowerCase();
    const target = SEARCH_TARGETS[query.type];
    const results = sorted.filter((n) => target(n).toLowerCase().includes(keyword));
    return { pinned: [], items: results };
  }

  return {
    pinned: sorted.filter((n) => n.pinned),
    items: sorted.filter((n) => !n.pinned),
  };
}

/* ---------- 3. 그리기 ---------- */
// 데이터는 이 사이트가 직접 넣은 글이라 innerHTML로 그림
// (사용자가 입력한 검색어는 textContent로만 넣음)
function rowTemplate(n) {
  const num = n.pinned ? '<span class="badge">공지</span>' : n.id;
  const newBadge = n.isNew ? ' <span class="badge badge--new">NEW</span>' : "";
  return `
    <tr class="${n.pinned ? "board-table__row--pinned" : ""}">
      <td>${num}</td>
      <td>${n.category}</td>
      <td class="board-table__title">
        <button type="button" class="board-title" data-notice-id="${n.id}">${n.title}</button>${newBadge}
      </td>
      <td><time datetime="${n.date}">${formatDate(n.date)}</time></td>
      <td>${n.views}</td>
    </tr>`;
}

function cardTemplate(n) {
  const pinBadge = n.pinned ? '<span class="badge">공지</span>' : "";
  const newBadge = n.isNew ? '<span class="badge badge--new">NEW</span>' : "";
  return `
    <li>
      <button type="button" class="notice-card ${n.pinned ? "notice-card--pinned" : ""}" data-notice-id="${n.id}">
        <span class="notice-card__meta">${pinBadge}<span>${n.category}</span>${newBadge}</span>
        <span class="notice-card__title">${n.title}</span>
        <span class="notice-card__info"><time datetime="${n.date}">${formatDate(n.date)}</time> · 조회 ${n.views}</span>
      </button>
    </li>`;
}

function renderPagination(nav, query, pageCount) {
  const { page } = query;
  // 이동할 곳이 없는 화살표는 href를 빼고 aria-disabled (가이드의 페이지네이션 규칙)
  const arrow = (target, label, text) =>
    target >= 1 && target <= pageCount
      ? `<a class="pagination__link pagination__link--arrow" href="${pageHref(query, target)}" aria-label="${label}">${text}</a>`
      : `<a class="pagination__link pagination__link--arrow" aria-label="${label}" aria-disabled="true">${text}</a>`;

  let numbers = "";
  for (let i = 1; i <= pageCount; i++) {
    const current = i === page ? ' aria-current="page"' : "";
    numbers += `<a class="pagination__link" href="${pageHref(query, i)}" aria-label="${i}페이지"${current}>${i}</a>`;
  }

  nav.innerHTML = arrow(page - 1, "이전 페이지", "←") + numbers + arrow(page + 1, "다음 페이지", "→");
}

/* ---------- 4. 상세 모달 ---------- */
function initNoticeModal(getNavList) {
  const dialog = document.getElementById("notice-modal");
  const meta = dialog.querySelector("[data-modal-meta]");
  const title = dialog.querySelector("[data-modal-title]");
  const info = dialog.querySelector("[data-modal-info]");
  const body = dialog.querySelector("[data-modal-body]");
  const prevBtn = dialog.querySelector("[data-modal-prev]");
  const nextBtn = dialog.querySelector("[data-modal-next]");
  let current = null;

  const paragraph = (text) => {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  };

  function fill(notice) {
    current = notice;

    meta.innerHTML = `${notice.pinned ? '<span class="badge">공지</span>' : ""}<span>${notice.category}</span>`;
    title.textContent = notice.title;
    info.textContent = `작성일 ${formatDate(notice.date)} · 조회 ${notice.views}`;

    // 본문 → 강조 상자 → 이어지는 본문
    body.replaceChildren(...notice.body.map(paragraph));
    if (notice.box) {
      const box = document.createElement("div");
      box.className = "modal__box";
      const boxTitle = document.createElement("strong");
      boxTitle.textContent = notice.box.title;
      box.append(boxTitle, ...notice.box.lines.map(paragraph));
      body.append(box);
    }
    if (notice.after) body.append(...notice.after.map(paragraph));
    body.scrollTop = 0;

    // 이전 글 = 목록에서 바로 위, 다음 글 = 바로 아래
    const list = getNavList(notice);
    const index = list.indexOf(notice);
    prevBtn.setAttribute("aria-disabled", String(index <= 0));
    nextBtn.setAttribute("aria-disabled", String(index >= list.length - 1));
  }

  function move(step, btn) {
    if (btn.getAttribute("aria-disabled") === "true") return;
    const list = getNavList(current);
    fill(list[list.indexOf(current) + step]);
  }

  prevBtn.addEventListener("click", () => move(-1, prevBtn));
  nextBtn.addEventListener("click", () => move(1, nextBtn));

  return function open(notice) {
    fill(notice);
    if (!dialog.open) dialog.showModal();
  };
}

/* ---------- 실행 ---------- */
const initBoard = () => {
  const board = document.querySelector("[data-board]");
  if (!board) return;

  const query = readQuery();
  const { pinned, items } = getList(query);

  // 페이지 번호가 범위를 벗어나면 가까운 끝 페이지로
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  query.page = Math.min(Math.max(query.page, 1), pageCount);
  const start = (query.page - 1) * PAGE_SIZE;
  const visible = [...pinned, ...items.slice(start, start + PAGE_SIZE)];

  // 검색 폼에 지금 조건을 다시 채워 둠
  const form = board.querySelector("[data-board-search]");
  form.elements.type.value = query.type;
  form.elements.q.value = query.q;

  // 건수 + 탭 제목 (페이지를 새로 불러오므로 제목으로 결과를 알려 줌)
  const count = board.querySelector("[data-board-count]");
  if (query.q) {
    count.innerHTML = `<span data-keyword></span> 검색 결과 <strong>${items.length}</strong>건`;
    count.querySelector("[data-keyword]").textContent = `'${query.q}'`;
    document.title = `'${query.q}' 검색 결과 ${items.length}건 | 공지사항 | 멍냥 동물병원`;
  } else {
    count.innerHTML = `전체 <strong>${NOTICES.length}</strong>건`;
    if (query.page > 1) document.title = `공지사항 ${query.page}페이지 | 멍냥 동물병원`;
  }

  // 목록 (표와 카드를 같은 데이터로 그리고, CSS가 폭에 맞는 하나만 보여 줌)
  const list = board.querySelector("[data-board-list]");
  const empty = board.querySelector("[data-board-empty]");
  const pagination = board.querySelector("[data-board-pagination]");

  if (visible.length === 0) {
    list.hidden = true;
    pagination.hidden = true;
    empty.hidden = false;
  } else {
    board.querySelector("[data-board-rows]").innerHTML = visible.map(rowTemplate).join("");
    board.querySelector("[data-board-cards]").innerHTML = visible.map(cardTemplate).join("");
    renderPagination(pagination, query, pageCount);
  }

  // 모달: 목록에 있는 글이면 그 순서로, 주소로 바로 연 글이 목록에 없으면 그 글 하나만
  const openNotice = initNoticeModal((notice) => (visible.includes(notice) ? visible : [notice]));

  // 제목(표) / 카드 클릭 → 모달 (이벤트 위임)
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-notice-id]");
    if (!btn) return;
    openNotice(NOTICES.find((n) => n.id === Number(btn.dataset.noticeId)));
  });

  // notice.html?id=15 로 들어오면 그 글을 바로 열기 (메인 공지 목록에서 옴)
  const linked = NOTICES.find((n) => n.id === query.id);
  if (linked) openNotice(linked);
};

initLayout();
initMobileMenu();
initModal();
initBoard();
