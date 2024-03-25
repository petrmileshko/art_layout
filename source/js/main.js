import {
  onLoadJs,
  validateName,
  validatePhone,
  validateEmail
} from './utils/utils.js';
import menuMobile from './menu/menu.js';
import './focus-poly/focus-poly.js';
import initForm from './form/form.js';


const initHeader = onLoadJs('.page__header', '--nojs');

initHeader();

const initMobileMenu = menuMobile({
  element: '.page__header',
  activation: 'page__header--opened'
}, {
  element: '.navigation__menu',
  activation: 'navigation__menu--opened'
}, {
  element: '.burger__icon',
  activation: 'burger__icon--opened'
});

initMobileMenu();

const appointment = new initForm(
  '.form', {
    classTo: 'form__label',
    errorTextParent: 'form__label',
    errorTextClass: 'form__label--error'
  }
);

appointment.setValidators([{
  selector: '[name="username"]',
  cb: validateName,
  message: 'Кириллица не более чем 50 символов!'
}, {
  selector: '[name="userphone"]',
  cb: validatePhone,
  message: '16 цифр как в шаблоне!'
}, {
  selector: '[name="usermail"]',
  cb: validateEmail,
  message: 'Укажите правильное имя почты, не более 35 символов!'
}]);

appointment.initPhoneMasks('[name="userphone"]', {
  mask: '+{7}(000)000-00-00',
  lazy: true
});
