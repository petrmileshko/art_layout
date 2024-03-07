/**
 * Полифил для правильной работы селекторов с псевдоэлементом :focus
 * в браузере Safari на IOS (iPhones, iPads and Macbooks)
 */

(function () {
  var capturedEvents = [];
  var capturing = false;

  function getEventTarget(event) {
    return event.composedPath()[0] || event.target;
  }

  function captureEvent(e) {
    if (capturing) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      capturedEvents.unshift(e);
    }
  }

  function hiddenOrInert(element) {
    var el = element;
    while (el) {
      if (el.style.display === 'none' || el.getAttribute('inert') !== null) return true;
      el = el.parentElement;
    }
    return false;
  }

  /*
   * События по нажатию кнопоки мышки
   * (A) якорные ссылки с атрибутом href,
   * (B) незаблокированные кнопки,
   * (C) незаблокированные textarea,
   * (D) незаблокированные поля ввода input типов - "button", "reset", "checkbox", "radio", "submit"
   * (E) неинтерактивные элементы у которых значения tabindex - число (button, a, input, textarea, select)
   * (F) встраиваемый элемент audio
   * (G) встраиваемый элемент video с атрибутами управления
   * (H) любой другой элемент с атрибутом contenteditable
   */
  function isFocusableElement(el) {
    var tag = el.tagName;
    return (
      !hiddenOrInert(el) && (
        (/^a$/i.test(tag) && el.href != null) || // (A)
        (/^(button|textarea)$/i.test(tag) && el.disabled !== true) || // (B) (C)
        (/^input$/i.test(tag) &&
          /^(button|reset|submit|radio|checkbox)$/i.test(el.type) &&
          !el.disabled) || // (D)
        (!/^(button|input|textarea|select|a)$/i.test(tag) &&
          !Number.isNaN(Number.parseFloat(el.getAttribute('tabindex')))) || // (E)
        /^audio$/i.test(tag) || // (F)
        (/^video$/i.test(tag) && el.controls === true) || // (G)
        el.getAttribute('contenteditable') != null // (H)
      )
    );
  }

  function getLabelledElement(labelElement) {
    var forId = labelElement.getAttribute('for');
    return forId ?
      document.querySelector('#' + forId) :
      labelElement.querySelector('button, input, keygen, select, textarea');
  }

  function getFocusableElement(e) {
    var currentElement = getEventTarget(e);
    var focusableElement;
    while (!focusableElement && currentElement !== null && currentElement.nodeType === 1) {
      if (isFocusableElement(currentElement)) {
        focusableElement = currentElement;
      } else if (/^label$/i.test(currentElement.tagName)) {
        var labelledElement = getLabelledElement(currentElement);
        if (isFocusableElement(labelledElement)) {
          focusableElement = labelledElement;
        }
      }
      currentElement = currentElement.parentElement || currentElement.parentNode
    }
    return focusableElement;
  }

  function handler(e) {
    var focusableElement = getFocusableElement(e);

    if (focusableElement) {
      if (focusableElement === document.activeElement) {
        // нажатие мышки на элементе в фокусе
        // не запускаем событие в этом случае и
        // вызываем preventDefault() для предотвращения
        // переноса фокуса на элемент body
        e.preventDefault();
      } else {
        // захватываем возможные события от мышки
        capturing = true;

        /*
         * помещаем в очередь события focus, которые включают любые
         * события перед mouseup и click событиями.
         * Правильная очередь событий:
         *
         * [текущий элемент] MOUSEDOWN
         * [предыдущий активный элемент] BLUR
         * [предыдущий активный элемент] FOCUSOUT
         * [текущий элемент] FOCUS
         * [текущий элемент] FOCUSIN
         * [текущий элемент] MOUSEUP
         * [текущий элемент] CLICK
         */
        setTimeout(() => {
          // прекращаем захват возможных событий от мышки
          capturing = false;

          // активируем событие focus
          focusableElement.focus();

          // переадресовываем захваченные события мышки в очередь
          while (capturedEvents.length > 0) {
            var event = capturedEvents.pop();
            getEventTarget(event).dispatchEvent(new MouseEvent(event.type, event));
          }
        }, 0);
      }
    }
  }

  if (/apple/i.test(navigator.vendor)) {
    window.addEventListener('mousedown', handler, {
      capture: true
    });
    window.addEventListener('mouseup', captureEvent, {
      capture: true
    });
    window.addEventListener('click', captureEvent, {
      capture: true
    });
  }
})();
