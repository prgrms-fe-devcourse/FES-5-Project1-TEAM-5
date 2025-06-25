const imageMap = new Map(); // Base64를 저장할 Map

function convertSimpleMarkdownToHtml(markdownText) {
  let html = markdownText;

  // 인용문 (>) 처리
  html = html.replace(/^\s*>\s*(.*)$/gm, '<blockquote><p>$1</p></blockquote>');

  // 접고 펴는 기능 (<details><summary>) 처리
  html = html.replace(/<details><summary>(.*?)<\/summary>([\s\S]*?)<\/details>/g, '<details><summary>$1</summary>$2</details>');

  // 제목 (h1~h6) 처리 (가장 많은 #부터)
  html = html.replace(/^######\s*(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s*(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s*(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s*(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s*(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s*(.*)$/gm, '<h1>$1</h1>');

  // 불릿 리스트 항목
  html = html.replace(/^- (.*)$/gm, '<li-bullet>$1</li-bullet>');
  // 숫자 리스트 항목 (숫자 유지)
  html = html.replace(/^(\d+)\.\s*(.*)$/gm, '<li-number>$1. $2</li-number>');

  // 불릿 리스트 그룹화
  html = html.replace(/(<li-bullet>[\s\S]*?<\/li-bullet>)+/g, '<ul>$&</ul>');
  // 숫자 리스트 그룹화
  html = html.replace(/(<li-number>[\s\S]*?<\/li-number>)+/g, '<ol>$&</ol>');

  // 임시 태그를 실제 <li> 태그로 변환
  html = html.replace(/<li-bullet>(.*?)<\/li-bullet>/g, '<li>$1</li>');
  html = html.replace(/<li-number>(.*?)<\/li-number>/g, '<li>$1</li>');

  // 코드 블록 (```) 처리 
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');

  // 이미지: ![alt](imageID)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
    const realSrc = imageMap.get(src) || src; // base64로 변환
    return `<img src="${realSrc}" alt="${alt}">`;
  });


  // 코드 인라인 (`) 처리 
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 굵은 글씨 (**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // 기울임꼴 (*)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // 링크 ([텍스트](URL))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

 // 줄바꿈 처리 
  html = html.replace(/((?:\r?\n){2,})/g, '</p><p>');

  // 남아있는 단일 줄바꿈을 <br> 태그로 변환
  // <p> 태그로 묶이지 않은 단일 줄바꿈만 <br>로 변환
  html = html.replace(/\r?\n/g, '<br>');

  if (!html.startsWith('<p>') && !html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote') && !html.startsWith('<pre') && !html.startsWith('<details')) {
      html = '<p>' + html;
  }
  if (!html.endsWith('</p>') && !html.endsWith('</ul>') && !html.endsWith('</ol>') && !html.endsWith('</blockquote>') && !html.endsWith('</pre>') && !html.endsWith('</details>')) {
      html = html + '</p>';
  }
  // 줄바꿈 처리: 두 줄 이상 줄바꿈은 문단 구분
  html = html.replace(/(?:\r?\n){2,}/g, '</p><p>');

  // 단일 줄바꿈은 <br>로 처리하되, 블록 요소 사이에는 넣지 않음
  html = html.replace(/([^\n>])\r?\n(?!\r?\n)/g, '$1<br>');

  // 블록 태그 뒤에 붙은 <br> 제거 (간격 줄이기)
  html = html.replace(/<\/(ul|ol|h[1-6]|blockquote|pre|details)><br>/g, '</$1>');

  return html;
}


let modalAnimation;

