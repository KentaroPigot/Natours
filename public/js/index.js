import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM elements
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logoutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.getElementById('book-tour');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    console.log(e);

    const form = new FormData();
    form.append('name', e.target[0].value);
    form.append('email', e.target[1].value);
    form.append('photo', e.target[2].files[0]);
    // const name = e.target[0].value;
    // const email = e.target[1].value;

    updateSettings(form, 'data');
  });

  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').innerHTML = 'Updating...';
    const passwordCurrent = e.target[0].value;
    const password = e.target[1].value;
    const passwordConfirm = e.target[2].value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').innerHTML = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
