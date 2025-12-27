/* js/exam.js */

/*
  Behavior:
  - Loads questions array from sessionStorage key 'exam_questions' if present; otherwise uses defaultQuestions.
  - Renders total questions and current question number.
  - Renders choices depending on type (mcq / tf).
  - Allows selection of an answer (updates state and tracker).
  - Next / Previous navigation.
  - Jump to question by clicking tracker button.
  - Mark for review toggles a 'marked' flag.
  - Keeps answers and states in memory (questionsState).
  - Updates unanswered count text.
*/

/* ------------------ default questions (15 total: 10 MCQ, 5 TF) ------------------ */
const defaultQuestions = [
  // 10 MCQ
  { id: 1, desc: "What is 2 + 2?", type: "mcq", choices: ["1", "2", "4", "22"] },
  { id: 2, desc: "Which is a prime number?", type: "mcq", choices: ["4", "6", "7", "9"] },
  { id: 3, desc: "HTML stands for?", type: "mcq", choices: ["Hyper Text", "Hyperlink Text", "Home Tool", "Hyper Text Markup Language"] },
  { id: 4, desc: "What does CSS do?", type: "mcq", choices: ["Structure", "Styling", "Database", "Logic"] },
  { id: 5, desc: "Which language is used for backend often?", type: "mcq", choices: ["Python", "CSS", "HTML", "SVG"] },
  { id: 6, desc: "Which is NOT a JS framework?", type: "mcq", choices: ["React", "Angular", "Laravel", "Vue"] },
  { id: 7, desc: "Unit for angles?", type: "mcq", choices: ["meters", "hours", "radians", "kelvin"] },
  { id: 8, desc: "Binary of decimal 5?", type: "mcq", choices: ["0101", "1010", "111", "1000"] },
  { id: 9, desc: "HTTP status 404 means?", type: "mcq", choices: ["OK", "Unauthorized", "Not Found", "Server Error"] },
  { id: 10, desc: "Which is a loop in JS?", type: "mcq", choices: ["for", "select", "case", "pair"] },

  // 5 TF
  { id: 11, desc: "The Earth orbits the Sun.", type: "tf", choices: ["True", "False"] },
  { id: 12, desc: "JavaScript is the same as Java.", type: "tf", choices: ["True", "False"] },
  { id: 13, desc: "CSS can animate elements.", type: "tf", choices: ["True", "False"] },
  { id: 14, desc: "HTTP is a protocol.", type: "tf", choices: ["True", "False"] },
  { id: 15, desc: "SQL is used for styling websites.", type: "tf", choices: ["True", "False"] },
];

/* ------------------ helper to get questions from sessionStorage or default ------------------ */
function loadQuestionsFromStorageOrDefault() {
  try {
    const raw = sessionStorage.getItem("exam_questions");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Basic validation: ensure each has desc and type and choices
        const valid = parsed.every(q => typeof q.desc === "string" && typeof q.type === "string" && Array.isArray(q.choices));
        if (valid) return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not parse exam_questions from sessionStorage, falling back to defaults.", e);
  }
  console.log("Loaded Defualt Exam.");
  return defaultQuestions;
}

/* ------------------ sidebar toggle (mobile) ------------------ */
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggleSidebar");

function handleResize() {
  if (window.innerWidth <= 992) {
    toggleBtn.classList.remove("hidden");
  } else {
    toggleBtn.classList.add("hidden");
    sidebar.classList.remove("open");
  }
}

toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.toggle("open");
});

sidebar.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  if (window.innerWidth > 992) return;

  const clickedInsideSidebar = sidebar.contains(e.target);
  const clickedToggle = toggleBtn.contains(e.target);

  if (!clickedInsideSidebar && !clickedToggle) {
    sidebar.classList.remove("open");
  }
});

window.addEventListener("resize", handleResize);
handleResize();



/* ------------------ application state ------------------ */
const questions = loadQuestionsFromStorageOrDefault();
const total = questions.length;
let currentIndex = 0; // 0-based
// questionsState: array of objects { answer: null | choiceIndex, marked: boolean, status: 'unseen'|'answered' }
const questionsState = questions.map(() => ({ answer: null, marked: false, status: 'unseen' }));

/* ------------------ DOM references ------------------ */
const currQuestionEl = document.getElementById("curr-question");
const totalQuestionsEl = document.getElementById("total-questions");
const questionTextEl = document.getElementById("question-text");
const choicesEl = document.getElementById("choices");
const trackerEl = document.getElementById("tracker");
const unansweredTextEl = document.getElementById("unansweredText");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const markBtn = document.getElementById("markBtn");
const submitBtn = document.getElementById("submitBtn");

/* ------------------ render total and tracker ------------------ */
function renderTotals() {
  totalQuestionsEl.textContent = total;
  updateUnansweredText();
}

