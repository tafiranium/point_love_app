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

        console.log(args)

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

