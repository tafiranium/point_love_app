// ========== POPUP MANAGER CLASS ==========
// Main class that orchestrates all settings modules

class PopupManager {
  constructor(config, schema) {
    this.config = config;
    this.schema = schema;
    
    // Settings modules
    this.main = null;
    this.columns = null;
    this.types = null;
    this.money = null;
    this.manual = null;
    this.engineer = null;
    this.names = null;
    this.importExport = null;
    
    // UI elements
    this.tabs = null;
    this.saveAllBtn = null;
    this.alertElement = null;
    this.statusText = null;
  }

  // Initialize all settings modules
  init() {
    // Get common UI elements
    this.tabs = document.querySelectorAll('.tab');
    this.saveAllBtn = document.getElementById('btn-save-all');
    this.alertElement = document.getElementById('alert');
    this.statusText = document.getElementById('status-text');
    
    // Initialize settings modules
    this.main = new MainSettings(this.config);
    this.columns = new ColumnsSettings(this.config, this.schema);
    this.types = new TypesSettings(this.config, this.schema);
    this.money = new MoneySettings(this.config);
    this.manual = new ManualSettings(this.config, this.schema);
    this.engineer = new EngineerSettings(this.config, this.schema);
    this.names = new NamesSettings(this.config);
    this.importExport = new ImportExportSettings(this.config);
    
    // Get DOM elements for all modules
    this.main.getElements();
    this.columns.getElements();
    this.types.getElements();
    this.money.getElements();
    this.manual.getElements();
    this.engineer.getElements();
    this.names.getElements();
    this.importExport.getElements();
    
    // Render all forms
    this.main.render();
    this.columns.render();
    this.types.render();
    this.money.render();
    this.manual.render();
    this.engineer.render();
    this.names.render();
    this.importExport.render();
    
    // Populate all forms with data
    this.main.populate();
    this.columns.populate();
    this.types.populate();
    this.money.populate();
    this.manual.populate();
    this.engineer.populate();
    this.names.populate();
    this.importExport.populate();
    
    // Setup event listeners
    this.setupTabListeners();
    this.setupSaveListeners();
    this.setupImportExportListeners();
    
    console.log('PopupManager initialized successfully');
  }

  // Setup tab navigation
  setupTabListeners() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        
        // Switch tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const content = document.getElementById('tab-' + tabId);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  }

  // Setup save button listener
  setupSaveListeners() {
    if (this.saveAllBtn) {
      this.saveAllBtn.addEventListener('click', () => this.saveAll());
    }
  }

  // Setup import/export listeners
  setupImportExportListeners() {
    this.importExport.setupListeners(
      () => this.exportConfig(),
      (e) => this.importConfig(e),
      () => this.resetConfig()
    );
  }

  // Save all settings
  async saveAll() {
    try {
      // Save all modules
      this.main.save();
      this.columns.save();
      this.types.save();
      this.money.save();
      this.manual.save();
      this.engineer.save();
      this.names.save();
      this.importExport.save();
      
      // Clear cache before saving
      if (window.ConfigManager && window.ConfigManager.clearCache) {
        await window.ConfigManager.clearCache();
      }
      
      // Save to storage via ConfigManager
      if (window.ConfigManager) {
        await window.ConfigManager.saveConfig(this.config);
        this.updateStatus('Всё сохранено!', 'success');
      } else {
        this.updateStatus('ConfigManager не найден', 'error');
      }
    } catch (error) {
      this.updateStatus('Ошибка: ' + error.message, 'error');
    }
  }

  // Export config
  exportConfig() {
    try {
      if (!window.ConfigManager) {
        this.updateStatus('ConfigManager не найден', 'error');
        return;
      }
      
      const json = window.ConfigManager.exportConfig();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vputillity-config.json';
      a.click();
      URL.revokeObjectURL(url);
      this.updateStatus('Экспортировано!', 'success');
    } catch (error) {
      this.updateStatus('Ошибка: ' + error.message, 'error');
    }
  }

  // Import config
  async importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      this.config = await window.ConfigManager.importConfig(text);
      
      // Re-initialize with new config
      this.init();
      
      this.updateStatus('Импортировано!', 'success');
    } catch (error) {
      this.updateStatus('Ошибка: ' + error.message, 'error');
    }
    
    event.target.value = '';
  }

  // Reset config
  async resetConfig() {
    if (!confirm('Сбросить все настройки?')) return;
    
    try {
      this.config = await window.ConfigManager.resetConfig();
      
      // Re-initialize with default config
      this.init();
      
      this.updateStatus('Сброшено', 'success');
    } catch (error) {
      this.updateStatus('Ошибка: ' + error.message, 'error');
    }
  }

  // Update status message
  updateStatus(message, type) {
    if (this.alertElement) {
      this.alertElement.textContent = message;
      this.alertElement.className = 'alert alert-' + type;
      this.alertElement.style.display = 'block';
      
      setTimeout(() => {
        this.alertElement.style.display = 'none';
      }, 3000);
    }
    
    if (this.statusText) {
      this.statusText.textContent = message;
    }
  }
}
