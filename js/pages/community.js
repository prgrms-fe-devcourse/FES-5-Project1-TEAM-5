import { renderFestivalList } from "../components/createList.js";
import { getFestival } from "../utils/getFestival.js";







/* ------------------------------------ - ----------------------------------- */
// 축제 리스트 렌더 이벤트.
document.addEventListener("DOMContentLoaded", () => {
  const ul = document.querySelector(".festivalList .list");
  const festivals = getFestival();

  renderFestivalList(ul, festivals);

  // 이벤트 위임 : 축제 리스트 클릭 시
  ul.addEventListener("click", (e) => {
    const li = e.target.closest(".festivalItem");
    if (!li) return;

    const id = li.dataset.festivalId;
    if (id) {
      console.log(`클릭한 축제 ID: ${id}`);
      // showFestivalNote(id); // => 은정님 함수에 넣을 매개변수.
    }
  });
});
