// ========== MONEY SETTINGS CLASS ==========
class MoneySettings {
  constructor(config) {
    this.config = config;
    // Payment field elements
    this.payCash = null;
    this.payCard = null;
    this.paySbp = null;
    this.mobileCash = null;
    this.mobileCard = null;
    this.returnCash = null;
    this.returnCard = null;
  }

  // Get DOM elements
  getElements() {
    this.payCash = document.getElementById('cfg-pay-cash');
    this.payCard = document.getElementById('cfg-pay-card');
    this.paySbp = document.getElementById('cfg-pay-sbp');
    this.mobileCash = document.getElementById('cfg-mobile-cash');
    this.mobileCard = document.getElementById('cfg-mobile-card');
    this.returnCash = document.getElementById('cfg-return-cash');
    this.returnCard = document.getElementById('cfg-return-card');
  }

  // Render form fields (HTML is static in popup.html)
  render() {
    // No dynamic rendering needed
  }

  // Populate form with config data
  populate() {
    if (!this.config) return;
    
    const payment = this.config.payment || {};
    
    // Buyer payment: [cash, card, sbp]
    if (payment.buyer && this.payCash) {
      this.payCash.value = payment.buyer[0] || '';
    }
    if (payment.buyer && this.payCard) {
      this.payCard.value = payment.buyer[1] || '';
    }
    if (payment.buyer && this.paySbp) {
      this.paySbp.value = payment.buyer[2] || '';
    }
    
    // Mobile payment: [cash, card]
    if (payment.mobile && this.mobileCash) {
      this.mobileCash.value = payment.mobile[0] || '';
    }
    if (payment.mobile && this.mobileCard) {
      this.mobileCard.value = payment.mobile[1] || '';
    }
    
    // Return payment: [cash, card]
    if (payment.return && this.returnCash) {
      this.returnCash.value = payment.return[0] || '';
    }
    if (payment.return && this.returnCard) {
      this.returnCard.value = payment.return[1] || '';
    }
  }

  // Save to config object
  save() {
    if (!this.config) return;
    
    if (!this.config.payment) this.config.payment = {};
    
    // Buyer payment
    this.config.payment.buyer = [
      parseInt(this.payCash?.value) || 35,
      parseInt(this.payCard?.value) || 36,
      parseInt(this.paySbp?.value) || 37
    ];
    
    // Mobile payment
    this.config.payment.mobile = [
      parseInt(this.mobileCash?.value) || 43,
      parseInt(this.mobileCard?.value) || 44
    ];
    
    // Return payment
    this.config.payment.return = [
      parseInt(this.returnCash?.value) || 41,
      parseInt(this.returnCard?.value) || 42
    ];
  }
}
