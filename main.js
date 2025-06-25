import {
  getFestival,
  uhaRenderList,
  uhaHandleMouseEnter,
  uhaHandleMouseLeave,
  createFestivalInfo,
  filterFestivals,
  noResultsRender,
} from "./js/index.js";
import { config } from "./js/data/apikey.js";
import {
  addMarkers,
  deleteMarkers,
  initMap,
  isDefaultMarker,
  isFocusMarker,
  setMapCenter,
} from "./js/components/map.js";
import { initFestivalData, setUUID } from "./js/components/storage.js";
import { renderNav } from "./js/components/nav.js";

renderNav();

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let markers = {};
const map = initMap();

setMapCenter(map);
markers = addMarkers(map);

initFestivalData();
setUUID();

const controllerBtn = $(".video_controller a");
const video = $(".main_video");

function controllerBtnHandler(buttonState) {
  if (buttonState === "pause") {
    controllerBtn.setAttribute("data-play", "pause");
    controllerBtn.classList.add("pause");
  } else if (buttonState === "play") {
    controllerBtn.setAttribute("data-play", "play");
    controllerBtn.classList.remove("pause");
  }
}

function handleVideo() {
  const dataPlay = this.getAttribute("data-play");

  if (dataPlay === "pause") {
    video.pause();
    controllerBtnHandler("play");
  } else if (dataPlay === "play") {
    video.play().catch((e) => console.error(e));
    controllerBtnHandler("pause");
  }
}
controllerBtn.addEventListener("click", handleVideo);

const split = new SplitText(".main_visual01 h2", { type: "chars" });
gsap.from(split.chars, {
  opacity: 0,
  y: 30,
  stagger: 0.1,
  delay: 0.3,
  ease: "back(2)",
  immediateRender: false,
});

gsap.registerPlugin(ScrollTrigger);

const visualWrapper = $(".main_visual_wrapper");
const visuals = $$(".main_visual");

function setWrapperWidth() {
  const wrapperWidth = visuals.length * window.innerWidth;
  visualWrapper.style.width = wrapperWidth + "px";

  gsap.set(visualWrapper, { x: 0 });

  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  gsap.to(visualWrapper, {
    x: () => -wrapperWidth + window.innerWidth,
    ease: "none",
    scrollTrigger: {
      trigger: ".section01",
      start: "top top",
      end: () => "+=" + (wrapperWidth - window.innerWidth),
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,
    },
  });

  ScrollTrigger.refresh();
}

setWrapperWidth();

window.addEventListener("resize", () => {
  setWrapperWidth();
});

let festivalList = getFestival();
const uhaUl = document.querySelector(".uhaUl");
const imgNode = document.querySelector(".map-block");
const infoNode = document.querySelector(".fillter-list");
const searchButton = document.querySelector(".search-button");

uhaRenderList(festivalList, uhaUl);
const uhaButtons = document.querySelectorAll("li button");

uhaButtons.forEach((uhaButton) => {
  uhaButton.addEventListener("mouseenter", uhaHandleMouseEnter);
  uhaButton.addEventListener("mouseleave", uhaHandleMouseLeave);
});

searchButton.addEventListener("click", () => {
  festivalList = filterFestivals();
  if (festivalList.length === 0) {
    // 필터된 축제가 없으면?
    noResultsRender(); // 검색 결과 없을때 랜더되는 컴포넌트.
    return; // 검색 결과가 없으므로 종료.
  }
  uhaUl.innerHTML = "";

  uhaRenderList(festivalList, uhaUl);

  gsap.from(".uhaLi", {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out",
  });

  const uhaButtons = document.querySelectorAll("li button");
  uhaButtons.forEach((uhaButton) => {
    uhaButton.addEventListener("mouseenter", uhaHandleMouseEnter);
    uhaButton.addEventListener("mouseleave", uhaHandleMouseLeave);
  });
  markers = deleteMarkers();
  markers = addMarkers(map, festivalList);
});

function showFestivalInfoBySearch(e) {
  const target = e.target.closest(".uhaLi button");
  if (!target) return;
  const targetId = target.id;
  createFestivalInfo(targetId);
}

uhaUl.addEventListener("click", showFestivalInfoBySearch);

window.addEventListener("load", () => {
  const hash = window.location.hash;

  if (hash === "#main_search") {
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        // console.log("[main_search] 스크롤 이동 완료");
      } else {
        console.warn("[main_search] 해당 요소가 없습니다");
      }
    }, 200);
  }
});
