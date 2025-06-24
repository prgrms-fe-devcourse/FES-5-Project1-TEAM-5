export function noResultsRender() {
  const filterBox = document.querySelector(".filter");

  // 기존 내용 숨기기
  if (filterBox) {
    [...filterBox.children].forEach((el) => {
      el.style.display = "none";
    });
  }

  // alertBox 생성
  const alertBox = document.createElement("div");
  alertBox.className = "no-results-alert";
  alertBox.textContent = "검색 결과가 없습니다. 🥲";

  // transform-origin을 왼쪽으로 설정해야 앞부분부터 펼쳐짐
  alertBox.style.transformOrigin = "left center";

  filterBox.appendChild(alertBox);

  // 등장 애니메이션 (왼쪽에서 쭉 펼쳐짐)
  gsap.fromTo(
    alertBox,
    { scaleX: 0, opacity: 0 },
    { scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
  );

  // 2초 후 퇴장 (오른쪽으로 접힘)
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