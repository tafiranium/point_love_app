

// ========== app/defaultConfig.js ==========
// ========== DEFAULT CONFIG ==========
// New flat config format matching schema.js

const DEFAULT_CONFIG = {
    // Passive columns - column numbers for passive view
    // Новый формат: { col: number, turn_on: 0|1 }
    passive: {
        shift: { col: 0, turn_on: 1 },
        date: { col: 1, turn_on: 1 },
        time: { col: 2, turn_on: 1 },
        name: { col: 40, turn_on: 1 },
        enter: { col: 3, turn_on: 1 },
        no_client: { col: 4, turn_on: 1 },
        nc: { col: 4, turn_on: 1 },
        six: { col: 24, turn_on: 1 },
        order: { col: 26, turn_on: 1 },
        comments: { col: 31, turn_on: 1 },
        articles: { col: 34, turn_on: 1 },
        buys: { col: 32, turn_on: 1 },
        items_count: { col: 33, turn_on: 1 },
        dc: { col: 21, turn_on: 1 },
        order_number: { col: 39, turn_on: 1 }
    },
    
    // Details settings - column numbers for detail view
    details: {
        seller: [2, 'a', true],
        datetime: [3, 'td', true],
        traffic: [19, 'td', true],
        reason: [21, 'td', true],
        dc: [15, 'td *', true],
        buyer: [16, 'td *', true],
        return: [17, '', false],
        comment: [22, 'td', true]
    },
    
    // Sales types - buyer sources (entry)
    buyerSources: {
        'Сайт': 5,
        'Вывеска-пеш': 6,
        'Вывеска-авто': 7,
        'Постоянный': 8,
        'Соседи': 9,
        'СМИ': 10,
        'Партнеры': 11,
        'Яндекс': 13,
        'Гугл': 12,
        '2ГИЗ': 14,
        'По рекомендации': 15,
        'Прочее': 18
    },
    
    // Sales types - market sources
    marketSources: {
        'Яндекс Маркет': 29,
        'Яндекс Еда (Деливери)': 29,
        'ОЗОН': 30,
        'Сбер': 30
    },
    
    // Sales types - mobile sources
    mobileSources: {
        'Приложение': 27,
        'Сайт Страсть': 27
    },
    
    // Sales types - takeup (pickup)
    takeupSources: {
        'Самовывоз': 28
    },
    
    // Порядок отображения типов для каждой категории
    typesOrder: {
        buyer: [
            'Сайт',
            'Вывеска-пеш',
            'Вывеска-авто',
            'Постоянный',
            'Соседи',
            'СМИ',
            'Партнеры',
            'Яндекс',
            'Гугл',
            '2ГИЗ',
            'По рекомендации',
            'Прочее'
        ],
        market: [
            'Яндекс Маркет',
            'Яндекс Еда (Деливери)',
            'ОЗОН',
            'Сбер'
        ],
        mobile: [
            'Приложение',
            'Сайт Страсть'
        ]
    },
    
    // Engineer settings - selectors and details config
    ingeneerSettings: {
        selectors: {
            tables: {
                main: 'table#detail-view',
                mone: 'table#price-detail-view',
                sale: '#yw2',
                item: '#receipt-items table.items.table tbody tr',
                coun: 'div#receipt-items div.summary',
                money: [34, 33, 35]
            }
        },
        details: {
            seller: [2, 'a', true],
            datetime: [3, 'td', true],
            traffic: [19, 'td', true],
            reason: [21, 'td', true],
            dc: [15, 'td *', true],
            buyer: [16, 'td *', true],
            return: [17, '', false],
            comment: [22, 'td', true]
        }
    },
    
    // Stop articles (not counted in calculations)
    stopList: [0, 26702, 47586, 47586, 26795, 47650, 48263, 47660, 48568, 48568, 48457, 48567, 48263, 48261, 48491, 48495, 26279, 26280, 26795, 47177, 48168, 48327, 48570, 995, 996, 997, 26713, 26284, 26348, 26694, 26702, 26711, 26743, 26745],
    
    // Payment settings
    payment: {
        buyer: [35, 36, 37],    // cash, card, sbp
        mobile: [43, 44],        // cash, card for mobile
        return: [41, 42]         // cash, card for returns
    },
    
    // Main settings
    size: 42,          // columns count
    start: 10,         // shift start hour
    end: 22,           // shift end hour
    shop_type: 1,      // 1 - 24/7, 0 - daytime only
    
    // Names - mapping from original name to table name
    // { "Цао Джен Хао": "Цао Ч. Цао Джен Хао" }
    names: {}
};

function getDefaultConfig() {
    return DEFAULT_CONFIG;
}

// ========== app/classes/configManager.js ==========
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
    // Проверка доступности Chrome API
    try {
      this.#isChromeAvailable = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    } catch (e) {
      console.log('Chrome API недоступен:', e);
      this.#isChromeAvailable = false;
    }
    console.log('ConfigManager: инициализирован, Chrome API доступен:', this.#isChromeAvailable);
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
      this.#cachedConfig = DEFAULT_CONFIG;
      this.#configLoaded = true;
      console.log('ConfigManager: используется DEFAULT_CONFIG (Chrome недоступен)');
      return this.#cachedConfig;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get('config', (result) => {
          if (chrome.runtime.lastError) {
            console.log('ConfigManager: ошибка при чтении storage:', chrome.runtime.lastError);
            this.#cachedConfig = DEFAULT_CONFIG;
            this.#configLoaded = true;
            resolve(this.#cachedConfig);
            return;
          }

          if (result.config) {
            this.#cachedConfig = result.config;
            console.log('ConfigManager: конфиг загружен из storage');
          } else {
            this.#cachedConfig = DEFAULT_CONFIG;
            console.log('ConfigManager: конфиг в storage не найден, используется DEFAULT_CONFIG');
          }
          this.#configLoaded = true;
          resolve(this.#cachedConfig);
        });
      } catch (e) {
        console.log('ConfigManager: исключение при загрузке:', e);
        this.#cachedConfig = DEFAULT_CONFIG;
        this.#configLoaded = true;
        resolve(this.#cachedConfig);
      }
    });
  }

  // Сохранение конфига в storage
  async save(config) {
    console.log('ConfigManager: сохранение конфига...');
    
    if (!this.#isChromeAvailable) {
      this.#cachedConfig = config;
      console.log('ConfigManager: конфиг сохранен в память (Chrome недоступен)');
      return;
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ config: config }, () => {
        if (chrome.runtime.lastError) {
          console.log('ConfigManager: ошибка при сохранении:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        this.#cachedConfig = config;
        console.log('ConfigManager: конфиг сохранен в storage');
        resolve();
      });
    });
  }

  // Получение текущего кешированного конфига
  async getConfig() {
    if (this.#cachedConfig === null) {
      await this.load();
    }
    return this.#cachedConfig;
  }

  // Сброс конфига до DEFAULT_CONFIG
  async resetConfig() {
    await this.save(DEFAULT_CONFIG);
    console.log('ConfigManager: конфиг сброшен до DEFAULT_CONFIG');
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
      console.log('ConfigManager: конфиг импортирован');
      return this.#cachedConfig;
    } catch (e) {
      console.log('ConfigManager: ошибка импорта:', e);
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
        
        // Ссылка на экземпляр
        _instance: instance
      };
      
      console.log('ConfigManager: экземпляр создан и доступен через window.ConfigManager');
    }
  } catch (e) {
    console.error('ConfigManager: ошибка при создании экземпляра:', e);
  }
})();

// Также слушаем popstate (навигация вперед/назад)
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    console.log('Навигация (popstate):', window.location.href);
  });
}


// ========== app/classes/assets/interface.js ==========
// КЛАСС ИНТЕРФЕЙСА, САМЫЙ ЛАЙТОВЫЙ КЛАСС
// ПРОСТОР ДЛЯ ФАНТИАЗИИ
class Interface {

    async run(html) {

        // СОДЕРЖИМОЕ СТРАНИЦЫ ДЛЯ РЕДАКТИРОВАНИЯ
        this.html = html

        // ЦВЕТА ПРИЛОЖЕНИЯ
        const text_color = "#616161"
        const background_color = "white"
        const border_color = "#b3b1b1"
        const border_second_color = "#0088cc"

        // СТИЛИ ПРИЛОЖЕНИЯ
        const styles = {
            appwrapper: {
                height: "8vh",
                width: "auto",
                right: "0",
                bottom: "3vh",
                position: "fixed",
                zIndex: "100",
                display: "flex",
                gridTemplateColumns: "repeat(8, 20vh)"
              },
            spans: {
              position: "relative",
              height: "100%",
              width: "7vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              color: text_color,
              background: background_color,
              border: "solid 1px" + border_color,
              paddingInline: "1vh",
              fontSize: "1.5cqh",
              lineHeight: "2cqh",
              fontWeight: "100",
              fontFamily: "Verdana, Roboto, 'Open Sans'",
              cursor: "pointer",
              userSelect: "none",
              textAlign: "center"
            }
          }

          // СОЗДАНИЕ СКЕЛЕТА ПРИЛОЖЕНИЯ
          let wrapper = document.createElement("div")
          wrapper.classList.add("wrapper")
          Object.assign(wrapper.style, styles["appwrapper"])

          // НАСТРОЙКИ КНОПОК ПРИЛОЖЕНИЯ
          const bst = {
            "app_icon": [`ฅ^•⩊•^ฅ`, {
              fontWeight: "100",
              fontSize: "13px",
              transition: "transform 0.1s ease-in-out, color 0.2s ease-in-out"
            }],
            "app_copy_button": ["Копировать</br>Alt+S",  {}],
            "app_sbp": ["Сбп</br>Alt+A", {}],
            "app_dop": ["Допродажа</br>Alt+W", {}],
            "app_dc": ["Дк</br>Alt+Q", {}],
            "app_no_client": ["Не клиент", {}],
            "app_cut": ["Убрать копейки", {}],
            "app_telegram": ["Новости", {}]
          } // "app_error": ["Отчет об ошибке", {}]

          let buttons_list = {}

          // ПООЧЕРЕДНАЯ ПОДГРУЗКА КНОПОК
          for (let btn in bst) {
            let cls = btn
            let inner = bst[btn][0]
            let style = bst[btn][1]
            let elem = document.createElement("span")
            elem.classList.add(cls)
            elem.innerHTML += inner
            Object.assign(elem.style, Object.assign({}, styles["spans"], style))
            buttons_list[cls] = elem    
          }

          // СПИСКИ ПРИЛОЖЕНИЯ С РАЗНЫМ ФУНКЦИОНАЛОМ
          let mass = [buttons_list["app_dc"], buttons_list["app_sbp"], buttons_list["app_dop"], buttons_list["app_cut"]]
          let all = [
             buttons_list["app_icon"],  buttons_list["app_copy_button"], buttons_list["app_dop"], 
             buttons_list["app_sbp"], buttons_list["app_dc"], buttons_list["app_cut"], buttons_list["app_no_client"], buttons_list["app_telegram"]
          ]  

          let disp_el = [
            buttons_list["app_copy_button"], buttons_list["app_dop"], 
            buttons_list["app_sbp"], buttons_list["app_dc"], buttons_list["app_cut"], buttons_list["app_no_client"],  buttons_list["app_telegram"]
         ]  

          // ДОБАВЛЕНИЯ ФУНКЦИОНАЛА КНОПКАМ
          buttons_list["app_icon"].classList.add("open")

          function toggle_elements(is) {
            if (is) {disp_el.forEach((el) => {el.style.display = "flex"})} 
            else {disp_el.forEach((el) => {el.style.display = "none"})}
          }

          buttons_list["app_icon"].addEventListener("click", () => {
            buttons_list["app_icon"].classList.toggle("open")
            toggle_elements(buttons_list["app_icon"].classList.contains("open"))
          })


          all[0].style.borderTopLeftRadius    = "20px"
          all[0].style.borderBottomLeftRadius = "20px"
          
          mass.forEach((e) => {e.addEventListener("click", () => {
            this.ToggleCheck(e, [border_color, border_second_color])
            if (!this.check(e)) e.style.borderBottom = "solid 3px " + border_second_color
          })});
          
          [["mouseover", border_second_color, border_second_color],
           ["mouseout",  border_color,        text_color]].forEach(el => {
            mass.forEach((e) => {e.addEventListener(el[0], () => {
              if (!this.check(e)) e.style.borderBottom = "solid 3px " + el[1]
              e.style.color = el[2]
            })});
          })
          
          all.forEach(e => {wrapper.appendChild(e)});

          document.body.appendChild(wrapper)
          this.wrapper = wrapper

          buttons_list["app_telegram"].addEventListener("click", ()=> {
            window.open('https://t.me/+WBv4WSieLmwwMjZi');
          })
          
          let second_mass = ["app_copy_button", "app_telegram", "app_no_client"].map(i => {return buttons_list[i]})
          let move = [["mouseover", border_second_color], ["mouseout",  text_color]]
          move.forEach(el => {second_mass.forEach((e) => {e.addEventListener(el[0], () => {e.style.color = el[1]})});})

          return [
            buttons_list["app_copy_button"], 
            [buttons_list["app_sbp"], buttons_list["app_dc"], buttons_list["app_dop"], buttons_list["app_cut"]], 
            buttons_list["app_icon"], buttons_list["app_no_client"]
          ]
    }

    remove() {this.wrapper.remove()}

    ToggleCheck(el, colors, cls="checked") {
        console.clear()
        el.classList.toggle(cls)
        if (this.check(el)) {el.style.borderBottom = "solid 4px" + colors[1]} 
        else {el.style.borderBottom = "solid 4px" + colors[0]}
    }
    check(el, cls="checked") {return (el.classList.contains(cls))}
}

// ========== app/classes/assets/no_client.js ==========
/**
 * no_client - класс для обработки кнопки "Не клиент"
 * Адаптирован для работы с новым форматом конфига.
 */
