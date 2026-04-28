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