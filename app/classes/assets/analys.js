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