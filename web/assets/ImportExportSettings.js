// ========== IMPORT/EXPORT SETTINGS CLASS ==========
class ImportExportSettings {
  constructor(config) {
    this.config = config;
    this.exportBtn = null;
    this.importBtn = null;
    this.importFile = null;
    this.resetBtn = null;
  }

  // Get DOM elements
  getElements() {
    this.exportBtn = document.getElementById('btn-export');
    this.importBtn = document.getElementById('btn-import');
    this.importFile = document.getElementById('import-file');
    this.resetBtn = document.getElementById('btn-reset');
  }

  // Render form fields (HTML is static in popup.html)
  render() {
    // No dynamic rendering needed
  }

  // Populate form with config data
  populate() {
    // Import/Export doesn't need to populate form data
  }

  // Setup event listeners
  setupListeners(onExport, onImport, onReset) {
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', onExport);
    }
    
    if (this.importBtn && this.importFile) {
      this.importBtn.addEventListener('click', () => {
        this.importFile.click();
      });
      this.importFile.addEventListener('change', onImport);
    }
    
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', onReset);
    }
  }

  // Save to config object (Import/Export doesn't save to config)
  save() {
    // Nothing to save - these are action buttons
  }
}
