// ========== TYPES SETTINGS CLASS ==========
class TypesSettings {
  constructor(config, schema) {
    this.config = config;
    this.schema = schema;
    this.buyerContainer = null;
    this.marketContainer = null;
    this.mobileContainer = null;
    this.subTabButtons = null;
  }

  getElements() {
    this.buyerContainer = document.getElementById('buyer-sources');
    this.marketContainer = document.getElementById('market-sources');
    this.mobileContainer = document.getElementById('mobile-sources');
    this.subTabButtons = document.querySelectorAll('.type-sub-tab');
  }

  render() {}

  getOrderedKeys(type, dataMap) {
    const order = this.config?.typesOrder?.[type] || [];
    const keys = Object.keys(dataMap);
    if (order.length === 0) return keys;
    const orderedKeys = [];
    const remainingKeys = [];
    for (const orderedKey of order) {
      if (keys.includes(orderedKey)) orderedKeys.push(orderedKey);
    }
    for (const key of keys) {
      if (!orderedKeys.includes(key)) remainingKeys.push(key);
    }
    return [...orderedKeys, ...remainingKeys];
  }

  populate() {
    if (!this.config) return;
    this.renderTypeList('buyer', this.config.buyerSources || {});
    this.renderTypeList('market', this.config.marketSources || {});
    this.renderTypeList('mobile', this.config.mobileSources || {});
    this.setupSubTabs();
  }

  renderTypeList(type, dataMap) {
    const container = document.getElementById(type + '-sources');
    if (!container) return;
    const defaults = this.getDefaults(type);
    const orderedKeys = this.getOrderedKeys(type, dataMap);
    container.innerHTML = '';
    if (orderedKeys.length === 0 && Object.keys(dataMap).length === 0) {
      defaults.forEach((item) => {
        container.appendChild(this.createTypeRow(item.name, item.default, type));
      });
    } else {
      orderedKeys.forEach((name) => {
        const value = dataMap[name] || 0;
        container.appendChild(this.createTypeRow(name, value, type));
      });
    }
    this.updateIndexes(container);
  }

  createTypeRow(name, value, type) {
    const div = document.createElement('div');
    div.className = 'type-item';
    div.dataset.type = type;
    div.dataset.name = name;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'type-name';
    nameInput.value = name;
    nameInput.placeholder = 'Название';

    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.className = 'type-number';
    numInput.value = value;
    numInput.placeholder = '№';

    const upBtn = document.createElement('button');
    upBtn.innerHTML = '▲';
    upBtn.className = 'move-up-btn';
    upBtn.title = 'Переместить вверх';
    upBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentDiv = upBtn.closest('.type-item');
      const container = currentDiv.parentElement;
      const currentIndex = Array.from(container.children).indexOf(currentDiv);
      this.moveTypeItem(type, currentIndex, -1);
    });

    const downBtn = document.createElement('button');
    downBtn.innerHTML = '▼';
    downBtn.className = 'move-down-btn';
    downBtn.title = 'Переместить вниз';
    downBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentDiv = downBtn.closest('.type-item');
      const container = currentDiv.parentElement;
      const currentIndex = Array.from(container.children).indexOf(currentDiv);
      this.moveTypeItem(type, currentIndex, 1);
    });

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '×';
    removeBtn.className = 'btn-remove-type';
    removeBtn.setAttribute('data-type', type);
    removeBtn.setAttribute('data-name', name);
    removeBtn.addEventListener('click', () => {
      div.remove();
      this.updateIndexes(document.getElementById(type + '-sources'));
      this.saveOrderToConfig(type);
    });

    div.appendChild(nameInput);
    div.appendChild(numInput);
    div.appendChild(upBtn);
    div.appendChild(downBtn);
    div.appendChild(removeBtn);
    return div;
  }

  moveTypeItem(type, fromIndex, direction) {
    const container = document.getElementById(type + '-sources');
    if (!container) return;
    const items = Array.from(container.children);
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= items.length) return;
    if (direction === -1) {
      container.insertBefore(items[fromIndex], items[toIndex]);
    } else {
      container.insertBefore(items[toIndex + 1], items[fromIndex]);
    }
    this.updateIndexes(container);
    this.saveOrderToConfig(type);
    this.showAlert('Порядок типов изменён', 'success');
  }

  saveOrderToConfig(type) {
    const container = document.getElementById(type + '-sources');
    if (!container) return;
    if (!this.config.typesOrder) this.config.typesOrder = { buyer: [], market: [], mobile: [] };
    if (!this.config.typesOrder[type]) this.config.typesOrder[type] = [];
    const items = Array.from(container.children);
    this.config.typesOrder[type] = items.map(item => item.dataset.name);
    const event = new CustomEvent('configUpdated', { detail: this.config });
    document.dispatchEvent(event);
  }

  updateIndexes(container) {
    if (!container) return;
    Array.from(container.children).forEach((child, i) => {
      child.dataset.index = i;
    });
  }

  getDefaults(type) {
    const defaults = {
      buyer: this.schema?.buyerSources || [],
      market: this.schema?.marketSources || [],
      mobile: this.schema?.mobileSources || []
    };
    return defaults[type] || [];
  }

  setupSubTabs() {
    const contents = document.querySelectorAll('.type-tab-content');
    this.subTabButtons.forEach(tab => {
      tab.addEventListener('click', function() {
        const type = this.dataset.type;
        document.querySelectorAll('.type-sub-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        contents.forEach(c => c.classList.remove('active'));
        document.getElementById('type-' + type).classList.add('active');
      });
    });
    document.querySelectorAll('.btn-add-type').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', () => {
        this.addNewType(newBtn.dataset.type);
      });
    });
  }

  addNewType(type) {
    const container = document.getElementById(type + '-sources');
    if (!container) return;
    const name = prompt('Введите название нового типа продаж:');
    if (!name || !name.trim()) return;
    const newRow = this.createTypeRow(name.trim(), 0, type);
    container.appendChild(newRow);
    this.updateIndexes(container);
    this.saveOrderToConfig(type);
    this.showAlert('Тип добавлен', 'success');
  }

  showAlert(message, type = 'info') {
    const alertDiv = document.getElementById('alert');
    if (alertDiv) {
      alertDiv.textContent = message;
      alertDiv.className = `alert alert-${type}`;
      alertDiv.style.display = 'block';
      setTimeout(() => {
        alertDiv.style.display = 'none';
      }, 2000);
    }
  }

  save() {
    if (!this.config) return;
    const buyerMap = {};
    document.querySelectorAll('#buyer-sources .type-item').forEach(item => {
      const name = item.querySelector('.type-name').value.trim();
      const num = parseInt(item.querySelector('.type-number').value) || 0;
      if (name) buyerMap[name] = num;
    });
    this.config.buyerSources = buyerMap;
    const marketMap = {};
    document.querySelectorAll('#market-sources .type-item').forEach(item => {
      const name = item.querySelector('.type-name').value.trim();
      const num = parseInt(item.querySelector('.type-number').value) || 0;
      if (name) marketMap[name] = num;
    });
    this.config.marketSources = marketMap;
    const mobileMap = {};
    document.querySelectorAll('#mobile-sources .type-item').forEach(item => {
      const name = item.querySelector('.type-name').value.trim();
      const num = parseInt(item.querySelector('.type-number').value) || 0;
      if (name) mobileMap[name] = num;
    });
    this.config.mobileSources = mobileMap;
    this.saveOrderToConfig('buyer');
    this.saveOrderToConfig('market');
    this.saveOrderToConfig('mobile');
  }
}