class no_client {
    constructor(args) {
        this.args = args;
        this.cfg = args["config"]; // новый конфиг
        this.table = args["table"];
        this.shop = this.table[0]["shop"];
        // shop_mode: 0 = дневной, 1 = круглосуточный
        this.shop_mode = this.cfg["shop_mode"] !== undefined ? this.cfg["shop_mode"] : 0;
        this.start = this.cfg["start"] !== undefined ? this.cfg["start"] : 10;
        this.end = this.cfg["end"] !== undefined ? this.cfg["end"] : 22;
    }

    /**
     * Подключает обработчик клика к кнопке.
     * @param {HTMLElement} button - кнопка, на которую вешается событие
     */
    async connect(button) {
        button.addEventListener("click", async () => {
            await this.fu({
                "config": this.cfg,
                "table": this.table,
                "shop_mode": this.shop_mode,
                "start": this.start,
                "end": this.end
            });
        });
    }

    /**
     * Преобразует массив в строку с разделителями табуляции, заменяя -1 на пустую строку.
     * @param {Array} table - массив данных
     * @returns {string} строка, готовая для вставки в буфер обмена
     */
    format_uv(table) {
        return table.map((e) => (e == -1 ? "" : e)).join("\t");
    }

    /**
     * Основная логика: запрос причины, формирование VP-массива и копирование в буфер.
     * @param {Object} args - параметры (config, table, shop_mode, start, end)
     */
    async fu(args) {
        const cfg = args["config"];
        const table = args["table"];
        const shop_mode = args["shop_mode"];
        const start = args["start"];
        const end = args["end"];

        const problem = prompt("Что случилось?");
        if (!problem) return;

        const cleanedProblem = problem.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ");

        // --- Генерация старых структур из нового конфига ---
        const passiveTemplate = this._buildPassiveTemplate(cfg);
        const defaultArray = this._buildDefault(cfg);
        const size = cfg["size"] || 42;

        const vp = Array(size).fill(-1);
        const tm = await this._getNow(cfg, start, end, shop_mode);

        // Устанавливаем комментарий
        vp[passiveTemplate["comments"]] = "Неклиент, " + cleanedProblem;

        // Обработка шаблона (всегда "default")
        let temp = "default";
        const def = defaultArray; // [ [shift,date,time,name], {shift:col,...}, [col1,col2,col3,col4] ]

        for (let i = 0; i < temp.length; i++) {
            if (temp[i] === false) temp[i] = Array(def[2][i]).fill(-1);
        }
        if (temp === "default") temp = Array(def[2][0]).fill(true);

        // Определение смены (день/ночь)
        if (shop_mode === 0) {
            vp[def[1]["shift"]] = "д";
        } else {
            const hour = tm[0]; // час (0-23)
            vp[def[1]["shift"]] = (hour >= start && hour < end) ? "д" : "н";
        }

        // Дата и время
        if (def[0]["date"]) vp[def[1]["date"]] = tm[1];
        if (def[0]["time"]) vp[def[1]["time"]] = tm[2];
        vp[passiveTemplate["no_client"]] = 0;

        // Имя продавца
        let seller = table[0]["seller"]
            .trim()
            .split(" ")
            .filter((e) => e !== "-.")
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

        const namesMap = cfg["names"] || {};
        if (Array.isArray(namesMap)) {
            // Новый формат: массив имён, которые не нужно менять (ничего не делаем)
            if (!namesMap.includes(seller)) seller = seller;
        } else {
            // Старый формат: Base64 ключи
            const sellerHash = btoa(unescape(encodeURIComponent(seller)));
            if (namesMap[sellerHash]) {
                seller = decodeURIComponent(escape(atob(namesMap[sellerHash])));
            }
        }

        if (def[0]["name"]) vp[def[1]["name"]] = seller;

        // Копирование в буфер
        navigator.clipboard
            .writeText(this.format_uv(vp))
            .then(() => alert("Успешно скопировано! (Не клиент)"))
            .catch((err) => {
                console.debug("Ошибка", err);
                navigator.clipboard
                    .writeText(this.format_uv(vp))
                    .then(() => alert("Успешно скопировано! (Не клиент)"))
                    .catch((err) => console.debug("Ошибка", err));
            });
    }

    /**
     * Возвращает текущие дату, время и час.
     * @param {Object} config - конфиг (может не использоваться)
     * @param {number} start - начало дневной смены
     * @param {number} end - конец дневной смены
     * @param {number} shopMode - 0 = дневной магазин, 1 = круглосуточный
     * @returns {Promise<Array>} [час, дата, время] (например: [14, "31.03.2026", "14:30"])
     */
    async _getNow(config, start, end, shopMode) {
        const two = (number) => {
            const str = number.toString();
            return str.length === 1 ? "0" + str : str;
        };

        const now = new Date();
        const dateStr = `${two(now.getDate())}.${two(now.getMonth() + 1)}.${now.getFullYear()}`;
        const timeStr = `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`;

        // Используем VpTime для определения смены, но нам нужен только час, дата и время
        const vpTime = new VpTime(false, [start, end], shopMode);
        const result = await vpTime.run([dateStr, timeStr]);
        // result = [isDay (0/1), date, time]  - isDay здесь не нужен, заменяем на час
        const hour = now.getHours();
        return [hour, result[1], result[2]];
    }

    // ------------------- Вспомогательные методы для преобразования конфига -------------------

    /**
     * Строит объект passive_template из нового конфига.
     * @param {Object} config - новый конфиг
     * @returns {Object} passive_template
     */
    _buildPassiveTemplate(config) {
        const passive = config.passive;
        const payment = config.payment;

        const pt = {
            no_client: passive.no_client?.col ?? 4,
            six: passive.six?.col ?? 24,
            order: passive.order?.col ?? 26,
            enter: passive.enter?.col ?? 3,
            nc: passive.nc?.col ?? 4,
            comments: passive.comments?.col ?? 31,
            articles: passive.articles?.col ?? 34,
            buys: passive.buys?.col ?? 32,
            items_count: passive.items_count?.col ?? 33,
            dc: passive.dc?.col ?? 21,
            order_number: passive.order_number?.col ?? 39,
        };

        const allTypes = ['buyer', 'client_order', 'mobile', 'market', 'takeup', 'open', 'no_item', 'empty'];
        const money = { pay: {}, return: {} };
        for (const type of allTypes) {
            if (type === 'mobile') {
                money.pay[type] = [payment.mobile, 1];
            } else {
                money.pay[type] = [payment.buyer, 1];
            }
            money.return[type] = [payment.return, 1];
        }
        money.pay.market = false;
        money.pay.takeup = false;
        pt.money = money;
        return pt;
    }

    /**
     * Строит массив default из нового конфига.
     * @param {Object} config - новый конфиг
     * @returns {Array} default в старом формате
     */
    _buildDefault(config) {
        const passive = config.passive;
        return [
            { shift: true, date: true, time: true, name: true },
            {
                shift: passive.shift?.col ?? 0,
                date: passive.date?.col ?? 1,
                time: passive.time?.col ?? 2,
                name: passive.name?.col ?? 40,
            },
            [
                passive.no_client?.col ?? 4,
                passive.enter?.col ?? 3,
                passive.nc?.col ?? 4,
                passive.items_count?.col ?? 33,
            ],
        ];
    }
}


// ========== app/classes/assets/vp_time.js ==========
class VpTime {

    async run(time_obj=false, interval=[10, 22], shop_type=false) {

        console.log(time_obj, interval, shop_type)

        this.datetime_list =   time_obj
        this.start =        interval[0]
        this.end =          interval[1]
        this.shop_type =    !!(shop_type)

        this.date = this.adaptive_time(this.datetime_list[0]).split(".")
        this.time = this.datetime_list[1].split(":")
        // console.log(this.date, this.time)
        this.object = new Date(`${this.date[1]}.${this.date[0]}.${this.date[2]}`)

        this.sec_time   =   this.time[0]*60*60 + this.time[1]*60 + this.time[2]*1
        this.sec_end    =   60*60*this.end 
        this.sec_start  =   60*60*this.start
        this.day_time   =   24*60*60
        
        this.type_of_shift = -1 // проверочное число
        this.getTypeShift()

        // console.log(this.object)

        this.year    =  this.object.getFullYear()
        this.month   =  this.object.getMonth()+1
        this.day     =  this.object.getDate()

        this.time_to_send = this.getTime()
        this.date_to_send = `${this.two(this.day)}.${this.two(this.month)}.${this.year}`
        
        // console.log(this.year, this.month, this.day)
        // console.log(this.time_to_send)
        // console.log(this.date_to_send)

        // console.log([this.type_of_shift, this.date_to_send, this.time_to_send])
        console.log(`%cShift: ${this.type_of_shift}`, 'color: red; font-size: larger')
        console.log(`%cDate: ${this.date_to_send}`, 'color: red; font-size: larger')
        console.log(`%cTime: ${this.time_to_send}`, 'color: red; font-size: larger')

        
        return [this.type_of_shift, this.date_to_send, this.time_to_send]
    }

adaptive_time(date) {
    // Убираем лишние пробелы
    date = date.trim();
    
    // Словарь месяцев: полные и сокращённые (с точкой и без) в нижнем регистре
    const monthsMap = {
        'января': '01', 'январь': '01', 'янв.': '01', 'янв': '01',
        'февраля': '02', 'февраль': '02', 'фев.': '02', 'фев': '02',
        'марта': '03', 'март': '03', 'мар.': '03', 'мар': '03',
        'апреля': '04', 'апрель': '04', 'апр.': '04', 'апр': '04',
        'мая': '05', 'май': '05', 'мая.': '05', 'май.': '05',
        'июня': '06', 'июнь': '06', 'июн.': '06', 'июн': '06',
        'июля': '07', 'июль': '07', 'июл.': '07', 'июл': '07',
        'августа': '08', 'август': '08', 'авг.': '08', 'авг': '08',
        'сентября': '09', 'сентябрь': '09', 'сен.': '09', 'сен': '09',
        'октября': '10', 'октябрь': '10', 'окт.': '10', 'окт': '10',
        'ноября': '11', 'ноябрь': '11', 'ноя.': '11', 'ноя': '11',
        'декабря': '12', 'декабрь': '12', 'дек.': '12', 'дек': '12'
    };
    
    // 1. Формат "DD.MM.YYYY" или "DD.MM.YY"
    if (date.includes('.') && /^[\d\.]+$/.test(date.replace(/\s/g, ''))) {
        const parts = date.split('.');
        if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) {
                const yearInt = parseInt(year);
                year = yearInt <= 30 ? `20${year}` : `19${year}`;
            }
            return `${day}.${month}.${year}`;
        }
    }
    
    // 2. Формат с русским месяцем (полным или сокращённым), возможно с запятой и временем
    // Ищем шаблон: число, пробел, слово-месяц, пробел, год (4 цифры)
    // Регулярное выражение ищет последовательность: (день) (месяц) (год)
    // и извлекает группы.
    const regex = /(\d{1,2})\s+([а-яё]+\.?)\s+(\d{4})/i;
    const match = date.match(regex);
    if (match) {
        let day = match[1].padStart(2, '0');
        let monthWord = match[2].toLowerCase();
        let year = match[3];
        
        // Удаляем точку в конце месяца, если есть
        monthWord = monthWord.replace(/\.$/, '');
        
        const monthNum = monthsMap[monthWord];
        if (monthNum) {
            return `${day}.${monthNum}.${year}`;
        }
    }
    
    // 3. Попробуем универсальный поиск: извлекаем любую последовательность цифр, затем слово-месяц, затем цифры года
    // (более гибкий вариант, если формат сильно отличается)
    const flexibleRegex = /(\d{1,2})\D+([а-яё]+\.?)\D+(\d{4})/i;
    const flexMatch = date.match(flexibleRegex);
    if (flexMatch) {
        let day = flexMatch[1].padStart(2, '0');
        let monthWord = flexMatch[2].toLowerCase().replace(/\.$/, '');
        let year = flexMatch[3];
        const monthNum = monthsMap[monthWord];
        if (monthNum) {
            return `${day}.${monthNum}.${year}`;
        }
    }
    
    // Если ничего не подошло, выводим предупреждение и возвращаем как есть
    console.warn('Не удалось распознать формат даты:', date);
    return date;
}



    two(number) {
        let n = number.toString().split("")
        if (n.length == 1) {return "0"+n[0]} else {return number.toString()}
    }

    getTypeShift() {
        console.log(this.shop_type, this.sec_time, this.sec_start, this.sec_end)
        if (this.shop_type == true) {
            let first_night_part = !!((this.sec_time > this.sec_end) & (this.sec_time > this.sec_start))
            let second_night_part = !!((this.sec_time < this.sec_end) & (this.sec_time < this.sec_start)) 
            console.log(first_night_part, second_night_part)     
            if (first_night_part || second_night_part) {
                // ночная смена вроде не понятно зачем здесь эта функция
                this.type_of_shift = false
                // но мы делаем дату на 1 день меньше так как это все еще твоя смена брат
                if (second_night_part) {this.object.setDate(this.object.getDate() - 1) }
        
            } else if ((this.sec_time < this.sec_end) & (this.sec_time >= this.sec_start)) {
                this.type_of_shift = true // дневная смена радуйся проценту как и твой писюн)
            } 
        } else {
            this.type_of_shift = true // смена всегда дневная, так как магазин дневной
        }
    }

    getTime() {
         // проверка на размер числа
        if ((this.time[0].length != 1) & (this.time[0][0] == "0")) {this.time[0] = Number(time[0][1])}
        else if (this.time[0].length == 1) {this.time[0] = Number(this.time[0][0])}
        else {this.time[0] = Number(this.time[0])}
        if (this.time[1][0] == "0") {this.time[1] = Number(this.time[1][1])}
        if (this.time[2][0] == "0") {this.time[2] = Number(this.time[2][1])}

        // итоговое форматирование
        return `${this.two(this.time[0])}:${this.two(this.time[1])}`   
    }
}

