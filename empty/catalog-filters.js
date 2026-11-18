// Каталог NexPC: фільтри, пошук, лічильник результатів і відкриття категорії з посилання (?cat=...)
document.addEventListener('DOMContentLoaded', () => {
    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
    const cards = Array.from(document.querySelectorAll('.product-card'));
    const groups = Array.from(document.querySelectorAll('.category-filter-group'));
    const aside = document.querySelector('aside');
    if (!aside || cards.length === 0) return;

    const [priceFrom, priceTo] = aside.querySelectorAll('input[type="number"]');
    const stockOnly = Array.from(aside.querySelectorAll('input[type="checkbox"]'))
        .find(input => input.parentElement.textContent.includes('Тільки в наявності'));
    const searchInput = document.querySelector('input[placeholder^="Пошук"]');
    const buttons = Array.from(aside.querySelectorAll('button'));
    const applyBtn = buttons.find(b => b.textContent.trim() === 'Застосувати');
    const resetBtn = buttons.find(b => b.textContent.includes('Скинути'));
    const info = document.getElementById('results-info');
    const empty = document.getElementById('no-results');

    const activeTab = tabs.find(t => t.classList.contains('bg-[#2F6BFF]')) || tabs[0];
    let current = activeTab ? activeTab.dataset.category : 'cpu';

    const optionText = input => input.parentElement.textContent.trim();
    const cardTags = card => (card.dataset.tags || '').split('|').map(t => t.trim());

    // Правила поточної категорії: у кожному блоці (напр. «Сокет») має збігтися хоча б одна позначена опція.
    // Якщо в блоці не позначено нічого або позначено все, блок нічого не обмежує.
    function categoryRules() {
        const group = groups.find(g => g.dataset.category === current);
        if (!group) return [];
        return Array.from(group.children).map(block => {
            const inputs = Array.from(block.querySelectorAll('input[type="checkbox"]'));
            const checked = inputs.filter(i => i.checked).map(optionText);
            return (checked.length === 0 || checked.length === inputs.length) ? null : checked;
        }).filter(Boolean);
    }

    function plural(n) {
        const a = n % 10, b = n % 100;
        if (a === 1 && b !== 11) return 'товар';
        if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'товари';
        return 'товарів';
    }

    function applyFilters() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const from = parseFloat(priceFrom && priceFrom.value) || 0;
        const to = parseFloat(priceTo && priceTo.value) || Infinity;
        const rules = categoryRules();
        let shown = 0;

        cards.forEach(card => {
            const price = Number(card.dataset.price) || 0;
            const name = card.querySelector('h3').textContent.toLowerCase();
            // Під час пошуку шукаємо по всіх категоріях, інакше — лише в активній вкладці
            let visible = query ? name.includes(query) : card.dataset.category === current;
            visible = visible && price >= from && price <= to;
            if (stockOnly && stockOnly.checked) visible = visible && card.dataset.stock === '1';
            if (visible && !query) {
                const tags = cardTags(card);
                visible = rules.every(options => options.some(opt => tags.includes(opt)));
            }
            card.classList.toggle('hidden', !visible);
            if (visible) shown++;
        });

        if (info) {
            info.textContent = query
                ? `Знайдено ${shown} ${plural(shown)} за запитом «${searchInput.value.trim()}»`
                : `Показано ${shown} ${plural(shown)}`;
        }
        if (empty) empty.classList.toggle('hidden', shown > 0);
    }

    // Перемикання вкладок (основне перемикання робить наявний скрипт, тут лише застосовуємо фільтри)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            current = tab.dataset.category;
            if (searchInput) searchInput.value = '';
            applyFilters();
        });
    });

    aside.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', applyFilters));
    [priceFrom, priceTo].forEach(input => input && input.addEventListener('input', applyFilters));
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            aside.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
            if (priceFrom) priceFrom.value = '';
            if (priceTo) priceTo.value = '';
            if (searchInput) searchInput.value = '';
            applyFilters();
        });
    }

    // Посилання з головної сторінки: catalog.html?cat=gpu відкриває потрібну вкладку
    const fromLink = new URLSearchParams(location.search).get('cat');
    const linkedTab = tabs.find(t => t.dataset.category === fromLink);
    if (linkedTab) {
        linkedTab.click();
        linkedTab.scrollIntoView({ block: 'nearest', inline: 'center' });
    } else {
        applyFilters();
    }
});
