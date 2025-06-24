import { getFestival } from "../utils/getFestival.js";

// 축제 info 생성
export function createFestivalInfo(targetId) {
  const parentNode = document.querySelector(".fillter-list");
  const imageParentNode = document.querySelector(".map-block");
  const uhaUl = document.querySelector(".uhaUl");
  const imageWrapperNode = document.querySelector(".section02 .inner");

  if (!parentNode || !imageParentNode || !uhaUl || !imageWrapperNode) {
    console.warn("필수 DOM 요소가 누락되었습니다.");
    return;
  }

  if (parentNode.querySelector(".festival-info")) {
    console.warn("이미 열린 축제 정보가 있습니다.");
    return;
  }

  const [festival] = getFestival("id", targetId);
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

  // 인포 삽입
  const infoNode = createFestivalTemplate(name, city, theme, description);
  parentNode.appendChild(infoNode);

  uhaUl.classList.add("display-none");
  imageParentNode.classList.add("display-none");

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

  // 이미지 삽입
  let imageNode = null;
  if (image) {
    imageNode = createImageTemplate(image);
    imageWrapperNode.prepend(imageNode);
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

  // 닫기 처리
  const closeBtn = infoNode.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    infoNode.remove();
    if (imageNode && imageWrapperNode.contains(imageNode)) {
      imageNode.remove();
    }
    uhaUl.classList.remove("display-none");
    imageParentNode.classList.remove("display-none");
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
