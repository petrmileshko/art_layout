import Pristine from 'pristinejs/dist/pristine';

const initForm = function (formSelector, {
  classTo,
  errorTextParent,
  errorTextClass
}) {
  this.form = document.querySelector(formSelector);

  this.validator = this.form !== null ? new Pristine(this.form, {
    classTo,
    errorTextParent,
    errorTextClass
  }, true) : null;

  this.setValidators = function (params) {

    if (this.validator && params.length && (params instanceof Array)) {

      params.forEach((item) => {
        const element = item.selector ? this.form.querySelector(item.selector) : false;
        if (element && (typeof item.cb === 'function') && item.message.length) {
          this.validator.addValidator(element, item.cb, item.message);
        }
      });

      if (this.form !== null && this.validator) {
        this.form.addEventListener('submit', (evt) => {
          const isValid = this.validator.validate();

          if (!isValid) {
            evt.preventDefault();
          }
        });
      }
    }

  };
};

export default initForm;
