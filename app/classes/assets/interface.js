// КЛАСС ИНТЕРФЕЙСА, САМЫЙ ЛАЙТОВЫЙ КЛАСС
// ПРОСТОР ДЛЯ ФАНТИАЗИИ
class Interface {

    async run(html) {

        // СОДЕРЖИМОЕ СТРАНИЦЫ ДЛЯ РЕДАКТИРОВАНИЯ
        this.html = html

        // ЦВЕТА ПРИЛОЖЕНИЯ
        const text_color = "#616161"
        const background_color = "white"
        const border_color = "#b3b1b1"
        const border_second_color = "#0088cc"

        // СТИЛИ ПРИЛОЖЕНИЯ
        const styles = {
            appwrapper: {
                height: "8vh",
                width: "auto",
                right: "0",
                bottom: "3vh",
                position: "fixed",
                zIndex: "100",
                display: "flex",
                gridTemplateColumns: "repeat(8, 20vh)"
              },
            spans: {
              position: "relative",
              height: "100%",
              width: "7vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              color: text_color,
              background: background_color,
              border: "solid 1px" + border_color,
              paddingInline: "1vh",
              fontSize: "1.5cqh",
              lineHeight: "2cqh",
              fontWeight: "100",
              fontFamily: "Verdana, Roboto, 'Open Sans'",
              cursor: "pointer",
              userSelect: "none",
              textAlign: "center"
            }
          }

          // СОЗДАНИЕ СКЕЛЕТА ПРИЛОЖЕНИЯ
          let wrapper = document.createElement("div")
          wrapper.classList.add("wrapper")
          Object.assign(wrapper.style, styles["appwrapper"])

          // НАСТРОЙКИ КНОПОК ПРИЛОЖЕНИЯ
          const bst = {
            "app_icon": [`ฅ^•⩊•^ฅ`, {
              fontWeight: "100",
              fontSize: "13px",
              transition: "transform 0.1s ease-in-out, color 0.2s ease-in-out"
            }],
            "app_copy_button": ["Копировать</br>Alt+S",  {}],
            "app_sbp": ["Сбп</br>Alt+A", {}],
            "app_dop": ["Допродажа</br>Alt+W", {}],
            "app_dc": ["Дк</br>Alt+Q", {}],
            "app_no_client": ["Не клиент", {}],
            "app_cut": ["Убрать копейки", {}],
            "app_telegram": ["Новости", {}]
          } // "app_error": ["Отчет об ошибке", {}]

          let buttons_list = {}

          // ПООЧЕРЕДНАЯ ПОДГРУЗКА КНОПОК
          for (let btn in bst) {
            let cls = btn
            let inner = bst[btn][0]
            let style = bst[btn][1]
            let elem = document.createElement("span")
            elem.classList.add(cls)
            elem.innerHTML += inner
            Object.assign(elem.style, Object.assign({}, styles["spans"], style))
            buttons_list[cls] = elem    
          }

          // СПИСКИ ПРИЛОЖЕНИЯ С РАЗНЫМ ФУНКЦИОНАЛОМ
          let mass = [buttons_list["app_dc"], buttons_list["app_sbp"], buttons_list["app_dop"], buttons_list["app_cut"]]
          let all = [
             buttons_list["app_icon"],  buttons_list["app_copy_button"], buttons_list["app_dop"], 
             buttons_list["app_sbp"], buttons_list["app_dc"], buttons_list["app_cut"], buttons_list["app_no_client"], buttons_list["app_telegram"]
          ]  

          let disp_el = [
            buttons_list["app_copy_button"], buttons_list["app_dop"], 
            buttons_list["app_sbp"], buttons_list["app_dc"], buttons_list["app_cut"], buttons_list["app_no_client"],  buttons_list["app_telegram"]
         ]  

          // ДОБАВЛЕНИЯ ФУНКЦИОНАЛА КНОПКАМ
          buttons_list["app_icon"].classList.add("open")

          function toggle_elements(is) {
            if (is) {disp_el.forEach((el) => {el.style.display = "flex"})} 
            else {disp_el.forEach((el) => {el.style.display = "none"})}
          }

          buttons_list["app_icon"].addEventListener("click", () => {
            buttons_list["app_icon"].classList.toggle("open")
            toggle_elements(buttons_list["app_icon"].classList.contains("open"))
          })


          all[0].style.borderTopLeftRadius    = "20px"
          all[0].style.borderBottomLeftRadius = "20px"
          
          mass.forEach((e) => {e.addEventListener("click", () => {
            this.ToggleCheck(e, [border_color, border_second_color])
            if (!this.check(e)) e.style.borderBottom = "solid 3px " + border_second_color
          })});
          
          [["mouseover", border_second_color, border_second_color],
           ["mouseout",  border_color,        text_color]].forEach(el => {
            mass.forEach((e) => {e.addEventListener(el[0], () => {
              if (!this.check(e)) e.style.borderBottom = "solid 3px " + el[1]
              e.style.color = el[2]
            })});
          })
          
          all.forEach(e => {wrapper.appendChild(e)});

          document.body.appendChild(wrapper)
          this.wrapper = wrapper

          buttons_list["app_telegram"].addEventListener("click", ()=> {
            window.open('https://t.me/+WBv4WSieLmwwMjZi');
          })
          
          let second_mass = ["app_copy_button", "app_telegram", "app_no_client"].map(i => {return buttons_list[i]})
          let move = [["mouseover", border_second_color], ["mouseout",  text_color]]
          move.forEach(el => {second_mass.forEach((e) => {e.addEventListener(el[0], () => {e.style.color = el[1]})});})

          return [
            buttons_list["app_copy_button"], 
            [buttons_list["app_sbp"], buttons_list["app_dc"], buttons_list["app_dop"], buttons_list["app_cut"]], 
            buttons_list["app_icon"], buttons_list["app_no_client"]
          ]
    }

    remove() {this.wrapper.remove()}

    ToggleCheck(el, colors, cls="checked") {
        console.clear()
        el.classList.toggle(cls)
        if (this.check(el)) {el.style.borderBottom = "solid 4px" + colors[1]} 
        else {el.style.borderBottom = "solid 4px" + colors[0]}
    }
    check(el, cls="checked") {return (el.classList.contains(cls))}
}