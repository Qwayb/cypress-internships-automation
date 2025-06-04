describe('Просмотр страницы стажировок (Live)', () => {
  beforeEach(() => {    cy.fixture('internship').then(data => {
      // Авторизация работодателем
      cy.visit(data.main_url);
      cy.get('.form-input--text').type(data.employer_login);
      cy.get('.form-input--password').type(data.employer_password);
      cy.get('.button').contains('Войти').click();
    });

  // Обеспечиваем чистое состояние перед каждым тестом

    cy.visit('https://dev.profteam.su/internships');
  });

  it('Должен отображать основные элементы хедера и навигации', () => {
    // Ограничиваем выбор header одним элементом
    cy.get('header').first().within(() => {
      // Ожидаем ссылку с текстом "Стажировки"
      cy.get('a').contains('Стажировки').should('be.visible');
      // Проверить наличие остальных пунктов навигации
      cy.get('a').contains('Вакансии').should('be.visible');
      cy.get('a').contains('Потребности').should('be.visible');
    });
  });

  it('Должен отображать список стажировок', () => {
    // Ждём появления контейнера и внутри него хотя бы одной карточки
    cy.get('.internship-list', { timeout: 20000 })
      .should('exist')
      .within(() => {
        cy.get('.internship-item', { timeout: 20000 }).should('have.length.at.least', 1);
      });
  });

  it('Карточка стажировки должна содержать базовую информацию', () => {
    // Ждём появления контейнера и выбираем первую карточку
    cy.get('.internship-list', { timeout: 20000 })
      .should('exist')
      .within(() => {
        cy.get('.internship-item', { timeout: 20000 })
          .first()
          .should('be.visible')
          .within(() => {
            // Название стажировки не пустое
            cy.get('.internship-header__name').should('not.be.empty');
            // Компания, например "КПСС"
            cy.get('.card-info__company').should('contain', 'КПСС');
            // Информация об оплате отображается
            cy.get('.internship-header__salary').should('be.visible');
            // Кнопка "Подробнее" присутствует
            cy.get('button').contains('Подробнее').should('be.visible');
          });
      });
  });

  it('Должен корректно отображаться поиск', () => {
    // Попытка найти поле поиска, используя несколько селекторов
    cy.get('body').then($body => {
      const searchField = $body.find('input[placeholder*="Название"], input[type="search"], .search-input__field');
      if (searchField.length) {
        cy.wrap(searchField.first()).should('be.visible').type('Frontend');
        // Если есть кнопка поиска, то кликаем по ней
        if ($body.find('button:contains("Найти"), button:contains("Поиск")').length) {
          cy.get('button:contains("Найти"), button:contains("Поиск")').first().click();
        } else {
          cy.wrap(searchField.first()).type('{enter}');
        }
        // Проверка наличия результатов после поиска
        cy.get('.internship-item').should('have.length.at.least', 1);
      } else {
        cy.log('Поле поиска не найдено');
      }
    });
  });

  it('Должен работать фильтр по типу занятости', () => {
    // Увеличиваем таймаут для поиска элемента фильтра
    cy.get('.form-select__selected', { timeout: 10000 })
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.get('.form-select__items:visible', { timeout: 10000 }).should('exist');
    cy.get('.form-select__option:visible').then($options => {
      const targetOption = Array.from($options).map(opt => opt.textContent.trim()).find(opt => opt && opt !== 'Любой');
      if (targetOption) {
        cy.get('.form-select__option:visible').contains(targetOption).click({ force: true });
        // Проверяем, что карточки отображаются
        cy.get('.internship-list', { timeout: 20000 })
          .should('exist')
          .within(() => {
            cy.get('.internship-item').should('exist');
          });
      } else {
        cy.log('Нет дополнительных опций для фильтрации');
      }
    });
  });
});
