// ═══════════════════════════════════════════════════════
//  Tasks — CRUD + Rendering
// ═══════════════════════════════════════════════════════

let subtasksBuffer = [];

// ── Open / Close Modal ────────────────────────────────
function openTaskModal(task = null) {
    STATE.editingTaskId = task ? task.id : null;
    subtasksBuffer = task ? [...(task.subtasks || [])] : [];

    document.getElementById("task-modal-title").textContent = task ? "✏️ Edit Task" : "➕ New Task";
    document.getElementById("task-save-btn").textContent = task ? "Save Changes" : "Add Task ✓";
    document.getElementById("tm-title").value = task ? task.title : "";
    document.getElementById("tm-date").value = task ? (task.due_date || todayStr()) : todayStr();
    document.getElementById("tm-notes").value = task ? (task.notes || "") : "";
    document.getElementById("tm-tags").value = task ? (task.tags || []).join(", ") : "";

    // Build category dropdown
    const catSel = document.getElementById("tm-cat");
    catSel.innerHTML = STATE.cats.map(c => `<option value="${c.id}">${c.label}</option>`).join("");
    if (task) catSel.value = task.category;

    document.getElementById("tm-pri").value = task ? task.priority : "medium";

    renderSubtasksBuffer();
    document.getElementById("task-modal-overlay").classList.remove("hidden");
    document.getElementById("tm-title").focus();
}

function closeTaskModal() {
    document.getElementById("task-modal-overlay").classList.add("hidden");
    STATE.editingTaskId = null;
    subtasksBuffer = [];
}

// ── Subtask helpers ───────────────────────────────────
function addSubtask() {
    const inp = document.getElementById("tm-sub-inp");
    const txt = sanitize(inp.value);
    if (!txt) return;
    subtasksBuffer.push({ id: Date.now().toString(), text: txt, done: false });
    inp.value = "";
    renderSubtasksBuffer();
}

function removeSubtask(id) {
    subtasksBuffer = subtasksBuffer.filter(s => s.id !== id);
    renderSubtasksBuffer();
}

