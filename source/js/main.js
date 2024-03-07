import onLoadJs from './utils/utils.js';
import menuMobile from './menu/menu.js';
import './focus-poly/focus-poly.js';

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
