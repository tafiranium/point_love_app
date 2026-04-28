// ========== NAMES SETTINGS CLASS ==========
// Maps original names to table display names (for names without patronymics)

class NamesSettings {
  constructor(config) {
    this.config = config;
    this.container = null;
    this.addButton = null;
  }

  // Get DOM elements
  getElements() {
    this.container = document.getElementById('enames-list');
    this.addButton = document.getElementById('btn-add-ename');
  }

  // Render form fields
  render() {
    // Render is done in populate
  }

  // Populate form with config data
  populate() {
    if (!this.config || !this.container) return;
    
    // names is now an object: { "original": "table", ... }
    const names = this.config.names || {};
    const entries = Object.entries(names);
    
    this.container.innerHTML = entries.map(([original, table], idx) => `
      <div class="dynamic-row" data-index="${idx}">
        <label>Исходное:</label>
        <input type="text" class="ename-original" value="${original}" placeholder="Цао Джен Хао">
        <label>В таблице:</label>
        <input type="text" class="ename-table" value="${table}" placeholder="Цао Ч. Цао Джен Хао">
        <button class="remove-btn" data-idx="${idx}">×</button>
      </div>
    `).join('');
    
    if (entries.length === 0) {
      this.container.innerHTML = '<div class="dynamic-row"><label>Нет исключений</label></div>';
    }
    
    // Reattach event listeners
    this.container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeEname(parseInt(btn.dataset.idx));
      });
    });
    
    // Add button handler
    if (this.addButton) {
      this.addButton.addEventListener('click', () => this.addEname());
    }
  }

  // Add new ename
  addEname() {
    if (!this.container) return;
    
    // Remove "no items" message if present
    const emptyMsg = this.container.querySelector('label');
    if (emptyMsg && this.container.children.length === 0) {
      emptyMsg.parentElement.remove();
    }
    
    const idx = this.container.children.length;
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.dataset.index = idx;
    div.innerHTML = `
      <label>Исходное:</label>
      <input type="text" class="ename-original" value="" placeholder="Цао Джен Хао">
      <label>В таблице:</label>
      <input type="text" class="ename-table" value="" placeholder="Цао Ч. Цао Джен Хао">
      <button class="remove-btn" data-idx="${idx}">×</button>
    `;
    this.container.appendChild(div);
    
    // Attach event listener
    div.querySelector('.remove-btn').addEventListener('click', () => {
      this.removeEname(idx);
    });
  }

  // Remove ename
  removeEname(idx) {
    const rows = this.container?.querySelectorAll('.dynamic-row');
    if (rows && rows[idx]) rows[idx].remove();
  }

  // Save to config object
  save() {
    if (!this.config || !this.container) return;
    
    // Save as object: { "original": "table", ... }
    const names = {};
    const rows = this.container.querySelectorAll('.dynamic-row');
    
    rows.forEach(row => {
      const original = row.querySelector('.ename-original')?.value?.trim();
      const table = row.querySelector('.ename-table')?.value?.trim();
      if (original && table) {
        names[original] = table;
      }
    });
    
    this.config.names = names;
  }
}
