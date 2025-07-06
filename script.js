const canvas = document.getElementById("clock");
const ctx = canvas.getContext("2d");
const radius = canvas.height / 2;
ctx.translate(radius, radius);

const formContainer = document.getElementById("form-container");
const addBtn = document.getElementById("add-btn");
const pagiBtn = document.getElementById("pagi-btn");
const malamBtn = document.getElementById("malam-btn");
const modeLabel = document.getElementById("mode-label");

const activities = [];

// Minta izin notifikasi di awal
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

let mode = 'pagi';

// AUTO MODE ON LOAD
window.addEventListener("load", () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 1 && hour <= 12) {
    setMode('pagi');
  } else {
    setMode('malam');
  }
});

addBtn.onclick = () => {
  formContainer.classList.toggle("hidden");
};

pagiBtn.onclick = () => {
  setMode('pagi');
  addActivity();
};

malamBtn.onclick = () => {
  setMode('malam');
  addActivity();
};

function setMode(m) {
  mode = m;
  modeLabel.textContent = mode === 'pagi' ? '🌞 Pagi' : '🌙 Malam';
  if (mode === 'pagi') {
    document.body.classList.remove('bg-gray-900', 'text-white');
    document.body.classList.add('bg-white', 'text-black');
  } else {
    document.body.classList.add('bg-gray-900', 'text-white');
    document.body.classList.remove('bg-white', 'text-black');
  }
}

function addActivity(editIndex = null) {
  const name = document.getElementById("activity-name").value.trim();
  const start = document.getElementById("start-time").value.trim();
  const end = document.getElementById("end-time").value.trim();

  if (!name || !start || !end) return;

  const newActivity = { name, start, end, mode, notified: false };

  if (editIndex !== null) {
    activities[editIndex] = newActivity;
  } else {
    activities.push(newActivity);
  }

  renderActivities();
  formContainer.classList.add("hidden");
  document.getElementById("activity-name").value = '';
  document.getElementById("start-time").value = '';
  document.getElementById("end-time").value = '';
}

function renderActivities() {
  const list = document.getElementById("activity-list");
  list.innerHTML = "";
  activities.forEach((act, idx) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center p-2 border-b";
    li.innerHTML = `
      <span>${act.start}–${act.end} (${act.mode}) : ${act.name}</span>
      <div class="flex gap-1">
        <button class="edit-btn bg-green-500 text-white px-2 rounded" data-idx="${idx}">✏️</button>
        <button class="delete-btn bg-red-500 text-white px-2 rounded" data-idx="${idx}">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      activities.splice(btn.dataset.idx, 1);
      renderActivities();
    };
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const act = activities[btn.dataset.idx];
      document.getElementById("activity-name").value = act.name;
      document.getElementById("start-time").value = act.start;
      document.getElementById("end-time").value = act.end;
      setMode(act.mode);
      formContainer.classList.remove("hidden");

      pagiBtn.onclick = () => {
        setMode('pagi');
        addActivity(parseInt(btn.dataset.idx));
      };
      malamBtn.onclick = () => {
        setMode('malam');
        addActivity(parseInt(btn.dataset.idx));
      };
    };
  });
}

// DRAW CLOCK
function drawClock() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawActivities(ctx, radius);
  drawTime(ctx, radius);
}

function drawFace(ctx, radius) {
  ctx.fillStyle = mode === 'pagi' ? '#fff' : '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = radius * 0.05;
  ctx.strokeStyle = mode === 'pagi' ? '#000' : '#fff';
  ctx.stroke();
}

function drawNumbers(ctx, radius) {
  ctx.fillStyle = mode === 'pagi' ? '#000' : '#fff';
  ctx.font = radius * 0.08 + "px Orbitron";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let num = 1; num <= 12; num++) {
    const ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius) {
  const now = new Date();
  let hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  // Konversi ke jam analog 12 jam
  hour = hour % 12;
  hour = hour ? hour : 12; // jam 0 -> 12

  // Sudut
  const hourAngle = (Math.PI / 6) * (hour + minute / 60);
  const minuteAngle = (Math.PI / 30) * minute;
  const secondAngle = (Math.PI / 30) * second;

  drawHand(ctx, hourAngle, radius * 0.5, radius * 0.08, mode === 'pagi' ? '#000' : '#fff');
  drawHand(ctx, minuteAngle, radius * 0.75, radius * 0.06, mode === 'pagi' ? '#333' : '#ccc');
  drawHand(ctx, secondAngle, radius * 0.9, radius * 0.03, '#f87171');
}

function drawHand(ctx, pos, length, width, color) {
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;

  ctx.rotate(pos);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -length);
  ctx.stroke();

  ctx.restore();
}



function drawActivities(ctx, radius) {
  const now = new Date();
  let nowMinutes = now.getHours() * 60 + now.getMinutes();

  activities.forEach(act => {
    if (act.mode !== mode) return;

    let start = toMinutes(act.start);
    let end = toMinutes(act.end);

    if (mode === 'malam') {
      if (start < 720) start += 720;
      if (end < 720) end += 720;
    } else {
      if (start >= 720) start -= 720;
      if (end >= 720) end -= 720;
    }

    const startAngle = (start % 720) / 720 * 2 * Math.PI;
    const endAngle = (end % 720) / 720 * 2 * Math.PI;

    let progress = Math.min(Math.max((nowMinutes - toMinutes(act.start)) / (toMinutes(act.end) - toMinutes(act.start)), 0), 1);
    const currentEndAngle = startAngle + (endAngle - startAngle) * (1 - progress);

    const color = progressColor(progress);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = radius * 0.1;
    ctx.arc(0, 0, radius * 0.75, startAngle - Math.PI / 2, currentEndAngle - Math.PI / 2);
    ctx.stroke();

    const midAngle = (startAngle + currentEndAngle) / 2;
    const textRadius = radius * 0.85;
    ctx.save();
    ctx.translate(textRadius * Math.cos(midAngle - Math.PI / 2), textRadius * Math.sin(midAngle - Math.PI / 2));
    ctx.rotate(midAngle);
    if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) ctx.rotate(Math.PI);
    ctx.fillStyle = mode === 'pagi' ? '#000' : '#fff';
    ctx.font = `${radius * 0.06}px Orbitron`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(act.name, 0, 0);
    ctx.restore();
  });
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function progressColor(progress) {
  if (progress < 0.33) return '#4ade80';
  if (progress < 0.66) return '#facc15';
  return '#f87171';
}

function checkAlarms() {
  const now = new Date();
  let nowMinutes = now.getHours() * 60 + now.getMinutes();

  activities.forEach(act => {
    if (act.mode !== mode) return;

    let end = toMinutes(act.end);

    if (act.mode === 'malam' && end < 720) {
      end += 720;
    }
    if (mode === 'pagi' && end >= 720) {
      end -= 720;
    }

    if (!act.notified && nowMinutes >= end) {
      act.notified = true;
      notifyUser(act);
    }
  });
}

function notifyUser(act) {
  if (Notification.permission === "granted") {
    new Notification(`Kegiatan selesai!`, {
      body: `${act.name} (${act.mode}) sudah selesai.`,
    });
  } else {
    alert(`Kegiatan selesai: ${act.name} (${act.mode})`);
  }
}

setInterval(() => {
  ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
  drawClock();
  checkAlarms();
}, 1000);
