Ваш документ уже полностью соответствует стандарту Markdown (GFM). Никаких ошибок или несоответствий нет. Все заголовки, списки, таблицы, блоки кода и inline-элементы оформлены корректно.

Для вашего удобства привожу этот же документ в чистом виде (без внешних кавычек и пояснений). Вы можете скопировать его прямо в файл `docs/modules/configManager.md`:

```markdown
# ConfigManager – центральное хранилище конфигурации

**Файл:** `app/classes/configManager.js`

## Назначение

Единая точка доступа к конфигурации расширения.  
- Загружает конфиг из `chrome.storage.local` (если доступен) или из глобального `DEFAULT_CONFIG`.  
- Кеширует конфиг в памяти для быстрого доступа.  
- Предоставляет методы сохранения, сброса, экспорта, импорта.  
- Реализован как **синглтон** – один экземпляр на всё расширение.

## Глобальные зависимости

- `DEFAULT_CONFIG` – объект с настройками по умолчанию (определён в `defaultConfig.js` **до** подключения `configManager.js`).  
- `chrome.storage.local` – доступен только в контексте расширения Chrome (с permission `"storage"`).

## Экспорт в глобальную область

После инициализации в `window` создаётся объект `window.ConfigManager` со следующими методами:

```javascript
window.ConfigManager = {
  getConfig,           // async → Object
  loadConfigFromStorage, // async → Object (алиас load)
  saveConfig,          // async (config) → void
  resetConfig,         // async → Object
  exportConfig,        // () → string (JSON)
  importConfig,        // async (jsonString) → Object
  clearCache,          // () → void
  initConfig,          // async → Object (алиас getConfig)
  load,                // async → Object
  save,                // async (config) → void
  isChromeAvailable,   // () → boolean
  getInstance,         // () → экземпляр ConfigManager
  _instance            // ссылка на экземпляр (для отладки)
}
```

---

## Конструктор (приватный)

`constructor()` – не вызывать напрямую. Используйте `ConfigManager.getInstance()`.

При создании экземпляра:
- Проверяется доступность `chrome.storage.local`.  
- Результат сохраняется в `#isChromeAvailable` (приватное свойство).  
- В консоль выводится информация о доступности Chrome API.

---

## Статический метод

### `static async getInstance(): Promise<ConfigManager>`

**Вход:** нет.  
**Выход:** Promise, резолвится с единственным экземпляром `ConfigManager`.  

**Что делает:**  
- Если экземпляр ещё не создан – создаёт его и вызывает `load()`.  
- Возвращает существующий экземпляр.

**Пример:**
```javascript
const cm = await ConfigManager.getInstance();
const config = await cm.getConfig();
```

---

## Методы экземпляра (публичные)

### `async load(): Promise<Object>`

**Вход:** нет.  
**Выход:** Promise<Object> – загруженный конфиг (копия).  

**Описание:**  
- Если `chrome.storage.local` доступен – читает ключ `'config'`.  
  - Если в storage есть сохранённый конфиг – использует его.  
  - Иначе берёт `DEFAULT_CONFIG`.  
- Если Chrome API недоступен – сразу использует `DEFAULT_CONFIG`.  
- Сохраняет результат в `#cachedConfig` (кеш).  

**Примечание:** метод автоматически вызывается при инициализации синглтона. Повторный вызов перезагрузит конфиг из storage.

---

### `async save(config: Object): Promise<void>`

**Вход:** `config` – новый объект конфигурации (должен соответствовать структуре `DEFAULT_CONFIG`).  
**Выход:** `Promise<void>` – резолвится после сохранения.  

**Описание:**  
- Обновляет `#cachedConfig`.  
- Если `chrome.storage.local` доступен – записывает объект по ключу `'config'`.  
- Если API недоступен – просто обновляет кеш (в память).  

**Пример:**
```javascript
const cm = await ConfigManager.getInstance();
const newConfig = await cm.getConfig();
newConfig.theme = 'dark';
await cm.save(newConfig);
```

---

### `async getConfig(): Promise<Object>`

**Вход:** нет.  
**Выход:** `Promise<Object>` – **копия** текущего кешированного конфига.  

**Описание:**  
- Если кеш пуст (`#cachedConfig === null`), вызывает `load()`.  
- Всегда возвращает новый объект (не ссылку на внутренний), чтобы избежать мутаций.

