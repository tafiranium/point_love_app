// ========== ENGINEER SETTINGS CLASS ==========
class EngineerSettings {
  constructor(config, schema) {
    this.config = config;
    this.schema = schema;
    // Selector elements
    this.selectorMain = null;
    this.selectorMone = null;
    this.selectorSale = null;
    this.selectorItem = null;
    this.selectorCoun = null;
    // Details container
    this.detailsContainer = null;
  }

  // Get DOM elements
  getElements() {
    this.selectorMain = document.getElementById('cfg-selector-main');
    this.selectorMone = document.getElementById('cfg-selector-mone');
    this.selectorSale = document.getElementById('cfg-selector-sale');
    this.selectorItem = document.getElementById('cfg-selector-item');
    this.selectorCoun = document.getElementById('cfg-selector-coun');
    this.detailsContainer = document.getElementById('details-grid');
  }

  // Render form fields
  render() {
    if (!this.detailsContainer) return;
    
    this.detailsContainer.innerHTML = this.schema.details.map(f => `
      <div class="form-group">
        <label data-name="${f.key}">${f.label}:</label>
        <input type="text" id="cfg-detail-${f.key}" placeholder="index,selector,bool">
      </div>
    `).join('');
  }

  // Populate form with config data
  populate() {
    if (!this.config) return;
    
    const ingSettings = this.config.ingeneerSettings || {};
    const selectors = ingSettings.selectors || {};
    const tables = selectors.tables || {};
    
    // Selectors
    if (this.selectorMain) this.selectorMain.value = tables.main || 'table#detail-view';
    if (this.selectorMone) this.selectorMone.value = tables.mone || 'table#price-detail-view';
    if (this.selectorSale) this.selectorSale.value = tables.sale || '#yw2';
    if (this.selectorItem) this.selectorItem.value = tables.item || '#receipt-items table.items.table tbody tr';
    if (this.selectorCoun) this.selectorCoun.value = tables.coun || 'div#receipt-items div.summary';
    
    // Details
    const details = ingSettings.details || {};
    this.schema.details.forEach(f => {
      const el = document.getElementById(`cfg-detail-${f.key}`);
      if (el) {
        const val = details[f.key];
        el.value = val ? val.join(',') : f.default.join(',');
      }
    });
  }

  // Parse detail value
  parseDetailValue(value) {
    return value.split(',').map(s => {
      const trimmed = s.trim();
      if (trimmed === 'true') return true;
      if (trimmed === 'false') return false;
      const num = parseInt(trimmed);
      return isNaN(num) ? trimmed : num;
    });
  }

  // Save to config object
  save() {
    if (!this.config) return;
    
    if (!this.config.ingeneerSettings) this.config.ingeneerSettings = {};
    if (!this.config.ingeneerSettings.selectors) this.config.ingeneerSettings.selectors = {};
    if (!this.config.ingeneerSettings.selectors.tables) this.config.ingeneerSettings.selectors.tables = {};
    
    // Selectors
    if (this.selectorMain) this.config.ingeneerSettings.selectors.tables.main = this.selectorMain.value;
    if (this.selectorMone) this.config.ingeneerSettings.selectors.tables.mone = this.selectorMone.value;
    if (this.selectorSale) this.config.ingeneerSettings.selectors.tables.sale = this.selectorSale.value;
    if (this.selectorItem) this.config.ingeneerSettings.selectors.tables.item = this.selectorItem.value;
    if (this.selectorCoun) this.config.ingeneerSettings.selectors.tables.coun = this.selectorCoun.value;
    
    // Details
    if (!this.config.ingeneerSettings.details) this.config.ingeneerSettings.details = {};
    this.schema.details.forEach(f => {
      const el = document.getElementById(`cfg-detail-${f.key}`);
      if (el) {
        this.config.ingeneerSettings.details[f.key] = this.parseDetailValue(el.value);
      }
    });
  }
}
