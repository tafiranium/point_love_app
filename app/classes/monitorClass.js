// Мониторинг URL и управление приложениями
class Monitor {

    // Шаблоны URL для определения типа страницы
    constructor() {
        this.url_template = {
            view: ["sales/view/id"],
            manage: ["sales/manage"]
        };

        // Текущий URL и состояние приложения
        this.current = window.location.href;
        this.currentApp = null;
        this.appType = null; // 'main' или 'sale'
        this.observer = null;
        this.tableObserver = null;
        
        this.init();
    }

    // Инициализация монитора и ожидание загрузки конфига
    async init() {
        if (typeof configure === 'undefined' || !configure) {
            console.log('⏳ Ожидание загрузки конфига...');
            await new Promise(resolve => {
                const checkConfig = () => {
                    if (typeof configure !== 'undefined' && configure) {
                        resolve();
                    } else {
                        setTimeout(checkConfig, 50);
                    }
                };
                checkConfig();
            });
        }
        
        await this.routeByUrl(this.current);
        this.trackUrlChanges();
        console.log(configure)
    }
    
    // Получение типа страницы по URL
    getPageType(url) {
        if (this.url_template.view.some(pattern => url.includes(pattern))) {
            return 'view';
        }
        if (this.url_template.manage.some(pattern => url.includes(pattern))) {
            return 'manage';
        }
        return null;
    }

    // Получение document (основной или из iframe для cpanel)
    getTargetDoc() {
        if (window.location.href.includes('cpanel')) {
            const iframe = document.querySelector('main iframe');
            if (iframe) {
                return iframe.contentDocument || iframe.contentWindow.document;
            }
        }
        return document;
    }

    // Поиск таблицы
    findGrid() {
        const doc = this.getTargetDoc();
        return doc.getElementById('receipts-grid');
    }

