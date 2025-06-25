import { renderFestivalList } from "../components/createList.js";
import { getFestival } from "../utils/getFestival.js";
import { openModal, convertSimpleMarkdownToHtml } from "../components/note.js";
import { deleteReviews, getReviews } from "../components/storage.js"; // ✅ 수진님 만든 fetch 함수

const urlParams = new URLSearchParams(window.location.search);
let currentFestivalId = urlParams.get("id") || null;


/* 🧠 마크다운 렌더 함수 */
async function loadAndRenderNote(festivalId) {
  const container = document.querySelector(".noteContent");
  if (!container) return;

  try {
    const markdown = await getReviews(festivalId);
    // console.log("여기지? 다알아!", markdown);

    if (!markdown || markdown.trim() === "") {
      container.innerHTML = `<p class="empty-note">작성된 메모가 없습니다.</p>`;
      return;
    }
    const html = convertSimpleMarkdownToHtml(markdown);
    container.innerHTML = html;

    // ✅ 여기서 버튼 바인딩을 한다 — markdown이 있고 렌더링에 성공했을 때만!
    const editBtn = document.querySelector(".editNoteBtn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        console.log("✏️ 수정 버튼 클릭됨");
        openModal(festivalId, markdown); // 기존 마크다운 전달
      });
    }

    const deleteBtn = document.querySelector(".deleteNoteBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const confirmed = confirm("정말로 이 메모를 삭제하시겠습니까?");
        if (!confirmed) return;

        await deleteReviews(festivalId);
        container.innerHTML = `<p class="empty-note">작성된 메모가 없습니다.</p>`;
      });
    }

  } catch (err) {
    console.error("메모 렌더링 실패:", err);
    container.innerHTML = `<p class="empty-note">메모를 불러오는 데 실패했습니다.</p>`;
  }
}

/* ------------------------------------ - ----------------------------------- */
// 축제 리스트 렌더 이벤트
document.addEventListener("DOMContentLoaded", () => {
  const ul = document.querySelector(".festivalList .list");
  const festivals = getFestival();
  const container = document.querySelector(".noteContent");

  renderFestivalList(ul, festivals);

  // ✅ 쿼리에서 받아온 축제 ID가 있다면 선택 표시 + 렌더
  if (currentFestivalId) {
    const matchedItem = ul.querySelector(`[data-festival-id="${currentFestivalId}"]`);
    if (matchedItem) {
      matchedItem.classList.add("selected");
      matchedItem.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      loadAndRenderNote(currentFestivalId); // ✨ 메모 불러오기
    }
  }

  // 리스트 클릭 시 ID 저장 + 메모 불러오기
  ul.addEventListener("click", async (e) => {
    const li = e.target.closest(".festivalItem");
    if (!li) return;

    const id = li.dataset.festivalId;
    if (id) {
      currentFestivalId = id;

      ul.querySelectorAll(".festivalItem").forEach((item) =>
        item.classList.remove("selected")
      );
      li.classList.add("selected");

      await loadAndRenderNote(currentFestivalId); // ✨ 마크다운 렌더링
    }
  });

  // 노트 생성 버튼 클릭 → 모달 오픈
  const createNoteBtn = document.querySelector(".createNoteBtn");
  if (createNoteBtn) {
    createNoteBtn.addEventListener("click", () => {
      if (!currentFestivalId) {
        alert("먼저 축제를 선택해주세요!");
        return;
      }
      openModal(currentFestivalId); // 모달 열기
    });
  }
});
