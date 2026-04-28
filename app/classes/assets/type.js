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