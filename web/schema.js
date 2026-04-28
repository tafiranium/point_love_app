// ========== CONFIG SCHEMA ==========
// Schema for settings - defines labels and defaults for UI
// turn_on: 1 - checkbox checked, 0 - checkbox unchecked

const CONFIG_SCHEMA = {
  // Passive columns - column numbers for passive view
  passive: [
    { key: 'shift', label: 'Смена', default: 0, turn_on: 1 },
    { key: 'date', label: 'Дата', default: 1, turn_on: 1 },
    { key: 'time', label: 'Время', default: 2, turn_on: 1 },
    { key: 'name', label: 'Имя', default: 40, turn_on: 1 },
    { key: 'enter', label: 'Вход', default: 3, turn_on: 1 },
    { key: 'no_client', label: 'Неклиент', default: 4, turn_on: 1 },
    { key: 'nc', label: 'НК', default: 4, turn_on: 1 },
    { key: 'six', label: 'Акция', default: 24, turn_on: 1 },
    { key: 'order', label: 'Заказ', default: 26, turn_on: 1 },
    { key: 'comments', label: 'Комментарии', default: 31, turn_on: 1 },
    { key: 'articles', label: 'Артикулы', default: 34, turn_on: 1 },
    { key: 'buys', label: 'Покупки', default: 32, turn_on: 1 },
    { key: 'items_count', label: 'Кол-во', default: 33, turn_on: 1 },
    { key: 'dc', label: 'ДК', default: 21, turn_on: 1 },
    { key: 'order_number', label: 'Номер заказа', default: 39, turn_on: 1 }
  ],
  
  // Details settings - column numbers for detail view
  details: [
    { key: 'seller', label: 'Продавец', default: [2, 'a', true], turn_on: 1 },
    { key: 'datetime', label: 'Дата/Время', default: [3, 'td', true], turn_on: 1 },
    { key: 'traffic', label: 'Трафик', default: [19, 'td', true], turn_on: 1 },
    { key: 'reason', label: 'Причина', default: [21, 'td', true], turn_on: 1 },
    { key: 'dc', label: 'ДК', default: [15, 'td *', true], turn_on: 1 },
    { key: 'buyer', label: 'Покупатель', default: [16, 'td *', true], turn_on: 1 },
    { key: 'return', label: 'Возврат', default: [17, '', false], turn_on: 1 },
    { key: 'comment', label: 'Комментарий', default: [22, 'td', true], turn_on: 1 }
  ],
  
  // Sales types - buyer sources (entry)
  buyerSources: [
    { name: 'Сайт', default: 5},
    { name: 'Вывеска-пеш', default: 6},
    { name: 'Вывеска-авто', default: 7},
    { name: 'Постоянный', default: 8},
    { name: 'Соседи', default: 9},
    { name: 'СМИ', default: 10},
    { name: 'Партнеры', default: 11},
    { name: 'Яндекс', default: 13},
    { name: 'Гугл', default: 12},
    { name: '2ГИЗ', default: 14},
    { name: 'По рекомендации', default: 15},
    { name: 'Прочее', default: 18}
  ],
  
  // Sales types - market sources
  marketSources: [
    { name: 'Яндекс Маркет', default: 29},
    { name: 'Яндекс Еда (Деливери)', default: 29},
    { name: 'ОЗОН', default: 30},
    { name: 'Сбер', default: 30}
  ],
  
  // Sales types - mobile sources
  mobileSources: [
    { name: 'Приложение', default: 27},
    { name: 'Сайт Страсть', default: 27}
  ],
  
  // Sales types - takeup (pickup)
  takeupSources: [
    { name: 'Самовывоз', default: 28}
  ],
  
  // Engineer settings - selectors and details config
  ingeneerSettings: {
    selectors: {
      tables: {
        main: 'table#detail-view',
        mone: 'table#price-detail-view',
        sale: '#yw2',
        item: '#receipt-items table.items.table tbody tr',
        coun: 'div#receipt-items div.summary'
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
  
  // Default stop articles
  stopList: [0, 26702, 47586, 47586, 26795, 47650, 48263, 47660, 48568, 48568, 48457, 48567, 48263, 48261, 48491, 48495, 26279, 26280, 26795, 47177, 48168, 48327, 48570, 995, 996, 997, 26713, 26284, 26348, 26694, 26702, 26711, 26743, 26745],
  
  // Default payment settings
  payment: {
    buyer: [35, 36, 37],    // cash, card, sbp
    mobile: [43, 44],        // cash, card for mobile
    return: [41, 42]        // cash, card for returns
  },
  
  // Default main settings
  size: 42,          // columns count
  start: 10,         // shift start hour
  end: 22,           // shift end hour
  shop_type: 1,      // 1 - 24/7, 0 - daytime only
  
  // Names - mapping from original name to table name
  // { "Цао Джен Хао": "Цао Ч. Цао Джен Хао" }
  names: {}
};

// Get default config based on schema
function getDefaultConfig() {
  return {
    passive: CONFIG_SCHEMA.passive.reduce((acc, f) => {
      acc[f.key] = {
        col: f.default,
        turn_on: f.turn_on ?? 1
      };
      return acc;
    }, {}),
    
    details: {...CONFIG_SCHEMA.ingeneerSettings.details},
    
    buyerSources: CONFIG_SCHEMA.buyerSources.reduce((acc, s) => {
      acc[s.name] = s.default;
      return acc;
    }, {}),
    
    marketSources: CONFIG_SCHEMA.marketSources.reduce((acc, s) => {
      acc[s.name] = s.default;
      return acc;
    }, {}),
    
    mobileSources: CONFIG_SCHEMA.mobileSources.reduce((acc, s) => {
      acc[s.name] = s.default;
      return acc;
    }, {}),
    
    takeupSources: CONFIG_SCHEMA.takeupSources.reduce((acc, s) => {
      acc[s.name] = s.default;
      return acc;
    }, {}),
    
    ingeneerSettings: {
      selectors: {...CONFIG_SCHEMA.ingeneerSettings.selectors},
      details: {...CONFIG_SCHEMA.ingeneerSettings.details}
    },
    
    stopList: [...CONFIG_SCHEMA.stopList],
    size: CONFIG_SCHEMA.size,
    start: CONFIG_SCHEMA.start,
    end: CONFIG_SCHEMA.end,
    shop_type: CONFIG_SCHEMA.shop_type,
    names: {...CONFIG_SCHEMA.names},
    payment: {...CONFIG_SCHEMA.payment}
  };
}


