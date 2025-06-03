// cypress/support/e2e.js

Cypress.on('uncaught:exception', (err, runnable) => {
  // чтобы ошибки на странице не ломали тесты
  return false;
});
