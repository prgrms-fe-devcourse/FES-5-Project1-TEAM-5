import { getFestival } from "../utils/getFestival.js";

const { localStorage } = window;

export function handleReview(festivalId, textField) {
  textField.addEventListener("input", debounce(handleInput(festivalId), 300));
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

// 해당축제의 리뷰 가져와서 텍스트필드에 띄워주기
// 여기서 바로 마크다운이 적용되는지는 모르겠음 -> 안되면 되게하기 ...
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
const x_username = "FES5-Project1-5-Team";
const festivalsID = {};

export async function initFestivalData() {
  if (!localStorage.getItem("festival-ID")) {
    const festivals = getFestival();
    const results = await Promise.all(
      festivals.map(async (festival) => {
        const result = await post(festival["id"]);
        return { id: festival["id"], data: result };
      })
    );
    results.forEach(({ id, data }) => {
      festivalsID[id] = data;
    });
    localStorage.setItem("festival-ID", JSON.stringify(festivalsID));
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

export async function getReviews(id) {
  const idMap = JSON.parse(localStorage.getItem("festival-ID"));
  const param = idMap[id];  // 동적으로 키 접근
  let response = await fetch(`${url}/${param}`, {
    headers: { "x-username": x_username },
  });
  if (response.ok) {
    const data = await response.json();
    console.log(data);
    // const review = data.documents;
    return data.content;
  } else {
    console.error("error : " + response.status);
  }
}

export async function postReviews(festivalId) {
  let postMap = JSON.parse(localStorage.getItem("festival-ID"));
  let review = postMap[festivalId]
  let content = localStorage.getItem(`${festivalId}Review`);
  let reviewObj = { title: festivalId, content };
  try {
    const response = await fetch(`${url}/${review}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-username": x_username,
      },
      body: JSON.stringify(reviewObj),
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
    let review = festivalsID[festivalId];
    let reviewObj = { title: festivalId, content: "" };
    const response = await fetch(`${url}/${review}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-username": x_username,
      },
      body: JSON.stringify(reviewObj),
    });
    if (!response.ok) throw new Error(`Delete failed ${response.status}`);
  } catch (error) {
    console.error("Delete error : ", error);
  }
}
