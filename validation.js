'use strict';

const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('contact-submit');
const modal = document.getElementById('contact-modal');
const modalClose = document.getElementById('contact-modal-close');

const NAME_REGEX = /^[A-Za-zА-ЩЬЮЯҐЄІЇа-щьюяґєії'’ -]{2,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+380\d{9}$/;

// Поле, з яким користувач уже взаємодіяв (щоб не показувати помилки одразу)
const touched = new Set();

function normalizePhone(raw) {
  let digits = raw.replace(/[\s()\-]/g, '');
  if (/^0\d{9}$/.test(digits)) digits = '+38' + digits;
  else if (/^380\d{9}$/.test(digits)) digits = '+' + digits;
  return digits;
}

function validateName(value) {
  const v = value.trim();
  if (!v) return 'Вкажіть ім\'я';
  if (v.length < 2) return 'Ім\'я має містити щонайменше 2 символи';
  if (!NAME_REGEX.test(v)) return 'Ім\'я може містити лише літери, пробіл, апостроф і дефіс';
  return '';
}

function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Вкажіть email';
  if (!EMAIL_REGEX.test(v)) return 'Некоректний email, приклад: user@example.com';
  return '';
}

function validatePhone(value) {
  const raw = value.trim();
  if (!raw) return 'Вкажіть номер телефону';
  if (/[^\d+\s()\-]/.test(raw)) return 'Номер може містити лише цифри та знак +';
  const phone = normalizePhone(raw);
  const digitsCount = phone.replace(/\D/g, '').length;
  if (digitsCount < 12) return 'Номер неповний: потрібно +380 і ще 9 цифр';
  if (!PHONE_REGEX.test(phone)) return 'Забагато цифр або неправильний код: формат +380XXXXXXXXX';
  return '';
}

function validateMessage(value) {
  const v = value.trim();
  if (!v) return 'Напишіть повідомлення';
  const length = [...v].length; // емодзі рахується як 1 символ, а не 2
  if (length < 10) return `Повідомлення закоротке: ${length} з 10 символів`;
  return '';
}

function validateConsent(checked) {
  return checked ? '' : 'Потрібна згода на обробку даних';
}

const validators = {
  name: (el) => validateName(el.value),
  email: (el) => validateEmail(el.value),
  phone: (el) => validatePhone(el.value),
  message: (el) => validateMessage(el.value),
  consent: (el) => validateConsent(el.checked),
};

function showError(input, message) {
  const field = input.closest('.field');
  const errorEl = document.getElementById(`${input.id}-error`);
  field.classList.add('is-error');
  field.classList.remove('is-success');
  input.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function showSuccess(input) {
  const field = input.closest('.field');
  const errorEl = document.getElementById(`${input.id}-error`);
  field.classList.remove('is-error');
  field.classList.add('is-success');
  input.setAttribute('aria-invalid', 'false');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

function clearState(input) {
  const field = input.closest('.field');
  field.classList.remove('is-error', 'is-success');
  input.setAttribute('aria-invalid', 'false');
  const errorEl = document.getElementById(`${input.id}-error`);
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

function validateField(input) {
  const error = validators[input.name](input);
  if (error) showError(input, error);
  else showSuccess(input);
  return !error;
}

Object.keys(validators).forEach((name) => {
  const input = form.elements[name];
  const eventName = input.type === 'checkbox' ? 'change' : 'input';

  input.addEventListener(eventName, () => {
    if (touched.has(name)) validateField(input);
  });

  input.addEventListener('blur', () => {
    if (input.type !== 'checkbox' && input.value.trim() === '' && !touched.has(name)) return;
    touched.add(name);
    validateField(input);
  });
});

// Після виходу з поля телефону приводимо номер до єдиного вигляду
form.elements.phone.addEventListener('blur', (e) => {
  if (!validatePhone(e.target.value)) e.target.value = normalizePhone(e.target.value);
});

let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('modal-open');
  modalClose.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('modal-open');
  submitBtn.disabled = false;
  (lastFocused || submitBtn).focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (submitBtn.disabled) return;

  let firstInvalid = null;
  Object.keys(validators).forEach((name) => {
    const input = form.elements[name];
    touched.add(name);
    if (!validateField(input) && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  form.reset();
  touched.clear();
  Object.keys(validators).forEach((name) => clearState(form.elements[name]));
  openModal();
});

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (modal.classList.contains('hidden')) return;
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab') {
    // У модалці лише одна інтерактивна кнопка — фокус не виходить за її межі
    event.preventDefault();
    modalClose.focus();
  }
});
