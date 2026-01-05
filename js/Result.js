
    /*
result.html JS (ES5)
- Loads question + state from sessionStorage
- Calculates grade (done here)
- Animates loader then renders results
- Score ring and performance bar color changes according to thresholds
- Defensive: falls back to defaults if keys are missing
*/

// Push a new state into history
  history.pushState(null, null, location.href);

  // Listen for back/forward navigation
  window.onpopstate = function () {
    history.go(1); // forces staying on the current page
  };

/* ------------------ helper utilities ------------------ */
function safeParseJSON(s) {
try {
    return JSON.parse(s);
} catch (e) {
    return null;
}
}
function el(id) {
return document.getElementById(id);
}
function formatMinutes(seconds) {
if (!seconds || seconds <= 0) return "0m";
var m = Math.floor(seconds / 60);
var s = Math.floor(seconds % 60);
if (m > 99) return m + "m";
return m + "m " + (s < 10 ? "0" + s : s + "s");
}

/* ------------------ read data from sessionStorage ------------------ */
var rawQuestions =
safeParseJSON(sessionStorage.getItem("exam_questions")) || [];
var rawState = safeParseJSON(sessionStorage.getItem("exam_state")) || [];

/* optional metadata */
var userName = sessionStorage.getItem("user_name") || null;
if (userName == null)
    window.location.href = "login.html";

var studentId = sessionStorage.getItem("student_id") || null;

/* duration (minutes) fallback */
var durationMinutes = parseInt(
sessionStorage.getItem("exam_duration_minutes"),10);
if (!durationMinutes || isNaN(durationMinutes)) durationMinutes = undefined;
var totalTimeSeconds = durationMinutes * 60;

/* compute startTime from exam_end_time if present */
var endTime = parseInt(sessionStorage.getItem("exam_end_time"), 10);
if (isNaN(endTime)) endTime = null;
var startTime = null;
if (endTime) startTime = endTime - totalTimeSeconds;

/* submit time if present */
var submitTime = parseInt(sessionStorage.getItem("exam_submit_time"), 10);
if (isNaN(submitTime)) submitTime = null;



/* ------------------ grading logic ------------------ */
function gradeNow(questions, state) {
    var total = questions.length || 0;
    var correct = 0;
    var details = [];

    for (var i = 0; i < total; i++) {
        var q = questions[i];
        var s = state[i] || {};
        var userAnswer =
        s && typeof s.answer !== "undefined" ? s.answer : null; // 0-based
        var correctIndex = null;
        if (q && typeof q.correct !== "undefined") {
        // q.correct assumed 1-based
        correctIndex =
            q.correct === null || typeof q.correct === "undefined"
            ? null
            : q.correct - 1;
        } else if (q && typeof q.correctIndex !== "undefined") {
        correctIndex = q.correctIndex; // just in case
        }
        var isCorrect =
        correctIndex !== null &&
        userAnswer !== null &&
        userAnswer === correctIndex;
        if (isCorrect) correct++;
        details.push({
        id: q && q.id,
        userAnswer: userAnswer,
        correctAnswer: correctIndex === null ? null : correctIndex + 1,
        isCorrect: isCorrect,
        });
    }

    var incorrect = total - correct;
    var percent = total === 0 ? 0 : Math.round((correct / total) * 100);

    return {
        total: total,
        correct: correct,
        incorrect: incorrect,
        percent: percent,
        details: details,
    };
}

/* ------------------ compute time taken ------------------ */
function computeTimeTakenSeconds() {
// prefer explicit submitTime & startTime if available
var taken = sessionStorage.getItem("exam_time");
if(taken) return taken;

var nowSec = Math.floor(Date.now() / 1000);
var start = startTime;
var submit = submitTime || nowSec;
if (!start && endTime) start = endTime - totalTimeSeconds;
if (!start) {
    // fall back to totalTimeSeconds as time taken (we don't know)
    return totalTimeSeconds;
}
taken = submit - start;
if (taken < 0) taken = 0;
if (taken > totalTimeSeconds) taken = totalTimeSeconds;
sessionStorage.setItem("exam_time", taken);
return Math.round(taken);
}

/* ------------------ color thresholds ------------------ */
function colorForPercent(p) {
// thresholds: <60, <75, <90, <95, >=95
if (p < 60) return "#dc2626"; // red
if (p < 75) return "#f59e0b"; // amber
if (p < 90) return "#2563eb"; // blue
if (p < 95) return "#7c3aed"; // purple
return "#16a34a"; // bright green
}

/* ------------------ DOM elements ------------------ */
var loaderWrap = el("loaderWrap");
var resultCard = el("resultCard");
var scoreArc = el("scoreArc");
var scoreText = el("scoreText");
var scoreLabel = el("scoreLabel");
var correctNum = el("correctNum");
var incorrectNum = el("incorrectNum");
var timeTakenEl = el("timeTaken");
var perfFill = el("perfFill");
var passingLabel = el("passingLabel");
var titleEl = el("title");
var subtitleEl = el("subtitle");

var finishBtn = el("finishBtn");


/* ------------------ animation helpers ------------------ */
function animateScoreRing(percentage, color, durationMs) {
// circle radius 50 -> circumference 2*pi*50 ~ 314.159
var circ = 2 * Math.PI * 50;
var pct = Math.max(0, Math.min(100, percentage));
var targetOffset = circ - (pct / 100) * circ;

// animate by stepping (ES5 friendly)
var steps = Math.max(12, Math.round(durationMs / 25));
var start = circ;
var delta = (targetOffset - start) / steps;
var current = start;
var i = 0;
var timer = setInterval(function () {
    i++;
    current += delta;
    scoreArc.setAttribute("stroke-dashoffset", current);
    if (i >= steps) {
    clearInterval(timer);
    scoreArc.setAttribute("stroke-dashoffset", targetOffset);
    }
}, Math.round(durationMs / steps));

scoreArc.style.stroke = color;
}

