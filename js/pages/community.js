import { renderFestivalList } from "../components/createList.js";
import { getFestival } from "../utils/getFestival.js";
import { openModal  } from "../components/note.js";

let currentFestivalId = null;







/* ------------------------------------ - ----------------------------------- */
// 축제 리스트 렌더 이벤트.
document.addEventListener("DOMContentLoaded", () => {
  const ul = document.querySelector(".festivalList .list");
  const festivals = getFestival();

  renderFestivalList(ul, festivals);

  // 리스트 클릭 시, 축제 ID 전역 변수에 저장
  ul.addEventListener("click", (e) => {
    const li = e.target.closest(".festivalItem");
    if (!li) return;

    const id = li.dataset.festivalId;
    if (id) {
      console.log(`클릭한 축제 ID: ${id}`);
      currentFestivalId = id;

      ul.querySelectorAll(".festivalItem").forEach((item) =>
        item.classList.remove("selected")
      );
      li.classList.add("selected");
    }
  });

  // ✅ 노트 생성 버튼 클릭 → 모달 오픈 + ID 전달
  const createNoteBtn = document.querySelector(".createNoteBtn");
  if (createNoteBtn) {
    createNoteBtn.addEventListener("click", () => {
      if (!currentFestivalId) {
        alert("먼저 축제를 선택해주세요!");
        return;
      }
      openModal(currentFestivalId); // 모달 열기 + ID 전달
    });
  }
});
