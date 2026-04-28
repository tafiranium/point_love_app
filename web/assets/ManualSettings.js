// ========== MANUAL SETTINGS CLASS ==========
class ManualSettings {
  constructor(config, schema) {
    this.config = config;
    this.schema = schema;
    this.stopInput = null;
  }

  // Get DOM elements
  getElements() {
    this.stopInput = document.getElementById('cfg-stop');
  }

  // Render form fields (HTML is static in popup.html)
  render() {
    // No dynamic rendering needed
  }

  // Populate form with config data
  populate() {
    if (!this.stopInput) return;
    console.log(this.config)
    // Get stopList from config, fallback to schema defaults
    const stopList = this.config?.stopList || this.schema?.stopList || [];
    this.stopInput.value = stopList.join(', ');
  }

  // Save to config object
  save() {
    if (!this.config || !this.stopInput) return;
    
    this.config.stopList = this.stopInput.value
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
  }
}
