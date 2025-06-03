// cypress/e2e/internships/create_internship_precise.cy.js

describe('Создание стажировки - Точные селекторы', () => {
  it('Успешное создание стажировки работодателем', () => {
      cy.fixture('internship').then(data => {
          cy.log('Переход на страницу авторизации');
          cy.visit(data.main_url);

          cy.log('Ввод логина работодателя');
          cy.get('.form-input--text').type(data.employer_login);

          cy.log('Ввод пароля работодателя');
          cy.get('.form-input--password').type(data.employer_password);

          cy.log('Клик по кнопке "Войти"');
          cy.get('.button').contains('Войти').click();

          // Ожидание загрузки страницы после логина
          cy.url().should('include', '/account');
          cy.get('.page-title').should('contain', 'Личный кабинет');

          cy.log('Переход на страницу стажировок');
          cy.get('.menu-item__item-name').contains('Стажировки').click();

          // Ожидание загрузки страницы стажировок
          cy.get('.card-title').contains('Все стажировки').should('be.visible');

          cy.log('Клик по кнопке "Создать стажировку"');
          cy.get('button').contains('Создать стажировку').click();

          // Ожидание появления модального окна
          cy.get('.desktop-modal, .full-display-modal').should('be.visible');
          cy.wait(2000); // Ожидание полной загрузки формы

          cy.log('Заполнение формы создания стажировки');

          // 1. Название стажировки - первое поле
          cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(1)')
            .find('input')
            .clear({ force: true })
            .type('Frontend разработчик', { force: true });

          // 2. Тип занятости - второе поле (оставляем по умолчанию "Очный")
          cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(2)')
            .should('contain', 'Очный');

          // 3. Тип оплаты - третье поле
          cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(3) > .form-select > :nth-child(2) > .form-select__selected')
            .click({ force: true });

          // Ожидание появления опций и выбор "Оплачиваемая"
          cy.get('.form-select__items')
            .should('be.visible')
            .find('.form-select__option')
            .contains('Оплачиваемая')
            .click({ force: true });

          // 4. Дата начала - четвертое поле
          cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(4)')
            .find('input[type="date"]')
            .clear({ force: true })
            .type('2025-07-01', { force: true });

          // 5. Дата окончания - пятое поле
          cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(5)')
            .find('input[type="date"]')
            .clear({ force: true })
            .type('2025-09-01', { force: true });

          // 6. Требования - шестое поле
          cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(6)')
            .find('textarea')
            .clear({ force: true })
            .type('Знание HTML, CSS, JavaScript\nОпыт работы с React\nПонимание принципов UX/UI', { force: true });

          // 7. Обязанности - седьмое поле
          cy.get('.vacancy-add-form-wrapper > .form > :nth-child(1) > .form__labels > .labels > :nth-child(7)')
            .find('textarea')
            .clear({ force: true })
            .type('Разработка пользовательских интерфейсов\nОптимизация производительности\nТестирование кода', { force: true });

          // Ожидание активации кнопки
          cy.wait(1000);

          // Проверить, что кнопка стала активной и отправить форму
          cy.get('.vacancy-add-form-wrapper button')
            .contains('Создать стажировку')
            .should('not.be.disabled')
            .click({ force: true });

          // Ожидание закрытия модального окна
          cy.get('.desktop-modal, .full-display-modal').should('not.exist');
          cy.wait(2000);

          cy.log('Публикация стажировки');
          
          // Найти созданную стажировку (скорее всего первая в списке)
          cy.get('.internship-item').first().within(() => {
            // Проверить что статус "Черновик"
            cy.get('.entity__status').should('contain', 'Черновик');
            
            // Найти и нажать кнопку "Опубликовать"
            cy.get('button').contains('Опубликовать').click();
          });

          // Ожидание изменения статуса
          cy.wait(1500);

          cy.log('Проверка созданной стажировки');
          
          cy.get('.internship-item').first().within(() => {
            // Проверить что название содержит наш текст
            cy.get('.internship-header__name').should('contain', 'Frontend разработчик');
            
            // Проверить что статус изменился на "Открыта"
            cy.get('.entity__status').should('contain', 'Открыта');
            
            // Проверить тип оплаты
            cy.get('.internship-header__salary').should('contain', 'Оплачиваемая');
          });

          cy.log('Тест успешно завершен');
      });
  });
});