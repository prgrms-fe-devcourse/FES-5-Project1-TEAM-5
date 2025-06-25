
export function renderNav() {
  const navPlaceholder = document.getElementById("nav_placeholder");
  const isMainPage = location.pathname === "/" || location.pathname.endsWith("index.html");
  const searchHref = isMainPage ? "#main_search" : "../#main_search";

  if (navPlaceholder) {
    navPlaceholder.innerHTML = `
      <header class="header">
        <div class="fake-cursor">🚫구현예정기능입니다</div>
        <div class="stripes">
          <div class="stripes_box stripes_box1"></div>
          <div class="stripes_box stripes_box2"></div>
          <div class="stripes_box stripes_box3"></div>
          <div class="stripes_box stripes_box4"></div>
        </div>
        <div class="nav_btn">
          <div>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <nav class="nav">
          <ul class="nav_list">
            <li class="nav_list_item">
              <a href="${searchHref}">SEARCH</a>
            </li>
            <li class="nav_list_item disabled">
              <a href="#none">COMMUNITY</a>
            </li>
            <li class="nav_list_item disabled">
              <a href="#none">TRAVEL COURSE</a>
            </li>
            <li class="nav_list_item disabled">
              <a href="#none">ABOUT</a>
            </li>
          </ul>
        </nav>
        <ul class="gnb">
          <li class="gnb_item">
            <a href="${searchHref}">SEARCH</a>
          </li>
          <li class="gnb_item disabled">
            <a href="javascript:void(0);">COMMUNITY</a>
          </li>
          <li class="gnb_item disabled">
            <a href="javascript:void(0);">TRAVEL COURSE</a>
          </li>
          <li class="gnb_item disabled">
            <a href="javascript:void(0);">ABOUT</a>
          </li>
        </ul>
      </header>
    `;

    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);

    const toggle = $(".nav_btn");
    const nav = $(".nav");
    const gnb = $(".gnb");
    const stripes = $(".stripes");
    const links = $$(".nav a");
    const header = $("header");

    const disabled = [
      ...gnb.querySelectorAll(".disabled a"),
      ...nav.querySelectorAll(".disabled a"),
    ];

    disabled.forEach((button) => {
      button.addEventListener("mousemove", (e) => {
        const cursor = document.querySelector(".fake-cursor");
        let firstMove = true;
        const onMouseMove = (e) => {
          if (firstMove) {
            gsap.set(cursor, {
              x: e.clientX,
              y: e.clientY,
              opacity: 1,
            });
            firstMove = false;
          } else {
            gsap.to(cursor, {
              x: e.clientX,
              y: e.clientY,
              duration: 0.2,
              ease: "power2.out",
            });
          }
        };
        document.addEventListener("mousemove", onMouseMove);
        button.addEventListener("mouseleave", () => {
          document.removeEventListener("mousemove", onMouseMove);
          const cursor = document.querySelector(".fake-cursor");
          cursor.style.opacity = "0";
        });
      });
    });

    function handelToggle() {
      nav.classList.toggle("visible");
      toggle.classList.toggle("visible");
      stripes.classList.toggle("visible");
      gnb.classList.toggle("hidden");
      const cursor = document.querySelector(".fake-cursor");
      cursor.style.opacity = "0";
    }

    toggle.addEventListener("click", handelToggle);

    function handelHamburger(e) {
      if (e.target.closest(".nav a")) {
        nav.classList.remove("visible");
        toggle.classList.remove("visible");
        stripes.classList.remove("visible");
        gnb.classList.remove("hidden");
        const cursor = document.querySelector(".fake-cursor");
        cursor.style.opacity = "0";
      }
    }

    document.addEventListener("click", handelHamburger);

    function handleScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 800) {
        gnb.classList.add("dark");
        toggle.classList.add("dark");
        header.classList.add("no-before");
      } else {
        gnb.classList.remove("dark");
        toggle.classList.remove("dark");
        header.classList.remove("no-before");
      }
    }

    function applyDarkModeIfNeeded() {
      if (document.querySelector(".community_nav")) {
        gnb.classList.add("dark");
        toggle.classList.add("dark");
        header.classList.add("no-before");
      }
    }
    applyDarkModeIfNeeded(); 

    window.addEventListener("scroll", handleScroll);
  }
}
