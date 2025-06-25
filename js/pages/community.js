import { renderFestivalList } from "../components/createList.js";
import { getFestival } from "../utils/getFestival.js";
import { openModal, convertSimpleMarkdownToHtml } from "../components/note.js";
import { deleteReviews, getReviews } from "../components/storage.js";

let currentFestivalId = null;

// ✅ 순서: localStorage → URL → null
const localStoredId = localStorage.getItem("lastSelectedFestivalId");
const urlParamId = new URLSearchParams(window.location.search).get("id");

if (localStoredId) {
  currentFestivalId = localStoredId;
} else if (urlParamId) {
  currentFestivalId = urlParamId;
}

/* 🧠 마크다운 렌더 함수 */
async function loadAndRenderNote(festivalId) {
  const contentContainer = document.querySelector(".noteContent");
  const actionContainer = document.querySelector(".noteActions");
  if (!contentContainer || !actionContainer) return;

  try {
    const markdown = await getReviews(festivalId);

    if (!markdown || markdown.trim() === "") {
      contentContainer.innerHTML = `<p class="empty-note">작성된 메모가 없습니다. 🥲</p>`;
      actionContainer.innerHTML = ""; // 액션 버튼 제거
      return;
    }

    const html = convertSimpleMarkdownToHtml(markdown);
    // console.log(html);
    contentContainer.innerHTML = html;

    // 🎯 버튼을 매번 새로 만들어서 바인딩
    actionContainer.innerHTML = `
      <button class="editNoteBtn">수정</button>
      <button class="deleteNoteBtn">삭제</button>
    `;

    const editBtn = actionContainer.querySelector(".editNoteBtn");
    editBtn.addEventListener("click", () => {
      openModal(festivalId, markdown); // 항상 최신값 사용
    });

    const deleteBtn = actionContainer.querySelector(".deleteNoteBtn");
    deleteBtn.addEventListener("click", async () => {
      const confirmed = confirm("정말로 이 메모를 삭제하시겠습니까?");
      if (!confirmed) return;

      await deleteReviews(festivalId);
      contentContainer.innerHTML = `<p class="empty-note">작성된 메모가 없습니다.🥲</p>`;
      actionContainer.innerHTML = "";
    });

  } catch (err) {
    console.error("메모 렌더링 실패:", err);
    contentContainer.innerHTML = `<p class="empty-note">메모를 불러오는 데 실패했습니다.</p>`;
    actionContainer.innerHTML = "";
  }
}

/* 📌 DOMContentLoaded 후 축제 목록 초기 렌더링 */
document.addEventListener("DOMContentLoaded", () => {
  const ul = document.querySelector(".festivalList .list");
  const festivals = getFestival();

  renderFestivalList(ul, festivals);

  

  if (currentFestivalId) {
    // ✅ URL이나 localStorage에서 온 경우
    const matchedItem = ul.querySelector(`[data-festival-id="${currentFestivalId}"]`);
    if (matchedItem) {
      matchedItem.classList.add("selected");
      matchedItem.scrollIntoView({ behavior: "smooth", block: "center" });
      loadAndRenderNote(currentFestivalId);
    }
  } else {
    // ✅ URL도 localStorage도 없을 때: 첫 번째 축제를 선택
    const firstItem = ul.querySelector(".festivalItem");
    if (firstItem) {
      currentFestivalId = firstItem.dataset.festivalId;
      firstItem.classList.add("selected");
      loadAndRenderNote(currentFestivalId);
    }
  }

  // 리스트 클릭 시 ID 저장 + 메모 로딩
  ul.addEventListener("click", async (e) => {
    const li = e.target.closest(".festivalItem");
    if (!li) return;

    const id = li.dataset.festivalId;
    if (id) {
      currentFestivalId = id;

      localStorage.setItem("lastSelectedFestivalId", id);


      ul.querySelectorAll(".festivalItem").forEach((item) =>
        item.classList.remove("selected")
      );
      li.classList.add("selected");

      await loadAndRenderNote(currentFestivalId);
    }
  });

  // 노트 생성 버튼
  const createNoteBtn = document.querySelector(".createNoteBtn");
  if (createNoteBtn) {
    createNoteBtn.addEventListener("click", () => {
      if (!currentFestivalId) {
        alert("먼저 축제를 선택해주세요!");
        return;
      }
      openModal(currentFestivalId);
    });
  }
});
