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

if (sessionStorage.getItem("exam_finished") === "true") {
  alert("This exam has already been submitted.");
  // optionally redirect
  window.location.href = "dashboard.html";
}
/* ------------------ DOM references ------------------ */
var studentNameEl = document.getElementById("studentName");
var studentIdEl = document.getElementById("studentId");
var courseNameEl = document.getElementById("courseName");
var courseInfoEl = document.getElementById("courseInfo");

var currQuestionEl = document.getElementById("curr-question");
var totalQuestionsEl = document.getElementById("total-questions");
var questionTextEl = document.getElementById("question-text");
var choicesEl = document.getElementById("choices");
var trackerEl = document.getElementById("tracker");
var unansweredTextEl = document.getElementById("unansweredText");

var prevBtn = document.getElementById("prevBtn");
var nextBtn = document.getElementById("nextBtn");
var markBtn = document.getElementById("markBtn");
var submitBtn = document.getElementById("submitBtn");

var timerText = document.getElementById("timer");
var timeBar = document.getElementById("timeBar");
var timerBox = document.querySelector(".timer");

var timeUpModal = document.getElementById("timeUpModal");
var timeUpTitle = document.getElementById("timeUpTitle");
var viewResultsBtn = document.getElementById("viewResultsBtn");
var backDashboardBtn = document.getElementById("backDashboardBtn");


// -----------------------------------------------------------------------------------------------------
/* ------------------ Exam meta ------------------ */
var userName = "Abdelaziz Hesham";
var userId = 44812398;
var courseName = "HTML 101 Final"
var courseInfo = "Section 1 • Winter 2025"

studentNameEl.textContent = userName;
studentIdEl.textContent = "Student ID: " + userId; 
courseNameEl.textContent = courseName;
courseInfoEl.textContent = courseInfo;


// -----------------------------------------------------------------------------------------------------
/* ------------------ TIMER CONFIG ------------------ */

var timerInterval = null;
var EXAM_DURATION_MINUTES = 30; // change easily later
var totalTime = EXAM_DURATION_MINUTES * 60; // seconds
var remainingTime = totalTime;




/* ---- refresh resilience keys ---- */
var EXAM_STARTED_KEY = "exam_started";
var EXAM_START_TIME = "exam_start_time";
var EXAM_END_KEY = "exam_end_time";
var EXAM_STATE_KEY = "exam_state";
var EXAM_DURATION_MINUTES_st = "exam_duration_minutes"
var EXAM_INDEX_KEY = "exam_current_index";





function formatTime(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;
  return m + " : " + s;
}

function updateTimerUI() {
  var percent = remainingTime / totalTime;

  // Update text
  timerText.textContent = formatTime(remainingTime);

  // Update progress bar
  timeBar.style.width = (percent * 100) + "%";

  // Reset classes
  timerBox.classList.remove("green");
  timerBox.classList.remove("yellow");
  timerBox.classList.remove("red");

  // Color logic
  if (percent > 0.4) {
    timeBar.style.backgroundColor = "#16a34a";
    timerBox.classList.add("green");
  } else if (percent > 0.2) {
    timeBar.style.backgroundColor = "#facc15";
    timerBox.classList.add("yellow");
  } else {
    timeBar.style.backgroundColor = "#dc2626";
    timerBox.classList.add("red");
  }
}

function startTimer() {
  var now = Math.floor(new Date().getTime() / 1000);
  var savedEnd = sessionStorage.getItem(EXAM_END_KEY);

  var endTime;
  if (savedEnd) {
    endTime = parseInt(savedEnd, 10);
  } else {
    endTime = now + totalTime;
    sessionStorage.setItem(EXAM_START_TIME,now);
    sessionStorage.setItem(EXAM_DURATION_MINUTES_st , EXAM_DURATION_MINUTES)
    sessionStorage.setItem(EXAM_END_KEY, endTime);
    sessionStorage.setItem(EXAM_STARTED_KEY, "true");

  }

  function tick() {
    var current = Math.floor(new Date().getTime() / 1000);
    remainingTime = endTime - current;

    if (remainingTime <= 0) {
      remainingTime = 0;
      updateTimerUI();
      showTimeUpModal();

      return;
    }

    updateTimerUI();
  }

  tick(); // initial render
  timerInterval = setInterval(tick, 1000);

}




