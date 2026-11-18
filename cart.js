// Кошик NexPC: спільний для index.html і catalog.html.
// Вміст зберігається в localStorage браузера, тому не зникає при переході між сторінками та після перезавантаження.
(function () {
    const STORAGE_KEY = 'nexpc_cart';
    // Корінь сайту визначаємо за адресою цього скрипта (працює і з index.html, і з empty/catalog.html)
    const ROOT = new URL('.', document.currentScript.src).href;

    let memoryCart = [];

    function load() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return memoryCart;
        }
    }

    function save(items) {
        memoryCart = items;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* без localStorage кошик живе до перезавантаження */ }
        render();
    }

    const money = n => Number(n).toLocaleString('uk-UA') + ' ₴';
    const parsePrice = text => Number(String(text).replace(/[^\d]/g, '')) || 0;
    const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // Шлях до картинки зберігаємо відносно кореня сайту, щоб він працював на обох сторінках
    function relativeToRoot(absoluteUrl) {
        return absoluteUrl && absoluteUrl.startsWith(ROOT) ? absoluteUrl.slice(ROOT.length) : (absoluteUrl || '');
    }

    function add(item) {
        const items = load();
        const existing = items.find(i => i.id === item.id);
        if (existing) existing.qty += 1;
        else items.push({ ...item, qty: 1 });
        save(items);
        toast(`«${item.name}» додано до кошика`);
    }

    function changeQty(id, delta) {
        const items = load();
        const item = items.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        save(item.qty > 0 ? items : items.filter(i => i.id !== id));
    }

    function remove(id) { save(load().filter(i => i.id !== id)); }
    function clear() { save([]); }

    // ---------- Стилі ----------
    const style = document.createElement('style');
    style.textContent = `
    .nx-overlay{position:fixed;inset:0;background:rgba(5,8,15,.6);backdrop-filter:blur(2px);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s;z-index:10000}
    .nx-overlay.open{opacity:1;visibility:visible}
    .nx-cart{position:fixed;top:0;right:0;height:100%;width:400px;max-width:100vw;box-sizing:border-box;background:#0F1524;border-left:1px solid rgba(47,107,255,.3);box-shadow:-20px 0 50px rgba(0,0,0,.5);transform:translateX(100%);transition:transform .3s ease;z-index:10001;display:flex;flex-direction:column;color:#F5F7FA;font-family:inherit}
    .nx-cart.open{transform:translateX(0)}
    .nx-cart *{box-sizing:border-box}
    .nx-head{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid rgba(255,255,255,.08)}
    .nx-head h3{margin:0;font-size:20px;font-weight:700}
    .nx-head h3 span{font-size:13px;font-weight:500;color:rgba(245,247,250,.5);margin-left:6px}
    .nx-close{background:rgba(255,255,255,.06);border:0;color:#F5F7FA;width:36px;height:36px;border-radius:10px;font-size:20px;cursor:pointer;transition:background .2s}
    .nx-close:hover{background:rgba(47,107,255,.35)}
    .nx-body{flex:1;overflow-y:auto;padding:14px 22px}
    .nx-item{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06)}
    .nx-img{width:68px;height:68px;flex-shrink:0;border-radius:12px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;overflow:hidden}
    .nx-img img{width:100%;height:100%;object-fit:contain;padding:6px}
    .nx-img img.cover{object-fit:cover;padding:0}
    .nx-info{flex:1;min-width:0}
    .nx-cat{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#22D3EE}
    .nx-name{font-weight:700;font-size:14px;margin:2px 0 4px;line-height:1.3}
    .nx-details{font-size:11px;color:rgba(245,247,250,.5);margin-bottom:8px;line-height:1.4}
    .nx-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .nx-qty{display:flex;align-items:center;background:rgba(255,255,255,.06);border-radius:10px}
    .nx-qty button{background:none;border:0;color:#F5F7FA;width:30px;height:30px;font-size:16px;cursor:pointer;border-radius:10px}
    .nx-qty button:hover{background:rgba(47,107,255,.35)}
    .nx-qty span{min-width:26px;text-align:center;font-weight:600;font-size:14px}
    .nx-price{font-weight:700;font-size:15px;white-space:nowrap}
    .nx-remove{background:none;border:0;color:rgba(245,247,250,.35);cursor:pointer;font-size:12px;padding:0;margin-top:6px}
    .nx-remove:hover{color:#F87171}
    .nx-empty{text-align:center;padding:60px 10px;color:rgba(245,247,250,.6)}
    .nx-empty svg{width:64px;height:64px;color:rgba(47,107,255,.6);margin-bottom:12px}
    .nx-empty p{margin:0 0 18px}
    .nx-foot{padding:18px 22px 22px;border-top:1px solid rgba(255,255,255,.08);background:#0B0F1A}
    .nx-total{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
    .nx-total span{color:rgba(245,247,250,.6);font-size:14px}
    .nx-total strong{font-size:26px;color:#2F6BFF}
    .nx-btn{display:block;width:100%;text-align:center;text-decoration:none;padding:13px;border:0;border-radius:12px;background:linear-gradient(135deg,#2F6BFF,#7C3AED);color:#fff;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 8px 20px rgba(47,107,255,.25);transition:transform .2s,box-shadow .2s}
    .nx-btn:hover{transform:translateY(-1px);box-shadow:0 10px 26px rgba(124,58,237,.35)}
    .nx-link{display:block;width:100%;margin-top:10px;background:none;border:0;color:rgba(245,247,250,.45);font-size:13px;cursor:pointer}
    .nx-link:hover{color:#F87171}
    .nx-form label{display:block;font-size:12px;color:rgba(245,247,250,.7);margin:12px 0 6px}
    .nx-form input{width:100%;padding:11px 13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#F5F7FA;font-size:14px;outline:none;font-family:inherit}
    .nx-form input:focus{border-color:#2F6BFF}
    .nx-form h4{margin:6px 0 4px;font-size:16px}
    .nx-form p{margin:0;font-size:13px;color:rgba(245,247,250,.6)}
    .nx-done{text-align:center;padding:50px 10px}
    .nx-done .ok{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.15);color:#22C55E;font-size:32px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
    .nx-done h4{margin:0 0 8px;font-size:18px}
    .nx-done p{margin:0 0 20px;color:rgba(245,247,250,.65);font-size:14px;line-height:1.5}
    .nx-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#131B2E;border:1px solid rgba(34,211,238,.4);color:#F5F7FA;padding:12px 18px;border-radius:12px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.45);opacity:0;visibility:hidden;transition:all .25s;z-index:10002;max-width:calc(100vw - 32px)}
    .nx-toast.show{opacity:1;visibility:visible;transform:translate(-50%,0)}
    .nx-toast b{color:#22D3EE;cursor:pointer;margin-left:8px;white-space:nowrap}
    .nx-added{background:#22C55E !important}
    `;
    document.head.appendChild(style);

    // ---------- Розмітка панелі ----------
    const overlay = document.createElement('div');
    overlay.className = 'nx-overlay';
    const panel = document.createElement('aside');
    panel.className = 'nx-cart';
    panel.setAttribute('aria-label', 'Кошик');
    panel.innerHTML = `
        <div class="nx-head"><h3>Кошик<span class="nx-count"></span></h3><button class="nx-close" type="button" aria-label="Закрити кошик">×</button></div>
        <div class="nx-body"></div>
        <div class="nx-foot"></div>`;
    const toastEl = document.createElement('div');
    toastEl.className = 'nx-toast';

    let view = 'cart'; // cart | checkout | done
    let lastOrder = null;

    function open() { toastEl.classList.remove('show'); view = view === 'done' ? 'cart' : view; render(); overlay.classList.add('open'); panel.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('open'); panel.classList.remove('open'); document.body.style.overflow = ''; if (view === 'done') view = 'cart'; }

    let toastTimer;
    function toast(text) {
        toastEl.innerHTML = `${escapeHtml(text)} <b>Відкрити</b>`;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
    }

    function render() {
        const items = load();
        const count = items.reduce((s, i) => s + i.qty, 0);
        const total = items.reduce((s, i) => s + i.qty * i.price, 0);

        // Лічильник на кнопці в шапці
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count > 99 ? '99+' : count;
            el.classList.toggle('hidden', count === 0);
        });
        if (!panel.isConnected) return;

        panel.querySelector('.nx-count').textContent = count ? `(${count})` : '';
        const body = panel.querySelector('.nx-body');
        const foot = panel.querySelector('.nx-foot');

        if (view === 'done' && lastOrder) {
            body.innerHTML = `<div class="nx-done"><div class="ok">✓</div><h4>Дякуємо, ${escapeHtml(lastOrder.name)}!</h4>
                <p>Замовлення №${lastOrder.number} на суму ${money(lastOrder.total)} прийнято.<br>Менеджер зателефонує на номер ${escapeHtml(lastOrder.phone)} для підтвердження.</p>
                <button class="nx-btn" type="button" data-act="close">Продовжити покупки</button></div>`;
            foot.style.display = 'none';
            return;
        }

        if (items.length === 0) {
            view = 'cart';
            body.innerHTML = `<div class="nx-empty">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>
                <p>Кошик порожній</p><a class="nx-btn" href="${ROOT}empty/catalog.html">Перейти до каталогу</a></div>`;
            foot.style.display = 'none';
            return;
        }
        foot.style.display = '';

        if (view === 'checkout') {
            body.innerHTML = `<form class="nx-form" id="nx-checkout">
                <h4>Оформлення замовлення</h4><p>${count} ${count === 1 ? 'позиція' : 'позицій'} на суму ${money(total)}</p>
                <label for="nx-name">Ваше ім'я</label><input id="nx-name" name="name" required placeholder="Наприклад: Олександр">
                <label for="nx-phone">Телефон</label><input id="nx-phone" name="phone" type="tel" required pattern="[+0-9 ()-]{10,}" placeholder="+38 0XX XXX XX XX">
                <label for="nx-city">Місто доставки</label><input id="nx-city" name="city" placeholder="Київ">
            </form>`;
            foot.innerHTML = `<div class="nx-total"><span>До сплати</span><strong>${money(total)}</strong></div>
                <button class="nx-btn" type="submit" form="nx-checkout">Підтвердити замовлення</button>
                <button class="nx-link" type="button" data-act="back">← Назад до кошика</button>`;
            return;
        }

        body.innerHTML = items.map(i => {
            const src = /^(https?:|data:|\/)/.test(i.img) ? i.img : ROOT + i.img;
            return `<div class="nx-item">
                <div class="nx-img">${i.img ? `<img src="${escapeHtml(src)}" alt="" class="${i.cover ? 'cover' : ''}">` : ''}</div>
                <div class="nx-info">
                    ${i.cat ? `<div class="nx-cat">${escapeHtml(i.cat)}</div>` : ''}
                    <div class="nx-name">${escapeHtml(i.name)}</div>
                    ${i.details ? `<div class="nx-details">${escapeHtml(i.details)}</div>` : ''}
                    <div class="nx-row">
                        <div class="nx-qty"><button type="button" data-act="minus" data-id="${escapeHtml(i.id)}" aria-label="Менше">−</button><span>${i.qty}</span><button type="button" data-act="plus" data-id="${escapeHtml(i.id)}" aria-label="Більше">+</button></div>
                        <div class="nx-price">${money(i.price * i.qty)}</div>
                    </div>
                    <button class="nx-remove" type="button" data-act="remove" data-id="${escapeHtml(i.id)}">Видалити</button>
                </div></div>`;
        }).join('');
        foot.innerHTML = `<div class="nx-total"><span>Разом</span><strong>${money(total)}</strong></div>
            <button class="nx-btn" type="button" data-act="checkout">Оформити замовлення</button>
            <button class="nx-link" type="button" data-act="clear">Очистити кошик</button>`;
    }

    panel.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const id = btn.dataset.id;
        switch (btn.dataset.act) {
            case 'plus': changeQty(id, 1); break;
            case 'minus': changeQty(id, -1); break;
            case 'remove': remove(id); break;
            case 'clear': if (confirm('Очистити кошик?')) clear(); break;
            case 'checkout': view = 'checkout'; render(); break;
            case 'back': view = 'cart'; render(); break;
            case 'close': view = 'cart'; close(); break;
        }
    });

    panel.addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        const items = load();
        lastOrder = {
            number: Math.floor(100000 + Math.random() * 900000),
            name: form.elements['name'].value.trim(),
            phone: form.elements['phone'].value.trim(),
            total: items.reduce((s, i) => s + i.qty * i.price, 0)
        };
        view = 'done';
        save([]);
    });

    overlay.addEventListener('click', close);
    panel.querySelector('.nx-close').addEventListener('click', close);
    toastEl.addEventListener('click', () => { toastEl.classList.remove('show'); open(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
    // Синхронізація, якщо сайт відкрито в кількох вкладках
    window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) render(); });

    function flash(button) {
        button.classList.add('nx-added');
        setTimeout(() => button.classList.remove('nx-added'), 900);
    }

    // ---------- Підключення до сторінок ----------
    function init() {
        document.body.append(overlay, panel, toastEl);
        document.querySelectorAll('#cart-btn').forEach(btn => btn.addEventListener('click', open));

        // Каталог: кнопка «+» у картці товару
        document.querySelectorAll('.product-card').forEach(card => {
            const button = card.querySelector('.pt-4 button');
            if (!button) return;
            button.setAttribute('aria-label', 'Додати до кошика');
            button.title = 'Додати до кошика';
            button.addEventListener('click', () => {
                const name = card.querySelector('h3').textContent.trim();
                const img = card.querySelector('img');
                const cat = card.querySelector('.uppercase');
                add({
                    id: 'part:' + name,
                    name,
                    price: Number(card.dataset.price) || parsePrice(card.querySelector('.border-t .text-xl').textContent),
                    img: img ? relativeToRoot(img.src) : '',
                    cat: cat ? cat.textContent.trim() : 'Комплектуюче',
                    details: Array.from(card.querySelectorAll('ul li')).slice(0, 2).map(li => li.textContent.replace('•', '').trim()).join(' · ')
                });
                flash(button);
            });
        });

        // Головна: кнопки «Купити» в готових збірках
        document.querySelectorAll('a[href*="checkout.html?product="]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const card = link.closest('.rounded-2xl');
                if (!card) return;
                const img = card.querySelector('img');
                const name = card.querySelector('h3').textContent.trim();
                add({
                    id: 'build:' + name,
                    name,
                    price: parsePrice(card.querySelector('.border-t .text-xl').textContent),
                    img: img ? relativeToRoot(img.src) : '',
                    cover: true,
                    cat: 'Готова збірка',
                    details: Array.from(card.querySelectorAll('ul li')).map(li => li.textContent.replace('•', '').trim()).join(' · ')
                });
                flash(link);
            });
        });

        render();
    }

    window.NexCart = { add, open, close, clear, items: load };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
