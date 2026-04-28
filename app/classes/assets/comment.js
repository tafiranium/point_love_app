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