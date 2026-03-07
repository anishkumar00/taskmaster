// ═══════════════════════════════════════════════════════
//  Categories Modal
// ═══════════════════════════════════════════════════════

let catFormOpen = false;
let catFormEmoji = "🎯";
let catFormColor = "#00ff88";

function openCatModal() {
    catFormOpen = false;
    catFormEmoji = "🎯";
    catFormColor = "#00ff88";
    renderCatModal();
    document.getElementById("cat-overlay").classList.remove("hidden");
}

function closeCatModal() {
    document.getElementById("cat-overlay").classList.add("hidden");
}

function renderCatModal() {
    const modal = document.getElementById("cat-modal");
    modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div class="modal-title" style="margin:0">🎨 Categories</div>
      <button onclick="closeCatModal()" style="background:#21262d;border:none;border-radius:8px;color:#8b949e;width:28px;height:28px;font-size:14px;cursor:pointer">×</button>
    </div>

    ${STATE.cats.map(c => {
        const count = STATE.tasks.filter(t => t.category === c.id).length;
        const isDefault = ["📚 Study", "🌱 Personal", "📌 Other"].some(d => c.label.includes(d.split(" ")[1]));
        return `
        <div class="cat-modal-item">
          <div class="cat-modal-dot" style="background:${c.color}"></div>
          <span class="cat-modal-label">${c.label}</span>
          <span class="cat-modal-count">${count}</span>
          ${!isDefault
                ? `<button class="btn-cat-del" onclick="removeCat('${c.id}')">🗑</button>`
                : `<span class="cat-modal-def">Default</span>`}
        </div>`;
    }).join("")}

    ${!catFormOpen ? `
      <button class="btn-add-cat" onclick="toggleCatForm()">+ Add New Category</button>
    ` : `
      <div class="cat-form">
        <!-- Emoji picker -->
        <div class="emoji-picker">
          ${EMOJI_LIST.map(e => `
            <button class="emoji-btn ${catFormEmoji === e ? "selected" : ""}" onclick="selectCatEmoji('${e}')">${e}</button>
          `).join("")}
        </div>
        <!-- Color picker -->
        <div class="color-picker">
          ${COLORS.map(c => `
            <button class="color-btn ${catFormColor === c ? "selected" : ""}"
              style="background:${c}"
              onclick="selectCatColor('${c}')"></button>
          `).join("")}
        </div>
        <!-- Preview -->
        <div class="cat-preview">
          <div class="cat-preview-dot" id="cat-prev-dot" style="background:${catFormColor}"></div>
          <span id="cat-prev-label" style="color:${catFormColor};font-size:12px">${catFormEmoji} <span id="cat-prev-name">Preview</span></span>
        </div>
        <!-- Name input -->
        <input id="cat-name-inp" class="inp" placeholder="Category name..." oninput="updateCatPreview()"/>
        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn-cancel" onclick="toggleCatForm()">Cancel</button>
          <button class="btn-save" onclick="saveCat()">✓ Add Category</button>
        </div>
      </div>
    `}`;
}

function toggleCatForm() {
    catFormOpen = !catFormOpen;
    renderCatModal();
    if (catFormOpen) {
        setTimeout(() => document.getElementById("cat-name-inp")?.focus(), 50);
    }
}

function selectCatEmoji(e) {
    catFormEmoji = e;
    renderCatModal();
    setTimeout(() => {
        const inp = document.getElementById("cat-name-inp");
        if (inp) inp.focus();
    }, 30);
}

function selectCatColor(c) {
    catFormColor = c;
    renderCatModal();
    setTimeout(() => {
        const inp = document.getElementById("cat-name-inp");
        if (inp) inp.focus();
    }, 30);
}

function updateCatPreview() {
    const name = document.getElementById("cat-name-inp")?.value || "";
    const el = document.getElementById("cat-prev-name");
    if (el) el.textContent = name || "Preview";
}

async function saveCat() {
    const name = sanitize(document.getElementById("cat-name-inp")?.value || "");
    if (!name) { showToast("Enter a category name!", "error"); return; }
    try {
        const row = await dbAddCategory(STATE.user.id, {
            label: `${catFormEmoji} ${name}`,
            color: catFormColor,
        });
        STATE.cats.push(row);
        showToast("🎨 Category added!");
        catFormOpen = false;
        catFormEmoji = "🎯";
        catFormColor = "#00ff88";
        renderCatModal();
        updateSidebar();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

async function removeCat(id) {
    if (!confirm("Delete this category? Tasks in it will move to 'Other'.")) return;
    try {
        await dbDeleteCategory(id);
        STATE.cats = STATE.cats.filter(c => c.id !== id);
        STATE.tasks = STATE.tasks.map(t => t.category === id ? { ...t, category: STATE.cats[2]?.id || "other" } : t);
        showToast("🗑️ Category deleted");
        renderCatModal();
        updateSidebar();
        renderTasks();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}