function updateUnansweredText() {
  const unanswered = questionsState.filter(s => s.answer === null).length;
  unansweredTextEl.textContent = `You have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}.`;
}

/* ------------------ render tracker buttons ------------------ */
function renderTracker() {
  trackerEl.innerHTML = "";
  // show first 20 or all — for simplicity show all but grid will wrap
  questions.forEach((q, idx) => {
    const btn = document.createElement("button");
    btn.className = "q";
    btn.textContent = idx + 1;
    btn.dataset.index = idx;
    updateTrackerButtonClass(btn, idx);

    btn.addEventListener("click", () => {
      currentIndex = idx;
      renderQuestion();
      // CLOSE sidebar on mobile
        if (window.innerWidth <= 992) {
            sidebar.classList.remove("open");
        }
    });

    trackerEl.appendChild(btn);
  });
}

/* helper: update tracker button classes */
function updateTrackerButtonClass(btn, idx) {
  const state = questionsState[idx];
  btn.classList.remove("answered", "marked", "current");
  if (state.answer !== null) btn.classList.add("answered");
  if (state.marked) btn.classList.add("marked");
  if (idx === currentIndex) btn.classList.add("current");
}

/* ------------------ render question area ------------------ */
function renderQuestion() {
  const q = questions[currentIndex];
  const state = questionsState[currentIndex];

  // update header numbers
  currQuestionEl.textContent = `Question ${currentIndex + 1}`;

  // render text
  questionTextEl.textContent = q.desc;

  // render choices
  choicesEl.innerHTML = "";
  q.choices.forEach((choiceText, cIdx) => {
    const choiceDiv = document.createElement("div");
    choiceDiv.className = "choice";
    // apply 'selected' if this is the stored answer
    if (state.answer === cIdx) choiceDiv.classList.add("selected");

    const letter = document.createElement("span");
    letter.className = "letter";
    // letter label for TF vs MCQ
    if (q.type === "mcq") {
      // letters A,B,C,D...
      letter.textContent = String.fromCharCode(65 + cIdx);
    } else {
      letter.textContent = q.choices.length === 2 ? (cIdx === 0 ? "T" : "F") : String.fromCharCode(65 + cIdx);
    }

    const textSpan = document.createElement("span");
    textSpan.textContent = " " + choiceText;

    choiceDiv.appendChild(letter);
    choiceDiv.appendChild(textSpan);

    // click handler selects answer
    choiceDiv.addEventListener("click", () => {
      questionsState[currentIndex].answer = cIdx;
      questionsState[currentIndex].status = 'answered';
      // if previously marked, keep marked flag true (mark is separate)
      // update UI
      // remove selected from other choices
      const all = choicesEl.querySelectorAll(".choice");
      all.forEach((el, i) => el.classList.toggle("selected", i === cIdx));
      // update tracker button
      const trackerBtn = trackerEl.querySelector(`button[data-index="${currentIndex}"]`);
      if (trackerBtn) updateTrackerButtonClass(trackerBtn, currentIndex);
      updateUnansweredText();
    });

    choicesEl.appendChild(choiceDiv);
  });

  // update tracker visuals (current + states)
  const allTrackerBtns = trackerEl.querySelectorAll("button.q");
  allTrackerBtns.forEach(btn => {
    updateTrackerButtonClass(btn, Number(btn.dataset.index));
  });

  // enable/disable prev/next
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === total - 1;
  Mark_Check(state);
}

/* ------------------ navigation handlers ------------------ */
prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < total - 1) {
    currentIndex++;
    renderQuestion();
  }
});

function Mark_Check(s){

    // visual feedback: toggle a subtle class on mark button
    markBtn.textContent = s.marked ? "⚑ Marked" : "⚑ Mark for Review";
}

/* ------------------ mark for review ------------------ */
markBtn.addEventListener("click", () => {
  const s = questionsState[currentIndex];
  s.marked = !s.marked;
  const trackerBtn = trackerEl.querySelector(`button[data-index="${currentIndex}"]`);
  if (trackerBtn) updateTrackerButtonClass(trackerBtn, currentIndex);
//   // visual feedback: toggle a subtle class on mark button
//   markBtn.textContent = s.marked ? "⚑ Marked" : "⚑ Mark for Review";
Mark_Check(s);
});


/* ------------------ submit (placeholder) ------------------ */
submitBtn.addEventListener("click", () => {
  // For now just show a quick summary in console
  const answers = questionsState.map((s, i) => ({ id: questions[i].id, answer: s.answer, marked: s.marked }));
  console.log("Submitting answers:", answers);
  alert("Submit clicked — check console (answers summary).");
});

/* ------------------ initialization ------------------ */
function init() {
  renderTotals();
  renderTracker();
  renderQuestion();
  // optionally persist questionsState to sessionStorage so it survives refresh
  // setInterval(() => sessionStorage.setItem('exam_state', JSON.stringify(questionsState)), 2000);
}

init();
