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

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const toggle = $(".nav_btn");
const nav = $(".nav");
const gnb = $(".gnb");
const stripes = $(".stripes");
const links = $$(".nav a");
 const header = $("header");

let markers = {};
const map = initMap();

setMapCenter(map);
markers = addMarkers(map);

const disabled = [
  ...gnb.querySelectorAll(".disabled a"),
  ...nav.querySelectorAll(".disabled a"),
];

disabled.forEach((button) => {
  button.addEventListener("mousemove", (e) => {
    const cursor = document.querySelector(".fake-cursor");
    let firstMove = true;
    document.addEventListener("mousemove", (e) => {
      if (firstMove) {
        gsap.set(cursor, {
          x: e.clientX,
          y: e.clientY,
          opacity: 1,
        });
        firstMove = false;
      } else {
        // 이후부터는 부드럽게 따라다님
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    });
  });
  button.addEventListener("mouseleave", (e) => {
    const cursor = document.querySelector(".fake-cursor");
    cursor.style.opacity = "0";
    document.body.style.cursor = "auto";
  });
});

function handelToggle(){
  nav.classList.toggle("visible");
  toggle.classList.toggle("visible");
  stripes.classList.toggle("visible");
  gnb.classList.toggle("hidden");
  const cursor = document.querySelector(".fake-cursor");
  cursor.style.opacity = "0";
  document.body.style.cursor = "auto";
}
toggle.addEventListener("click", handelToggle);
function handelHamburger(e){
    if (e.target.closest(".nav a")) {
    nav.classList.remove("visible");
    toggle.classList.remove("visible");
    stripes.classList.remove("visible");
    gnb.classList.remove("hidden");
    const cursor = document.querySelector(".fake-cursor");
    cursor.style.opacity = "0";
    document.body.style.cursor = "auto";
  }
}
document.addEventListener("click", handelHamburger);

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

function handleVideo(){
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

function handleScroll() {
   const scrollY = window.scrollY || window.pageYOffset;
  if (scrollY > 800) {
    gnb.classList.add("dark");
    toggle.classList.add("dark");
    header.classList.add("no-before")
  } else {
    gnb.classList.remove("dark");
    toggle.classList.remove("dark");
    header.classList.remove("no-before")
  }
}
window.addEventListener("scroll", handleScroll);

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
