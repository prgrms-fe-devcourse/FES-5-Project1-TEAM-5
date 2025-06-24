export function noResultsRender() {
  const filterBox = document.querySelector(".filter");

  // 기존 필터 내용 숨기기
  if (filterBox) {
    [...filterBox.children].forEach((el) => {
      el.style.display = "none";
    });
  }

  // 알림 요소 생성
  const alertBox = document.createElement("div");
  alertBox.className = "no-results-alert";
  alertBox.textContent = "검색 결과가 없습니다. 🥲";

  // ✅ transform-origin을 '오른쪽'으로 지정
  alertBox.style.transformOrigin = "right center";

  filterBox.appendChild(alertBox);

  // 오른쪽에서 펼쳐지는 등장 애니메이션
  gsap.fromTo(
    alertBox,
    { scaleX: 0, opacity: 0 },
    { scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
  );

  // 2초 후 오른쪽으로 접히며 사라짐
  setTimeout(() => {
    gsap.to(alertBox, {
      scaleX: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        alertBox.remove();
        [...filterBox.children].forEach((el) => {
          if (el !== alertBox) el.style.display = "";
        });
      },
    });
  }, 2000);
}
