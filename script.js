document.addEventListener('DOMContentLoaded', () => {
    // Мобільне меню
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuIcon.textContent = mobileMenu.classList.contains('hidden') ? '≡' : 'X';
        });
    }
});

// Функція перемикання висувних списків комплектуючих
function toggleDropdown(dropdownId, element) {
    const dropdown = document.getElementById(dropdownId);
    const arrowSvg = element.querySelector('.arrow-btn svg');

    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
    if (arrowSvg) {
        arrowSvg.classList.toggle('rotate-180');
    }
}
// Віджет зворотного зв'язку: обробка форми (демо без сервера)
document.addEventListener('DOMContentLoaded', () => {
    const supportForm = document.getElementById('support-form');
    const supportSuccess = document.getElementById('support-success');

    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            supportSuccess.classList.add('show');
            supportForm.reset();
            setTimeout(() => supportSuccess.classList.remove('show'), 4000);
        });
    }
});