    // Ожидание появления таблицы на странице
    async waitForGrid() {
        return new Promise(resolve => {
            const check = () => {
                const grid = this.findGrid();
                if (grid) {
                    resolve(grid);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    // Настройка наблюдения за таблицей
    async setupSaleManagerObserver() {
        const grid = await this.waitForGrid();
        if (!grid) return;

        console.log('👀 Наблюдение за таблицей запущено');

        this.tableObserver = new MutationObserver(() => {
            console.log('🔄 Таблица изменилась');
            this.restartSaleManager();
        });

        this.tableObserver.observe(grid, { 
            childList: true, 
            subtree: true,
            characterData: true 
        });
    }

    // Перезапуск SaleManager с гарантированной повторной попыткой
    restartSaleManager() {
        if (this.appType === 'sale' && this.currentApp) {
            this.currentApp = null;
        }
        
        // Пробуем несколько раз с увеличивающейся задержкой
        this.attemptRestart(0);
    }

    // Рекурсивная функция для попытки запуска SaleManager с увеличивающейся задержкой
    attemptRestart(attempt) {
        const maxAttempts = 5;
        const delays = [100, 300, 500, 800, 1000]; // Увеличиваем задержку
        
        setTimeout(() => {
            const grid = this.findGrid();
            const hasRows = grid && grid.querySelector('tbody tr, tr');
            
            console.log(`📋 Попытка ${attempt + 1}: таблица=${!!grid}, строки=${!!hasRows}`);
            
            if (hasRows) {
                console.log('🚀 Создание SaleManager');
                try {
                    this.currentApp = new SaleManager();
                    this.appType = 'sale';
                    console.log('✅ SaleManager готов');
                } catch (e) {
                    console.error('❌ Ошибка:', e);
                    // Пробуем ещё раз если не удалось
                    if (attempt < maxAttempts - 1) {
                        this.attemptRestart(attempt + 1);
                    }
                }
            } else {
                // Таблица пустая, пробуем ещё раз
                if (attempt < maxAttempts - 1) {
                    console.log('⏳ Таблица пуста, повтор...');
                    this.attemptRestart(attempt + 1);
                }
            }
        }, delays[attempt]);
    }

// Запуск основного приложения
startMainApp() {

    // Удаляем предыдущее приложение, если было
    if (this.currentApp) {
        if (this.appType === 'main' && this.currentApp.app && this.currentApp.app.interface) {
            this.currentApp.app.interface.remove();
        }
        this.currentApp = null;
    }
    
    console.log('🚀 Запуск основного приложения с конфигом из storage');
    
    try {
        // Преобразуем конфиг из браузера в формат для приложения
        const appConfig = configure;
        
        this.currentApp = new App({ config: appConfig, start_key: sets.start_key });
        this.appType = 'main';
        console.log('✅ Основное приложение запущено');
    } catch (e) {
        console.error('❌ Ошибка:', e);
    }
}

// Функция для очистки ресурсов при смене страницы
cleanup() {
    console.log('🧹 Очистка ресурсов...');
    
    // Отключаем наблюдатель за таблицей
    if (this.tableObserver) {
        this.tableObserver.disconnect();
        this.tableObserver = null;
    }

    // Удаляем интерфейс основного приложения, если оно было запущено
    if (this.appType === 'main' && this.currentApp) {
        console.log('🗑️ Удаление интерфейса основного приложения');
        
        // Пробуем разные способы удаления
        if (this.currentApp.app && this.currentApp.app.interface) {
            // Прямой вызов remove
            this.currentApp.app.interface.remove();
        } else if (this.currentApp.interface) {
            // Альтернативный вариант
            this.currentApp.interface.remove();
        } else if (this.currentApp.wrapper) {
            // Если есть прямой доступ к wrapper
            this.currentApp.wrapper.remove();
        }
        
        // Дополнительная очистка DOM на всякий случай
        const wrapper = document.querySelector('.wrapper');
        if (wrapper) wrapper.remove();
    }
    
    // Очищаем SaleManager
    if (this.appType === 'sale' && this.currentApp) {
        console.log('🗑️ Очистка SaleManager');
        // Если у SaleManager есть метод destroy или cleanup, вызовите его
        if (this.currentApp.destroy) {
            this.currentApp.destroy();
        }
    }
    
    this.currentApp = null;
    this.appType = null;
    
    console.log('✅ Очистка завершена');
}
    // Маршрутизация по URL и запуск соответствующего приложения
    async routeByUrl(url) {
        const pageType = this.getPageType(url);
        
        this.cleanup();

        if (pageType === 'view') {
            this.startMainApp();
        } else if (pageType === 'manage') {
            await this.setupSaleManagerObserver();
            this.restartSaleManager();
            // Запускаем отслеживание пагинации
            this.startPaginationTracking();
        } else {
            console.log('⏭️ Неизвестный тип страницы');
        }
    }
    // Отслеживание изменений URL и маршрутизация
    trackUrlChanges() {
        this.current = window.location.href;
        
        this.observer = new MutationObserver(() => {
            if (this.current !== window.location.href) {
                const oldUrl = this.current;
                this.current = window.location.href;
                console.log(`🔁 URL изменился: ${oldUrl} -> ${this.current}`);
                this.routeByUrl(this.current);
            }
        });
        
        this.observer.observe(document, { 
            childList: true, 
            subtree: true 
        });
        
        // Дополнительная проверка URL через setInterval
        setInterval(() => {
            if (this.current !== window.location.href) {
                this.current = window.location.href;
                this.routeByUrl(this.current);
            }
        }, 500);
    }

    // Отслеживание пагинации через事件 delegation
    startPaginationTracking() {
        const setupTracking = () => {
            const doc = this.getTargetDoc();
            
            // Находим контейнер для пагинации
            const container = doc.querySelector('#yw10') || doc.querySelector('.pagination');
            
            // Event delegation - вешаем обработчик на document
            doc.addEventListener('click', (e) => {
                // Проверяем, была ли нажата ссылка пагинации
                const link = e.target.closest('a');
                if (link) {
                    const parent = link.parentElement;
                    // Проверяем что это ссылка пагинации (не disabled)
                    if (parent && !parent.classList.contains('disabled')) {
                        console.log('📄 Клик по пагинации:', link.href);
                        // Ждём загрузки новой страницы
                        setTimeout(() => this.restartSaleManager(), 800);
                    }
                }
            });
            
            // Отслеживаем изменение select количества записей
            const pageSizeSelect = doc.querySelector('#displayCount');
            if (pageSizeSelect) {
                // Удаляем старый обработчик если есть
                const oldHandler = pageSizeSelect._pageSizeHandler;
                if (oldHandler) {
                    pageSizeSelect.removeEventListener('change', oldHandler);
                }
                
                const newHandler = (e) => {
                    console.log('📊 Изменение количества записей:', e.target.value);
                    setTimeout(() => this.restartSaleManager(), 800);
                };
                
                pageSizeSelect._pageSizeHandler = newHandler;
                pageSizeSelect.addEventListener('change', newHandler);
                console.log('📊 Обработчик #displayCount установлен');
            }
            
            // Также следим за изменениями в DOM - новые элементы пагинации
            const observer = new MutationObserver(() => {
                const newContainer = doc.querySelector('#yw10') || doc.querySelector('.pagination');
                if (newContainer && !newContainer._observed) {
                    newContainer._observed = true;
                    newContainer.addEventListener('click', (e) => {
                        const link = e.target.closest('a');
                        if (link && !link.parentElement.classList.contains('disabled')) {
                            console.log('📄 Клик по новой пагинации');
                            setTimeout(() => this.restartSaleManager(), 800);
                        }
                    });
                }
                
                const newSelect = doc.querySelector('#displayCount');
                if (newSelect && !newSelect._hasHandler) {
                    newSelect._hasHandler = true;
                    newSelect.addEventListener('change', () => {
                        console.log('📊 Изменение #displayCount');
                        setTimeout(() => this.restartSaleManager(), 800);
                    });
                }
            });
            
            observer.observe(doc.body || doc.documentElement, { 
                childList: true, 
                subtree: true 
            });
            
            console.log('📄 Отслеживание пагинации активно');
        };

        // Запускаем с задержкой для загрузки DOM
        setTimeout(setupTracking, 500);
    }

    // Функция для очистки ресурсов при смене страницы
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.cleanup();
    }
}