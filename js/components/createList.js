// 템플릿 함수
function createFestivalListItem({ id, countryCode, name }) {
  const li = document.createElement("li");
  li.classList.add("festivalItem");
  li.dataset.festivalId = id; // ✅ id를 data 속성에 저장
  li.textContent = `${countryCode} ${name}`;
  return li;
}

export function renderFestivalList(container, data) {
  if (!container || !Array.isArray(data)) return;
  container.innerHTML = "";
  data.forEach((festival) => {
    const li = createFestivalListItem(festival);
    container.appendChild(li);
  });
}