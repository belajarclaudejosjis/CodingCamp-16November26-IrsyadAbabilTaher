/* =============================================
   MY DASHBOARD — app.js
   Features:
     - Greeting + clock/date
     - Custom name in greeting         [Challenge]
     - Light / Dark mode               [Challenge]
     - Focus timer w/ custom duration  [Challenge]
     - To-Do list (add, edit, done, delete)
       - Prevent duplicate tasks       [Challenge]
       - Sort tasks                    [Challenge]
     - Quick Links (Local Storage)
   ============================================= */

"use strict";

/* --------------------------------------------------
   UTILITY: Local Storage helpers
   -------------------------------------------------- */
const store = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

/* --------------------------------------------------
   1. CLOCK & GREETING
   -------------------------------------------------- */
const clockTimeEl  = document.getElementById("clock-time");
const clockDateEl  = document.getElementById("clock-date");
const greetTextEl  = document.getElementById("greeting-text");
const greetNameEl  = document.getElementById("greeting-name");

const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

function getGreeting(hour) {
  if (hour < 5)  return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function updateClock() {
  const now  = new Date();
  const h    = String(now.getHours()).padStart(2, "0");
  const m    = String(now.getMinutes()).padStart(2, "0");
  const s    = String(now.getSeconds()).padStart(2, "0");
  clockTimeEl.textContent = `${h}:${m}:${s}`;

  const day  = DAYS[now.getDay()];
  const date = now.getDate();
  const mon  = MONTHS[now.getMonth()];
  const yr   = now.getFullYear();
  clockDateEl.textContent = `${day}, ${date} ${mon} ${yr}`;

  greetTextEl.textContent = getGreeting(now.getHours());
}

setInterval(updateClock, 1000);
updateClock();

/* --------------------------------------------------
   2. CUSTOM NAME (Challenge)
   -------------------------------------------------- */
const nameModal    = document.getElementById("name-modal");
const nameInput    = document.getElementById("name-input");
const nameSaveBtn  = document.getElementById("name-save");
const nameCancelBtn = document.getElementById("name-cancel");
const editNameBtn  = document.getElementById("edit-name-btn");

function loadName() {
  const saved = store.get("userName");
  greetNameEl.textContent = saved || "Friend";
}

function openNameModal() {
  nameInput.value = store.get("userName") || "";
  nameModal.classList.remove("hidden");
  nameInput.focus();
}

function closeNameModal() {
  nameModal.classList.add("hidden");
}

function saveName() {
  const name = nameInput.value.trim();
  if (name) {
    store.set("userName", name);
    greetNameEl.textContent = name;
  }
  closeNameModal();
}

editNameBtn.addEventListener("click", openNameModal);
nameSaveBtn.addEventListener("click", saveName);
nameCancelBtn.addEventListener("click", closeNameModal);
nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") saveName(); });
nameModal.addEventListener("click", (e) => { if (e.target === nameModal) closeNameModal(); });

// Show name modal on first visit
if (!store.get("userName")) {
  setTimeout(openNameModal, 500);
}

loadName();

/* --------------------------------------------------
   3. DARK / LIGHT MODE (Challenge)
   -------------------------------------------------- */
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeToggle.textContent = dark ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  store.set("darkMode", isDark);
  applyTheme(isDark);
});

// Load saved theme; default: match system preference
const savedDark = store.get("darkMode");
if (savedDark !== null) {
  applyTheme(savedDark);
} else {
  applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/* --------------------------------------------------
   4. FOCUS TIMER — with custom duration (Challenge)
   -------------------------------------------------- */
const timerDisplay    = document.getElementById("timer-display");
const timerStartBtn   = document.getElementById("timer-start");
const timerStopBtn    = document.getElementById("timer-stop");
const timerResetBtn   = document.getElementById("timer-reset");
const customMinInput  = document.getElementById("custom-minutes");
const timerSetBtn     = document.getElementById("timer-set");

let timerInterval  = null;
let totalSeconds   = 25 * 60;
let remainSeconds  = totalSeconds;
let timerRunning   = false;

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(remainSeconds);
  timerDisplay.classList.toggle("running", timerRunning && remainSeconds > 0);
  timerDisplay.classList.toggle("finished", remainSeconds === 0);
}

