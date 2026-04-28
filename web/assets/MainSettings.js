// ========== MAIN SETTINGS CLASS ==========
class MainSettings {
  constructor(config) {
    this.config = config;
    this.sizeInput = null;
    this.shopTypeCheckbox = null;
    this.timeStartInput = null;
    this.timeEndInput = null;
  }

  // Get DOM elements
  getElements() {
    this.sizeInput = document.getElementById('cfg-main-size');
    this.shopTypeCheckbox = document.getElementById('cfg-shop-type');
    this.timeStartInput = document.getElementById('cfg-time-shift-start');
    this.timeEndInput = document.getElementById('cfg-time-shift-end');
  }

  // Render form fields (HTML is static in popup.html)
  render() {
    // No dynamic rendering needed
  }

  // Populate form with config data
  populate() {
    if (!this.config) return;
    
    if (this.sizeInput) this.sizeInput.value = this.config.size || 42;
    
    // checkbox checked = shop_type = 1 (круглосуточный)
    // checkbox unchecked = shop_type = 0 (обычный)
    if (this.shopTypeCheckbox) {
      this.shopTypeCheckbox.checked = (this.config.shop_type === 1);
    }
    
    if (this.timeStartInput) this.timeStartInput.value = this.config.start || 10;
    if (this.timeEndInput) this.timeEndInput.value = this.config.end || 22;
  }

  // Save to config object
  save() {
    if (!this.config) return;
    
    this.config.size = parseInt(this.sizeInput?.value) || 42;
    
    // checkbox checked = 1, unchecked = 0
    if (this.shopTypeCheckbox) {
      this.config.shop_type = this.shopTypeCheckbox.checked ? 1 : 0;
    }
    
    this.config.start = parseInt(this.timeStartInput?.value) || 10;
    this.config.end = parseInt(this.timeEndInput?.value) || 22;
  }
}
