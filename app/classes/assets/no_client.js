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
