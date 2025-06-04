describe('Негативное создание стажировки - Точные селекторы', () => {
  beforeEach(() => {
    cy.fixture('internship').then(data => {
      // Выполняем вход в аккаунт
      cy.log('Переход на страницу авторизации');
      cy.visit(data.main_url);
      cy.get('.form-input--text').type(data.employer_login);
      cy.get('.form-input--password').type(data.employer_password);
      cy.get('.button').contains('Войти').click();
      cy.url().should('include', '/account');
      cy.get('.page-title').should('contain', 'Личный кабинет');

      // Переход на страницу стажировок и открытие формы создания стажировки
      cy.log('Переход на страницу стажировок');
      cy.get('.menu-item__item-name').contains('Стажировки').click();
      cy.get('button').contains('Создать стажировку').click();
      // Ожидание появления модального окна создания стажировки
      cy.get('.desktop-modal, .full-display-modal').should('be.visible');
      cy.wait(2000); // ожидание полной загрузки формы
    });
  });

  it('Не должно создаваться стажировка при отсутствии обязательных полей', () => {
    cy.log('Проверяем, что кнопка "Создать стажировку" не активна при отсутствии обязательных полей');
    // Вместо клика проверяем, что кнопка недоступна (disabled)
    cy.get('button').contains('Создать стажировку').should('be.disabled');
    // Можно также проверить наличие сообщения об ошибке, если оно отображается валидацией формы
    cy.get('.error-message').should('contain.text', 'Обязательное поле');
  });

  it('Не должно создаваться стажировка с некорректным форматом даты', () => {
    cy.log('Заполнение формы с неверным форматом дат');
    // 1. Название
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(1)')
      .find('input')
      .clear({ force: true })
      .type('Тестовая стажировка', { force: true });
    // 2. Описание
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(6)')
      .find('textarea')
      .clear({ force: true })
      .type('Некорректное описание', { force: true });
    // 3. Дата начала и окончания с неверным форматом
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(4)')
      .find('input[type="date"]')
      .clear({ force: true })
      .type('неверная_дата', { force: true });
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(5)')
      .find('input[type="date"]')
      .clear({ force: true })
      .type('неверная_дата', { force: true });
      
    cy.log('Проверяем, что кнопка "Создать стажировку" не активна при неверном формате дат');
    cy.get('button').contains('Создать стажировку').should('be.disabled');
    cy.get('.error-message').should('contain.text', 'Неверный формат даты');
  });

  it('Не должно создаваться стажировка, если дата начала позже даты окончания', () => {
    cy.log('Заполнение формы, где дата начала позже даты окончания');
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(1)')
      .find('input')
      .clear({ force: true })
      .type('Тестовая стажировка', { force: true });
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(6)')
      .find('textarea')
      .clear({ force: true })
      .type('Описание тестовой стажировки', { force: true });
    // Указываем дату начала позже даты окончания
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(4)')
      .find('input[type="date"]')
      .clear({ force: true })
      .type('2025-12-31', { force: true });
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(5)')
      .find('input[type="date"]')
      .clear({ force: true })
      .type('2025-01-01', { force: true });
      
    cy.log('Проверяем, что кнопка "Создать стажировку" не активна при некорректном порядке дат');
    cy.get('button').contains('Создать стажировку').should('be.disabled');
    cy.get('.error-message').should('contain.text', 'Дата начала должна быть раньше даты окончания');
  });

  it('Не должно создаваться стажировка с названием, превышающим максимально допустимую длину', () => {
    cy.log('Заполнение формы с слишком длинным названием');
    // Формируем строку длиной 256 символов (максимум 255 символов)
    const longTitle = 'A'.repeat(256);
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(1)')
      .find('input')
      .clear({ force: true })
      .type(longTitle, { force: true });
      
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(6)')
      .find('textarea')
      .clear({ force: true })
      .type('Описание корректное', { force: true });
      
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(4)')
      .find('input[type="date"]')
      .clear({ force: true })
      .type('2025-01-01', { force: true });
    cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(5)')
      .find('input[type="date"]')
      .clear({ force: true })
      .type('2025-12-31', { force: true });
      
    cy.log('Проверяем, что кнопка "Создать стажировку" не активна при слишком длинном названии');
    cy.get('button').contains('Создать стажировку').should('be.disabled');
    cy.get('.error-message').should('contain.text', 'Длина заголовка не должна превышать');
  });
});