function renderSubtasksBuffer() {
    const container = document.getElementById("tm-subtasks");
    container.innerHTML = subtasksBuffer.map(s => `
    <div class="subtask-item">
      <span>◻ ${s.text}</span>
      <button class="subtask-del" onclick="removeSubtask('${s.id}')">×</button>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("tm-sub-inp")?.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); addSubtask(); }
    });
    document.getElementById("tm-title")?.addEventListener("keydown", e => {
        if (e.key === "Enter") saveTask();
    });
});

// ── Save Task ─────────────────────────────────────────
async function saveTask() {
    const title = sanitize(document.getElementById("tm-title").value);
    if (!title) { showToast("Please enter a task title!", "error"); return; }

    const taskData = {
        title,
        category: document.getElementById("tm-cat").value,
        priority: document.getElementById("tm-pri").value,
        due_date: document.getElementById("tm-date").value || null,
        notes: sanitize(document.getElementById("tm-notes").value),
        tags: document.getElementById("tm-tags").value.split(",").map(t => sanitize(t)).filter(Boolean),
        subtasks: subtasksBuffer,
    };

    try {
        if (STATE.editingTaskId) {
            const updated = await dbUpdateTask(STATE.editingTaskId, taskData);
            STATE.tasks = STATE.tasks.map(t => t.id === STATE.editingTaskId ? { ...t, ...updated } : t);
            showToast("✏️ Task updated!");
        } else {
            const newTask = await dbAddTask(STATE.user.id, { ...taskData, completed: false, completed_at: null });
            STATE.tasks.unshift(newTask);
            showToast("✅ Task added! +10 XP");
            await gainXp(10);
        }
        closeTaskModal();
        renderTasks();
        updateHeader();
        updateSidebar();
    } catch (e) {
        showToast("Error saving task: " + e.message, "error");
    }
}

// ── Toggle Complete ───────────────────────────────────
async function toggleTask(id) {
    const task = STATE.tasks.find(t => t.id === id);
    if (!task) return;
    const nowDone = !task.completed;
    try {
        const updated = await dbUpdateTask(id, {
            completed: nowDone,
            completed_at: nowDone ? new Date().toISOString() : null,
        });
        STATE.tasks = STATE.tasks.map(t => t.id === id ? { ...t, ...updated } : t);
        if (nowDone) {
            showToast("🔥 Task complete! +30 XP", "success");
            await gainXp(30);
            spawnConfetti();
        }
        renderTasks(); updateHeader(); updateSidebar();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

// ── Delete Task ───────────────────────────────────────
async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
        await dbDeleteTask(id);
        STATE.tasks = STATE.tasks.filter(t => t.id !== id);
        showToast("🗑️ Deleted");
        renderTasks(); updateHeader(); updateSidebar();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

// ── Toggle Subtask ────────────────────────────────────
async function toggleSubtask(taskId, subId) {
    const task = STATE.tasks.find(t => t.id === taskId);
    if (!task) return;
    const newSubs = task.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s);
    await dbUpdateTask(taskId, { subtasks: newSubs });
    STATE.tasks = STATE.tasks.map(t => t.id === taskId ? { ...t, subtasks: newSubs } : t);
    renderTasks();
    // Re-open detail modal with updated data
    const updated = STATE.tasks.find(t => t.id === taskId);
    if (updated) openDetailModal(updated);
}

// ── Filter & Sort ─────────────────────────────────────
function getFilteredTasks() {
    const search = document.getElementById("search-inp")?.value.toLowerCase() || "";
    const fPri = document.getElementById("filter-pri")?.value || "all";
    const sort = document.getElementById("sort-by")?.value || "date";
    const fCat = STATE.filterCat;
    const view = STATE.view;

    let list = STATE.tasks.filter(t => {
        if (view === "today" && !isToday(t.due_date) && !t.completed) return false;
        if (view === "completed" && !t.completed) return false;
        if (view === "pending" && t.completed) return false;
        if (fCat !== "all" && t.category !== fCat) return false;
        if (fPri !== "all" && t.priority !== fPri) return false;
        if (search && !t.title.toLowerCase().includes(search) && !(t.tags || []).join(" ").includes(search)) return false;
        return true;
    });

    list.sort((a, b) => {
        if (sort === "priority") { const o = { high: 0, medium: 1, low: 2 }; return o[a.priority] - o[b.priority]; }
        if (sort === "date") return (a.due_date || "9") < (b.due_date || "9") ? -1 : 1;
        if (sort === "name") return a.title.localeCompare(b.title);
        return 0;
    });

    return list;
}

// ── Render Task List ──────────────────────────────────
function renderTasks() {
    const container = document.getElementById("task-list");
    if (!container) return;

    // Update stat cards
    const done = STATE.tasks.filter(t => t.completed).length;
    const total = STATE.tasks.length;
    const todayAll = STATE.tasks.filter(t => isToday(t.due_date));
    const todayDone = todayAll.filter(t => t.completed).length;
    const overdue = STATE.tasks.filter(t => isOverdue(t.due_date) && !t.completed);
    const pct = total ? Math.round(done / total * 100) : 0;
    const streak = calcStreak();

    document.getElementById("sc-today").textContent = `${todayDone}/${todayAll.length}`;
    document.getElementById("sc-today-sub").textContent = `${todayAll.length - todayDone} remaining`;
    document.getElementById("sc-pct").textContent = pct + "%";
    document.getElementById("sc-pct-sub").textContent = `${done} of ${total}`;
    document.getElementById("sc-overdue").textContent = overdue.length;
    document.getElementById("sc-overdue").style.color = overdue.length > 0 ? "#ff4444" : "#00ff88";
    document.getElementById("sc-overdue-sub").textContent = overdue.length > 0 ? "Needs attention!" : "All clear ✓";
    document.getElementById("sc-streak").textContent = streak + "d";
    document.getElementById("sc-streak-sub").textContent = streak > 0 ? "Keep going!" : "Start today";
    document.getElementById("prog-pct").textContent = pct + "%";
    document.getElementById("prog-fill").style.width = pct + "%";

    const list = getFilteredTasks();

    if (list.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-title">No tasks here!</div>
        <div class="empty-sub">Click "+ Task" to add one</div>
      </div>`;
        return;
    }

    container.innerHTML = list.map(t => {
        const c = catById(t.category);
        const p = priById(t.priority);
        const subs = t.subtasks || [];
        const subDone = subs.filter(s => s.done).length;
        const over = isOverdue(t.due_date) && !t.completed;

        return `
      <div class="task-card ${t.completed ? "done" : ""}" onclick="openDetailModal(STATE.tasks.find(x=>x.id==='${t.id}'))">
        <button class="task-check ${t.completed ? "done" : ""}" onclick="event.stopPropagation();toggleTask('${t.id}')">
          ${t.completed ? "✓" : ""}
        </button>
        <div class="task-body">
          <div class="task-title ${t.completed ? "done" : ""}">${t.title}</div>
          <div class="task-meta">
            <span class="tag-chip" style="color:${c.color};background:${c.color}22">${c.label}</span>
            <span class="tag-chip" style="color:${p.color};background:${p.color}22">${p.label}</span>
            ${t.due_date ? `<span style="font-size:10px;color:${over ? "#ff4444" : "#484f58"}">📅${over ? "⚠️" : ""}${fmtDate(t.due_date)}</span>` : ""}
            ${subs.length > 0 ? `<span style="font-size:10px;color:#8b949e">◻${subDone}/${subs.length}</span>` : ""}
            ${(t.tags || []).map(tag => `<span style="font-size:10px;color:#8b949e;background:#21262d;padding:1px 5px;border-radius:3px">#${tag}</span>`).join("")}
          </div>
          ${subs.length > 0 ? `
            <div class="task-sub-bar">
              <div class="task-sub-fill" style="width:${(subDone / subs.length) * 100}%;background:${c.color}"></div>
            </div>` : ""}
        </div>
        <div class="task-actions" onclick="event.stopPropagation()">
          <button class="task-action-btn" onclick="openTaskModal(STATE.tasks.find(x=>x.id==='${t.id}'))">✏️</button>
          <button class="task-action-btn del" onclick="deleteTask('${t.id}')">🗑</button>
        </div>
      </div>`;
    }).join("");
}

// ── Detail Modal ──────────────────────────────────────
function openDetailModal(task) {
    if (!task) return;
    const c = catById(task.category);
    const p = priById(task.priority);
    const subs = task.subtasks || [];

    const modal = document.getElementById("detail-modal");
    modal.innerHTML = `
    <div class="detail-badges">
      <span class="detail-badge" style="color:${c.color};background:${c.color}22">${c.label}</span>
      <span class="detail-badge" style="color:${p.color};background:${p.color}22">${p.label}</span>
      ${task.completed ? `<span class="detail-badge" style="color:#00ff88;background:#00ff8822">✓ DONE</span>` : ""}
    </div>
    <div class="detail-title ${task.completed ? "done" : ""}">${task.title}</div>
    ${task.due_date ? `<div class="detail-info">📅 Due: ${fmtDate(task.due_date)}</div>` : ""}
    ${task.completed_at ? `<div class="detail-info" style="color:#00ff88">✓ Done: ${fmtDate(new Date(task.completed_at).toISOString().slice(0, 10))} ${fmtTime(task.completed_at)}</div>` : ""}
    ${task.notes ? `<div class="detail-notes">${task.notes}</div>` : ""}

    ${subs.length > 0 ? `
      <div class="detail-sub-header">SUBTASKS (${subs.filter(s => s.done).length}/${subs.length})</div>
      ${subs.map(s => `
        <div class="detail-sub-item" onclick="toggleSubtask('${task.id}','${s.id}')">
          <div class="detail-sub-check ${s.done ? "done" : ""}">${s.done ? "✓" : ""}</div>
          <span class="detail-sub-text ${s.done ? "done" : ""}">${s.text}</span>
        </div>`).join("")}
    ` : ""}

    ${(task.tags || []).length > 0 ? `
      <div class="detail-tags">${task.tags.map(t => `<span class="detail-tag">#${t}</span>`).join("")}</div>
    ` : ""}

    <div class="detail-actions">
      <button class="btn-detail-toggle ${task.completed ? "pending" : "complete"}"
        onclick="toggleTask('${task.id}');closeDetail()">
        ${task.completed ? "↩ Pending" : "✓ Complete"}
      </button>
      <button class="btn-detail-edit" onclick="closeDetail();openTaskModal(STATE.tasks.find(x=>x.id==='${task.id}'))">✏️ Edit</button>
      <button class="btn-detail-del" onclick="closeDetail();deleteTask('${task.id}')">🗑</button>
    </div>`;

    document.getElementById("detail-overlay").classList.remove("hidden");
}

function closeDetail() {
    document.getElementById("detail-overlay").classList.add("hidden");
}

// ── Stat Modal ────────────────────────────────────────
function openStatModal(type) {
    const done = STATE.tasks.filter(t => t.completed);
    const todayTasks = STATE.tasks.filter(t => isToday(t.due_date));
    const todayDone = todayTasks.filter(t => t.completed).length;
    const overdue = STATE.tasks.filter(t => isOverdue(t.due_date) && !t.completed);
    const streak = calcStreak();

    const cfgs = {
        today: {
            title: "☀️ Today's Tasks", color: "#00ff88",
            items: todayTasks,
            summary: [{ l: "Total", v: todayTasks.length, c: "#00eeff" }, { l: "Done", v: todayDone, c: "#00ff88" }, { l: "Left", v: todayTasks.length - todayDone, c: "#ffaa00" }],
            empty: "No tasks today!",
        },
        completed: {
            title: "✅ Completed", color: "#00eeff",
            items: [...done].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)),
            summary: [{ l: "Total", v: done.length, c: "#00ff88" }, { l: "This Week", v: done.filter(t => t.completed_at && new Date(t.completed_at) > new Date(Date.now() - 7 * 864e5)).length, c: "#00eeff" }, { l: "Today", v: done.filter(t => t.completed_at && new Date(t.completed_at).toISOString().slice(0, 10) === todayStr()).length, c: "#ffaa00" }],
            empty: "No completed tasks!",
        },
        overdue: {
            title: "⚠️ Overdue", color: "#ff4444",
            items: [...overdue].sort((a, b) => a.due_date < b.due_date ? -1 : 1),
            summary: [{ l: "Overdue", v: overdue.length, c: "#ff4444" }, { l: "High", v: overdue.filter(t => t.priority === "high").length, c: "#ff4444" }, { l: "Medium", v: overdue.filter(t => t.priority === "medium").length, c: "#ffaa00" }],
            empty: "🎉 No overdue tasks! Great job.",
        },
        streak: {
            title: "🔥 Streak", color: "#ff8800",
            items: [...done].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)).slice(0, 15),
            summary: [{ l: "Streak", v: streak + "d", c: "#ff8800" }, { l: "Total", v: done.length, c: "#00ff88" }, { l: "Today", v: done.filter(t => t.completed_at && new Date(t.completed_at).toISOString().slice(0, 10) === todayStr()).length, c: "#00eeff" }],
            empty: "Complete a task to start your streak!",
        },
    };

    const cfg = cfgs[type];
    const modal = document.getElementById("stat-modal");
    modal.innerHTML = `
    <div class="stat-modal-header">
      <div class="stat-modal-title" style="color:${cfg.color}">${cfg.title}</div>
      <button class="stat-modal-close" onclick="closeStatModal()">×</button>
    </div>
    <div class="stat-summary">
      ${cfg.summary.map(s => `
        <div class="stat-sum-card" style="border:1px solid ${s.c}33">
          <div class="stat-sum-val" style="color:${s.c}">${s.v}</div>
          <div class="stat-sum-lbl">${s.l}</div>
        </div>`).join("")}
    </div>
    ${cfg.items.length === 0 ? `<div style="text-align:center;padding:30px 0;color:#484f58">${cfg.empty}</div>` :
            cfg.items.map(t => {
                const c = catById(t.category), p = priById(t.priority);
                return `
          <div class="stat-task-item" onclick="closeStatModal();openDetailModal(STATE.tasks.find(x=>x.id==='${t.id}'))">
            <button class="stat-task-check ${t.completed ? "done" : ""}" onclick="event.stopPropagation();toggleTask('${t.id}');closeStatModal()">${t.completed ? "✓" : ""}</button>
            <div class="stat-task-body">
              <div class="stat-task-title ${t.completed ? "done" : ""}">${t.title}</div>
              <div class="stat-task-meta">
                <span style="font-size:10px;color:${c.color}">${c.label}</span>
                <span style="font-size:10px;color:${p.color}">${p.label}</span>
                ${t.due_date ? `<span style="font-size:10px;color:${isOverdue(t.due_date) && !t.completed ? "#ff4444" : "#484f58"}">📅${fmtDate(t.due_date)}</span>` : ""}
                ${t.completed_at ? `<span style="font-size:10px;color:#484f58">✓${fmtTime(t.completed_at)}</span>` : ""}
              </div>
            </div>
          </div>`;
            }).join("")}`;

    document.getElementById("stat-overlay").classList.remove("hidden");
}

function closeStatModal() {
    document.getElementById("stat-overlay").classList.add("hidden");
}