/* ------------------ default questions (15 total: 10 MCQ, 5 TF) ------------------ */
var defaultQuestions = [
  // MCQ (10)
  { id: 1, desc: "What is 2 + 2?", type: "mcq", choices: ["1", "2", "4", "22"], correct: 3 },
  { id: 2, desc: "Which is a prime number?", type: "mcq", choices: ["4", "6", "7", "9"], correct: 3 },
  { id: 3, desc: "HTML stands for?", type: "mcq",
    choices: ["Hyper Text", "Hyperlink Text", "Home Tool", "Hyper Text Markup Language"], correct: 4 },
  { id: 4, desc: "What does CSS do?", type: "mcq",
    choices: ["Structure", "Styling", "Database", "Logic"], correct: 2 },
  { id: 5, desc: "Which language is used for backend often?", type: "mcq",
    choices: ["Python", "CSS", "HTML", "SVG"], correct: 1 },
  { id: 6, desc: "Which is NOT a JS framework?", type: "mcq",
    choices: ["React", "Angular", "Laravel", "Vue"], correct: 3 },
  { id: 7, desc: "Unit for angles?", type: "mcq",
    choices: ["meters", "hours", "radians", "kelvin"], correct: 3 },
  { id: 8, desc: "Binary of decimal 5?", type: "mcq",
    choices: ["0101", "1010", "111", "1000"], correct: 1 },
  { id: 9, desc: "HTTP status 404 means?", type: "mcq",
    choices: ["OK", "Unauthorized", "Not Found", "Server Error"], correct: 3 },
  { id: 10, desc: "Which is a loop in JS?", type: "mcq",
    choices: ["for", "select", "case", "pair"], correct: 1 },

  // True / False (5)
  { id: 11, desc: "The Earth orbits the Sun.", type: "tf",
    choices: ["True", "False"], correct: 1 },
  { id: 12, desc: "JavaScript is the same as Java.", type: "tf",
    choices: ["True", "False"], correct: 2 },
  { id: 13, desc: "CSS can animate elements.", type: "tf",
    choices: ["True", "False"], correct: 1 },
  { id: 14, desc: "HTTP is a protocol.", type: "tf",
    choices: ["True", "False"], correct: 1 },
  { id: 15, desc: "SQL is used for styling websites.", type: "tf",
    choices: ["True", "False"], correct: 2 }
];


/* ------------------ helper to get questions from sessionStorage or default ------------------ */
function loadQuestionsFromStorageOrDefault() {
  try {
    var raw = sessionStorage.getItem("exam_questions");
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.length > 0) {
        // Basic validation: ensure each has desc and type and choices
        var valid = true;
        for (var i = 0; i < parsed.length; i++) {
          var q = parsed[i];
          if (!(typeof q.desc === "string" && typeof q.type === "string" && Object.prototype.toString.call(q.choices) === "[object Array]")) {
            valid = false;
            break;
          }
        }
        if (valid) return parsed;
      }
    }
  } catch (e) {
    try { console.warn("Could not parse exam_questions from sessionStorage, falling back to defaults.", e); } catch (ee) {}
  }
  try { console.log("Loaded Defualt Exam."); } catch (e) {}
  sessionStorage.setItem("exam_questions",JSON.stringify(defaultQuestions));
  return defaultQuestions;
}







/* ------------------ sidebar toggle (mobile) ------------------ */
var sidebar = document.querySelector(".sidebar");
var toggleBtn = document.getElementById("toggleSidebar");

function handleResize() {
  if (window.innerWidth <= 992) {
    toggleBtn.classList.remove("hidden");
  } else {
    toggleBtn.classList.add("hidden");
    sidebar.classList.remove("open");
  }
}

toggleBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  sidebar.classList.toggle("open");
});

sidebar.addEventListener("click", function (e) {
  e.stopPropagation();
});

document.addEventListener("click", function (e) {
  if (window.innerWidth > 992) return;

  var clickedInsideSidebar = sidebar.contains(e.target);
  var clickedToggle = toggleBtn.contains(e.target);

  if (!clickedInsideSidebar && !clickedToggle) {
    sidebar.classList.remove("open");
  }
});

window.addEventListener("resize", handleResize);
handleResize();



