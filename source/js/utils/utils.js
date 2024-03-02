/**
 *  Функция для удаления класса у элемента
 * @param {object} element
 * @param {string} selector
 */
function removeClass(element, selector) {
  if (element.classList.contains(selector)) {
    element.classList.remove(selector);
  }
}

/**
 * Функция для удаления классов дочерних элементов в контейнере по заданному шаблону
 * @param {object} container
 * @param {string} pattern
 * @returns null or object
 */
function onLoadJs(container, pattern) {
  const element = document.querySelector(container);

  return function () {
    if (element !== null) {
      element.classList.forEach((item) => {
        if (item.includes(pattern)) {
          removeClass(element, item);
        }
      });

      const childs = element.querySelectorAll(`*[class*="${pattern}"]`);

      childs.forEach((child) => {
        child.classList.forEach((item) => {
          if (item.includes(pattern)) {
            removeClass(child, item);
          }
        });
      });
      return element;
    }
    return null;
  }
}

export default onLoadJs;
