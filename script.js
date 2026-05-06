let chart;

function generatePlan() {
  const examInput = document.getElementById("examDate").value;
  const subjectsInput = document.getElementById("subjects").value;
  const mood = document.getElementById("mood").value;

  if (!examInput || !subjectsInput) {
    alert("Enter all fields!");
    return;
  }

  let examDate = new Date(examInput);
  let today = new Date();

  let subjects = subjectsInput.split(",").map(s => s.trim()).filter(s => s);

  let subjectsPerDay = mood === "low" ? 1 : mood === "high" ? 3 : 2;

  let plan = [];
  let i = 0;
  let currentDate = new Date(today);

  while (currentDate <= examDate) {
    let daily = [];

    for (let j = 0; j < subjectsPerDay; j++) {
      daily.push(subjects[i % subjects.length]);
      i++;
    }

    plan.push({
      date: currentDate.toDateString(),
      subject: daily,
      done: false
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  localStorage.setItem("plan", JSON.stringify(plan));
  displayPlan();

  // 🔥 AUTO SCROLL
  setTimeout(() => {
    document.getElementById("output").scrollIntoView({ behavior: "smooth" });
  }, 200);
}

function displayPlan() {
  let plan = JSON.parse(localStorage.getItem("plan")) || [];
  let output = document.getElementById("output");
  let focus = document.getElementById("todayFocus");

  let completed = 0;
  let subjectStats = {};
  let progressData = [];

  output.innerHTML = "";

  const today = new Date().toDateString();

  plan.forEach((day, index) => {
    if (day.done) completed++;

    progressData.push(completed);

    day.subject.forEach(sub => {
      subjectStats[sub] = (subjectStats[sub] || 0) + (day.done ? 1 : 0);
    });

    if (day.date === today) {
      focus.innerHTML = `
        <div class="date">${day.date}</div>
        <div>${day.subject.join(" • ")}</div>
      `;
    }

    output.innerHTML += `
      <div class="day-card ${day.done ? "done" : ""}" ondblclick="toggleDone(${index})">
        <div class="date">${day.date}</div>
        <div class="subject">${day.subject.join(" • ")}</div>
      </div>
    `;
  });

  // stats
  let progress = Math.round((completed / plan.length) * 100) || 0;
document.getElementById("progress").innerText = progress + "%";
  let streak = plan.filter(d => d.done).length;
  document.getElementById("streak").innerText = streak;

  let weak = Object.keys(subjectStats).reduce((a, b) =>
    subjectStats[a] < subjectStats[b] ? a : b, "-"
  );
  document.getElementById("weak").innerText = weak;

  drawChart(progressData);
}

function toggleDone(index) {
  let plan = JSON.parse(localStorage.getItem("plan"));
  plan[index].done = !plan[index].done;
  localStorage.setItem("plan", JSON.stringify(plan));
  displayPlan();
}

function drawChart(data) {
  let ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [{
        label: "Progress",
        data: data,
        tension: 0.4,
        fill: true
      }]
    }
  });
}

function autoAdjust() {
  generatePlan();
}

window.onload = displayPlan;

