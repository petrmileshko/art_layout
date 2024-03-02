/**
 * Функция для инициализации мобильной версии меню с кнопкой типа бургер, передать объекты с описанием классов элемента и активации для элементов (контейнер, меню, бургер)
 * @param {object} container
 * @param {object} menu
 * @param {object} control
 * @returns
 */
function menuMobile(container, menu, control) {
  const containerElement = document.querySelector(container.element);
  const menuElement = document.querySelector(menu.element);
  const controlElement = document.querySelector(control.element);

  return function () {
    if (containerElement !== null && menuElement !== null && controlElement !== null) {

      controlElement.addEventListener('click', (e) => {
        e.preventDefault();
        containerElement.classList.toggle(container.activation);
        menuElement.classList.toggle(menu.activation);
        controlElement.classList.toggle(control.activation);
      });

      if (/apple/i.test(navigator.vendor)) {
        controlElement.addEventListener('focus', (e) => {
          e.preventDefault();
        });
      }
    }
  };
}

export default menuMobile;
