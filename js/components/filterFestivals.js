import { festivals } from "../data/data.js";
import { getFestival } from "../utils/getFestival.js";

const filterInputs = document.querySelectorAll(".filter-item input");
const [filterCountryInput, filterCityInput, filterDateInput, filterThemeInput] =
  filterInputs;

//
export function filterFestivals() {
  let filterCountryText = filterCountryInput.value.trim().toUpperCase();
  let filterCityText = filterCityInput.value.trim().toLowerCase();
  let filterDateText = filterDateInput.value;
  let filterThemeText = filterThemeInput.value.trim();

  const matched = festivals.filter((festival) => {
    const matchesCountry =
      !filterCountryText ||
      festival.countryCode.toUpperCase().includes(filterCountryText);
    const matchesCity =
      !filterCityText || festival.city.toLowerCase().includes(filterCityText);
    const matchesDate =
      !filterDateInput || festival.date.includes(filterDateText);
    const matchesTheme =
      !filterThemeText ||
      (Array.isArray(festival.theme) &&
        festival.theme.some((t) => t.includes(filterThemeText)));

    return matchesCountry && matchesCity && matchesDate && matchesTheme;
  });

  updateDropdowns(
    filterCountryText,
    filterCityText,
    filterDateText,
    filterThemeText
  );
  return matched;
}

// export function handleSearchClick( ){
//   const searchButton = document.querySelector('.search-button');

//   searchButton.addEventListener('click',()=>{
//     lastFilteredFestivals = filterFestivals();
//   })
// }

function updateDropdowns(countryText, cityText, dateText, themeText) {
  const activeElement = document.activeElement; // 활성화된 요소 지정
  const activeFilter = activeElement?.id?.replace("filter-", ""); // 단어 정리

  ["country", "city", "date", "theme"].forEach(removeDropdown);

  switch (activeFilter) {
    case "country":
      if (countryText) {
        const countryList = festivals
          .filter((item) =>
            item.countryCode.toUpperCase().includes(countryText)
          )
          .map((item) => item.countryCode);
        addDropdown("country", countryList);
      }
      break;

    case "city":
      if (cityText) {
        const cityList = festivals
          .filter((item) => item.city.toLowerCase().includes(cityText))
          .map((item) => item.city);
        addDropdown("city", cityList);
      }
      break;

    case "date":
      if (dateText) {
        const dateList = festivals
          .filter((item) => item.date.includes(dateText))
          .map((item) => item.date);
      }
      break;

    case "theme":
      if (themeText) {
        const allThemes = festivals.flatMap((item) => item.theme || []);
        const matchedThemes = allThemes.filter((item) =>
          item.includes(themeText)
        );
        const uniqueSorted = [...new Set(matchedThemes)].sort((a, b) => {
          const aStarts = a.startsWith(themeText);
          const bStarts = b.startsWith(themeText);
          const aExact = a === themeText;
          const bExact = b === themeText;

          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        });

        addDropdown("theme", uniqueSorted);
      }
      break;

    default:
      // 포커스가 없거나, 위에 해당하지 않으면 아무것도 안함 (모든 드롭다운 닫힘)
      break;
  }
}

// 검색 드롭다운 추가
export function addDropdown(filter, items) {
  const ul = document.querySelector(`#${filter}-dd`);
  ul.textContent = ""; // 기존 목록 지우기

  const flattenedItems = filter === "theme" ? items.flat() : items;
  const uniqueItems = [...new Set(flattenedItems)]; // 중복 제거

  if (uniqueItems.length === 0) {
    return;
  }

  uniqueItems.forEach((item) => {
    const li = document.createElement("li");
    li.classList.add("dropdown-li");
    li.textContent = item;

    li.addEventListener("click", () => {
      // console.log( `Clicked: ${item}`);

      // 클릭되면 그 값을 인풋에 넣고
      switch (filter) {
        case "country":
          filterCountryInput.value = item;
          break;
        case "city":
          filterCityInput.value = item;
          break;
        case "theme":
          filterThemeInput.value = item;
          break;
      }

      // 리스트 없애기
      removeDropdown(filter);
    });

    ul.append(li);
  });
}

export function removeDropdown(filter) {
  const ul = document.querySelector(`#${filter}-dd`);

  if (ul) {
    ul.innerHTML = ""; //기존 리스트 비우기s
  }
}

export function showFullDropDown(filterKey) {
  let list;

  switch (filterKey) {
    case "country":
      list = festivals.map((item) => item.countryCode);
      break;
    case "city":
      list = festivals.map((item) => item.city);
      break;
    case "theme":
      list = festivals.flatMap((item) => item.theme || []);
      break;
    default:
      return;
  }

  const uniqueList = [...new Set(list)];
  addDropdown(filterKey, uniqueList);
}

const filterButtons = document.querySelectorAll(".filter-button");
let isButtonClicked = false;

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filterKey = btn.dataset.filter;

    if (!isButtonClicked) {
      showFullDropDown(filterKey);
      isButtonClicked = !isButtonClicked;
    } else {
      isButtonClicked = !isButtonClicked;
      removeDropdown(filterKey);
    }
  });
});

filterCountryInput.addEventListener("input", filterFestivals);
filterCityInput.addEventListener("input", filterFestivals);
filterDateInput.addEventListener("input", filterFestivals);
filterThemeInput.addEventListener("input", filterFestivals);

// console.log(festivals);
