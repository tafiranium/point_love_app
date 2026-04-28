# MonitorClass – центральный диспетчер SPA

**Файл:** `app/classes/monitorClass.js`

## Назначение

Отслеживает URL на страницах myVirtual POS (в том числе при навигации внутри SPA).  
В зависимости от типа страницы запускает `App` (для чека) или `SaleManager` (для списка продаж).  
Обеспечивает очистку ресурсов при смене страницы и перезапуск `SaleManager` при изменениях таблицы/пагинации.

## Зависимости

- `window.location.href` – для определения текущего URL.
- `DEFAULT_CONFIG` (глобально) или `configure` (глобальная переменная с конфигом).
- `App` (глобальный класс из `appClass.js`).
- `SaleManager` (глобальный класс из `manageClass.js`).
- Вспомогательные модули: `interface.js`, `tables.js` и др. (не используются напрямую, но нужны для `App`/`SaleManager`).

## Конструктор

`constructor()` – не принимает параметров.  
Вызывает `this.init()` асинхронно.

## Свойства экземпляра (из кода)

| Свойство | Тип | Описание |
|----------|-----|----------|
| `url_template` | Object | Шаблоны для определения типа страницы: `view` и `manage`. |
| `current` | string | Последний известный URL. |
| `currentApp` | Object|null | Текущий запущенный экземпляр `App` или `SaleManager`. |
| `appType` | string|null | Тип запущенного приложения: `'main'` или `'sale'`. |
| `observer` | MutationObserver|null | Наблюдатель за изменениями DOM (для отслеживания URL). |
| `tableObserver` | MutationObserver|null | Наблюдатель за изменениями таблицы `#receipts-grid`. |

## Методы

### `async init()`

**Вход:** нет.  
**Выход:** Promise (void).  

**Что делает:**  
- Ждёт появления глобальной переменной `configure` (конфиг).  
- Вызывает `routeByUrl(this.current)`.  
- Запускает `trackUrlChanges()`.

### `getPageType(url)`

**Вход:** `url` – строка.  
**Выход:** `'view'`, `'manage'` или `null`.  

**Пример:**  
`getPageType('https://tl.myvirtualpos.ru/console/sales/view/id/123')` → `'view'`.

### `getTargetDoc()`

**Вход:** нет.  
**Выход:** `Document` – если URL содержит `cpanel`, возвращает `contentDocument` из `main iframe`, иначе `window.document`.

### `findGrid()`

**Вход:** нет.  
**Выход:** `HTMLElement` – элемент с `id="receipts-grid"` (в целевом документе) или `null`.

### `async waitForGrid()`

**Вход:** нет.  
**Выход:** `Promise<HTMLElement>` – резолвится, когда таблица появляется в DOM.

### `async setupSaleManagerObserver()`

**Вход:** нет.  
**Выход:** Promise (void).  

**Что делает:**  
- Ждёт таблицу `#receipts-grid`.  
- Создаёт `tableObserver`, следящий за изменениями внутри таблицы (перезапускает `SaleManager` при любых изменениях).

### `restartSaleManager()`

**Вход:** нет.  
**Выход:** нет.  

**Что делает:**  
- Сбрасывает `this.currentApp = null`, если тип был `sale`.  
- Вызывает `attemptRestart(0)`.

### `attemptRestart(attempt)`

**Вход:** `attempt` – число (номер попытки).  
**Выход:** нет (рекурсивный таймер).  

**Что делает:**  
- С задержкой (от 100 до 1000 мс) проверяет, есть ли в таблице строки.  
- Если есть – создаёт `new SaleManager()`, устанавливает `this.appType = 'sale'`.  
- Если нет – повторяет до 5 раз.

### `startMainApp()`

**Вход:** нет.  
**Выход:** нет.  

**Что делает:**  
- Очищает предыдущее приложение, удаляет его интерфейс.  
- Создаёт `new App({ config: configure, start_key: sets.start_key })`.  
- Устанавливает `this.appType = 'main'`.

### `cleanup()`

**Вход:** нет.  
**Выход:** нет.  

**Что делает:**  
- Отключает `tableObserver`.  
- Пытается удалить DOM-элементы интерфейса (ищет `.wrapper` и вызывает `remove()` у интерфейса текущего приложения).  
- Обнуляет `currentApp`, `appType`.

### `async routeByUrl(url)`

**Вход:** `url` – текущий URL.  
**Выход:** Promise (void).  

**Что делает:**  
- Вызывает `cleanup()`.  
- Если тип страницы `view` → `startMainApp()`.  
- Если `manage` → `setupSaleManagerObserver()`, затем `restartSaleManager()` и `startPaginationTracking()`.  
- Если неизвестный тип – только лог.

### `trackUrlChanges()`

**Вход:** нет.  
**Выход:** нет.  

**Что делает:**  
- Устанавливает `MutationObserver` на `document` для отслеживания изменений в DOM (перехватывает смену URL при SPA-навигации).  
- Дополнительно опрашивает URL через `setInterval` (каждые 500 мс) – резервный механизм.

### `startPaginationTracking()`

**Вход:** нет.  
**Выход:** нет.  

**Что делает:**  
- Добавляет обработчики событий на пагинацию (контейнер `#yw10` или `.pagination`) – при клике по ссылке через 800 мс вызывает `restartSaleManager()`.  
- Отслеживает изменение выпадающего списка `#displayCount` (количество записей на странице).  
- Запускает `MutationObserver` на `body` для перехвата динамически добавленных элементов пагинации.

### `destroy()`

**Вход:** нет.  
**Выход:** нет.  

**Что делает:**  
- Отключает `observer` (отслеживание URL).  
- Вызывает `cleanup()`.

## Пример использования (автоматически при загрузке)

```javascript
// В monitorClass.js после объявления класса
const monitor = new Monitor();  // автоматически запускает init()