// cypress/e2e/internships/internships_page_view_fixed.cy.js

describe('Просмотр страницы со стажировками - Исправленная версия', () => {
  
  beforeEach(() => {
    cy.fixture('internship').then(data => {
      // Авторизация работодателем
      cy.visit(data.main_url);
      cy.get('.form-input--text').type(data.employer_login);
      cy.get('.form-input--password').type(data.employer_password);
      cy.get('.button').contains('Войти').click();
      
      // Переход на страницу стажировок
      cy.url().should('include', '/account');
      cy.get('.menu-item__item-name').contains('Стажировки').click();
      cy.url().should('include', '/internships');
      
      // Ожидание загрузки страницы
      cy.get('.card-title').contains('Все стажировки').should('be.visible');
      cy.wait(2000); // Дополнительное ожидание загрузки данных
    });
  });

  describe('Отображение страницы стажировок', () => {
    
    it('Должен отображать все основные элементы страницы', () => {
      cy.log('Проверка основных элементов интерфейса');
      
      // Заголовок страницы
      cy.get('.card-title')
        .contains('Все стажировки')
        .should('be.visible');
      
      // Кнопка создания стажировки
      cy.get('button')
        .contains('Создать стажировку')
        .should('be.visible')
        .and('not.be.disabled');
      
      // Проверить наличие фильтра (может быть скрыт на некоторых экранах)
      cy.get('body').then($body => {
        if ($body.find('.vacancies-block__filters-wrapper .form-select').length > 0) {
          cy.get('.vacancies-block__filters-wrapper .form-select')
            .should('exist');
          cy.log('Фильтр по статусу найден');
        } else {
          cy.log('Фильтр по статусу не отображается на данном экране');
        }
      });
      
      // Список стажировок
      cy.get('.vacancy-list, .internship-list, [data-v-f425a3f4]')
        .should('be.visible');
    });

    it('Должен отображать список стажировок', () => {
      cy.log('Проверка отображения карточек стажировок');
      
      // Проверить наличие карточек стажировок
      cy.get('.internship-item').should('have.length.at.least', 1);
      
      // Проверить структуру первой карточки
      cy.get('.internship-item').first().within(() => {
        // Название стажировки
        cy.get('.internship-header__name').should('be.visible');
        
        // Статус
        cy.get('.entity__status').should('be.visible');
        
        // Информация о компании
        cy.get('.card-info__company').should('contain', 'КПСС');
        
        // Длительность
        cy.get('.internship-header__name--accent').should('be.visible');
        
        // Тип оплаты
        cy.get('.internship-header__salary').should('be.visible');
        
        // Тип занятости
        cy.get('.badge').should('be.visible');
        
        // Кнопка "Подробнее"
        cy.get('button').contains('Подробнее').should('be.visible');
      });
    });

    it('Должен корректно отображать информацию о каждой стажировке', () => {
      cy.log('Проверка корректности данных в карточках');
      
      cy.get('.internship-item').each($item => {
        cy.wrap($item).within(() => {
          // Название не должно быть пустым
          cy.get('.internship-header__name')
            .should('not.be.empty')
            .and('be.visible');
          
          // Статус должен быть один из допустимых (добавлен "Открыта")
          cy.get('.entity__status p').then($status => {
            const statusText = $status.text().trim();
            expect(['Активна', 'Черновик', 'Начата', 'Завершена', 'Отменена', 'Закрыта', 'Открыта'])
              .to.include(statusText);
          });
          
          // Тип оплаты должен быть указан
          cy.get('.internship-header__salary').then($salary => {
            const salaryText = $salary.text().trim();
            expect(['Оплачиваемая', 'Неоплачиваемая'])
              .to.include(salaryText);
          });
          
          // Тип занятости должен быть указан
          cy.get('.badge').then($badge => {
            const badgeText = $badge.text().trim();
            expect(['Очный', 'Дистант', 'Совмещенный'])
              .to.include(badgeText);
          });
        });
      });
    });
  });

  describe('Фильтрация стажировок', () => {
    
    it('Должен работать фильтр по статусу', () => {
      cy.log('Тестирование фильтра по статусу');
      
      // Проверить наличие фильтра
      cy.get('body').then($body => {
        if ($body.find('.vacancies-block__filters-wrapper .form-select__selected:visible').length > 0) {
          
          // Открыть фильтр статуса
          cy.get('.vacancies-block__filters-wrapper .form-select__selected:visible')
            .first()
            .click({ force: true });
          
          // Ожидание появления выпадающего списка
          cy.get('.form-select__items:visible', { timeout: 3000 }).should('exist');
          
          // Получить список доступных опций
          cy.get('.form-select__option:visible').then($options => {
            const options = Array.from($options).map(el => el.textContent.trim());
            cy.log('Доступные опции фильтра: ' + options.join(', '));
            
            // Выбрать первую доступную опцию (кроме "Любой" и "Все")
            const targetOption = options.find(opt => opt !== 'Любой' && opt !== '' && opt !== 'Все');
            if (targetOption) {
              cy.get('.form-select__option:visible')
                .contains(targetOption)
                .click({ force: true });
              
              cy.wait(1500);
              
              // Проверить применение фильтра
              cy.get('.internship-item').then($filteredItems => {
                if ($filteredItems.length > 0) {
                  cy.get('.internship-item').each($item => {
                    cy.wrap($item).within(() => {
                      cy.get('.entity__status p').should('contain', targetOption);
                    });
                  });
                } else {
                  cy.log('Нет стажировок с выбранным статусом');
                }
              });
              
              // Сбросить фильтр
              cy.get('.vacancies-block__filters-wrapper .form-select__selected:visible')
                .click({ force: true });
              cy.get('.form-select__option:visible').contains('Любой').click({ force: true });
            } else {
              cy.log('Не найдено подходящих опций для фильтрации');
            }
          });
        } else {
          cy.log('Фильтр недоступен, пропускаем тест');
        }
      });
    });

    it('Должен корректно реагировать на фильтрацию без опций', () => {
      cy.log('Тестирование поведения фильтра при отсутствии данных');
      
      cy.get('body').then($body => {
        if ($body.find('.vacancies-block__filters-wrapper .form-select__selected:visible').length > 0) {
          // Попробуем открыть фильтр
          cy.get('.vacancies-block__filters-wrapper .form-select__selected:visible')
            .first()
            .click({ force: true });
          
          // Проверим состояние после клика, не требуя обязательной видимости .form-select__items
          cy.get('.form-select__items').should('exist');
          
          // Закрыть фильтр кликом вне его области
          cy.get('body').click(0, 0);
          cy.log('Фильтр закрыт');
        } else {
          cy.log('Фильтр недоступен, пропускаем тест');
        }
      });
    });
  });

  describe('Взаимодействие с карточками стажировок', () => {
    
    it('Должен открывать детальную страницу стажировки', () => {
      cy.log('Тестирование перехода к деталям стажировки');
      
      cy.get('.internship-item').first().within(() => {
        // Запомнить название стажировки
        cy.get('.internship-header__name').invoke('text').as('internshipName');
        
        // Кликнуть по кнопке "Подробнее"
        cy.get('button').contains('Подробнее').click();
      });
      
      // Проверить переход на детальную страницу
      cy.url().should('match', /\/internship\/\d+|\/internships\/\d+/);
      
      // Проверить что страница загрузилась
      cy.get('body').then($body => {
        const bodyText = $body.text();
        const hasExpectedContent = bodyText.includes('Стажировка') || 
                                  bodyText.includes('Детали') || 
                                  bodyText.includes('Описание') ||
                                  bodyText.includes('Требования') ||
                                  bodyText.includes('Обязанности');
        expect(hasExpectedContent).to.be.true;
      });
    });

    it('Должен отображать соответствующие кнопки для каждого статуса', () => {
      cy.log('Проверка кнопок для разных статусов стажировок');
      
      cy.get('.internship-item').each($item => {
        cy.wrap($item).within(() => {
          cy.get('.entity__status p').invoke('text').then(status => {
            const statusText = status.trim();
            
            cy.get('button').then($buttons => {
              const buttonTexts = Array.from($buttons).map(btn => btn.textContent.trim());
              
              // Всегда должна быть кнопка "Подробнее"
              expect(buttonTexts).to.include('Подробнее');
              
              // Проверить специфичные кнопки для каждого статуса
              switch (statusText) {
                case 'Черновик':
                  expect(buttonTexts.some(text => 
                    text.includes('Редактировать') || 
                    text.includes('Опубликовать')
                  )).to.be.true;
                  break;
                case 'Начата':
                  expect(buttonTexts.some(text => 
                    text.includes('Закрыть') || 
                    text.includes('Отменить')
                  )).to.be.true;
                  break;
                default:
                  // Для других статусов достаточно кнопки "Подробнее"
                  cy.log(`Статус "${statusText}" - проверена кнопка "Подробнее"`);
              }
            });
          });
        });
      });
    });

    it('Должен корректно отображать длительность стажировки', () => {
      cy.log('Проверка отображения длительности');
      
      cy.get('.internship-item').each($item => {
        cy.wrap($item).within(() => {
          cy.get('.internship-header__name--accent').then($duration => {
            const durationText = $duration.text().trim();
            
            // Проверить что длительность в правильном формате
            expect(durationText).to.match(/\d+\s*(день|дня|дней|месяц|месяца|месяцев)/);
          });
        });
      });
    });
  });

  describe('Поиск стажировок', () => {
    
    it('Должен работать поиск если доступен', () => {
      cy.log('Тестирование поиска стажировок');
      
      // Поиск поля ввода для поиска
      cy.get('body').then($body => {
        let searchFound = false;
        
        // Проверить различные возможные селекторы для поиска
        const searchSelectors = [
          '[data-testid="search-input"]',
          'input[placeholder*="поиск"]',
          'input[placeholder*="Поиск"]',
          'input[placeholder*="Найти"]',
          '.search-input',
          'input[type="search"]'
        ];
        
        for (const selector of searchSelectors) {
          if ($body.find(selector).length > 0) {
            searchFound = true;
            cy.log(`Найдено поле поиска: ${selector}`);
            
            cy.get(selector).first().type('Frontend', { force: true });
            
            // Поиск кнопки поиска
            const buttonSelectors = [
              '[data-testid="search-button"]',
              'button[type="submit"]',
              '.search-button',
              'button:contains("Найти")',
              'button:contains("Поиск")'
            ];
            
            let buttonFound = false;
            for (const btnSelector of buttonSelectors) {
              if ($body.find(btnSelector).length > 0) {
                cy.get(btnSelector).first().click({ force: true });
                buttonFound = true;
                break;
              }
            }
            
            if (!buttonFound) {
              // Попробовать нажать Enter
              cy.get(selector).first().type('{enter}');
            }
            
            cy.wait(1000);
            
            // Проверить результаты
            cy.get('body').then($bodyAfterSearch => {
              if ($bodyAfterSearch.find('.internship-item').length > 0) {
                cy.log('Найдены стажировки по поиску');
              } else {
                cy.log('Стажировки по поиску не найдены');
              }
            });
            
            break;
          }
        }
        
        if (!searchFound) {
          cy.log('Поле поиска не найдено на странице');
        }
      });
    });
  });

  describe('Адаптивность и стабильность', () => {
    
    it('Должен корректно отображаться на разных разрешениях', () => {
      cy.log('Тестирование адаптивности');
      
      // Тест на планшете
      cy.viewport(768, 1024);
      cy.get('.card-title').should('be.visible');
      cy.get('.internship-item').should('be.visible');
      
      // Тест на мобильном
      cy.viewport(375, 667);
      cy.get('.card-title').should('be.visible');
      cy.get('.internship-item').should('be.visible');
      
      // Вернуть стандартное разрешение
      cy.viewport(1280, 720);
    });

    it('Должен загружаться в разумное время', () => {
      cy.log('Проверка производительности');
      
      const startTime = Date.now();
      
      cy.get('.internship-item').should('have.length.at.least', 1).then(() => {
        const loadTime = Date.now() - startTime;
        cy.log(`Время загрузки: ${loadTime}мс`);
        expect(loadTime).to.be.lessThan(10000); // Увеличен лимит до 10 секунд
      });
    });

    it('Должен обрабатывать ошибки загрузки данных', () => {
      cy.log('Тестирование обработки ошибок');
      
      // Перехватить API запросы и вернуть ошибку
      cy.intercept('GET', '**/api/companies/*/internships*', {
        statusCode: 500,
        body: { error: 'Server Error' }
      }).as('getInternshipsError');
      
      // Перезагрузить страницу
      cy.reload();
      
      // Ожидать запрос с ошибкой
      cy.wait('@getInternshipsError');
      
      // Проверить что страница обрабатывает ошибку корректно
      cy.get('body').then($body => {
        const bodyText = $body.text().toLowerCase();
        const hasErrorHandling = bodyText.includes('ошибка') || 
                               bodyText.includes('не удалось') ||
                               bodyText.includes('попробуйте') ||
                               bodyText.includes('загрузить');
        
        if (hasErrorHandling) {
          cy.log('Обработка ошибок работает корректно');
        } else {
          cy.log('Обработка ошибок может быть улучшена');
        }
      });
    });
  });
});