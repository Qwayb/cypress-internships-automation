describe('Workspace Interaction Tests', () => {
  beforeEach(() => {
    cy.fixture('internship').then(data => {
      cy.visit('https://dev.profteam.su/login');
      cy.get('.form-input--text').type(data.employer_login);
      cy.get('.form-input--password').type(data.employer_password);
      cy.get('.button').contains('Войти').click();
      cy.url().should('include', '/account');
      cy.get('.menu-item__item-name').contains('Отклики').click(); // Navigate to responses
      cy.url().should('include', '/responses');
      cy.contains('.responses-list-item', 'Отклик на стажировку') // Find the specific response
        .should('exist')
        .contains('Рабочее пространство') // Click "Рабочее пространство"
        .click();
      cy.url().should('include', '/workspaces/250'); // Updated to match new workspace id
    });
  });

  it('should verify the workspace title', () => {
    cy.get('.page-title').should('contain.text', 'Пространство');
  });

  it('should interact with the "Стажировка пройдена" button only if the status is "Открыто"', () => {
    cy.get('.detailed-workspace-status').then($status => {
      if ($status.text().includes('Открыто')) {
        cy.contains('button', 'Стажировка пройдена').should('be.visible').click();
        // Add assertions to verify the result of the button click
      } else {
        cy.contains('button', 'Стажировка пройдена').should('not.exist');
      }
    });
  });

  it('should validate that the "Стажировка не пройдена" button is not present', () => {
    // Since the internship is already finished, the button should not exist
    cy.contains('button', 'Стажировка не пройдена').should('not.exist');
  });

  it('should add a comment only if the internship is "Открыто"', () => {
    cy.get('.detailed-workspace-status').then($status => {
      if ($status.text().includes('Открыто')) {
        cy.get('textarea[placeholder="Напишите комментарий..."]')
          .scrollIntoView().should('exist')
          .type('This is a test comment.', { force: true });
        cy.get('.comment-textarea__buttons button').last().click();
        cy.contains('.comment-text', 'This is a test comment.').should('exist');
      } else {
        // On a frozen workspace, the comment area exists but is disabled
        cy.get('textarea[placeholder="Напишите комментарий..."]').should('be.disabled');
      }
    });
  });
});