function startTimer() {
  if (timerRunning || remainSeconds === 0) return;
  timerRunning = true;
  renderTimer();
  timerInterval = setInterval(() => {
    remainSeconds--;
    renderTimer();
    if (remainSeconds === 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.classList.remove("running");
      timerDisplay.classList.add("finished");
      // Browser notification if permitted
      if (Notification && Notification.permission === "granted") {
        new Notification("⏰ Focus session complete!", { body: "Time to take a break." });
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  renderTimer();
}

function resetTimer() {
  stopTimer();
  remainSeconds = totalSeconds;
  timerDisplay.classList.remove("finished");
  renderTimer();
}

function setCustomTimer() {
  const mins = parseInt(customMinInput.value, 10);
  if (isNaN(mins) || mins < 1 || mins > 120) {
    customMinInput.style.borderColor = "var(--danger)";
    setTimeout(() => (customMinInput.style.borderColor = ""), 1500);
    return;
  }
  stopTimer();
  totalSeconds  = mins * 60;
  remainSeconds = totalSeconds;
  timerDisplay.classList.remove("finished");
  renderTimer();
}

timerStartBtn.addEventListener("click", startTimer);
timerStopBtn.addEventListener("click", stopTimer);
timerResetBtn.addEventListener("click", resetTimer);
timerSetBtn.addEventListener("click", setCustomTimer);
customMinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") setCustomTimer(); });

// Request notification permission passively
if (Notification && Notification.permission === "default") {
  Notification.requestPermission();
}

renderTimer();

/* --------------------------------------------------
   5. TO-DO LIST
      Challenges: prevent duplicates, sort tasks
   -------------------------------------------------- */
const todoListEl  = document.getElementById("todo-list");
const todoInputEl = document.getElementById("todo-input");
const todoAddBtn  = document.getElementById("todo-add-btn");
const todoSortEl  = document.getElementById("todo-sort");

let todos = store.get("todos", []);
// Migrate old format if necessary
todos = todos.map((t) =>
  typeof t === "string" ? { id: Date.now() + Math.random(), text: t, done: false } : t
);

function saveTodos() {
  store.set("todos", todos);
}

function getSortedTodos() {
  const sort = todoSortEl.value;
  const copy = [...todos];
  if (sort === "az")   return copy.sort((a, b) => a.text.localeCompare(b.text));
  if (sort === "za")   return copy.sort((a, b) => b.text.localeCompare(a.text));
  if (sort === "done") return copy.sort((a, b) => Number(a.done) - Number(b.done));
  return copy; // default: insertion order
}

function renderTodos() {
  todoListEl.innerHTML = "";
  const sorted = getSortedTodos();

  if (sorted.length === 0) {
    todoListEl.innerHTML = `<li class="todo-empty">No tasks yet. Add one above!</li>`;
    return;
  }

  sorted.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.done ? " done" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.done ? "checked" : ""} aria-label="Mark done" />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-item-actions">
        <button class="btn btn-ghost btn-sm todo-edit-btn">Edit</button>
        <button class="btn btn-danger btn-sm todo-delete-btn">Delete</button>
      </div>
    `;

    // Toggle done
    li.querySelector(".todo-checkbox").addEventListener("change", () => {
      const t = todos.find((x) => x.id === todo.id);
      if (t) { t.done = !t.done; saveTodos(); renderTodos(); }
    });

    // Delete
    li.querySelector(".todo-delete-btn").addEventListener("click", () => {
      todos = todos.filter((x) => x.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    // Edit
    li.querySelector(".todo-edit-btn").addEventListener("click", () => {
      enterEditMode(li, todo);
    });

    todoListEl.appendChild(li);
  });
}

function enterEditMode(li, todo) {
  const textSpan   = li.querySelector(".todo-text");
  const actionsDiv = li.querySelector(".todo-item-actions");

  const input = document.createElement("input");
  input.type      = "text";
  input.className = "todo-edit-input";
  input.value     = todo.text;
  input.maxLength = 100;

  const saveBtn   = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.className   = "btn btn-primary btn-sm";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.className   = "btn btn-ghost btn-sm";

  textSpan.replaceWith(input);
  actionsDiv.innerHTML = "";
  actionsDiv.appendChild(saveBtn);
  actionsDiv.appendChild(cancelBtn);
  input.focus();
  input.select();

  function commitEdit() {
    const newText = input.value.trim();
    if (!newText) return;

    // Duplicate check (excluding the current item)
    const duplicate = todos.some(
      (x) => x.id !== todo.id && x.text.toLowerCase() === newText.toLowerCase()
    );
    if (duplicate) {
      input.style.borderColor = "var(--danger)";
      input.title = "A task with this name already exists.";
      return;
    }

    const t = todos.find((x) => x.id === todo.id);
    if (t) { t.text = newText; saveTodos(); renderTodos(); }
  }

  saveBtn.addEventListener("click", commitEdit);
  cancelBtn.addEventListener("click", renderTodos);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter")  commitEdit();
    if (e.key === "Escape") renderTodos();
  });
}

function addTodo() {
  const text = todoInputEl.value.trim();
  if (!text) return;

  // Prevent duplicate tasks (Challenge)
  const duplicate = todos.some((t) => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    todoInputEl.style.borderColor = "var(--danger)";
    todoInputEl.title = "This task already exists.";
    setTimeout(() => {
      todoInputEl.style.borderColor = "";
      todoInputEl.title = "";
    }, 1800);
    return;
  }

  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  todoInputEl.value = "";
  renderTodos();
}

todoAddBtn.addEventListener("click", addTodo);
todoInputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") addTodo(); });
todoSortEl.addEventListener("change", renderTodos);

renderTodos();

/* --------------------------------------------------
   6. QUICK LINKS
   -------------------------------------------------- */
const linksGrid     = document.getElementById("links-grid");
const linkNameInput = document.getElementById("link-name-input");
const linkUrlInput  = document.getElementById("link-url-input");
const linkAddBtn    = document.getElementById("link-add-btn");

let links = store.get("quickLinks", [
  { id: 1, name: "Google",   url: "https://google.com" },
  { id: 2, name: "YouTube",  url: "https://youtube.com" },
  { id: 3, name: "GitHub",   url: "https://github.com" },
]);

function saveLinks() {
  store.set("quickLinks", links);
}

function renderLinks() {
  linksGrid.innerHTML = "";
  if (links.length === 0) {
    linksGrid.innerHTML = `<p class="todo-empty">No links yet. Add one above!</p>`;
    return;
  }
  links.forEach((link) => {
    const chip = document.createElement("div");
    chip.className = "link-chip";
    chip.innerHTML = `
      <a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(link.name)}
      </a>
      <button class="link-delete" title="Remove link">✕</button>
    `;
    chip.querySelector(".link-delete").addEventListener("click", () => {
      links = links.filter((l) => l.id !== link.id);
      saveLinks();
      renderLinks();
    });
    linksGrid.appendChild(chip);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  const url  = linkUrlInput.value.trim();

  if (!name || !url) return;

  // Basic URL validation
  let fullUrl = url;
  if (!/^https?:\/\//i.test(url)) fullUrl = "https://" + url;

  try {
    new URL(fullUrl);
  } catch {
    linkUrlInput.style.borderColor = "var(--danger)";
    setTimeout(() => (linkUrlInput.style.borderColor = ""), 1800);
    return;
  }

  links.push({ id: Date.now(), name, url: fullUrl });
  saveLinks();
  linkNameInput.value = "";
  linkUrlInput.value  = "";
  renderLinks();
}

linkAddBtn.addEventListener("click", addLink);
linkUrlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addLink(); });
linkNameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addLink(); });

renderLinks();

/* --------------------------------------------------
   UTILITY: XSS helpers
   -------------------------------------------------- */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
