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