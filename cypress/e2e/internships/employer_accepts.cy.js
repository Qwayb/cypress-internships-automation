describe('Работодатель подтверждает отклик на стажировку', () => {
  beforeEach(() => {
    cy.fixture('internship').then(data => {
      cy.visit('https://dev.profteam.su/login');
      cy.get('.form-input--text').type(data.employer_login);
      cy.get('.form-input--password').type(data.employer_password);
      cy.get('.button').contains('Войти').click();
      cy.url().should('include', '/account');
      cy.get('.menu-item__item-name').contains('Отклики').click();
      cy.url().should('include', '/responses');
      // Проверяем, что есть отклик на стажировку
      cy.get('.responses-list-item .badge span').contains('Отклик на стажировку').should('exist');
    });
  });

  it('Работодатель видит отклики на стажировку', () => {
    cy.get('.responses-list-item').should('exist');
    cy.get('.responses-list-item .badge span').contains('Отклик на стажировку').should('exist');
  });

  it('Работодатель может принять отклик', () => {
    cy.get('.responses-list-item').then($items => {
      // Ищем отклик с кнопкой "Принять"
      const targetIndex = $items.toArray().findIndex(el =>
        el.querySelectorAll('.responses-list-item__action').length > 0
      );
      expect(targetIndex, 'Индекс отклика с кнопкой "Принять" найден').to.be.greaterThan(-1);

      // Кликаем "Принять" внутри нужного отклика
      cy.wrap($items[targetIndex]).within(() => {
        cy.get('.responses-list-item__action').first().click();
      });

      // Проверяем появление кнопки "Рабочее пространство" по индексу отклика
      cy.get(`.infinite-loader > :nth-child(${targetIndex + 1}) > .button`)
        .contains('Рабочее пространство')
        .should('be.visible');
    });
  });

  it('Работодатель может отклонить отклик', () => {
    cy.get('.responses-list-item').then($items => {
      // Ищем отклик с кнопкой "Отклонить"
      const target = [...$items].find(el =>
        el.querySelectorAll('.responses-list-item__action').length > 1
      );
      expect(target, 'Отклик с кнопкой "Отклонить" найден').to.exist;
      cy.wrap(target).within(() => {
        cy.get('.responses-list-item__action').eq(1).click();
        cy.get('.responses-list-item__button-denied')
          .contains('Отклик отклонён')
          .should('be.visible');
      });
    });
  });
});