// ========== app/classes/assets/addfuncs.js ==========
/**
 * Строит объект typeSettings из нового формата конфига.
 * Сохраняет шаблоны и настройки из старого формата, но заменяет словари трафика на новые.
 * @param {Object} config - конфиг нового формата
 * @returns {Object} typeSettings в старом формате
 */
function buildTypeSettings(config) {
    // Базовые шаблоны (остаются неизменными)
    const templates = {
        return: [
            [
                ["default"],
                [0, 0, -1, -1],
                [0],
                [0, 1, 1, 1, 1],
                [0, 0, 1]
            ],
            [3, [0, "return", "cssDisplayNone"]]
        ],
        no_item: [
            [
                ["default"],
                [1, 1, -1, -1],
                [-1],
                [0, 1, -1, -1, 1],
                [false]
            ],
            [2, "Нетовар"]
        ],
        client_order: [
            [
                ["default"],
                [1, 1, 1, -1],
                [-1],
                [1, 1, 1, 1, 1],
                [1, -1, -1]
            ],
            [2, "Клиентский заказ"]
        ],
        open: [
            [
                ["default"],
                [false],
                [false],
                [false],
                [false]
            ],
            [2, "открытие смены"]
        ],
        empty: [
            ["default"],
            [false],
            [0],
            [false],
            [false]
        ],
        buyer: [
            [
                ["default"],
                [1, 1, 1, -1],
                [-1],
                [1, 1, 1, 1, 1],
                [1, -1, -1]
            ],
            [1, false],
            {}
        ],
        market: [
            [
                ["default"],
                [0, -1, -1, -1],
                [1],
                [0, -1, 1, -1, 1],
                [false]
            ],
            [1, false],
            {}
        ],
        mobile: [
            [
                ["default"],
                [0, 0, -1, -1],
                [1],
                [0, -1, 1, 1, 1],
                [-1, 1, -1]
            ],
            [1, false],
            {}
        ],
        takeup: [
            [
                ["default"],
                [0, 0, -1, -1],
                [1],
                [0, 1, 1, 1, 1],
                [-1, 1, -1]
            ],
            [1, false],
            {}
        ]
    };

    // Заполняем словари трафика из нового конфига
    if (config.buyerSources) {
        templates.buyer[2] = config.buyerSources;
    }
    if (config.marketSources) {
        templates.market[2] = config.marketSources;
    }
    if (config.mobileSources) {
        templates.mobile[2] = config.mobileSources;
    }
    if (config.takeupSources) {
        templates.takeup[2] = config.takeupSources;
    }

    return templates;
}

// ============================================================
// Функции для преобразования нового конфига в старые структуры
// ============================================================

/**
 * Строит объект type_settings из нового конфига.
 * @param {Object} config - новый конфиг
 * @returns {Object} type_settings в старом формате
 */
function buildTypeSettings(config) {
    const templates = {
        return: [
            [
                ["default"],
                [0, 0, -1, -1],
                [0],
                [0, 1, 1, 1, 1],
                [0, 0, 1]
            ],
            [3, [0, "return", "cssDisplayNone"]]
        ],
        no_item: [
            [
                ["default"],
                [1, 1, -1, -1],
                [-1],
                [0, 1, -1, -1, 1],
                [false]
            ],
            [2, "Нетовар"]
        ],
        client_order: [
            [
                ["default"],
                [1, 1, 1, -1],
                [-1],
                [1, 1, 1, 1, 1],
                [1, -1, -1]
            ],
            [2, "Клиентский заказ"]
        ],
        open: [
            [
                ["default"],
                [false],
                [false],
                [false],
                [false]
            ],
            [2, "открытие смены"]
        ],
        empty: [
            ["default"],
            [false],
            [0],
            [false],
            [false]
        ],
        buyer: [
            [
                ["default"],
                [1, 1, 1, -1],
                [-1],
                [1, 1, 1, 1, 1],
                [1, -1, -1]
            ],
            [1, false],
            {}
        ],
        market: [
            [
                ["default"],
                [0, -1, -1, -1],
                [1],
                [0, -1, 1, -1, 1],
                [false]
            ],
            [1, false],
            {}
        ],
        mobile: [
            [
                ["default"],
                [0, 0, -1, -1],
                [1],
                [0, -1, 1, 1, 1],
                [-1, 1, -1]
            ],
            [1, false],
            {}
        ],
        takeup: [
            [
                ["default"],
                [0, 0, -1, -1],
                [1],
                [0, 1, 1, 1, 1],
                [-1, 1, -1]
            ],
            [1, false],
            {}
        ]
    };

    // Заполняем словари трафика из нового конфига
    if (config.buyerSources) templates.buyer[2] = config.buyerSources;
    if (config.marketSources) templates.market[2] = config.marketSources;
    if (config.mobileSources) templates.mobile[2] = config.mobileSources;
    if (config.takeupSources) templates.takeup[2] = config.takeupSources;

    return templates;
}

/**
 * Строит объект passive_template из нового конфига.
 * @param {Object} config - новый конфиг
 * @returns {Object} passive_template в старом формате
 */
async function get_page(url) {return fetch(url).then(data => {return data.text()}).catch(error => console.error('Error fetching data:', error));}

function buildPassiveTemplate(config) {
    const passive = config.passive;
    const payment = config.payment;

    console.log(passive, payment)

    // Базовые поля
    const pt = {
        no_client: [passive.no_client?.col ?? 4, !!(passive.no_client?.turn_on) ?? true],
        six: [passive.six?.col ?? 24, !!(passive.six?.turn_on) ?? true],
        order: [passive.order?.col ?? 26, !!(passive.order?.turn_on) ?? true],
        enter: [passive.enter?.col ?? 3, !!(passive.enter?.turn_on) ?? true],
        nc: [passive.nc?.col ?? 4, !!(passive.nc?.turn_on) ?? true],
        comments: [passive.comments?.col ?? 31, !!(passive.comments?.turn_on) ?? true],
        articles: [passive.articles?.col ?? 34, !!(passive.articles?.turn_on) ?? true],
        buys: [passive.buys?.col ?? 32, !!(passive.buys?.turn_on) ?? true],
        items_count: [passive.items_count?.col ?? 33, !!(passive.items_count?.turn_on) ?? true],
        dc: [passive.dc?.col ?? 21, !!(passive.dc?.turn_on) ?? true],
        order_number: [passive.order_number?.col ?? 39, !!(passive.order_number?.turn_on) ?? true]
    };

    // Структура money
    const allTypes = ['buyer', 'client_order', 'mobile', 'market', 'takeup', 'open', 'no_item', 'empty'];
    const money = {
        pay: {},
        return: {}
    };

    for (const type of allTypes) {
        if (type === 'mobile') {
            money.pay[type] = [payment.mobile, 1];
        } else {
            money.pay[type] = [payment.buyer, 1];
        }
        money.return[type] = [payment.return, 1];
    }
    // Для market и takeup pay можно сделать false (тогда будет использоваться buyer по умолчанию)
    money.pay.market = false;
    money.pay.takeup = false;

    pt.money = money;
    return pt;
}

/**
 * Строит массив default из нового конфига.
 * @param {Object} config - новый конфиг
 * @returns {Array} default в старом формате
 */
function buildDefault(config) {
    const passive = config.passive;
    console.log(config.passive)
    return [
        { 
            shift: !!(passive.shift?.turn_on) ?? true, 
            date: !!(passive.date?.turn_on) ?? true, 
            time: !!(passive.time?.turn_on) ?? true, 
            name: !!(passive.name?.turn_on) ?? true },
        {
            shift: passive.shift?.col ?? 0,
            date: passive.date?.col ?? 1,
            time: passive.time?.col ?? 2,
            name: passive.name?.col ?? 40
        },
        [
            passive.no_client?.col ?? 4,
            passive.enter?.col ?? 3,
            passive.nc?.col ?? 4,
            passive.items_count?.col ?? 33
        ]
    ];
}

// ========== app/classes/assets/tables.js ==========
// КЛАСС TABLES ПРЕДНАЗНАЧЕН ДЛЯ ФОРМИРОВАНИЯ МАССИВА ДАННЫХ ИЗ ТАБЛИЦ
class Tables {

    // ПОДГОТОВКА ПЕРЕМЕННЫХ К ЭКСПЛОУТАЦИИ
    constructor(settings, html) {

        this.cfg   =   settings
        this.sel   =   this.cfg["ingeneerSettings"]["selectors"]["tables"]
        // console.log(this.sel)
        this.html  =   html

        this.count_of_items_on_one_page = 10 // предметов на странице

        this.count_of_items = 1 // КОЛИЧЕСТВО ПРЕДМЕТОВ (ПО-УМОЛЧАНИЮ)
        this.count_of_pages = 1 // КОЛИЧЕСТВО СТРАНИЦ   (ПО-УМОЛЧАНИЮ)

    }

    // ПОЛУЧЕНИЕ ТАБЛИЦЫ ПО СЕЛЕКТОРУ
    async set_table(name, findall=false) { 
        
        // console.log(name, this.html.querySelector(this.sel[name]))

        if (findall) {

            // ПОПЫТКА ПОЛУЧЕНИЯ ВСЕХ СТРАНИЦ С ТОВАРАМИ
            try {
                let count = await this.set_table("coun")
                this.count_of_items = count.innerHTML.trim().split(" ")[3].replace(".", '') 
                this.count_of_pages = Math.ceil(this.count_of_items / this.count_of_items_on_one_page)
            } catch { this.count_of_pages = 1 }
            
            // ЕСЛИ СТРАНИЦ БОЛЬШЕ 1 СОЗДАЕМ БУФЕР ОБЪЕДЕНЯЕМ ТОВАРЫ В ОДИН ЭЛЕМЕНТ И ПРОВОДИМ ПОИСК ПО СЕЛЕКТОРУ
            // ИНАЧЕ ПРОСТО ПРОВОДИМ ПОИСК ПО СЕЛЕКТОРУ
            if (this.count_of_pages > 1) {

                let buffer = []

                for (let i = this.count_of_pages; i >= 1; i--) {

                    let bill_id = window.location.href.split("/")
                    bill_id = bill_id[bill_id.length - 1]
                    let url = `https://tl.myvirtualpos.ru/console/sales/view/ajax/receipt-items/id/${bill_id}/page/${i}`
                    let page = await get_page(url)
                    let temp = document.createElement("div")
                    temp.innerHTML = page
                    buffer.push(temp.querySelectorAll(this.sel[name]));

                }

                let result = document.createElement("div")

                buffer.forEach((page) => {
                    page.forEach((e)=> {
                        result.appendChild(e)
                    })
                }) 

                return result.querySelectorAll("div > *")
                
            } else {return this.html.querySelectorAll(this.sel[name])}
        } else {return this.html.querySelector(this.sel[name])}
    }

    // ПОЛУЧЕНИЕ ВСЕХ ТАБЛИЦ ПО СЕЛЕКТОРУ И ИХ СОРТИРОВКА
    async get_all() {

        this.mbase  =  this.set_table("main")
        this.money  =  this.set_table("mone")
        this.sales  =  this.set_table("sale")
        this.items  =  this.set_table("item", true)

        let b  = new  Base(this.mbase, this.cfg)
        let m  = new Money(this.money, this.cfg)
        let it = new Items(this.items, this.cfg)

        // console.log(b, m, it)

        return this.ClassVariables([
            await b.run(), 
            await m.run(),  
            await it.run()
        ])
    }

    // ОБРАБОТКА СТРОК В ОБЪЕКТЫ ДЛЯ ДАЛЬНЕЙШЕЙ РАБОТЫ С НИМИ
    ClassVariables(tables) {

        // ПОДМЕНА СТРОКИ КОММЕНТАРИЯ - ОБЪЕКТОМ КОММЕНТАРИЯ
        let comment = new Comment({
            table: tables[0]["comment"], config: this.cfg
        }); tables[0]["comment"] = comment.object

        return tables
    }
}

// БАЗОВЫЙ ШАБЛОН (ИМЕНА, ДАТА И ДРУГОЕ)
class Base {

    // НАСТРОЙКА НАЧАЛЬНЫХ НАСТРОЕК
    constructor(html, settings) {
        this.table = html; this.cfg = settings;
        this.det = this.cfg["details"];
    }

    // ПОЛУЧЕНИЕ КОНКРЕТНОЙ ИНФОРМАЦИИ ИЗ ТАБЛИЦЫ ПО СЕЛЕКТОРУ
    async detail_table(n, to, inner=true) {
        let table = await this.table
        let body = table.querySelector(`tr:nth-child(${n}) ${to}`)
        if (inner) {return body.innerHTML} else {return body.classList.contains("cssDisplayNone")} 
    }

    // СОРТИРОВКА ПОЛУЧЕННОЙ ИНФОРМАЦИИ
    async sorted() {
        let send = {}

        for (let key in this.det) {
            send[key] = await this.detail_table(
                    this.det[key][0], 
                    this.det[key][1], 
                    this.det[key][2]
        )}; return send;
    }

    async run() {
        return await this.sorted()
    }
}

// КЛАСС ПОЛУЧЕНИЯ ИНФОРМАЦИИ О ДЕНЕЖНОЙ ЧАСТИ ЧЕКА
class Money {

    // ИНФОРМАЦИЯ КОТОРАЯ ПОСТУПАЕТ В КЛАСС
    constructor(html, settings) {
        this.table  = html 
        this.cfg    = settings
        this.temp   = {}
        this.run()
    }

    // ПАРСИТ КАЖДЫЙ ТИП ОПЛАТЫ
    async generate() {
        let cash    = await this.gtable(1)
        let no_cash = await this.gtable(2)
        let sbp     = await this.gtable(3)
        this.temp = {cash: cash, no_cash: no_cash, sbp: sbp}
    }

    // ФУНКЦИЯ ПАРСИНГА ТИПА ОПЛАТЫ ИЗ ТАБЛИЦЫ
    async gtable(n) {
        let table = await this.table
        return parseFloat(table.querySelector(`tr:nth-child(${n}) td`)
            .innerHTML.replace(" ", "").replace("руб.", "")).toFixed(2)
    }