**Пример:**
```javascript
const config = await ConfigManager.getInstance().getConfig();
console.log(config.passive);
```

---

### `async resetConfig(): Promise<Object>`

**Вход:** нет.  
**Выход:** `Promise<Object>` – новый конфиг после сброса (равен `DEFAULT_CONFIG`).  

**Описание:**  
- Вызывает `save(DEFAULT_CONFIG)`.  
- Возвращает обновлённый кеш.  
- Если `DEFAULT_CONFIG` не определён, выбрасывает ошибку `'DEFAULT_CONFIG is not defined'`.

---

### `exportConfig(): string`

**Вход:** нет.  
**Выход:** `string` – JSON-строка с отступами (2 пробела) текущего конфига.  

**Примечание:** синхронный метод. Использует `#cachedConfig` или `DEFAULT_CONFIG`, если кеш пуст.

---

### `async importConfig(jsonString: string): Promise<Object>`

**Вход:** `jsonString` – корректный JSON, соответствующий структуре конфига.  
**Выход:** `Promise<Object>` – новый конфиг после импорта.  

**Что делает:**  
- Парсит строку.  
- Вызывает `save()`.  
- При ошибке парсинга выбрасывает `new Error('Неверный JSON формат')`.

---

### `clearCache(): void`

**Вход:** нет.  
**Выход:** нет (синхронный).  

**Описание:** сбрасывает внутренний кеш (`#cachedConfig = null`, `#configLoaded = false`). Полезно для принудительной перезагрузки конфига при следующем вызове `getConfig()`.

---

### `async initConfig(): Promise<Object>`

**Вход:** нет.  
**Выход:** `Promise<Object>` – результат `getConfig()`.  

**Назначение:** совместимость со старым кодом. Просто вызывает `getConfig()`.

---

## Геттеры (свойства только для чтения)

- **`isLoaded: boolean`** – загружен ли конфиг в кеш (был ли вызов `load()`).  
- **`isChromeAvailable: boolean`** – доступен ли `chrome.storage.local` на момент создания экземпляра.

---

## Примеры использования

### Получение экземпляра и чтение конфига
```javascript
const cm = await ConfigManager.getInstance();
const config = await cm.getConfig();
console.log('Стоп-лист:', config.stopList);
```

### Изменение и сохранение
```javascript
const cm = await ConfigManager.getInstance();
let config = await cm.getConfig();
config.payment.methods = ['card', 'cash'];
await cm.save(config);
```

### Сброс к настройкам по умолчанию
```javascript
await ConfigManager.getInstance().resetConfig();
```

### Экспорт / импорт для бэкапа
```javascript
const cm = await ConfigManager.getInstance();
const backup = cm.exportConfig();
// ... сохранить backup в файл

// Восстановить
await cm.importConfig(backup);
```

### Принудительная перезагрузка из storage
```javascript
const cm = await ConfigManager.getInstance();
cm.clearCache();
const freshConfig = await cm.getConfig();
```

---

## Внутренние приватные поля (не для внешнего использования)

| Поле | Тип | Описание |
|------|-----|----------|
| `#instance` | `ConfigManager` | Статическое поле – синглтон. |
| `#cachedConfig` | `Object` | Кеш конфига. |
| `#isChromeAvailable` | `boolean` | Флаг доступности Chrome API. |
| `#configLoaded` | `boolean` | Флаг, указывающий, был ли конфиг загружен хотя бы раз. |

---

## Примечания по реализации

- В **офлайн-разработке** (без контекста расширения) `chrome.storage` недоступен – все операции идут только через `DEFAULT_CONFIG` и память.  
- В **клиентской версии** (в расширении Chrome) конфиг сохраняется в `chrome.storage.local` и сохраняется между сеансами.  
- Методы возвращают **копии** объектов, чтобы случайно не изменить внутренний кеш.  
- Все асинхронные методы корректно обрабатывают ошибки и логируют их в консоль.

---

## Связанные файлы

- `app/defaultConfig.js` – эталонный конфиг.  
- `web/background.js` – может использовать `ConfigManager` для чтения/записи конфига.  
- `web/popup.js` – вызывает `window.ConfigManager.saveConfig()` и `getConfig()`.  
- `monitorClass.js` – ожидает `ConfigManager.getInstance()` перед запуском логики.
```

Если вы планируете добавить отдельную документацию для `Monitor` с учётом нового способа получения `ConfigManager`, я могу подготовить аналогичный чистый файл.
