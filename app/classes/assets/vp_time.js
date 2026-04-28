class VpTime {

    async run(time_obj=false, interval=[10, 22], shop_type=false) {

        console.log(time_obj, interval, shop_type)

        this.datetime_list =   time_obj
        this.start =        interval[0]
        this.end =          interval[1]
        this.shop_type =    !!(shop_type)

        this.date = this.adaptive_time(this.datetime_list[0]).split(".")
        this.time = this.datetime_list[1].split(":")
        // console.log(this.date, this.time)
        this.object = new Date(`${this.date[1]}.${this.date[0]}.${this.date[2]}`)

        this.sec_time   =   this.time[0]*60*60 + this.time[1]*60 + this.time[2]*1
        this.sec_end    =   60*60*this.end 
        this.sec_start  =   60*60*this.start
        this.day_time   =   24*60*60
        
        this.type_of_shift = -1 // проверочное число
        this.getTypeShift()

        // console.log(this.object)

        this.year    =  this.object.getFullYear()
        this.month   =  this.object.getMonth()+1
        this.day     =  this.object.getDate()

        this.time_to_send = this.getTime()
        this.date_to_send = `${this.two(this.day)}.${this.two(this.month)}.${this.year}`
        
        // console.log(this.year, this.month, this.day)
        // console.log(this.time_to_send)
        // console.log(this.date_to_send)

        // console.log([this.type_of_shift, this.date_to_send, this.time_to_send])
        console.log(`%cShift: ${this.type_of_shift}`, 'color: red; font-size: larger')
        console.log(`%cDate: ${this.date_to_send}`, 'color: red; font-size: larger')
        console.log(`%cTime: ${this.time_to_send}`, 'color: red; font-size: larger')

        
        return [this.type_of_shift, this.date_to_send, this.time_to_send]
    }

adaptive_time(date) {
    // Убираем лишние пробелы
    date = date.trim();
    
    // Словарь месяцев: полные и сокращённые (с точкой и без) в нижнем регистре
    const monthsMap = {
        'января': '01', 'январь': '01', 'янв.': '01', 'янв': '01',
        'февраля': '02', 'февраль': '02', 'фев.': '02', 'фев': '02',
        'марта': '03', 'март': '03', 'мар.': '03', 'мар': '03',
        'апреля': '04', 'апрель': '04', 'апр.': '04', 'апр': '04',
        'мая': '05', 'май': '05', 'мая.': '05', 'май.': '05',
        'июня': '06', 'июнь': '06', 'июн.': '06', 'июн': '06',
        'июля': '07', 'июль': '07', 'июл.': '07', 'июл': '07',
        'августа': '08', 'август': '08', 'авг.': '08', 'авг': '08',
        'сентября': '09', 'сентябрь': '09', 'сен.': '09', 'сен': '09',
        'октября': '10', 'октябрь': '10', 'окт.': '10', 'окт': '10',
        'ноября': '11', 'ноябрь': '11', 'ноя.': '11', 'ноя': '11',
        'декабря': '12', 'декабрь': '12', 'дек.': '12', 'дек': '12'
    };
    
    // 1. Формат "DD.MM.YYYY" или "DD.MM.YY"
    if (date.includes('.') && /^[\d\.]+$/.test(date.replace(/\s/g, ''))) {
        const parts = date.split('.');
        if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) {
                const yearInt = parseInt(year);
                year = yearInt <= 30 ? `20${year}` : `19${year}`;
            }
            return `${day}.${month}.${year}`;
        }
    }
    
    // 2. Формат с русским месяцем (полным или сокращённым), возможно с запятой и временем
    // Ищем шаблон: число, пробел, слово-месяц, пробел, год (4 цифры)
    // Регулярное выражение ищет последовательность: (день) (месяц) (год)
    // и извлекает группы.
    const regex = /(\d{1,2})\s+([а-яё]+\.?)\s+(\d{4})/i;
    const match = date.match(regex);
    if (match) {
        let day = match[1].padStart(2, '0');
        let monthWord = match[2].toLowerCase();
        let year = match[3];
        
        // Удаляем точку в конце месяца, если есть
        monthWord = monthWord.replace(/\.$/, '');
        
        const monthNum = monthsMap[monthWord];
        if (monthNum) {
            return `${day}.${monthNum}.${year}`;
        }
    }
    
    // 3. Попробуем универсальный поиск: извлекаем любую последовательность цифр, затем слово-месяц, затем цифры года
    // (более гибкий вариант, если формат сильно отличается)
    const flexibleRegex = /(\d{1,2})\D+([а-яё]+\.?)\D+(\d{4})/i;
    const flexMatch = date.match(flexibleRegex);
    if (flexMatch) {
        let day = flexMatch[1].padStart(2, '0');
        let monthWord = flexMatch[2].toLowerCase().replace(/\.$/, '');
        let year = flexMatch[3];
        const monthNum = monthsMap[monthWord];
        if (monthNum) {
            return `${day}.${monthNum}.${year}`;
        }
    }
    
    // Если ничего не подошло, выводим предупреждение и возвращаем как есть
    console.warn('Не удалось распознать формат даты:', date);
    return date;
}



    two(number) {
        let n = number.toString().split("")
        if (n.length == 1) {return "0"+n[0]} else {return number.toString()}
    }

    getTypeShift() {
        console.log(this.shop_type, this.sec_time, this.sec_start, this.sec_end)
        if (this.shop_type == true) {
            let first_night_part = !!((this.sec_time > this.sec_end) & (this.sec_time > this.sec_start))
            let second_night_part = !!((this.sec_time < this.sec_end) & (this.sec_time < this.sec_start)) 
            console.log(first_night_part, second_night_part)     
            if (first_night_part || second_night_part) {
                // ночная смена вроде не понятно зачем здесь эта функция
                this.type_of_shift = false
                // но мы делаем дату на 1 день меньше так как это все еще твоя смена брат
                if (second_night_part) {this.object.setDate(this.object.getDate() - 1) }
        
            } else if ((this.sec_time < this.sec_end) & (this.sec_time >= this.sec_start)) {
                this.type_of_shift = true // дневная смена радуйся проценту как и твой писюн)
            } 
        } else {
            this.type_of_shift = true // смена всегда дневная, так как магазин дневной
        }
    }

    getTime() {
         // проверка на размер числа
        if ((this.time[0].length != 1) & (this.time[0][0] == "0")) {this.time[0] = Number(time[0][1])}
        else if (this.time[0].length == 1) {this.time[0] = Number(this.time[0][0])}
        else {this.time[0] = Number(this.time[0])}
        if (this.time[1][0] == "0") {this.time[1] = Number(this.time[1][1])}
        if (this.time[2][0] == "0") {this.time[2] = Number(this.time[2][1])}

        // итоговое форматирование
        return `${this.two(this.time[0])}:${this.two(this.time[1])}`   
    }
}