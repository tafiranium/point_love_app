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