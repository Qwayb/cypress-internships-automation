describe('Отклик на стажировку студентом', () => {
  beforeEach(() => {
    // Замените на актуальные данные для студента
    cy.fixture('internship').then(data => {
      cy.visit('https://dev.profteam.su/login');
      cy.get('.form-input--text').type('stud');
      cy.get('.form-input--password').type(data.employer_password);
      cy.get('.button').contains('Войти').click();
      cy.url().should('include', '/account');
      cy.get(':nth-child(1) > .header__nav > [href="/internships"]').click();
      cy.url().should('include', '/internships');
      cy.get('.card-title').contains('Все стажировки').should('be.visible');
    });
  });

  it('Студент видит список стажировок', () => {
    cy.get('.internship-item').should('have.length.at.least', 1);
    cy.get('.internship-header__name').first().should('be.visible');
  });

  it('Студент может открыть карточку стажировки', () => {
    cy.get('.internship-item').first().within(() => {
      cy.get('button').contains('Подробнее').click();
    });
    cy.url().should('match', /\/internship\/\d+|\/internships\/\d+/);
    cy.get('.internship-header__name').should('be.visible');
  });

  it('Студент может откликнуться на стажировку', () => {
    cy.get('.internship-item').first().within(() => {
      cy.get('button').contains('Подробнее').click();
    });
    cy.url().should('match', /\/internship\/\d+|\/internships\/\d+/);

    // Кнопка отклика должна быть видимой и активной
    cy.get('button').contains('Откликнуться').should('be.visible').and('not.be.disabled').click();

    // После отклика появляется сообщение или кнопка "Вы уже откликнулись!"
    cy.get('button').contains('Вы уже откликнулись!').should('be.visible').and('be.disabled');
  });

  it('Студент не может откликнуться повторно', () => {
    cy.get('.internship-item').first().within(() => {
      cy.get('button').contains('Подробнее').click();
    });
    cy.url().should('match', /\/internship\/\d+|\/internships\/\d+/);

    // Кнопка "Вы уже откликнулись!" должна быть неактивной
    cy.get('button').contains('Вы уже откликнулись!').should('be.visible').and('be.disabled');
  });
});