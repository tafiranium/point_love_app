// ========== POPUP.JS - Main Entry Point ==========
// Uses modular architecture with settings classes

// Global config reference
let currentConfig = null;
let popupManager = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
  // Small delay to ensure everything is loaded
  setTimeout(async () => {
    try {
      // Load config using new ConfigManager singleton
      await loadConfig();
      
      // Initialize PopupManager with config and schema
      popupManager = new PopupManager(currentConfig, CONFIG_SCHEMA);
      popupManager.init();
    } catch (error) {
      console.error('Init error:', error);
    }
  }, 100);
});

// ========== CONFIG LOAD ==========
async function loadConfig() {
  try {
    if (window.ConfigManager && window.ConfigManager._instance) {
      // Use new singleton instance
      const manager = window.ConfigManager._instance;
      currentConfig = await manager.getConfig();
    } else if (window.ConfigManager && window.ConfigManager.getConfig) {
      // Fallback for compatibility - use getConfig method
      currentConfig = await window.ConfigManager.getConfig();
    } else {
      // Fallback if ConfigManager not available
      currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
  } catch (error) {
    console.error('Error loading config:', error);
    currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

(function() {
  // Корневой прокручиваемый элемент (обычно document.scrollingElement)
  const scrollable = document.scrollingElement || document.documentElement || document.body;

  // Функция сброса корневой прокрутки
  function resetRootScroll() {
    if (scrollable.scrollTop !== 0) {
      scrollable.scrollTop = 0;
    }
    if (scrollable.scrollLeft !== 0) {
      scrollable.scrollLeft = 0;
    }
  }

  // --- 1. Событийные обработчики (мгновенный сброс) ---
  scrollable.addEventListener('scroll', resetRootScroll, { passive: false });

  // Блокировка колёсика мыши
  window.addEventListener('wheel', function(e) {
    const target = e.target;
    const isInnerScrollable = target.closest && target.closest(
      '[style*="overflow: auto"], [style*="overflow-y: auto"], [style*="overflow: scroll"], [style*="overflow-x: auto"], [style*="overflow-x: scroll"]'
    );
    if (!isInnerScrollable) {
      resetRootScroll();
    }
  }, { passive: false });

  // Блокировка touch-свайпов (мобильные устройства)
  let touchStartY = 0;
  window.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: false });
  window.addEventListener('touchmove', function(e) {
    const dy = e.touches[0].clientY - touchStartY;
    const target = e.target;
    const isInnerScrollable = target.closest && target.closest(
      '[style*="overflow: auto"], [style*="overflow-y: auto"], [style*="overflow: scroll"]'
    );
    if (!isInnerScrollable && Math.abs(dy) > 5) {
      resetRootScroll();
      e.preventDefault(); // предотвращает прокрутку корневого элемента
    }
  }, { passive: false });

  // Сброс при изменении размеров окна (редко, но для надёжности)
  window.addEventListener('resize', resetRootScroll);

  // --- 2. Периодическая проверка каждые 100 мс (дополнительная страховка) ---
  const intervalId = setInterval(resetRootScroll, 50);

  // Очистка интервала при выгрузке страницы (хороший тон для расширений)
  window.addEventListener('beforeunload', function() {
    clearInterval(intervalId);
  });

  // Немедленный сброс при загрузке
  resetRootScroll();
})();