/* ------------------ application state ------------------ */
var questions = loadQuestionsFromStorageOrDefault();
var total = questions.length;
var currentIndex = 0; // 0-based
// questionsState: array of objects { answer: null | choiceIndex, marked: boolean, status: 'unseen'|'answered' }
var questionsState = [];
for (var qi = 0; qi < questions.length; qi++) {
  questionsState.push({ answer: null, marked: false, status: 'unseen' });
}
try { console.log(questionsState); } catch (e) {}



/* ------------------ render total and tracker ------------------ */
function renderTotals() {
  totalQuestionsEl.textContent = total;
  updateUnansweredText();
}

function updateUnansweredText() {
  var unanswered = 0;
  for (var i = 0; i < questionsState.length; i++) {
    if (questionsState[i].answer === null) unanswered++;
  }
  unansweredTextEl.textContent = "You have " + unanswered + " unanswered question" + (unanswered !== 1 ? 's' : '') + ".";
}

/* ------------------ render tracker buttons ------------------ */
function renderTracker() {
  trackerEl.innerHTML = "";
  // show first 20 or all — for simplicity show all but grid will wrap
  for (var t = 0; t < questions.length; t++) {
    (function (idx) {
      var btn = document.createElement("button");
      btn.className = "q";
      btn.textContent = idx + 1;
      btn.setAttribute('data-index', idx);
      updateTrackerButtonClass(btn, idx);

      btn.addEventListener("click", function () {
        currentIndex = idx;
        renderQuestion();
        // CLOSE sidebar on mobile
        if (window.innerWidth <= 992) {
          sidebar.classList.remove("open");
        }
      });

      trackerEl.appendChild(btn);
    })(t);
  }
}

/* helper: update tracker button classes */
function updateTrackerButtonClass(btn, idx) {
  var state = questionsState[idx];
  btn.classList.remove("answered");
  btn.classList.remove("marked");
  btn.classList.remove("current");
  if (state.answer !== null) btn.classList.add("answered");
  if (state.marked) btn.classList.add("marked");
  if (idx === currentIndex) btn.classList.add("current");
}

/* ------------------ render question area ------------------ */
function renderQuestion() {
  var q = questions[currentIndex];
  var state = questionsState[currentIndex];

  // update header numbers
  currQuestionEl.textContent = "Question " + (currentIndex + 1);

  // render text
  questionTextEl.textContent = q.desc;

  // render choices
  choicesEl.innerHTML = "";
  for (var c = 0; c < q.choices.length; c++) {
    (function (cIdx) {
      var choiceDiv = document.createElement("div");
      choiceDiv.className = "choice";
      // apply 'selected' if this is the stored answer
      if (state.answer === cIdx) {
        if (choiceDiv.classList) choiceDiv.classList.add("selected");
        else choiceDiv.className += " selected";
      }

      var letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = String.fromCharCode(65 + cIdx);

      var textSpan = document.createElement("span");
      textSpan.textContent = " " + q.choices[cIdx];

      choiceDiv.appendChild(letter);
      choiceDiv.appendChild(textSpan);

      // click handler selects answer
      choiceDiv.addEventListener("click", function () {
        questionsState[currentIndex].answer = cIdx;
        questionsState[currentIndex].status = 'answered';
        // update UI
        // remove selected from other choices
        var all = choicesEl.querySelectorAll(".choice");
        for (var a = 0; a < all.length; a++) {
          var el = all[a];
          if (a === cIdx) {
            if (el.classList) el.classList.add("selected");
            else el.className += " selected";
          } else {
            if (el.classList) el.classList.remove("selected");
            else el.className = el.className.replace("selected", "").trim();
          }
        }
        // update tracker button
        var trackerBtn = trackerEl.querySelector('button[data-index="' + currentIndex + '"]');
        if (trackerBtn) updateTrackerButtonClass(trackerBtn, currentIndex);
        updateUnansweredText();
      });

      choicesEl.appendChild(choiceDiv);
    })(c);
  }

  // update tracker visuals (current + states)
  var allTrackerBtns = trackerEl.querySelectorAll("button.q");
  for (var tb = 0; tb < allTrackerBtns.length; tb++) {
    updateTrackerButtonClass(allTrackerBtns[tb], Number(allTrackerBtns[tb].getAttribute('data-index')));
  }

  // enable/disable prev/next
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === total - 1;
  Mark_Check(state);
}

/* ------------------ navigation handlers ------------------ */
prevBtn.addEventListener("click", function () {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", function () {
  if (currentIndex < total - 1) {
    currentIndex++;
    renderQuestion();
  }
});

