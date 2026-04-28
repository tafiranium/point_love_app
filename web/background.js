// Слушаем сообщения от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "injectScriptFromUrl") {
        fetch(request.url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(code => {
                // Выполняем код на целевой странице
                chrome.scripting.executeScript({
                    target: { tabId: sender.tab.id },
                    func: (codeStr) => {
                        // Создаём функцию и вызываем её (безопасный eval)
                        const exec = new Function(codeStr);
                        exec();
                    },
                    args: [code]
                }).catch(err => console.error("executeScript error:", err));
                sendResponse({ success: true });
            })
            .catch(err => {
                console.error("Fetch error:", err);
                sendResponse({ success: false, error: err.message });
            });
        return true; // асинхронный ответ
    }
});