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