    // СРАВНЕНИЕ С ШАБЛОНОМ
    async get() {
        for (let key in this.temp) {
            if (this.temp[key]=="0") {
                this.temp[key]=-1
            }} return this.temp
    }

    // ЗАПУСК
    async run() {
        await this.generate()
        return await this.get()
    }
}

// ИНФОРМАЦИЯ О ТОВАРЕ
class Item {
    constructor() {
        this.is_good =  undefined
        this.name    =  undefined
        this.art     =  undefined
        this.count   =  undefined
    }
}

// КЛАСС НУМЕРОВАНИЯ И НАСТРОЙКИ ТОВАРОВ
class Items {

    // НАЧАЛЬНАЯ НАСТРОЙКА
    constructor(html_list, settings) {
        this.items_list =   html_list
        this.cfg        =    settings
        this.items      =          []
    }

    async run() {
        await this.loop() 
        return this.items 
    }

    // ПРОВЕРКА АРТИКУЛА
    isNumeric(num) {return !isNaN(num)}

    // ЗАЛУПИРОВАННОЕ ПОЛУЧЕНИЕ ПРОДАННХ ТОВАРОВ
    async loop(max_comment_size=25) {

        let items_list = await this.items_list
        items_list.forEach((item) => {
            
            let obj = new Item()
            let all = item.querySelector("td:nth-child(2)").innerHTML 
            let art = all.slice(0, all.indexOf(' '))
            obj.count = item.querySelector("td:nth-child(3)").innerHTML.split(".")[0]

            if (this.isNumeric(art)) {

                obj.name =           all.slice(all.indexOf(' '), all.length)  
                if (obj.name.length > max_comment_size) {obj.name = obj.name.slice(0, max_comment_size)}
                obj.art     =    art
                obj.is_good =   true

                this.items.push(obj)

            } else {

                obj.is_good = false
                obj.name    =   all
                obj.art     =   "0" 

                this.items.push(obj)

            }
        })
    }
}

// ========== app/classes/assets/type.js ==========
/**
 * Класс для определения типа чека по старой схеме, но с использованием нового конфига.
 * Получает typeSettings из buildTypeSettings(config).
 */
class Type {
    /**
     * @param {HTMLElement} html - DOM-элемент, содержащий страницу чека (обычно #yw0)
     * @param {Object} config - основной конфиг (нового формата)
     * @param {boolean} isReturn - true, если обрабатывается чек возврата, иначе false
     */
    constructor(html, config, isReturn) {
        this.html = html;
        this.config = config;
        this.isReturn = isReturn;

        // Построить typeSettings из конфига
        this.typeSettings = buildTypeSettings(config);
        console.log(this.typeSettings)

        // Извлечь данные со страницы, используя конфиг
        this._extractPageData();

        // Определить тип чека
        this.type = this.get_type();
        console.log(`%cType of this page: ${this.type[0]}`, 'color: green; font-size: larger')
    }

    /**
     * Извлекает данные страницы (трафик, причина, комментарий, магазин, ссылка на возврат)
     * на основе настроек config.details.
     */
    _extractPageData() {
        const details = this.config.details || {};
        // Определяем, какие строки и селекторы использовать
        const trafficRow = details.traffic?.[0] || 19;
        const trafficSel = details.traffic?.[1] || 'td';
        const reasonRow = details.reason?.[0] || 21;
        const reasonSel = details.reason?.[1] || 'td';
        const commentRow = details.comment?.[0] || 22;
        const commentSel = details.comment?.[1] || 'td';
        const shopRow = details.shop?.[0] || 1;
        const shopSel = details.shop?.[1] || 'a';
        const returnRow = details.return?.[0] || 17;
        const returnSel = details.return?.[1] || 'td a';

        // Функция для получения элемента
        const getElement = (row, selector, isText = true) => {
            const element = this.html.querySelector(`#detail-view tr:nth-child(${row}) ${selector}`);
            if (!element) return isText ? '' : false;
            return isText ? element.innerText.trim() : element.getAttribute('href');
        };

        this.vars = {
            traffic: getElement(trafficRow, trafficSel, true),
            reason: getElement(reasonRow, reasonSel, true),
            comment: getElement(commentRow, commentSel, true),
            shop: getElement(shopRow, shopSel, true),
            return_link: getElement(returnRow, returnSel, false)
        };
    }

    /**
     * Проверяет, является ли чек "нетовар" или другим типом с одним товаром.
     * @param {string} name - название товара для проверки.
     * @returns {boolean} true, если в чеке ровно один товар и его название равно name.
     */
    one_check(name) {
        const items = this.html.querySelectorAll('#receipt-items .items.table tbody tr');
        if (items.length !== 1) return false;
        const itemTitle = items[0].querySelector('td:nth-child(2)').innerText;
        return itemTitle === name;
    }

    /**
     * Проверяет, соответствует ли чек заданному типу.
     * @param {Object} arg - аргументы проверки {type, argument, part, template, return}
     * @returns {boolean} true, если чек соответствует типу.
     */
    check(arg) {
        if (arg.type === 1) {
            // Тип 1: проверка по трафику (входит ли трафик в словарь типа)
            const trafficDict = arg.template[arg.part][2];
            return trafficDict && Object.keys(trafficDict).includes(this.vars.traffic);
        }
        if (arg.type === 2) {
            // Тип 2: проверка по одному товару
            return this.one_check(arg.argument);
        }
        if (arg.type === 3) {
            // Тип 3: проверка возврата
            return !arg.return; // если return false, значит это чек возврата
        }
        return false;
    }

    /**
     * Определяет тип чека, перебирая все типы из typeSettings.
     * @returns {string|Array} Название типа или массив [тип, доп.данные], если тип найден.
     *                         Если тип не найден, возвращает "empty".
     */
    get_type() {
        const checks = {};
        // Вычисляем для каждого типа, соответствует ли чек
        for (const [typeName, typeData] of Object.entries(this.typeSettings)) {
            const [template, configPart] = typeData;
            checks[typeName] = this.check({
                type: configPart[0],
                argument: configPart[1],
                part: typeName,
                template: this.typeSettings,
                return: this.isReturn
            });
        }
        checks.empty = false; // empty не активен по умолчанию

        // Определяем дополнительные данные (isEnter, dc, isDay)
        const emptyTraffic = ["", "Не задан"];
        const isEnter = !emptyTraffic.includes(this.vars.traffic);
        const isDay = this.config.points?.[this.vars.shop] || false;
        const additionalData = [isEnter, false, isDay]; // dc пока false

        // Сначала ищем типы, не входящие в no_buyer
        const allTypes = Object.keys(this.typeSettings);
        const noBuyerTypes = this.config.no_buyer || [];

        let result = false;

        // Ищем среди обычных типов
        for (const typeName of allTypes) {
            if (!noBuyerTypes.includes(typeName) && checks[typeName]) {
                result = [typeName, additionalData];
                break;
            }
        }

        // Если не нашли, ищем среди no_buyer
        if (!result) {
            for (const typeName of noBuyerTypes) {
                if (checks[typeName]) {
                    result = [typeName, additionalData];
                    break;
                }
            }
        }

        // Если ничего не подошло – empty
        if (!result) {
            result = "empty";
        }

        return result;
    }
}

// Пример использования:
// const config = {...}; // новый конфиг
// const html = ...; // DOM страницы
// const typeInstance = new Type(html, config, false);
// console.log(typeInstance.type);

// ========== app/classes/assets/comment.js ==========
// КЛАСС КОММЕНТАРИЯ ВСЯ ОБРАБОТКА КОММЕНТАРИЯ РАЗБИЕНИЕ ЕГО 
// НА ПОДПУНКТЫ [ОБНОВЛЕНО 09.01.2025] ИСПРАВЛЕНА ОШИБКА СБЕРЛОГИСТИКИ
class Comment {

    constructor(base) {

        // ФОРМАТИРОВАНИЕ КОММЕНТАРИЯ
        this.comment_raw = base["table"]
        this.comment_formatted = this.formatComment()

        // ОБРЕЗКА НАСТРОЙКИ
        this.config = base["config"]
        // console.log(base)
        // console.log(this.config)

        // ПОДГОТОВКА ШАБЛОНОВ
        this.market_template = this.config["marketSources"]
        this.mobile_template = this.config["mobileSources"][2]
        this.all_templates = Object.assign({}, this.market_template, this.mobile_template)

        this.object = {
            carrier_number: "",
            carrier_type:   "",
            other:          ""
        }

        this.partComment()

    }

    formatComment() {
         // Убираем лишние пробелы, табуляцию и двоеточие
         return this.comment_raw.replace(/[\t]+|\s{2,}/g, ' ').trim();                 
    }

    partComment() {
    
        // Разделяем строку на слова
        this.words_massive = this.comment_formatted.split(' ');

        let orderNumber = [];
        let carrierType = [];
        let courierComment = this.comment_formatted; // Изначально вся строка - это комментарий

        // Список возможных служб доставки
        const deliveryServices = Object.keys(this.all_templates).map(service => service.toLowerCase());

        // Ищем тип службы доставки и собираем их в массив
        for (const service of deliveryServices) {
            const serviceLower = service.toLowerCase();
            let index = courierComment.toLowerCase().indexOf(serviceLower);

            // Если служба доставки найдена
            while (index !== -1) {
                carrierType.push(service);
                courierComment = courierComment.slice(0, index) + courierComment.slice(index + service.length);
                index = courierComment.toLowerCase().indexOf(serviceLower);
            }
        }

        // Удаляем лишние пробелы
        courierComment = courierComment.replace(/\s+/g, ' ').trim();

        // Разделяем оставшуюся строку на слова для поиска номера заказа
        this.words_massive = courierComment.split(' ');

        // Проверяем слова на наличие номеров заказов
        for (const word of this.words_massive) {
            // Проверяем наличие двоеточия
            if (word.includes(':')) {
                const parts = word.split(':');
                const suffix = parts[1]; // Часть после двоеточия
                
                if (/\d{5,}/.test(suffix)) {
                    orderNumber.push(word);
                    courierComment = courierComment.replace(word, '').trim();
                }
            }
            // Проверяем новый формат с дефисами (63027148-0387-1)
            else if (word.includes('-')) {
                const parts = word.split('-');
                // Проверяем что:
                // 1. Есть ровно 2 дефиса
                // 2. Все части содержат только цифры
                // 3. Вторая часть от 2 до 6 цифр (можно изменить по требованиям)
                if (parts.length === 3 && 
                    parts.every(part => /^\d+$/.test(part)) && 
                    parts[1].length >= 2 && parts[1].length <= 6) {
                    
                    orderNumber.push(word);
                    courierComment = courierComment.replace(word, '').trim();
                }
            }
            // Проверяем стандартный формат номера заказа (ABC12345)
            else if (/^[A-Z]{1,3}\d{5,}$/.test(word)) {
                orderNumber.push(word);
                courierComment = courierComment.replace(word, '').trim();
            }
            // Проверяем числовой формат (только цифры, длина > 4)
            else if (/^\d+$/.test(word) && word.length > 4) {
                orderNumber.push(word);
                courierComment = courierComment.replace(word, '').trim();
            }
        }

        // Удаляем лишние пробелы после удаления номеров заказов
        courierComment = courierComment.replace(/\s+/g, ' ').trim();

        // Очищаем номера заказов от двоеточий (если были)
        orderNumber = orderNumber.map(e => e.replace(/:/g, ' ').trim());

        if (orderNumber     == []) {orderNumber     = false}
        if (carrierType     == []) {carrierType     = false}
        if (courierComment  == []) {courierComment  = false}

        this.object = {
            full: this.comment_formatted,
            orderNumber: orderNumber,
            carrierType: carrierType,
            courierComment: courierComment
        }; 
    }
}

function range(start, end) {
    var result = []; 
    for (var i = start; i <= end; i++) {result.push(i);}
    return result;
}

// ========== app/classes/assets/analys.js ==========
// ============================================================
// Адаптированный класс AnalIs
// ============================================================

