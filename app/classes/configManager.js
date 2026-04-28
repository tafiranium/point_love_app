// Менеджер конфигурации - управление загрузкой и сохранением конфига из chrome.storage
// Реализован как класс с синглтоном

class ConfigManager {
  // Приватное статическое свойство для единственного экземпляра
  static #instance = null;
  
  // Приватные свойства экземпляра
  #cachedConfig = null;
  #isChromeAvailable = false;
  #configLoaded = false;

  // Приватный конструктор
  constructor() {
    // Сначала проверяем наличие chrome и его API
    try {
      // Проверяем существование chrome и его свойств
      const hasChrome = typeof chrome !== 'undefined';
      const hasStorage = hasChrome && chrome.storage;
      const hasLocal = hasStorage && chrome.storage.local;
      
      this.#isChromeAvailable = hasChrome && hasStorage && hasLocal;
      
      // Для отладки - логируем только при доступности
      if (this.#isChromeAvailable) {
        console.log('ConfigManager: ✅ Chrome API доступен');
      } else {
        console.log('ConfigManager: ❌ Chrome API НЕ доступен');
        if (!hasChrome) console.log('  - Причина: chrome объект не определен');
        else if (!hasStorage) console.log('  - Причина: chrome.storage не доступен');
        else if (!hasLocal) console.log('  - Причина: chrome.storage.local не доступен');
      }
    } catch (e) {
      console.log('ConfigManager: ❌ ошибка при проверке Chrome API:', e);
      this.#isChromeAvailable = false;
    }
    
    // Исправлено: выводим true/false вместо undefined
    console.log('ConfigManager: инициализирован, Chrome API доступен:', this.#isChromeAvailable === true);
  }

  // Статический метод для получения единственного экземпляра
  static async getInstance() {
    if (ConfigManager.#instance === null) {
      ConfigManager.#instance = new ConfigManager();
      // При первом вызове загружаем конфиг
      await ConfigManager.#instance.load();
    }
    return ConfigManager.#instance;
  }

  // Загрузка конфига из storage
  async load() {
    console.log('ConfigManager: загрузка конфига...');
    
    if (!this.#isChromeAvailable) {
      // Проверяем, что DEFAULT_CONFIG существует
      if (typeof DEFAULT_CONFIG === 'undefined') {
        console.error('❌ ConfigManager: DEFAULT_CONFIG не определен при загрузке!');
        this.#cachedConfig = {};
      } else {
        this.#cachedConfig = { ...DEFAULT_CONFIG }; // Создаем копию
      }
      this.#configLoaded = true;
      console.log('ConfigManager: ✅ используется DEFAULT_CONFIG (Chrome API недоступен)');
      console.log('ConfigManager: текущий конфиг:', this.#cachedConfig);
      return this.#cachedConfig;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get('config', (result) => {
          if (chrome.runtime.lastError) {
            console.warn('ConfigManager: ⚠️ ошибка при чтении storage:', chrome.runtime.lastError);
            this.#cachedConfig = typeof DEFAULT_CONFIG !== 'undefined' ? { ...DEFAULT_CONFIG } : {};
            this.#configLoaded = true;
            resolve(this.#cachedConfig);
            return;
          }

          if (result.config) {
            this.#cachedConfig = result.config;
            console.log('ConfigManager: ✅ конфиг загружен из storage');
          } else {
            this.#cachedConfig = typeof DEFAULT_CONFIG !== 'undefined' ? { ...DEFAULT_CONFIG } : {};
            console.log('ConfigManager: ⚠️ конфиг в storage не найден, используется DEFAULT_CONFIG');
          }
          this.#configLoaded = true;
          resolve(this.#cachedConfig);
        });
      } catch (e) {
        console.error('ConfigManager: ❌ исключение при загрузке:', e);
        this.#cachedConfig = typeof DEFAULT_CONFIG !== 'undefined' ? { ...DEFAULT_CONFIG } : {};
        this.#configLoaded = true;
        resolve(this.#cachedConfig);
      }
    });
  }

  // Сохранение конфига в storage
  async save(config) {
    console.log('ConfigManager: сохранение конфига...');
    
    if (!this.#isChromeAvailable) {
      this.#cachedConfig = { ...config };
      console.log('ConfigManager: ⚠️ конфиг сохранен только в память (Chrome API недоступен)');
      console.log('ConfigManager: текущий конфиг в памяти:', this.#cachedConfig);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ config: config }, () => {
          if (chrome.runtime.lastError) {
            console.error('ConfigManager: ❌ ошибка при сохранении:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          this.#cachedConfig = { ...config };
          console.log('ConfigManager: ✅ конфиг сохранен в storage');
          resolve();
        });
      } catch (e) {
        console.error('ConfigManager: ❌ исключение при сохранении:', e);
        reject(e);
      }
    });
  }

