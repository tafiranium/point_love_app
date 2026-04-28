// ========== COLUMNS SETTINGS CLASS ==========
class ColumnsSettings {
  constructor(config, schema) {
    this.config = config;
    this.schema = schema;
    this.container = null;
  }

  // Get DOM elements
  getElements() {
    this.container = document.getElementById('passive-columns');
  }

  // Render form fields
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = this.schema.passive.map(f => `
      <div class="passive-col-item">
        <div class="col-label">${f.label}</div>
        <input type="number" class="col-number" id="cfg-passive-${f.key}" value="${f.default}">
        <div class="col-checkbox">
          <input type="checkbox" id="cfg-passive-enabled-${f.key}" checked>
        </div>
      </div>
    `).join('');
  }

  // Populate form with config data
  populate() {
    if (!this.config) return;
    
    this.schema.passive.forEach(f => {
      const numEl = document.getElementById(`cfg-passive-${f.key}`);
      const enabledEl = document.getElementById(`cfg-passive-enabled-${f.key}`);
      
      // Читаем col и turn_on из конфига
      if (numEl && this.config.passive) {
        const fieldConfig = this.config.passive[f.key];
        if (fieldConfig && typeof fieldConfig === 'object') {
          numEl.value = fieldConfig.col ?? f.default;
          enabledEl.checked = (fieldConfig.turn_on === 1);
        } else {
          // Обратная совместимость - старый формат
          numEl.value = fieldConfig ?? f.default;
          enabledEl.checked = (f.turn_on === 1);
        }
      } else {
        enabledEl.checked = (f.turn_on === 1);
      }
    });
  }

  // Save to config object
  save() {
    if (!this.config) return;
    
    if (!this.config.passive) this.config.passive = {};
    
    this.schema.passive.forEach(f => {
      const numEl = document.getElementById(`cfg-passive-${f.key}`);
      const enabledEl = document.getElementById(`cfg-passive-enabled-${f.key}`);
      
      if (numEl) {
        // Сохраняем как объект { col, turn_on }
        this.config.passive[f.key] = {
          col: parseInt(numEl.value) || f.default,
          turn_on: enabledEl?.checked ? 1 : 0
        };
      }
    });
  }
}