class AnalIs {
    async run(args) {
        console.log("[AnalIs.run] Начало выполнения");
        this.ready = true;

        this.html = args["html"];
        const newConfig = args["config"];  // новый конфиг
        this.all_tables_sorted = args["tables"];

        console.log(newConfig)

        // Генерируем старые структуры из нового конфига
        this.type_settings = buildTypeSettings(newConfig);
        this.passive_template = buildPassiveTemplate(newConfig);
        this.default = buildDefault(newConfig);
        this.stop = newConfig.stopList || [];
        this.enames = newConfig.names || {};
        this.shop_mode = newConfig.shop_mode ?? 1;   // 0 = дневной, 1 = круглосуточный
        this.start = newConfig.start ?? 10;           // начало дневной смены
        this.end = newConfig.end ?? 22;               // конец дневной смены
        console.log(this.passive_template)

        // Сохраняем ссылки на старые структуры в this.cfg для обратной совместимости
        this.cfg = {
            type_settings: this.type_settings,
            passive_template: this.passive_template,
            default: this.default,
            stop: this.stop,
            enames: this.enames,
            no_buyer: newConfig.no_buyer || ["empty", "open", "client_order", "no_item", "return"],
            enter: newConfig.enter || ["", "Не задан", "Сайт", "Вывеска-пеш", "Вывески-очень", "Вывеска-авто", "Постоянный", "Соседи", "СМИ", "Партнеры", "Яндекс", "Гугл", "2ГИЗ", "По рекомендации", "Прочее", "Самовывоз"],
            size: newConfig.size || 42,
            points: {} // не используется, вместо этого shop_mode
        };

        console.log(`%cSize of the vp template: ${this.cfg.size}`, 'color: blue; font-size: larger')

        this.traffic = this.all_tables_sorted[0]["traffic"];
        
        this.vp = Array(this.cfg.size).fill(-1);
        this.pt = this.passive_template;
        console.log(this.passive_template)
        this.def = this.default;
        console.log(this.def)
        this.temps = args["templates"];
        console.log(this.temps)
        this.all_list = args["templates"]["all_list"];
        console.log(this.all_list)
        this.deny = args["deny"];
        this.tm = args["datetime"];


        console.log("[AnalIs.run] Базовые переменные инициализированы, traffic:", this.traffic);

        this.ts = {};
        this.refuse_count = false;

        // Создаём объект Type для определения типа страницы (используем новый конфиг)
        this.type_of_page_object = new Type(this.html, newConfig, this.all_tables_sorted[0]["return"]);
        this.type_of_page = this.type_of_page_object.type;
        console.log("[AnalIs.run] Тип страницы определён:", this.type_of_page);

        this.return_type = false;
        if (this.type_of_page[0] == "return") {
            console.log("[AnalIs.run] Обнаружен return тип, получаем return bill");
            let page = await this.get_return_bill();
            if (page) {
                this.return_type = new Type(page, newConfig, true);
                this.vars = this.return_type.vars;
            }
            console.log("[AnalIs.run] Return bill обработан, return_type создан");
        }
        this.copy_massive = [this.return_type, this.vars];
        this.current_temp = this.type_settings[this.type_of_page[0]][0];
        console.log("[AnalIs.run] current_temp установлен для типа:", this.type_of_page[0]);

        for (let i = 1; i < this.current_temp.length; i++) {
            let e = this.current_temp[i];
            if (e.length == 1 && e[0] == false) {
                this.current_temp[i] = Array(this.def[2][i]).fill(-1);
            }
        }

        console.log(this.current_temp)

        console.log("[AnalIs.run] current_temp обработан, пустые шаблоны заполнены");

        this.uv_turn = Object.keys(this.temps["uv_off"]).includes(this.traffic);
        console.log("[AnalIs.run] uv_turn определён:", this.uv_turn);

        console.log("[AnalIs.run] Запуск Scan для обработки шаблона");
        this.Scan(this.current_temp);
        console.log("[AnalIs.run] Scan завершён, vp готов");

        console.log("[AnalIs.run] Возврат результата, type_of_page:", this.type_of_page);
        return [this.type_of_page, this.vp];
    }

    async get_return_bill(url) {
        let bill = this.html.querySelector("#detail-view tr:nth-child(17) a");
        let bill_url = bill.getAttribute("href");
        let page = await get_page(bill_url);
        let html = document.createElement("div");
        html.innerHTML = page;
        return html;
    }

    // Определение, день сейчас или ночь, на основе времени и режима магазина
    _isDay() {
        return this.tm[0]; // час (0-23)
    }

    default_group(temp) {
        console.log("[AnalIs.default_group] Начало выполнения");

        for (let i = 0; i < temp.length; i++) {
            if (temp[i] == false) temp[i] = Array(this.def[2][i]).fill(-1);
        }
        if (temp.length == 1 && temp[0] == "default") temp = Array(this.def[2][0]).fill(true);

        console.log(this._isDay(), this.shop_mode)

        if (this.def[0]["shift"]) {
            // Определяем смену: дневной магазин всегда "д", круглосуточный – по времени
            if (this.shop_mode === 0) {
                this.vp[this.def[1]["shift"]] = "д";
            } else {
                this.vp[this.def[1]["shift"]] = this._isDay() ? "д" : "н";
            }
        }


        if (this.def[0]["date"]) this.vp[this.def[1]["date"]] = this.tm[1]; // дата
        if (this.def[0]["time"]) this.vp[this.def[1]["time"]] = this.tm[2]; // время

        let seller = this.all_tables_sorted[0]["seller"].trim()
            .split(" ")
            .filter(e => e != "-.")
            .join(" ")
            .replace(/\s+/g, ' ')
            .trim();

        // Обработка имён продавцов (enames / names)
        if (this.enames && typeof this.enames === 'object') {
            if (Array.isArray(this.enames)) {
                if (!this.enames.includes(seller)) seller = seller;
            } else {
                let seller_hash = btoa(unescape(encodeURIComponent(seller)));
                if (this.enames[seller_hash]) seller = decodeURIComponent(escape(atob(this.enames[seller_hash])));
            }
        }

        if (this.def[0]["name"]) this.vp[this.def[1]["name"]] = seller;
        console.log("[AnalIs.default_group] Завершено, seller:", seller);
    }

    standart(temp, otemp) {
        console.log("[AnalIs.standart] Начало выполнения");
        console.log(this.passive_template)
        
        if (!this.uv_turn) {
            this.vp[this.all_list[this.traffic]] = temp[1];
        }
        console.log(this.all_tables_sorted)

        console.log(this.pt, otemp, this.all_list, this.traffic)
        console.log(otemp[0], temp[0])
        if (this.uv_turn) {
            
            if (this.pt.order[1] == true) {
                this.vp[this.pt["order"][0]] = temp[0];
            } else {
                this.vp[this.pt["order"][0]] = -1;
            }

            this.vp[this.all_list[this.traffic]] = otemp[0];
        }
        console.log("[AnalIs.standart] Завершено");
    }

    enter_group(temp, otemp) {
        console.log("[AnalIs.enter_group] Начало выполнения");
        if (this.pt.enter[1] == true) {
            this.vp[this.pt["enter"][0]] = temp[0];
        }
        if (this.pt["nc"]) {
            this.vp[this.pt["nc"][0]] = temp[3];
        }
        this.standart(temp, otemp);
        console.log("[AnalIs.enter_group] Завершено");
    }

    items_group(temp) {
        console.log("[AnalIs.items_group] Начало выполнения");
        let items = this.all_tables_sorted[2];
        console.log("[AnalIs.items_group] Количество товаров:", Object.keys(items).length);

        if (Object.keys(items).length > 0) {
            let desc = [];
            let arts = [];
            let count = 0;

            items.forEach(e => {
                if (temp[3] == 1) {
                    if (!(this.stop.includes(Number(e.art))) || (e.art == 0 && e.name == "Клиентский заказ")) {
                        desc.push(e.name);
                        if (e.art != 0) arts.push(e.art);
                        if (e.is_good || e.name == "Клиентский заказ") count += Number(e.count);
                    }
                } else if (temp[3] == -1) {
                    desc.push(e.name);
                    arts.push(e.art);
                    if (e.is_good || e.name == "Клиентский заказ") count += Number(e.count);
                }
            });
            console.log("[AnalIs.items_group] Товары обработаны, count:", count);

            if (temp[1] != 1) desc = [];

            let cobj = this.all_tables_sorted[0]["comment"];
            let comment = cobj["full"];
            let c = document.createElement("div");
            c.innerHTML += comment;
            comment = c.innerText;

            if ((temp[4] == 1) && !(["Не задан", ""].includes(comment))) desc.push(comment);

            if (this.type_of_page[0] == "market" || this.type_of_page[0] == "mobile") {
                cobj["courierComment"] = cobj["courierComment"] ? cobj["courierComment"] : "";
                if (this.pt.comments[1] == true) {
                    this.vp[this.pt["comments"][0]] = cobj["carrierType"].filter(item => typeof item === 'string').map(item => `[${item}]`).join('') + " " + cobj["courierComment"];
                }
                if (this.pt.order_number[1] == true) {
                    this.vp[this.pt["order_number"][0]] = cobj["orderNumber"].join(" ");
                }
                if (this.pt.articles[1] == true) {
                    this.vp[this.pt["articles"][0]] = arts.join(";  ");
                }
            } else {
                if (this.pt.comments[1] == true) {
                    this.vp[this.pt["comments"][0]] = desc.join(",  ");
                }
                if (this.pt.articles[1] == true) {
                    this.vp[this.pt["articles"][0]] = arts.join(";  ");
                }
            }

            this.refuse_count = true;

            if (temp[2] == -1) this.vp[this.pt["articles"][0]] = temp[2];
            if (temp[0] != 1) {
                if (this.pt["buys"][1] == true) {
                    this.vp[this.pt["buys"][0]] = temp[0];
                }
                if (this.pt["items_count"][1] == true) {
                   this.vp[this.pt["items_count"][0]] = temp[0];
                }
            } else {
                if (count > 0) {
                    if (this.pt["buys"][1] == true) {
                    this.vp[this.pt["buys"][0]] = 1;}
                    if (this.pt["items_count"][1] == true) {
                    this.vp[this.pt["items_count"][0]] = count;}
                    this.refuse_count = true;
                } else {
                    this.refuse_count = false;
                    if (this.pt["buys"][1] == true) {
                        this.vp[this.pt["buys"][0]] = 0;
                    }
                    if (this.pt["items_count"][1] == true) {
                        this.vp[this.pt["items_count"][0]] = 0;
                    }
                    this.vp[this.all_list[this.traffic]] = 0;
                    if (this.pt["enter"][1] == true) {
                        this.vp[this.pt["enter"][0]] = 0;
                    }
                }
            }
            console.log("[AnalIs.items_group] vp заполнен, buys:", this.vp[this.pt["buys"]]);
        } else {
            console.log("[AnalIs.items_group] Нет товаров для обработки");
        }
    }

    money_group(temp) {
        console.log("[AnalIs.money_group] Начало выполнения");

        function cd(n) {
            let num = n.split(".");
            if (num[1] == "00") return num[0];
            else {
                if (num[1][1] == "0") num[1] = num[1][0];
                return num.join(".");
            }
        }

        let m = [
            Number(cd(this.all_tables_sorted[1]["cash"])),
            Number(cd(this.all_tables_sorted[1]["no_cash"])),
            Number(cd(this.all_tables_sorted[1]["sbp"]))
        ];
        console.log("[AnalIs.money_group] Деньги считаны, m:", m);

        let cnc = [
            [m[0], m[1], m[2]],
            [m[0], m[1] + m[2]]
        ];
        cnc.forEach(e => {
            e.forEach(elem => {
                if (elem == 0) elem = -1;
            });
        });

        function isInteger(num) {
            return (num ^ 0) === num;
        }

        for (let i = 0; i < cnc.length; i++) {
            for (let j = 0; j < cnc[i].length; j++) {
                if (cnc[i][j] == 0 || !this.refuse_count) {
                    cnc[i][j] = [-1, -1];
                } else {
                    if (!isInteger(cnc[i][j])) {
                        cnc[i][j] = [
                            cnc[i][j].toString().trim().split(".").join(","),
                            Math.round(cnc[i][j]).toString().trim()
                        ];
                    } else {
                        cnc[i][j] = [
                            cnc[i][j].toString().trim(),
                            cnc[i][j].toString().trim()
                        ];
                    }
                }
            }
        }

        let cash_nocash = cnc[1];
        let cash_nocash_sbp = cnc[0];

        let if_money = (this.pt["money"]["pay"][this.type_of_page[0]] && this.pt["money"]["return"][this.type_of_page[0]]);
        let t_m = {};
        let mi = false;
        let mmp = false;

        if (this.return_type != false) {
            mi = this.pt["money"]["pay"][this.return_type.type[0]][0];
            mmp = this.pt["money"]["return"][this.return_type.type[0]][0];
        } else {
            if (if_money) {
                mi = this.pt["money"]["pay"][this.type_of_page[0]][0];
                mmp = this.pt["money"]["return"][this.type_of_page[0]][0];
            } else {
                mi = this.pt["money"]["pay"]["buyer"][0];
                mmp = this.pt["money"]["return"]["buyer"][0];
            }
        }

        t_m[mmp[0]] = [-1, -1];
        t_m[mmp[1]] = [-1, -1];

        this.money_object = (temp.length == 1 && temp[0] == -1) ? t_m : false;
        console.log("[AnalIs.money_group] money_object инициализирован:", this.money_object ? "объект создан" : "false");

        if (temp[0] === 1 && !this.money_object) {
            console.log("[AnalIs.money_branch] Обычная оплата");
            this.money_object = {};
            range(0, 2).forEach(i => {
                this.vp[mi[i]] = cash_nocash_sbp[0][i];
                this.money_object[mi[i]] = cnc[0][i];
            });
        } else if (temp[1] === 1) {
            console.log("[AnalIs.money_branch] Оплата заказа");
            this.money_object = {};
            range(0, 1).forEach(i => {
                this.vp[mi[i]] = cash_nocash[0][i];
                this.money_object[mi[i]] = cnc[0][i];
            });
        } else if (this.return_type != false && temp[2] === 1) {
            console.log("[AnalIs.money_branch] Возврат заказа");
            if (this.return_type.type[0] != false) {
                this.money_object = {};
                if (this.return_type.type[0] == "mobile") {
                    range(0, 1).forEach(i => {
                        this.vp[mi[i]] = cash_nocash[0][i];
                        this.money_object[mi[i]] = cnc[0][i];
                    });
                } else if (this.return_type.type[0] == "buyer") {
                    range(0, 1).forEach(i => {
                        this.vp[mmp[i]] = cash_nocash[0][i];
                        this.money_object[mmp[i]] = cnc[0][i];
                    });
                } else {
                    range(0, 1).forEach(i => {
                        this.vp[mmp[i]] = cash_nocash[0][i];
                        this.money_object[mmp[i]] = cnc[0][i];
                    });
                }
            }
        }
        console.log("[AnalIs.money_group] Завершено");
    }

    Scan(temp) {
        console.log("[AnalIs.Scan] Начало Scan");
        this.default_group(temp[0]);
        this.enter_group(temp[1], temp[2]);
        this.items_group(temp[3]);
        this.money_group(temp[4]);
        console.log("[AnalIs.Scan] Возврат vp");
        return this.vp;
    }
}

// ========== app/classes/assets/copy.js ==========
/**
 * CopyConnect – управление горячими клавишами, кнопками интерфейса и копированием VP-массива.
 * Адаптирован для работы с новым конфигом (использует данные из AnalIs).
 */
class CopyConnect {
    constructor() {
        this.location = window.location.href;
        console.log('🔧 [CopyConnect] Конструктор, текущий URL:', this.location);
    }

