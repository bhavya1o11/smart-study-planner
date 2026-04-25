// ===================== GENERATE PLAN =====================
function generatePlan() {
    const examDate = document.getElementById("examDate").value;
    const subjectsInput = document.getElementById("subjects").value;
    const mood = document.getElementById("mood").value;

    if (!examDate || !subjectsInput) {
        alert("Please fill all fields!");
        return;
    }

    const subjects = subjectsInput.split(",").map(s => s.trim());

    const today = new Date();
    const exam = new Date(examDate);

    const totalDays = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));

    let subjectsPerDay = 2;

    if (mood === "tired") subjectsPerDay = 1;
    if (mood === "motivated") subjectsPerDay = 3;

    let plan = [];

    for (let i = 0; i < totalDays; i++) {
        let d = new Date();
        d.setDate(today.getDate() + i);

        let subjectsForDay = [];

        for (let j = 0; j < subjectsPerDay; j++) {
            subjectsForDay.push(subjects[(i + j) % subjects.length]);
        }

        plan.push({
            date: d.toDateString(),
            subject: subjectsForDay.join(", "),
            done: false
        });
    }

    localStorage.setItem("plan", JSON.stringify(plan));
    displayPlan();
}

// ===================== DISPLAY PLAN =====================
function displayPlan() {
    let plan = JSON.parse(localStorage.getItem("plan")) || [];

    if (plan.length === 0) {
        document.getElementById("output").innerHTML =
            "<p class='empty'>No plan yet 📚</p>";
        return;
    }

    let today = new Date().toDateString();

    let todayTasks = [];
    let otherTasks = [];

    let doneCount = 0;

    plan.forEach((item, i) => {
        if (item.done) doneCount++;

        if (item.date === today) {
            todayTasks.push({ ...item, index: i });
        } else {
            otherTasks.push({ ...item, index: i });
        }
    });

    let html = "";

    // 🔥 TODAY'S FOCUS
    if (todayTasks.length > 0) {
        html += `<h2>🔥 Today’s Focus</h2>`;
        html += `<div class="calendar">`;

        todayTasks.forEach(item => {
            html += `
                <div class="day today ${item.done ? "done" : ""}" ondblclick="toggleTask(${item.index})">
                    <div class="date">${item.date}</div>
                    <div class="subject">${item.subject}</div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // 📅 FULL PLAN
    html += `<h2>📅 Your Study Plan</h2>`;
    html += `<div class="calendar">`;

    otherTasks.forEach(item => {
        html += `
            <div class="day ${item.done ? "done" : ""}" ondblclick="toggleTask(${item.index})">
                <div class="date">${item.date}</div>
                <div class="subject">${item.subject}</div>
            </div>
        `;
    });

    html += `</div>`;

    // 📊 STATS
    let progress = Math.round((doneCount / plan.length) * 100);
    let streak = calculateStreak(plan);
    let weakSubject = getWeakSubject(plan);

    html += `
        <div class="progress-container">
            <div class="progress-bar" style="width:${progress}%"></div>
        </div>

        <p>📊 Progress: ${progress}%</p>
        <p>🔥 Streak: ${streak} day(s)</p>
        <p>🎯 Focus More On: ${weakSubject}</p>
    `;

    document.getElementById("output").innerHTML = html;

    drawGraph(plan);
}

// ===================== TOGGLE TASK =====================
function toggleTask(index) {
    let plan = JSON.parse(localStorage.getItem("plan"));
    plan[index].done = !plan[index].done;

    localStorage.setItem("plan", JSON.stringify(plan));
    displayPlan();
}

// ===================== STREAK =====================
function calculateStreak(plan) {
    let streak = 0;

    let sorted = [...plan].sort((a, b) => new Date(a.date) - new Date(b.date));

    for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].done) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// ===================== WEAK SUBJECT =====================
function getWeakSubject(plan) {
    let subjectStats = {};

    plan.forEach(item => {
        let subjects = item.subject.split(",");

        subjects.forEach(sub => {
            sub = sub.trim();

            if (!subjectStats[sub]) {
                subjectStats[sub] = { total: 0, done: 0 };
            }

            subjectStats[sub].total++;

            if (item.done) {
                subjectStats[sub].done++;
            }
        });
    });

    let weakest = "None";
    let lowestRate = Infinity;

    for (let sub in subjectStats) {
        let rate = subjectStats[sub].done / subjectStats[sub].total;

        if (rate < lowestRate) {
            lowestRate = rate;
            weakest = sub;
        }
    }

    return weakest;
}

// ===================== AUTO ADJUST =====================
function autoAdjustPlan() {
    alert("Auto-adjust feature coming soon 🚀");
}

// ===================== GRAPH =====================
function drawGraph(plan) {
    const ctx = document.getElementById("progressChart");

    let data = [];
    let count = 0;

    plan.forEach(p => {
        if (p.done) count++;
        data.push(count);
    });

    if (window.chart) window.chart.destroy();

    window.chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map((_, i) => i + 1),
            datasets: [{
                label: "Tasks Completed",
                data: data
            }]
        }
    });
}

// ===================== LOAD =====================
window.onload = displayPlan;