  // Получение текущего кешированного конфига
  async getConfig() {
    if (this.#cachedConfig === null) {
      await this.load();
    }
    return { ...this.#cachedConfig }; // Возвращаем копию
  }

  // Сброс конфига до DEFAULT_CONFIG
  async resetConfig() {
    console.log('ConfigManager: сброс конфига до DEFAULT_CONFIG');
    if (typeof DEFAULT_CONFIG === 'undefined') {
      console.error('❌ ConfigManager: Cannot reset - DEFAULT_CONFIG is undefined');
      throw new Error('DEFAULT_CONFIG is not defined');
    }
    await this.save(DEFAULT_CONFIG);
    return this.#cachedConfig;
  }

  // Экспорт конфига в JSON строку
  exportConfig() {
    const config = this.#cachedConfig || DEFAULT_CONFIG;
    console.log('ConfigManager: экспорт конфига');
    return JSON.stringify(config, null, 2);
  }

  // Импорт конфига из JSON строки
  async importConfig(jsonString) {
    try {
      const config = JSON.parse(jsonString);
      await this.save(config);
      console.log('ConfigManager: ✅ конфиг импортирован');
      return this.#cachedConfig;
    } catch (e) {
      console.error('ConfigManager: ❌ ошибка импорта:', e);
      throw new Error('Неверный JSON формат');
    }
  }

  // Очистка кеша без сохранения
  clearCache() {
    this.#cachedConfig = null;
    this.#configLoaded = false;
    console.log('ConfigManager: кеш очищен');
  }

  // Инициализация конфига (для совместимости со старым кодом)
  async initConfig() {
    console.log('ConfigManager: initConfig вызван');
    const config = await this.getConfig();
    return config;
  }

  // Геттеры для доступа к приватным свойствам (для отладки)
  get isLoaded() {
    return this.#configLoaded;
  }

  get isChromeAvailable() {
    return this.#isChromeAvailable;
  }
}

// Инициализация и экспорт синглтона
(async () => {
  try {
    console.log('ConfigManager: инициализация синглтона...');
    const instance = await ConfigManager.getInstance();
    
    // Экспорт в window для совместимости со старым кодом
    if (typeof window !== 'undefined') {
      window.ConfigManager = {
        // Основные методы
        getConfig: () => instance.getConfig(),
        loadConfigFromStorage: () => instance.load(),
        saveConfig: (config) => instance.save(config),
        resetConfig: () => instance.resetConfig(),
        exportConfig: () => instance.exportConfig(),
        importConfig: (jsonString) => instance.importConfig(jsonString),
        clearCache: () => instance.clearCache(),
        
        // Для совместимости
        initConfig: () => instance.initConfig(),
        
        // Дополнительные методы
        load: () => instance.load(),
        save: (config) => instance.save(config),
        
        // Геттеры
        isChromeAvailable: () => instance.isChromeAvailable,
        
        // Прямой доступ к экземпляру (для продвинутого использования)
        getInstance: () => instance,
        
        // Ссылка на экземпляр (для обратной совместимости)
        _instance: instance
      };
      
      console.log('✅ ConfigManager: экземпляр создан и доступен через window.ConfigManager');
      
      // Проверяем, что конфиг загружен
      const config = await window.ConfigManager.getConfig();
      const configKeys = Object.keys(config);
      console.log(`📋 Текущая конфигурация: ${configKeys.length} ключей`);
      
      // Выводим основные ключи для информации
      if (configKeys.length > 0) {
        console.log('📋 Основные разделы конфига:', configKeys);
      }
    }
  } catch (e) {
    console.error('❌ ConfigManager: критическая ошибка при создании экземпляра:', e);
    // Создаем fallback для предотвращения ошибок в старом коде
    if (typeof window !== 'undefined' && !window.ConfigManager) {
      const fallbackConfig = typeof DEFAULT_CONFIG !== 'undefined' ? DEFAULT_CONFIG : {};
      window.ConfigManager = {
        getConfig: async () => ({ ...fallbackConfig }),
        saveConfig: async (config) => console.log('Fallback save:', config),
        resetConfig: async () => console.log('Fallback reset'),
        isChromeAvailable: false,
        getInstance: () => null
      };
      console.log('⚠️ ConfigManager: создан fallback объект');
    }
  }
})();

// Также слушаем popstate (навигация вперед/назад)
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    console.log('📌 Навигация (popstate):', window.location.href);
  });
}