    /**
     * Основной метод запуска.
     * @param {Object} args - аргументы из App
     */
    async run(args) {
        console.log('🚀 [CopyConnect.run] Начало, аргументы:', {
            traffic: args.traffic,
            comment: args.comment?.full,
            reasons: args.reasons,
            templatesKeys: Object.keys(args.templates),
            deny: args.deny,
            hasAnalis: !!args.analis
        });

        // Сохраняем входные данные
        this.traffic = args.traffic;
        this.comment = args.comment;
        this.reasons = args.reasons;
        this.all_list = args.templates.all_list;
        this.html = args.html;
        this.all_tables_sorted = args.tables;
        this.interface = args.interface;
        this.analis = args.analis;
        this.deny = args.deny;
        this.temp = args.templates;

        // Сокращённые ссылки на часто используемые объекты
        this.pt = this.analis.pt;               // passive_template
        this.money = this.analis.money_object;  // объект оплат
        this.return_obj = this.analis.copy_massive; // информация о возврате
        this.type = this.analis.type_of_page[0];
        this.vp = this.analis.vp;
        this.refuse_count = this.analis.refuse_count;

        console.log('📋 [CopyConnect.run] Состояние:', {
            type: this.type,
            refuse_count: this.refuse_count,
            money_keys: Object.keys(this.money || {}),
            return_exists: this.return_obj[0] !== false,
            vp_length: this.vp?.length
        });

        // Кнопки интерфейса
        this.buttons = this.interface;
        this.copyButton = this.buttons[0];
        this.checksButtons = this.buttons[1];
        this.cat_button = this.buttons[2];
        this.cat = this.temp.icons;

        // Горячие клавиши
        this.key_buffer = [];
        this._setupHotKeys();

        // Ссылка на исходный чек при возврате
        const bill_url = this.analis.type_of_page_object.vars?.return_link;
        this._checkReturnErrors(bill_url);

        // Определяем, есть ли ошибки в полях
        this._evaluateErrors();

        // Настраиваем внешний вид иконки
        this._setupIcon();

        // Подключаем обработчик клика по кнопке копирования
        this.connect_click();

        // Первоначальная проверка (без вызова alert)
        this.checks(false);
        console.log('✅ [CopyConnect.run] Завершён');
    }

    // ------------------------------------------------------------------
    // Обработка ошибок (трафик, комментарий, причина, возврат)
    // ------------------------------------------------------------------

    /**
     * Определяет, какие поля не заполнены (traffic, comment, reasons, orderNumber).
     */
    _evaluateErrors() {
        const need = this.temp.need;

        // Проверка основного чека
        this.need_traffic = !need.traffic.includes(this.type) && this.deny.includes(this.traffic);
        this.need_comment = need.comment.includes(this.type) && this.deny.includes(this.comment.full);
        this.need_orderNu = need.orderNumber.includes(this.type) && this.comment.orderNumber.length < 1;
        this.need_reasons = need.reasons.includes(this.type) && this.deny.includes(this.reasons);

        console.log('🔍 [CopyConnect._evaluateErrors] Основной чек:', {
            type: this.type,
            traffic: this.traffic,
            need_traffic: this.need_traffic,
            need_comment: this.need_comment,
            need_orderNu: this.need_orderNu,
            need_reasons: this.need_reasons
        });

        // Проверка чека возврата (если есть)
        this.need_returns = false;
        if (this.return_obj[0] !== false) {
            const vars = this.return_obj[0].vars;
            const returnType = this.return_obj[0].type[0];
            const need_traffic = !need.traffic.includes(returnType) && this.deny.includes(vars.traffic);
            const need_comment = need.comment.includes(returnType) && this.deny.includes(vars.comment.full);
            const need_orderNu = need.orderNumber.includes(returnType) && vars.comment.orderNumber.length < 1;
            const need_reasons = need.reasons.includes(returnType) && this.deny.includes(vars.reasons);
            this.need_returns = need_reasons || need_comment || need_orderNu || need_traffic;
            console.log('🔄 [CopyConnect._evaluateErrors] Чек возврата:', {
                returnType,
                need_traffic,
                need_comment,
                need_orderNu,
                need_reasons,
                need_returns: this.need_returns
            });
        }

        this.not_allow = this.need_reasons || this.need_comment || this.need_orderNu || this.need_traffic || this.need_returns;
        console.log('🚫 [CopyConnect._evaluateErrors] Итог: not_allow =', this.not_allow);
    }

    /**
     * Проверяет чек возврата и предлагает перейти к исходному чеку при ошибках.
     * @param {string} bill_url - ссылка на исходный чек
     */
    _checkReturnErrors(bill_url) {
        if (this.return_obj[0] !== false && this.need_returns) {
            console.warn('⚠️ [CopyConnect._checkReturnErrors] Обнаружены ошибки в исходном чеке возврата, URL:', bill_url);
            const confirmed = confirm("Исходный чек не корректен!\nПерейти к проблемному чеку?");
            if (confirmed && bill_url) {
                console.log('🔁 [CopyConnect._checkReturnErrors] Перенаправление на проблемный чек');
                window.location.replace(bill_url);
            } else {
                console.log('❌ [CopyConnect._checkReturnErrors] Перенаправление отменено');
            }
        }
    }

    // ------------------------------------------------------------------
    // Интерфейс и кнопки
    // ------------------------------------------------------------------

    /**
     * Настраивает внешний вид иконки (котик) в зависимости от наличия ошибок.
     */
    _setupIcon() {
        if (this.not_allow) {
            this.cat_button.innerHTML = this.cat[1];
            console.log('🐱 [CopyConnect._setupIcon] Иконка переключена на грустного кота (ошибки есть)');
        } else {
            this.cat_button.innerHTML = this.cat[0][0];
            console.log('🐱 [CopyConnect._setupIcon] Иконка счастливого кота, ошибок нет');
            this.cat_button.addEventListener("mouseover", () => {
                this.cat_button.innerHTML = this.cat[0][1];
                this.cat_button.style.fontSize = "1cqh";
                console.log('🐱 mouseover -> смена текста и уменьшение шрифта');
            });
            this.cat_button.addEventListener("mouseout", () => {
                this.cat_button.innerHTML = this.cat[0][0];
                this.cat_button.style.fontSize = "2cqh";
                console.log('🐱 mouseout -> восстановление текста и шрифта');
            });
        }
    }

    /**
     * Проверяет, активна ли кнопка (имеет класс 'checked').
     * @param {HTMLElement} btn - кнопка
     * @returns {boolean}
     */
    checked(btn) {
        const isChecked = btn?.classList.contains("checked");
        if (btn && btn.innerText) {
            // Логируем только если кнопка не undefined, чтобы не засорять консоль
            // console.debug(`🔘 Кнопка "${btn.innerText}" checked = ${isChecked}`);
        }
        return isChecked;
    }

    // ------------------------------------------------------------------
    // Проверка полей и подсветка ошибок
    // ------------------------------------------------------------------

    /**
     * Выполняет проверку полей, подсвечивает проблемные строки и выводит сообщения.
     * @param {boolean} no_start - если true, показывать alert при ошибках
     * @returns {[boolean, Array]} [разрешено_ли_копирование, vp]
     */
    checks(no_start = true) {
        console.log(`🔎 [CopyConnect.checks] no_start = ${no_start}, not_allow = ${this.not_allow}`);
        // Если страница изменилась – переустановить класс (глобальная функция)
        if (this.location !== window.location.href) {
            console.log('🔄 [CopyConnect.checks] URL изменился, вызов reinstallClass()');
            if (typeof reinstallClass === "function") reinstallClass();
            return [false, this.vp];
        }

        // Шаблоны ошибок
        const errorTemplates = {
            returns: ["У вас проблемный чек!", [17], this.need_returns, false],
            traffic: ["Введите трафик!", [19], this.need_traffic, false],
            orderNumber: ["В комментарии нет номера заказа!", [22], this.need_orderNu, false],
            comment: [
                {
                    return: "Введите комментарий, опишите причину возврата чека!",
                    market: "Введите комментарий с номером заказа!",
                    no_item: "Опишите непокупку (обстоятельства, причина)"
                },
                [22],
                this.need_comment,
                true
            ],
            reasons: ["Введите причину не покупки!", [21], this.need_reasons, false]
        };

        let anyError = false;
        for (const [key, [msg, rows, condition, isDynamic]] of Object.entries(errorTemplates)) {
            if (condition) {
                anyError = true;
                const message = isDynamic ? msg[this.type] : msg;
                if (no_start) {
                    console.warn(`⚠️ [CopyConnect.checks] Ошибка поля "${key}": ${message}`);
                    alert(message);
                }
                rows.forEach(row => {
                    const tr = this.html.querySelector(`.detail-view.table tr:nth-child(${row})`);
                    if (tr) {
                        [tr.querySelector("th"), tr.querySelector("td")].forEach(el => {
                            if (el) {
                                el.style.background = "#C44536";
                                el.style.color = "white";
                                console.log(`🎨 Подсветка строки ${row}, элемент:`, el);
                            }
                        });
                    } else {
                        console.warn(`⚠️ Строка ${row} не найдена в DOM`);
                    }
                });
            }
        }

        // Если есть ошибки – копирование запрещено
        if (this.not_allow) {
            console.log('❌ [CopyConnect.checks] not_allow = true, копирование запрещено');
            return [false, this.vp];
        }

        // Применяем логику кнопок к vp
        console.log('🔄 [CopyConnect.checks] Применение логики кнопок');
        this._applyButtonLogic();
        console.log('✅ [CopyConnect.checks] Копирование разрешено');
        return [true, this.vp];
    }

    /**
     * Применяет состояние кнопок к массиву vp.
     */
    _applyButtonLogic() {
        console.log('⚙️ [CopyConnect._applyButtonLogic] Начало');
        // Кнопка ДК (DC) – индекс 1 (вторая кнопка)
        console.log(this.checksButtons[1], this.type, this.checksButtons)
        if (this.checked(this.checksButtons[1]) && this.type === "buyer") {
            const newDc = this.checked(this.checksButtons[2]) ? 0 : 1;
            console.log(`🎛️ Кнопка ДК активна, тип buyer, DC = ${newDc} (раньше было ${this.vp[this.pt.dc[0]]})`);
            this.vp[this.pt.dc[0]] = newDc;
        } else {
            if (this.vp[this.pt.dc[0]] !== -1) {console.log(`🎛️ DC не меняется, остаётся ${this.vp[this.pt.dc[0]]}`);
            this.vp[this.pt.dc[0]] = -1;}
        }

        // Логика кнопки "убранные покупки" (checkButtons[2]) – третья кнопка
        if (this.refuse_count) {
            const buttonChecked = this.checked(this.checksButtons[2]);
            console.log(buttonChecked && this.type === "buyer")
            if (buttonChecked && this.type === "buyer") {
                    console.log('🔄 [ApplyButtons] Обнуляем трафик и вход (кнопка активна)');
                    if (this.vp[this.all_list[this.traffic]] !== -1) this.vp[this.all_list[this.traffic]] = 0;
                    if (this.vp[this.pt.enter[0]] !== -1) this.vp[this.pt.enter[0]] = 0;
                    if (this.vp[this.pt.dc[0]] !== -1) this.vp[this.pt.dc[0]] = 0;
                    if (this.vp[this.pt.buys[0]] !== -1) this.vp[this.pt.buys[0]] = 0;
            } else if (!buttonChecked && this.type === "buyer") {
                    console.log('🔄 [ApplyButtons] Восстанавливаем трафик и вход (кнопка неактивна)');
                    if (this.vp[this.all_list[this.traffic]] !== -1) this.vp[this.all_list[this.traffic]] = 1;
                    if (this.vp[this.pt.enter[0]] !== -1) this.vp[this.pt.enter[0]] = 1;
                    if (this.vp[this.pt.dc[0]] !== -1) this.vp[this.pt.dc[0]] = 1;
                    if (this.vp[this.pt.buys[0]] !== -1) this.vp[this.pt.buys[0]] = 1;
            }
            console.log(this.vp[this.pt.enter[0]] === 0, this.vp[this.all_list[this.traffic]] === 0,  this.vp[this.pt.enter[0]], this.vp[this.all_list[this.traffic]])
            console.log((this.vp[this.pt.enter[0]] === 0 && this.vp[this.all_list[this.traffic]] === 0), (!buttonChecked && this.type === "buyer"))
        }
        

        console.log(this.money, this.pt.money, this.type, Object.keys(this.money).length === 3)

        console.log((this.money && Object.keys(this.money).length === 3) )

        // Логика кнопки "СБП/наличные" (checkButtons[0]) – первая кнопка
        if (this.money && Object.keys(this.money).length === 3) {
            console.log(this.pt)
            const payCfg = this.pt.money?.pay?.[this.type];
            console.log(this.money)
            if (payCfg && payCfg[0] && payCfg[0].length >= 3) {
                const bezn = payCfg[0][1];
                const sbp = payCfg[0][2];
                const numObj = { [bezn]: false, [sbp]: true };
                const num = Object.keys(numObj);
                console.log(this.checked(this.checksButtons[0]))
                console.log(`💰 [ApplyButtons] Обработка СБП/наличные, колонки: ${bezn}, ${sbp}`);
                console.log(this.money[num[0]][0], this.money[num[1]][0])
                if (this.checked(this.checksButtons[0])) {
                    console.log('cбп')
                        let temp1 = this.money[num[0]][0]
                        let temp2 = this.money[num[0]][1]
                        if (temp1 != -1 && temp2 != -1) {
                        this.money[num[0]][0] = this.money[num[1]][0];
                        this.money[num[0]][1] = this.money[num[1]][1];
                        this.money[num[1]][0] = temp1;
                        this.money[num[1]][1] = temp2;
                        }
                        
                    } else {
                        console.log('безнал')
                        let temp1 = this.money[num[1]][0]
                        let temp2 = this.money[num[1]][1]
                        console.log(temp1, temp2)
                        if (temp1 != -1 && temp2 != -1) {
                        this.money[num[1]][0] = this.money[num[0]][0];
                        this.money[num[1]][1] = this.money[num[0]][1];
                        this.money[num[0]][0] = temp1;
                        this.money[num[0]][1] = temp2;
                        }
                    }

                }}
                console.log(this.money)

        // Применяем округление (убрать копейки) – кнопка checkButtons[3] (четвёртая)
        const cutActive = this.checked(this.checksButtons[3]);
        const cutIndex = cutActive ? 1 : 0;
        console.log(`✂️ [ApplyButtons] Округление активен = ${cutActive}, индекс = ${cutIndex}`);

        // Заполняем vp из money_object
        if (this.return_obj[0] !== false) {
            const returnType = this.return_obj[0].type[0];
            console.log(`🔄 Возврат, тип = ${returnType}`);
            if (returnType === "mobile") {
                for (const [col, val] of Object.entries(this.money)) {
                    const value = val[cutIndex];
                    this.vp[col] = value === "-1" ? "" : "-" + value;
                }
                console.log('📱 Применены отрицательные значения для mobile');
            } else if (returnType === "buyer") {
                for (const [col, val] of Object.entries(this.money)) {
                    this.vp[col] = val[cutIndex];
                }
                console.log('👤 Скопированы значения для buyer');
            } else if (returnType === "market") {
                for (const col of Object.keys(this.money)) {
                    this.vp[col] = "-1";
                }
                console.log('🏪 Для market все деньги = -1');
            }
        } else {
            for (const [col, val] of Object.entries(this.money)) {
                this.vp[col] = val[cutIndex];
            }
            console.log('💵 Обычный чек, значения денег скопированы с учётом округления');
        }
    }

