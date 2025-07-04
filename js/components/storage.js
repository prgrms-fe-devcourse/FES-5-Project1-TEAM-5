import { getFestival } from "../utils/getFestival.js";

const { localStorage } = window;

export function handleReview(festivalId, textField) {
  // ✅ 기존 input 이벤트 제거 (가능한 경우)
  textField.removeEventListener(
    "__input_handler__",
    textField.__debounced_handler__
  );

  // ✅ 새 debounce 핸들러 정의
  const handler = debounce(function (e) {
    const value = this.value;
    localStorage.setItem(`${festivalId}Review`, value);
  }, 300);

  textField.__debounced_handler__ = handler;

  // ✅ input 핸들러 등록 (참조 이름으로 추적 가능)
  textField.addEventListener("input", handler);
}

// input이  변경될때마다 로컬스토리지에 축제idreview에  저장
function handleInput(id) {
  return function (e) {
    const value = this.value;
    localStorage.setItem(`${id}Review`, value);
  };
}

// textField.addEventListener("input", debounce(handleInput, 300))
function debounce(f, limit = 1000) {
  let timeout;
  return function (e) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      f.call(this, e);
    }, limit);
  };
}

export function initTextField(id) {
  const value = localStorage.getItem(`${id}Review`);
  if (value) textField.value = value;
}

function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function setUUID() {
  let uuid = localStorage.getItem("uuid");

  if (!uuid) {
    uuid = generateUUID();
    localStorage.setItem("uuid", uuid);
  }
}

// ---------프로그래머스 API ---------------

const url = "https://kdt-api.fe.dev-cos.com/documents";
const x_username = "FES5-Project1-5Team_final";
const festivalsID = {};

export async function initFestivalData() {
  const saved = localStorage.getItem("festival-ID");
  if (saved) return; // 이미 저장돼 있으면 아무 것도 안 함

  const idMap = {};

  try {
    const response = await fetch(`${url}`, {
      headers: { "x-username": x_username },
    });
    if (!response.ok) throw new Error("서버에서 데이터 가져오기 실패");

    const data = await response.json();

    for (const item of data) {
      if (item.title && item.id) {
        idMap[item.title] = item.id;
      }
    }

    const allFestivals = getFestival();
    for (const festival of allFestivals) {
      const festivalId = festival.id;
      if (!idMap[festivalId]) {
        const newId = await post(festivalId);
        idMap[festivalId] = newId;
      }
    }
    localStorage.setItem("festival-ID", JSON.stringify(idMap));
  } catch (err) {
    console.error("initFestivalData 오류:", err);
  }
}
async function post(title, parent = { parent: null }) {
  try {
    const response = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-username": x_username,
      },
      body: JSON.stringify({ title, ...parent }),
    });
    if (!response.ok) throw new Error(`http error : ${response.status}`);
    else {
      localStorage.removeItem(`${title}Review`);
      const data = await response.json();
      return data.id;
    }
  } catch (error) {
    console.error("error : ", error);
  }
}

export async function getReviews(id, getID = false) {
  const idMap = JSON.parse(localStorage.getItem("festival-ID"));
  const param = idMap[id];
  try {
    let response = await fetch(`${url}/${param}`, {
      headers: { "x-username": x_username },
    });
    if (response.ok) {
      const data = await response.json();
      const reviews = data.documents;
      const userUUID = localStorage.getItem("uuid");
      for (let review of reviews) {
        if (review.title === userUUID) {
          let response = await fetch(`${url}/${review.id}`, {
            headers: { "x-username": x_username },
          });
          if (response.ok) {
            const data = await response.json();
            if (getID === false) {
              return data.content;
            } else {
              return { id: data.id, content: data.content };
            }
          } else {
            throw new Error("get error : ", error);
          }
        }
      }
      return;
    } else {
      throw new Error("get festival error : ", error);
    }
  } catch (error) {
    console.error("error : ", error);
  }
}

export async function postReviews(festivalId) {
  let postMap = JSON.parse(localStorage.getItem("festival-ID"));
  let festival = postMap[festivalId];
  const userUUID = localStorage.getItem("uuid");
  let content = localStorage.getItem(`${festivalId}Review`);
  let reviewObjContent = { title: userUUID, content };
  try {
    let reviewExist = await getReviews(festivalId, true);
    let responsePOST = reviewExist?.id;
    if (!reviewExist) responsePOST = await post(userUUID, { parent: festival });
    const response = await fetch(`${url}/${responsePOST}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-username": x_username,
      },
      body: JSON.stringify(reviewObjContent),
    });
    if (!response.ok) throw new Error(`http error : ${response.status}`);
    else {
      localStorage.removeItem(`${festivalId}Review`);
    }
  } catch (error) {
    console.error("error : ", error);
  }
}

// export async function postReviews(festivalId) {
//   const review = await post("", { parent: festivalsID[festivalId] });
//   let title = localStorage.getItem(`${festivalId}Review`);
//   let reviewObj = { title, content: "" };
//   try {
//     const response = await fetch(`${url}/${review}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "x-username": x_username,
//       },
//       body: JSON.stringify(reviewObj),
//     });
//     if (!response.ok) throw new Error(`http error : ${response.status}`);
//     else {
//       localStorage.removeItem(`${festivalId}Review`);
//       console.log("리뷰올리기성공");
//     }
//   } catch (error) {
//     console.error("error : ", error);
//   }
// }

export async function deleteReviews(festivalId) {
  try {
    let postMap = JSON.parse(localStorage.getItem("festival-ID"));
    let festival = postMap[festivalId];
    const response = await getReviews(festivalId, true);

    const responseDelete = await fetch(`${url}/${response.id}`, {
      method: "DELETE",
      headers: { "x-username": x_username },
    });
    if (!responseDelete.ok)
      throw new Error(`Delete failed ${responseDelete.status}`);
    else localStorage.removeItem(`${festivalId}Review`);
  } catch (error) {
    console.error("Delete error : ", error);
  }
}
