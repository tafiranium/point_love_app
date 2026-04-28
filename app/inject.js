async function start() {
    const scriptUrl = 'https://raw.githubusercontent.com/tafiranium/point_love_app/refs/heads/main/app.js';
    try {
        const response = await chrome.runtime.sendMessage({
            action: "injectScriptFromUrl",
            url: scriptUrl
        });
        if (response && response.success) {
            console.log("Скрипт успешно внедрён");
        } else {
            console.error("Ошибка внедрения:", response?.error);
        }
    } catch (err) {
        console.error("Ошибка связи с background:", err);
    }
}
start();