    // ------------------------------------------------------------------
    // Копирование в буфер обмена
    // ------------------------------------------------------------------

    /**
     * Форматирует массив VP в строку с разделителями табуляцией.
     * @param {Array} table - массив данных (vp)
     * @returns {string}
     */
    format_uv(table) {
        console.log(table)
        const result = table.map(e => (e === -1 ? "" : e)).join("\t");
        console.log('📄 [CopyConnect.format_uv] Строка для копирования:', result.substring(0, 100) + (result.length > 100 ? '…' : ''));
        return result;
    }

    /**
     * Копирует сформированный массив в буфер обмена.
     * @param {Array} msg - массив vp
     * @param {boolean} hot - флаг, что вызов из горячей клавиши
     */
    clipText(msg, hot = false) {
        console.log(`📋 [CopyConnect.clipText] hot = ${hot}, вызов checks(true)`);
        const [ok, vp] = this.checks(true);
        if (!ok) {
            console.warn('❌ Копирование отклонено из-за ошибок');
            return;
        }

        const textToCopy = this.format_uv(vp);
        navigator.clipboard.writeText(textToCopy)
            .then(() => console.log('✅ Успешно скопировано в буфер обмена! (Alt+S)'))
            .catch(err => console.error('❌ Ошибка копирования:', err));

        if (hot) {
            this.key_buffer = this.key_buffer.filter(k => k !== "AltLeft");
            console.log('⌨️ Горячая клавиша Alt+S обработана, AltLeft удалён из буфера');
        }
    }

    // ------------------------------------------------------------------
    // Горячие клавиши
    // ------------------------------------------------------------------

    /**
     * Проверяет, нажата ли клавиша.
     * @param {string} k - код клавиши (например, "AltLeft")
     * @returns {boolean}
     */
    key(k) {
        return this.key_buffer.includes(k);
    }

    /**
     * Настраивает обработчики onkeydown/onkeyup.
     */
    _setupHotKeys() {
        document.onkeydown = e => {
            if (!this.key_buffer.includes(e.code)) {
                this.key_buffer.push(e.code);
                // console.debug(`⌨️ KeyDown: ${e.code}, буфер:`, this.key_buffer);
            }
        };

        document.onkeyup = e => {
            const code = e.code;
            if (!this.key_buffer.includes(code)) return;

            // Alt+S – копирование
            if (this.key("AltLeft") && this.key("KeyS")) {
                console.log('⌨️ Обнаружена комбинация Alt+S, вызов clipText');
                this.clipText(this.vp, true);
            }

            // Alt+A, Alt+Q, Alt+W – переключение кнопок
            const buttonMap = { A: 0, Q: 1, W: 2 };
            for (const [keyLetter, index] of Object.entries(buttonMap)) {
                if (this.key("AltLeft") && this.key(`Key${keyLetter}`)) {
                    console.log(`⌨️ Комбинация Alt+${keyLetter}, переключение кнопки ${index}`);
                    this.interface.ToggleCheck(this.checksButtons[index]);
                    this.key_buffer = this.key_buffer.filter(k => k !== "AltLeft");
                    break;
                }
            }

            // Убираем клавишу из буфера
            this.key_buffer = this.key_buffer.filter(k => k !== code);
            // console.debug(`⌨️ KeyUp: ${code}, буфер:`, this.key_buffer);
        };
        console.log('⌨️ [CopyConnect._setupHotKeys] Обработчики горячих клавиш установлены');
    }

    /**
     * Подключает обработчик клика к кнопке копирования.
     */
    connect_click() {
        this.copyButton.addEventListener("click", () => {
            console.log('🖱️ Клик по кнопке копирования');
            this.copyButton.style.background = "white";
            this.clipText(this.vp, false);
        });
        console.log('🖱️ [CopyConnect.connect_click] Обработчик клика добавлен');
    }
}

// ========== app/classes/appClass.js ==========
// Код приложения
// Вместо жестко заданного объекта configure используется глобальная переменная configure, инициализируемая через initConfig()


// ГЛАВНЫЙ КЛАСС ПРИЛОЖЕНИЯ
class App {

    // {
    //     "config": "НАСТРОЙКИ ПРИЛОЖЕНИЯ (ЗАГРУЖАЕМЫЕ С СЕРВЕРА ИП)",
    //     "html": "ПЕРЕМЕННАЯ С ПРЕДВАРИТЕЛЬНЫМ СОДЕРЖИМЫМ СТРАНИЦЫ (ПОСЛЕ ПОЛУЧЕНИЯ)", 
    //     "start_key": "КЛЮЧ ЗАПУСКА (ЗАКОДИРОВАН В BASE64, РАЗКОДИРОВЫВАЕТСЯ ПРИ ЗАПУСКЕ)"
    // }
    
    // НАЧАЛЬНЫЕ ЗНАЧЕНИЯ ПРИЛОЖЕНИЯ
    constructor(args) {

        // ПЕРЕМЕННАЯ С НАСТРОЙКАМИ; ПЕРЕМЕННАЯ С ПРЕДВАРИТЕЛЬНЫМ СОДЕРЖИМЫМ СТРАНИЦЫ;  КЛЮЧ ЗАПУСКА;
        this.config = args["config"]; 
        this.html = document.body; 
        this.start_key = args["start_key"];
        this.main();

    }

    // types: 
    // {
    //     "buyer": ["buyer", "Покупатель", 0],
    //     "market": ["market", "Маркетплейс", 1],
    //     "mobile": ["mobile", "Мобильное приложение", 2],
    //     "takeup": ["takeup", "Самовывоз", 3],
    //     "return": ["return", "Возврат", 4],
    //     "open": ["open", "Открытый чек", 5],
    //     "no_item": ["no_item", "Непокупка", 6]
    // }

    // КОСТЫЛЬ ДЛЯ УПРОЩЕНИЯ КОДА И ЕГО ОБЛЕГЧЕНИЯ
    t(type_of_page) {return this.cfg["type_settings"][type_of_page][2]}

    // func html()
    // -> None 
    // html (inner of iframe on the page after waiting) <-

    // ПОЛУЧЕНИЕ СОДЕРЖИМОГО СТРАНИЦЫ
    async get_html() {
        let html = document.body // ПОЛУЧЕНИЕ ПРЕДВОРИТЕЛЬНОГО РЕЗУЛЬТАТА
        // ФУНКЦИЯ ПОЛУЧЕНИЯ СОДЕРЖИМОГО ПОСЛЕ ПОДГРУЗКИ ЕЛЕМЕНТА ПО СЕЛЕКТОРУ
        async function waitForIframeAndElement(selector) {
            return new Promise((resolve, reject) => { // СОЗДАЕМ ПРОМИС
                const checkIframe = setInterval(() => { //СТАВИМ ИНТЕРВАЛ ПРОВЕРКИ ЭЛЕМЕНТА
                    const iframe = document.querySelector('main iframe'); // ОЖИДАНИЕ IFRAME
                    if (iframe) {
                        // ЕСЛИ IFRAME В НАЛИЧИИ ТО СОЗДАЕМ НОВЫЙ ИНТЕРВАЛ ОЖИДАНИЯ ЭЛЕМЕНТА
                        const checkElement = setInterval(() => {
                            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                            const element = iframeDocument.querySelector(selector);
                            // ЭЛЕМЕНТ НАЙДЕН
                            if (element) {
                                clearInterval(checkElement);
                                clearInterval(checkIframe);
                                resolve(element); // ОТПРАВИТЬ ОТВЕТ ПРОМИСА
                            }
                        }, 100);
                    }
                }, 100);
            });
        }
        if (window.location.href.includes("cpanel")) {html = await waitForIframeAndElement("#yw0")} // ПРОВЕРКА СТАРОЙ ВЕРСИИ САЙТА (НЕАКТУАЛЬНО)
        return html // ВОЗВРАЩАЕМ СОДЕРЖИМОЕ СТРАНИЦЫ
    }

    // ГЛАВНАЯ ФУНКЦИЯ ВХОД В ПРОГРАММУ
    async main() {
        // ПОЛУЧЕНИЕ СОДЕРЖИМОГО СТРАНИЦЫ
        this.html = await this.get_html()
        console.log("[App.main] HTML loaded")
        // ПОЛУЧЕНИЕ НАСТРОЕК ОТ ИП
        // this.cfg = await this.get_file("configure.json").catch(err => {console.log("[App.main] GET_CONFIG_ERROR", err)})
        this.cfg = configure
        console.log("[App.main] Config loaded")

        // БАЗОВЫЕ ШАБЛОНЫ К VP И ОФОРМЛЕНИЮ ИНТЕРФЕЙСА
        this.templates = {
            all_list: Object.assign({}, this.cfg["buyerSources"], this.cfg["marketSources"], this.cfg["mobileSources"], this.cfg["takeupSources"]),
            uv_off: Object.assign({}, this.cfg["marketSources"], this.cfg["mobileSources"], this.cfg["takeupSources"]),
            need: {orderNumber: ["market", "mobile", "takeup"], traffic: ["open", "return"], comment: ["market", "mobile", "takeup", "return", "no_item"], reasons: ["no_item"]},
            icons: [["ฅ^•⩊•^ฅ", "⎛⎝^>⩊<^⎠⎞"], "≽/ᐠ - ˕ -マ≼"] }

        // СТРОКИ БЕЗ ВЫБРАННОГО ПУНКТА
        this.deny = ["Не задан", ""]
        console.log("[App.main] Templates loaded")
        
        // ПРЕМЕЧАНИЕ: ТАК КАК САЙТ СЕЙЧАС ИМЕЕТ ФОРМУ SPA (single page application)
        // ПОЛУЧЕНИЕ СОДЕРЖИМОГО СТРАНИЦЫ ЯВЛЯЕТСЯ АСИНХРОННОЙ ФУНКЦИЕЙ И ЗАПУСКАЕТСЯ ВНУТРИ
        // "АСИНХРОННЫХ КЛАССОВ", В КОТОРЫХ НЕТ ВОЗМОЖНОСТИ АСИНХРОННО ЗАПУСТИТЬ КОД ЧЕРЕЗ 
        // CONSTRUCTOR ИЗ ЗА ЧЕГО В КАЖДОМ КЛАССЕ РЕАЛИЗОВАННА АСИНХРОННАЯ ФУНКЦИЯ RUN() 
        // КОТОРАЯ МОЖЕТ ЧТО ТО ПРИНИМАТЬ, А МОЖЕТ И НЕ ПРИНИМАТЬ, ЕЕ ЗАПУСК В КЛАССЕ НЕОБХОДИМ.
        // КЛАССЫ, КОТОРЫЕ НЕ ТРЕБУЕТ АСИХРОННОГО ПОДХОДА ВЫПОЛНЕННЫ ПО ВОЗМОЖНОСТИ БЕЗ НЕГО. 
        
        // КЛАСС INTERFACE ОТВЕЧАЕТ ЗА ИНТЕРФЕЙС ПРОГРАММЫ
        this.interface = new Interface()
        console.log("[App.main] Interface class loaded")
        this.buttons = await this.interface.run(this.html)
        console.log("[App.main] Interface buttons loaded")
        
        // КЛАСС TABLES ОТВЕЧАЕТ ЗА РАЗБИТИЕ ДАННЫХ СТРАНИЦЫ НА КОМФОРТНЫЕ ДЛЯ ПОНИМАНИЯ ДАННЫЕ.
        this.tables = new Tables(this.cfg, this.html)
        console.log("[App.main] Tables class loaded")
        this.tables = await this.tables.get_all()
        console.log("[App.main] Tables class get all data")
        this.all_tables_sorted = [this.tables[0], this.tables[1], this.tables[2]]
        console.log("[App.main] Tables class sorted all tables")
        console.log(this.all_tables_sorted)

        // КЛАСС НЕКЛИЕНТА ПИШЕТСЯ ПОД КАЖДОЕ ИП ОТДЕЛЬНО ЯВЛЯЕТСЯ СИЛЬНОЙ И НЕЗАВИСИМОЙ ФУНКЦИЕЙ
        let nc = new no_client({"config": this.cfg, "table": this.all_tables_sorted})
        console.log("[App.main] No_client class loaded")

        console.log(`%cStop List: ${this.cfg.stopList}`, 'color: green; font-size: larger')

        await nc.connect(this.buttons[3])
        console.log("[App.main] No_client connected")

        // ВВОД ОСНОВНЫХ ДЕЙСТВУЮЩИХ ПЕРЕМЕННЫХ
        this.traffic  = this.all_tables_sorted[0]["traffic"]
        this.comment  = this.all_tables_sorted[0]["comment"]
        this.reasons  = this.all_tables_sorted[0]["reason"]

        

        console.log(`[App.main] Main variables loaded: traffic: ${this.traffic}, comment: ${this.comment}, reasons: ${this.reasons}]`)

        const timeshift = [this.cfg["start"], this.cfg["end"]]

         // КЛАСС VPTIME ОТВЕЧАЕТ ЗА ОБРАБОТКУ ДАТЫ ВРЕМЕНИ И ТИПА СМЕНЫ (Н/Д)
        // console.log(timeshift, this.cfg["shop_type"] === 1)
        this.datetime = new VpTime()
        console.log("[App.main] VpTime class loaded")
        this.datetime = await this.datetime.run(this.all_tables_sorted[0]["datetime"].split(", "), timeshift, this.cfg["shop_type"] == 1)
        console.log("[App.main] VpTime class data loaded")


        

        // КЛАСС ANALYSIS ОТВЕЧАЕТ ЗА СВЕРКУ ДАННЫХ С ШАБЛОНОМ 
        // И ПОЛНОСТЬЮ ГЕНЕРИРУЕТ ПРЕДВАРИТЕЛЬНЫЙ ШАБЛОН
        this.analysis     = new AnalIs()
        this.analis       = await this.analysis.run({
            tables:     this.all_tables_sorted, 
            all_list:   this.templates["all_list"],
            config:     this.cfg,
            html:       this.html,
            interface:  this.interface,
            templates:  this.templates,
            datetime:   this.datetime,
            deny:       this.deny
        })

        this.uv_turn      = this.analysis.uv_turn // ТИП СМЕНЫ (Д/Н)
        this.type_of_page = this.analis[0]        // ТИП ЧЕКА  (маркет, клиент, нетовар, неклиен...)
        
        // console.log(this.uv_turn, this.type_of_page)
        // КЛАСС COPYCONNECT САМЫЙ НЕ СИСТЕМАТИЗРОВАННЫЙ КЛАСС - ОТВЕЧАЕТ ЗА ГОРЯЧИЕ КЛАВИШИ, 
        // ОТСЛЕЖИВАНИЕ НАЖАТЫХ КНОПОК И ИТОГОВОЕ КОПИРОВАНИЕ 
        this.copy_class = new CopyConnect()
        await this.copy_class.run({
            html:              this.html,
            type_of_page:      this.type_of_page,
            interface:         this.buttons,
            all_tables_sorted: this.all_tables_sorted[0]["table_sorted"],
            traffic:           this.traffic,
            comment:           this.comment,
            reasons:           this.reasons,
            analis:            this.analysis,
            deny:              this.deny,
            templates:         this.templates
        })
    }
}



