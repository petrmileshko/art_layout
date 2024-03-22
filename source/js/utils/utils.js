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
export function onLoadJs(container, pattern) {
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
  };
}

export function validateName(value) {
  const re = /^[а-яё -]+$/i;

  if (!re.test(value) || value.length > 50) {
    return false;
  }
  return true;
}

export function validatePhone(value) {

  const re = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

  if (!re.test(value) || value.length < 16) {
    return false;
  }
  return true;
}

export function validateEmail(value) {
  const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  if (!re.test(value)) {
    return false;
  }

  if (value.length > 35) {
    return false;
  }
  return true;
}
