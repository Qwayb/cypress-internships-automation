describe('Негативные тесты просмотра страницы стажировок - Точные селекторы', () => {
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
      
      // Ожидание загрузки страницы стажировок
      cy.get('.card-title').contains('Все стажировки').should('be.visible');
      cy.wait(2000);
    });
  });

  it('Должен отображать сообщение, если отсутствуют стажировки', () => {
    cy.log('Перехват запроса и возврат пустого списка');
    cy.intercept('GET', '**/api/companies/*/internships*', {
      statusCode: 200,
      body: [] // Пустой список стажировок
    }).as('getEmptyInternships');
    cy.reload();
    cy.wait('@getEmptyInternships');
    // Проверяем наличие сообщения об отсутствии стажировок
    cy.get('body').should('contain.text', 'Не удалось загрузить стажировки');
  });

  it('Должен обрабатывать ошибку загрузки стажировок', () => {
    cy.log('Перехват запроса и возврат ошибки сервера');
    cy.intercept('GET', '**/api/companies/*/internships*', {
      statusCode: 500,
      body: { error: 'Server Error' }
    }).as('getInternshipsError');
    cy.reload();
    cy.wait('@getInternshipsError');
    // Проверяем, что отображается сообщение об ошибке загрузки
    cy.get('body').should('contain.text', 'Не удалось загрузить стажировки');
  });

  it('Должен отображать корректное сообщение при поиске, если результаты не найдены', () => {
    cy.log('Ввод запроса, который не вернет результатов');
    // Находим поле поиска по возможным селекторам
    const searchSelector = 'input[placeholder*="поиск"], input[placeholder*="Найти"]';
    cy.get(searchSelector).first().clear().type('Нет результатов - 12345');
    // Выполняем поиск через нажатие Enter
    cy.get(searchSelector).first().type('{enter}');
    cy.wait(1000);
    // Проверяем, что на странице отображается сообщение о том, что стажировки не найдены
    cy.get('body').should('contain.text', 'Не удалось загрузить стажировки');
  });

  it('Должен корректно обрабатывать выбор фильтра, когда нет стажировок по выбранному статусу', () => {
    cy.log('Выбор фильтра по статусу, для которого нет стажировок');
    cy.get('body').then($body => {
      if ($body.find('.vacancies-block__filters-wrapper .form-select__selected:visible').length > 0) {
        // Открываем фильтр статуса
        cy.get('.vacancies-block__filters-wrapper .form-select__selected:visible')
          .first()
          .click({ force: true });
        cy.get('.form-select__items:visible', { timeout: 3000 }).should('exist');
        
        // Выбираем статус, который маловероятно встречается, например "Отменена"
        cy.get('.form-select__option:visible').contains('Отменена').click({ force: true });
        cy.wait(1500);
        
        // Проверяем, что карточки стажировок отсутствуют и показывается сообщение об отсутствии стажировок
        cy.get('.internship-item').should('have.length', 0);
        cy.get('body').should('contain.text', 'Не удалось загрузить стажировки');
      } else {
        cy.log('Фильтр по статусу не отображается на данном экране');
      }
    });
  });
});