// ========== app/classes/monitorClass.js ==========
class Monitor {
    constructor() {
        this.url_template = {
            view: ["sales/view/id"],
            manage: ["sales/manage"]
        };
        this.current = window.location.href;
        this.currentApp = null;
        this.appType = null; // 'main' или 'sale'
        this.observer = null;
        this.tableObserver = null;
        
        this.init();
    }

    async init() {
        if (typeof configure === 'undefined' || !configure) {
            console.log('⏳ Ожидание загрузки конфига...');
            await new Promise(resolve => {
                const checkConfig = () => {
                    if (typeof configure !== 'undefined' && configure) {
                        resolve();
                    } else {
                        setTimeout(checkConfig, 50);
                    }
                };
                checkConfig();
            });
        }
        
        await this.routeByUrl(this.current);
        this.trackUrlChanges();
        console.log(configure)
    }

    getPageType(url) {
        if (this.url_template.view.some(pattern => url.includes(pattern))) {
            return 'view';
        }
        if (this.url_template.manage.some(pattern => url.includes(pattern))) {
            return 'manage';
        }
        return null;
    }

    // Получение document (основной или из iframe для cpanel)
    getTargetDoc() {
        if (window.location.href.includes('cpanel')) {
            const iframe = document.querySelector('main iframe');
            if (iframe) {
                return iframe.contentDocument || iframe.contentWindow.document;
            }
        }
        return document;
    }

    // Поиск таблицы
    findGrid() {
        const doc = this.getTargetDoc();
        return doc.getElementById('receipts-grid');
    }

    async waitForGrid() {
        return new Promise(resolve => {
            const check = () => {
                const grid = this.findGrid();
                if (grid) {
                    resolve(grid);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    // Настройка наблюдения за таблицей
    async setupSaleManagerObserver() {
        const grid = await this.waitForGrid();
        if (!grid) return;

        console.log('👀 Наблюдение за таблицей запущено');

        this.tableObserver = new MutationObserver(() => {
            console.log('🔄 Таблица изменилась');
            this.restartSaleManager();
        });

        this.tableObserver.observe(grid, { 
            childList: true, 
            subtree: true,
            characterData: true 
        });
    }

    // Перезапуск SaleManager с гарантированной повторной попыткой
    restartSaleManager() {
        if (this.appType === 'sale' && this.currentApp) {
            this.currentApp = null;
        }
        
        // Пробуем несколько раз с увеличивающейся задержкой
        this.attemptRestart(0);
    }

    attemptRestart(attempt) {
        const maxAttempts = 5;
        const delays = [100, 300, 500, 800, 1000]; // Увеличиваем задержку
        
        setTimeout(() => {
            const grid = this.findGrid();
            const hasRows = grid && grid.querySelector('tbody tr, tr');
            
            console.log(`📋 Попытка ${attempt + 1}: таблица=${!!grid}, строки=${!!hasRows}`);
            
            if (hasRows) {
                console.log('🚀 Создание SaleManager');
                try {
                    this.currentApp = new SaleManager();
                    this.appType = 'sale';
                    console.log('✅ SaleManager готов');
                } catch (e) {
                    console.error('❌ Ошибка:', e);
                    // Пробуем ещё раз если не удалось
                    if (attempt < maxAttempts - 1) {
                        this.attemptRestart(attempt + 1);
                    }
                }
            } else {
                // Таблица пустая, пробуем ещё раз
                if (attempt < maxAttempts - 1) {
                    console.log('⏳ Таблица пуста, повтор...');
                    this.attemptRestart(attempt + 1);
                }
            }
        }, delays[attempt]);
    }

 startMainApp() {
    // Удаляем предыдущее приложение, если было
    if (this.currentApp) {
        if (this.appType === 'main' && this.currentApp.app && this.currentApp.app.interface) {
            this.currentApp.app.interface.remove();
        }
        this.currentApp = null;
    }
    
    console.log('🚀 Запуск основного приложения с конфигом из storage');
    try {
        // Преобразуем конфиг из браузера в формат для приложения
        const appConfig = configure;
        
        this.currentApp = new App({ config: appConfig, start_key: sets.start_key });
        this.appType = 'main';
        console.log('✅ Основное приложение запущено');
    } catch (e) {
        console.error('❌ Ошибка:', e);
    }
}

cleanup() {
    console.log('🧹 Очистка ресурсов...');
    
    // Отключаем наблюдатель за таблицей
    if (this.tableObserver) {
        this.tableObserver.disconnect();
        this.tableObserver = null;
    }

    // Удаляем интерфейс основного приложения, если оно было запущено
    if (this.appType === 'main' && this.currentApp) {
        console.log('🗑️ Удаление интерфейса основного приложения');
        
        // Пробуем разные способы удаления
        if (this.currentApp.app && this.currentApp.app.interface) {
            // Прямой вызов remove
            this.currentApp.app.interface.remove();
        } else if (this.currentApp.interface) {
            // Альтернативный вариант
            this.currentApp.interface.remove();
        } else if (this.currentApp.wrapper) {
            // Если есть прямой доступ к wrapper
            this.currentApp.wrapper.remove();
        }
        
        // Дополнительная очистка DOM на всякий случай
        const wrapper = document.querySelector('.wrapper');
        if (wrapper) wrapper.remove();
    }
    
    // Очищаем SaleManager
    if (this.appType === 'sale' && this.currentApp) {
        console.log('🗑️ Очистка SaleManager');
        // Если у SaleManager есть метод destroy или cleanup, вызовите его
        if (this.currentApp.destroy) {
            this.currentApp.destroy();
        }
    }
    
    this.currentApp = null;
    this.appType = null;
    
    console.log('✅ Очистка завершена');
}

    async routeByUrl(url) {
        const pageType = this.getPageType(url);
        
        this.cleanup();

        if (pageType === 'view') {
            this.startMainApp();
        } else if (pageType === 'manage') {
            await this.setupSaleManagerObserver();
            this.restartSaleManager();
            // Запускаем отслеживание пагинации
            this.startPaginationTracking();
        } else {
            console.log('⏭️ Неизвестный тип страницы');
        }
    }

    trackUrlChanges() {
        this.current = window.location.href;
        
        this.observer = new MutationObserver(() => {
            if (this.current !== window.location.href) {
                const oldUrl = this.current;
                this.current = window.location.href;
                console.log(`🔁 URL изменился: ${oldUrl} -> ${this.current}`);
                this.routeByUrl(this.current);
            }
        });
        
        this.observer.observe(document, { 
            childList: true, 
            subtree: true 
        });
        
        // Дополнительная проверка URL через setInterval
        setInterval(() => {
            if (this.current !== window.location.href) {
                this.current = window.location.href;
                this.routeByUrl(this.current);
            }
        }, 500);
    }

    // Отслеживание пагинации через事件 delegation
    startPaginationTracking() {
        const setupTracking = () => {
            const doc = this.getTargetDoc();
            
            // Находим контейнер для пагинации
            const container = doc.querySelector('#yw10') || doc.querySelector('.pagination');
            
            // Event delegation - вешаем обработчик на document
            doc.addEventListener('click', (e) => {
                // Проверяем, была ли нажата ссылка пагинации
                const link = e.target.closest('a');
                if (link) {
                    const parent = link.parentElement;
                    // Проверяем что это ссылка пагинации (не disabled)
                    if (parent && !parent.classList.contains('disabled')) {
                        console.log('📄 Клик по пагинации:', link.href);
                        // Ждём загрузки новой страницы
                        setTimeout(() => this.restartSaleManager(), 800);
                    }
                }
            });
            
            // Отслеживаем изменение select количества записей
            const pageSizeSelect = doc.querySelector('#displayCount');
            if (pageSizeSelect) {
                // Удаляем старый обработчик если есть
                const oldHandler = pageSizeSelect._pageSizeHandler;
                if (oldHandler) {
                    pageSizeSelect.removeEventListener('change', oldHandler);
                }
                
                const newHandler = (e) => {
                    console.log('📊 Изменение количества записей:', e.target.value);
                    setTimeout(() => this.restartSaleManager(), 800);
                };
                
                pageSizeSelect._pageSizeHandler = newHandler;
                pageSizeSelect.addEventListener('change', newHandler);
                console.log('📊 Обработчик #displayCount установлен');
            }
            
            // Также следим за изменениями в DOM - новые элементы пагинации
            const observer = new MutationObserver(() => {
                const newContainer = doc.querySelector('#yw10') || doc.querySelector('.pagination');
                if (newContainer && !newContainer._observed) {
                    newContainer._observed = true;
                    newContainer.addEventListener('click', (e) => {
                        const link = e.target.closest('a');
                        if (link && !link.parentElement.classList.contains('disabled')) {
                            console.log('📄 Клик по новой пагинации');
                            setTimeout(() => this.restartSaleManager(), 800);
                        }
                    });
                }
                
                const newSelect = doc.querySelector('#displayCount');
                if (newSelect && !newSelect._hasHandler) {
                    newSelect._hasHandler = true;
                    newSelect.addEventListener('change', () => {
                        console.log('📊 Изменение #displayCount');
                        setTimeout(() => this.restartSaleManager(), 800);
                    });
                }
            });
            
            observer.observe(doc.body || doc.documentElement, { 
                childList: true, 
                subtree: true 
            });
            
            console.log('📄 Отслеживание пагинации активно');
        };

        // Запускаем с задержкой для загрузки DOM
        setTimeout(setupTracking, 500);
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.cleanup();
    }
}

// ========== app/inject.js ==========
/**
 * ============================================================
 * INJECT.JS - ТОЧКА ВХОДА ДЛЯ CHROME-РАСШИРЕНИЯ
 * ============================================================
 */

// Глобальные переменные
let configure = null;
let sets = {
    start_key: null
};

// Инициализация конфига
async function initConfig() {
    if (window.ConfigManager && window.ConfigManager._instance) {
        // Используем новый синглтон ConfigManager
        const manager = window.ConfigManager._instance;
        configure = await manager.getConfig();
        console.log('✅ Конфиг загружен из ConfigManager:', configure ? 'Да' : 'Нет');
    } else if (window.ConfigManager && window.ConfigManager.getConfig) {
        // Fallback для совместимости
        configure = await window.ConfigManager.getConfig();
        console.log('✅ Конфиг загружен (fallback):', configure ? 'Да' : 'Нет');
    } else {
        // Загрузка напрямую из chrome.storage
        configure = await new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get('config', (result) => {
                    if (result.config) {
                        console.log('✅ Конфиг загружен из storage');
                        resolve(result.config);
                    } else {
                        console.log('⚠️ Конфиг в storage не найден, используем DEFAULT_CONFIG');
                        resolve(DEFAULT_CONFIG);
                    }
                });
            } else {
                console.log('⚠️ Chrome API недоступен, используем DEFAULT_CONFIG');
                resolve(DEFAULT_CONFIG);
            }
        });
    }
    return configure;
}

// ============================================================
// ЗАПУСК
// ============================================================

async function start() {
    try {
        // Загружаем конфиг
        await initConfig();
        
        console.log('✅ Конфиг загружен, запуск монитора');
        
        // Запускаем монитор
        new Monitor();
        
    } catch (error) {
        console.error('❌ Ошибка при запуске:', error);
    }
}

// Запуск
start();