function Mark_Check(s) {

  // visual feedback: toggle a subtle class on mark button
  markBtn.textContent = s.marked ? "⚑ Marked" : "⚑ Mark for Review";
}

/* ------------------ mark for review ------------------ */
markBtn.addEventListener("click", function () {
  var s = questionsState[currentIndex];
  s.marked = !s.marked;
  var trackerBtn = trackerEl.querySelector('button[data-index="' + currentIndex + '"]');
  if (trackerBtn) updateTrackerButtonClass(trackerBtn, currentIndex);

  Mark_Check(s);
});


/* ------------------ submit (placeholder) ------------------ */
function gradeExam() {
  var score = 0;

  var detailedResults = [];
  for (var qi = 0; qi < questions.length; qi++) {
    var q = questions[qi];
    var userAnswer = questionsState[qi].answer; // 0-based
    var correctAnswer = (q.correct !== undefined) ? (q.correct - 1) : null; // convert to 0-based if exists

    var isCorrect = (correctAnswer !== null) ? (userAnswer === correctAnswer) : false;
    if (isCorrect) score++;

    detailedResults.push({
      questionId: q.id,
      userAnswer: (userAnswer !== null ? (userAnswer + 1) : null),
      correctAnswer: q.correct,
      isCorrect: isCorrect
    });
  }

  return {
    totalQuestions: questions.length,
    score: score,
    results: detailedResults
  };
}

function CloseExam(){
  sessionStorage.setItem("exam_finished", "true");

  if (timerInterval) {
  clearInterval(timerInterval);
  timerInterval = null;
  }

}

submitBtn.addEventListener("click", function () {

  // optional: lock exam from reopening
  CloseExam();
  // redirect to result page
  window.location.href = "Result.html";
});


function showTimeUpModal() {

  CloseAndGradeEaxm();

  timeUpTitle.textContent = "Time’s Up, " + userName.split(" ")[0] + "!";

  // lock exam interactions
  document.body.style.pointerEvents = "none";
  timeUpModal.style.pointerEvents = "auto";

  // show modal
  timeUpModal.classList.remove("hidden");

  
  
}


var examModal = document.getElementById("examModal");
var startExamBtn = document.getElementById("startExamBtn");
var modalTotalT = document.getElementById("modal-time");
var modalTotalQ = document.getElementById("modalTotalQ");

/* ------------------ exam start modal logic ------------------ */
function handleExamStartModal() {

  // set total questions in modal
  modalTotalQ.textContent = total;
  modalTotalT.textContent = EXAM_DURATION_MINUTES;

  // if exam already started, hide modal and start timer
  if (sessionStorage.getItem(EXAM_STARTED_KEY) === "true") {
    examModal.classList.add("hidden");
    startTimer();
    return;
  }

  // otherwise show modal
  examModal.classList.remove("hidden");

  startExamBtn.onclick = function () {
    examModal.classList.add("hidden");
    startTimer();
  };
}


/* ------------------ initialization ------------------ */
function init() {
  // restore saved state if exists
  var savedState = sessionStorage.getItem(EXAM_STATE_KEY);
  if (savedState) {
    try {
      var parsed = JSON.parse(savedState);
      if (parsed && parsed.length === questionsState.length) {
        for (var i = 0; i < parsed.length; i++) {
          questionsState[i] = parsed[i];
        }
      }
    } catch (e) {}
  }

  // restore current question index
  var savedIndex = sessionStorage.getItem(EXAM_INDEX_KEY);
  if (savedIndex !== null) {
    currentIndex = parseInt(savedIndex, 10) || 0;
  }


  renderTotals();
  renderTracker();
  renderQuestion();
 /* -------- modal & timer control -------- */
  handleExamStartModal();
  

  // persist periodically
  setInterval(function () {
    sessionStorage.setItem(EXAM_STATE_KEY, JSON.stringify(questionsState));
    sessionStorage.setItem(EXAM_INDEX_KEY, currentIndex);
  }, 2000);

}

init();




// TimeUp modal Navigation
viewResultsBtn.addEventListener("click", function () {
  // redirect to result page
  window.location.href = "result.html";
});

backDashboardBtn.addEventListener("click", function () {
  // clear exam-related storage
  sessionStorage.clear();
  window.location.href = "dashboard.html";
});
