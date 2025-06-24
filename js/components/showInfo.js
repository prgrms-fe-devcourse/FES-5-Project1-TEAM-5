// festivalInfoModule.js
import { getFestival } from "../utils/getFestival.js";

// 축제 info 생성
export function createFestivalInfo(targetId, parentNode, imageParentNode) {
  if (parentNode.querySelector(".festival-info")) {
    console.warn("이미 열린 축제 정보가 있습니다.");
    return; // 중복 생성 방지
  }

  console.log(imageParentNode);

  const [festival] = getFestival("id", targetId); // 축제 데이터 가져오기
  if (!festival) {
    console.warn(`ID가 ${targetId}인 축제가 없습니다.`);
    return;
  }

  const {
    name,
    info: { image, description },
    city,
    theme,
  } = festival;

  // 인포 노드 생성 및 삽입
  const infoNode = createFestivalTemplate(name, city, theme, description);
  parentNode.appendChild(infoNode);
  const uhaUlNode = document.querySelector(".uhaUl");
  const mapNode = document.querySelector(".map-block");
  if (uhaUlNode) {
    uhaUlNode.classList.add("display-none");
    mapNode.classList.add("display-none");
  }
  gsap.fromTo(
    infoNode,
    { opacity: 0, x: 40 },
    {
      opacity: 1,
      x: 0,
      duration: 1.5,
      ease: "power2.out",
    }
  );

  // 이미지 노드 생성 및 삽입 (선언 위치는 이벤트 리스너와 공유할 수 있도록 바깥에 둠)
  const inner = document.querySelector(".section02 .inner");
  let imageNode = null;
  if (image && imageParentNode) {
    imageNode = createImageTemplate(image);
    inner.prepend(imageNode);
    gsap.fromTo(
      imageNode,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 2,
        ease: "power2.out",
      }
    );
  }

  //뒤로가기 버튼 클릭 시 정보 + 이미지 제거
  const closeBtn = infoNode.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    infoNode.remove();
    if (imageNode && inner.contains(imageNode)) {
      imageNode.remove();
    }

    const uhaUlNode = document.querySelector(".uhaUl");
    const mapNode = document.querySelector(".map-block");
    if (uhaUlNode) {
      uhaUlNode.classList.remove("display-none");
      mapNode.classList.remove("display-none");
    }
  });
}

// 인포 템플릿 생성
function createFestivalTemplate(name, city, theme, description) {
  const wrapper = document.createElement("div");
  wrapper.className = "festival-info is-active";

  const themeList = theme.map((item) => `<li>#${item}</li>`).join("");

  wrapper.innerHTML = /*html */ `
    <header>
      <h3>${name}</h3>
      <button class="close-btn">
        <img src="../../../assets/images/backIcon.png" alt="뒤로가기" />
      </button>
    </header>
    <div>
      <ul class="hash-tag">
        <li>#${city}</li>
        ${themeList}
      </ul>
    </div>
    <p>${description}</p>
  `;

  return wrapper;
}

// 이미지 템플릿 생성
function createImageTemplate(imageUrl, altText = "부가 이미지") {
  const imgWrapper = document.createElement("div");
  imgWrapper.className = "festival-image-overlay";

  imgWrapper.innerHTML = `
    <img src="${imageUrl}" alt="${altText}" />
  `;

  return imgWrapper;
}