function openModal() {
  modalAnimation = gsap.timeline({ defaults: { ease: "power2.inOut" }})
    .set("#note_modal", { display: "flex", visibility: "visible", opacity: 0, scaleY: 0.01, transformOrigin: "center center" })
    .set("#note_modal #fourth", { opacity: 0, scaleY: 0, transformOrigin: "center center" })
    .set("#note_modal #second", { opacity: 0, scaleY: 0, transformOrigin: "center center" })
    .set("#note_modal #third", { opacity: 0, scaleY: 0, transformOrigin: "center center" })
    .to("#note_modal", { opacity: 1, scaleY: 1, duration: 0.6, background: "rgba(0,0,0,0.16)" })
    .to("#note_modal #fourth", { opacity: 1, scaleY: 1, duration: 0.6 }, "-=0.4")
    .to("#note_modal #second", { opacity: 1, scaleY: 1, duration: 0.4 }, "-=0.2")
    .to("#note_modal #third", { opacity: 1, scaleY: 1, duration: 0.4 }, "-=0.2")
    .to("#note_modal #fourth", { background: "rgba(135,25,795,0.5)", border: "1px solid rgba(0,0,0,0.1)", duration: 0.8 }, "-=0.4");
      document.body.style.overflow = 'hidden';

  const markdownInput = document.getElementById('markdown_input');
  const markdownDisplay = document.querySelector('.modal_description_display');
  if (markdownInput && markdownDisplay) {
    markdownInput.value = ''; // 입력 필드 비우기
    markdownDisplay.innerHTML = ''; // 미리보기 영역 비우기
    markdownInput.focus(); // 입력 필드에 포커스 주기
  }
}

function closeModal() {
  if (modalAnimation && modalAnimation.progress() !== 0) {
    modalAnimation.timeScale(1.6).reverse().then(() => {
      gsap.set("#note_modal", { display: "none", visibility: "hidden" });
       document.body.style.overflow = '';
    });
  }
}

function saveSomething() {
  console.log("Save clicked!");
  const markdownTextToSave = document.getElementById('markdown_input').value;
  console.log("저장할 마크다운 텍스트:", markdownTextToSave);
  // 실제 저장 로직 (서버로 전송 등)
  closeModal();
}

// DOM이 완전히 로드된 후 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
  const openNoteBtn = document.getElementById("open_note");
  if (openNoteBtn) {
    openNoteBtn.addEventListener("click", openModal);
  } else {
    console.warn("Element with ID 'open_note' not found. Open button might not work.");
  }

  document.getElementById("close_btn").addEventListener("click", closeModal);
  document.getElementById("save_btn").addEventListener("click", saveSomething);
  document.getElementById("x_btn").addEventListener("click", closeModal);

  const markdownInput = document.getElementById('markdown_input');
  const markdownDisplay = document.querySelector('.modal_description_display');
  const attachImageBtn = document.getElementById('attach_image_btn');
  const imageFileInput = document.getElementById('image_file_input');

  if (markdownInput && markdownDisplay) {
    markdownInput.addEventListener('input', () => {
      const markdownText = markdownInput.value;
      markdownDisplay.innerHTML = convertSimpleMarkdownToHtml(markdownText);
    });
  } else {
    console.warn("Markdown input or display element not found. Check IDs and classes.");
  }

  if (attachImageBtn && imageFileInput && markdownInput && markdownDisplay) {
    attachImageBtn.addEventListener('click', () => {
      imageFileInput.click();
    });

  imageFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택해주세요!');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      const imageId = `image_${Date.now()}`;
      imageMap.set(imageId, base64);

      const markdownImage = `![${file.name}](${imageId})\n`;

      const currentText = markdownInput.value;
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;

      markdownInput.value =
        currentText.substring(0, start) +
        markdownImage +
        currentText.substring(end);

      markdownInput.selectionStart = markdownInput.selectionEnd = start + markdownImage.length;
      markdownInput.dispatchEvent(new Event('input'));

      event.target.value = ''; // 파일 초기화
    };

    reader.readAsDataURL(file);
  });

  } else {
    console.warn("이미지 첨부 요소를 찾을 수 없습니다.");
  }

});

document.querySelector(".modal_overlay").addEventListener("click", function(e) {
  if (e.target === this) {
    closeModal();
  }
});
