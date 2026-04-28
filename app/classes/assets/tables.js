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