/* animate numeric text up */
function animateNumber(elNode, from, to, duration) {
var range = to - from;
var steps = Math.max(12, Math.round(duration / 25));
var stepVal = range / steps;
var cur = from;
var i = 0;
var t = setInterval(function () {
    i++;
    cur += stepVal;
    if (
    (stepVal > 0 && cur >= to) ||
    (stepVal < 0 && cur <= to) ||
    i >= steps
    ) {
    elNode.textContent = to;
    clearInterval(t);
    return;
    } else {
    elNode.textContent = Math.round(cur);
    }
}, Math.round(duration / steps));
}

/* ------------------ render results to DOM ------------------ */
function renderResults(resultObj) {
    var pct = resultObj.percent;
    var color = colorForPercent(pct);

    // header dynamic
    var nameText = userName || "Student";
    titleEl.textContent = "Great Job!";
    subtitleEl.textContent =
        "You have successfully completed the exam, " + nameText + ".";

    // update cards numbers
    correctNum.textContent = resultObj.correct;
    incorrectNum.textContent = resultObj.incorrect;

    // time
    try {
        var takenSec = resultObj.timeTakenSeconds;
        if (!takenSec) {
            takenSec = computeTimeTakenSeconds();
        }
    } catch (e) {
        console.log("Cant find time");
    }
    timeTakenEl.textContent = formatMinutes(takenSec);

    // animate ring & number
    scoreText.textContent = "0%";
    animateScoreRing(pct, color, 1100);
    // animate center number to pct
    var centerNumEl = scoreText;
    (function animateCenter() {
        var start = 0;
        var end = pct;
        var dur = 1100;
        var steps = Math.max(12, Math.round(dur / 25));
        var step = (end - start) / steps;
        var cur = start;
        var idx = 0;
        var timer = setInterval(function () {
        idx++;
        cur += step;
        if (idx >= steps) {
            clearInterval(timer);
            centerNumEl.innerHTML =
            end +
            '%<span style="display:block; font-size:12px; font-weight:600; color:var(--muted);">SCORE</span>';
        } else {
            centerNumEl.innerHTML =
            Math.round(cur) +
            '%<span style="display:block; font-size:12px; font-weight:600; color:var(--muted);">SCORE</span>';
        }
        }, Math.round(dur / steps));
    })();

    // perf bar
    perfFill.style.width = pct + "%";
    perfFill.style.backgroundColor = color;

    // score label (you can change text based on thresholds)
    if (pct >= 95) scoreLabel.textContent = "Excellent";
    else if (pct >= 90) scoreLabel.textContent = "Outstanding";
    else if (pct >= 75) scoreLabel.textContent = "Good Work";
    else if (pct >= 60) scoreLabel.textContent = "Needs Improvement";
    else scoreLabel.textContent = "Keep Practicing";

    // store exam_result so front-end or backend can pick it
    var examResultObj = {
        total: resultObj.total,
        correct: resultObj.correct,
        incorrect: resultObj.incorrect,
        percent: resultObj.percent,
        timeTakenSeconds: takenSec,
        studentName: userName,
        studentId: studentId,
        timestamp: Math.floor(Date.now() / 1000),
    };
    try {
        // sessionStorage.setItem("exam_result", JSON.stringify(examResultObj));
        localStorage.setItem('exam_result', JSON.stringify(examResultObj));

    } catch (e) {}

    // show card
    resultCard.style.display = "flex";
}

/* ------------------ main flow ------------------ */
(function main() {
    // show loader for 2 seconds then compute & draw
    var LOADER_MS = 1800; // ~1.8s
    var result = null;
    /* ------------------ try to load cached result ------------------ */
    try {
        var raw = localStorage.getItem("exam_result");
        if (raw) {
            result = JSON.parse(raw);
        }
        else
            result = gradeNow(rawQuestions, rawState);
    } catch (e) {
        
    }
    

    // small delay to allow loader animation then show
    setTimeout(function () {
        // hide loader
        loaderWrap.className = loaderWrap.className + " hidden";
        // render results with animation
        renderResults(result);
    }, LOADER_MS);
})();

/* ------------------ actions ------------------ */
finishBtn.onclick = function () {
// clear exam session keys and return to dashboard
try {
    sessionStorage.clear();
} catch (e) {}
// go back to dashboard or home
window.location.href = "login.html";
};



/* ======================================================
   NAVBAR USER MENU LOGIC (ES5)
====================================================== */

var userMenuToggle = document.getElementById("userMenuToggle");
var userDropdown = document.getElementById("userDropdown");
var logoutBtn = document.getElementById("logoutBtn");

var navStudentName = document.getElementById("navStudentName");
var navStudentId = document.getElementById("navStudentId");
var avatarImg = document.getElementById("avatarImg");

/* fill navbar user info */
(function fillNavbarUser() {
  var name = userName || "Student";
  var id = studentId || "";

  navStudentName.textContent = name;
  navStudentId.textContent = id ? "ID: " + id : "";

  // update avatar initials dynamically
  avatarImg.src =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(name) +
    "&background=2563eb&color=fff";
})();

/* toggle dropdown */
userMenuToggle.onclick = function (e) {
  e.stopPropagation();
  userDropdown.classList.toggle("hidden");
};

/* close dropdown when clicking outside */
document.addEventListener("click", function () {
  if (!userDropdown.classList.contains("hidden")) {
    userDropdown.classList.add("hidden");
  }
});

/* logout */
logoutBtn.onclick = function () {
  try {
    sessionStorage.clear();
  } catch (e) {}
  window.location.href = "login.html";
};