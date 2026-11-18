// Конфігуратор ПК на головній сторінці NexPC:
// вибір комплектуючих, перевірка сумісності, розрахунок ціни та енергоспоживання, покупка збірки через кошик (cart.js).
(function () {
    const TARIFF = 4.32;             // грн за кВт·год — тариф для населення
    const PSU_STEPS = [450, 550, 650, 750, 850, 1000, 1200];
    const BASE_POWER = { mb: 35 };   // чипсет, VRM, USB-пристрої
    const STORAGE_KEY = 'nexpc_config';
    const IMG = 'images/catalog/';

    // power — споживання під навантаженням (Вт); для CPU та GPU це TDP / TBP
    const PARTS = {
        cpu: { label: 'Процесор', choose: 'Оберіть процесор:', items: [
            { id: 'r5-5600', name: 'AMD Ryzen 5 5600', price: 7130, power: 65, socket: 'AM4', img: 'cpu-amd.svg', specs: '6 ядер / 12 потоків • 3.5–4.4 ГГц • AM4 • TDP 65W' },
            { id: 'r7-5700x', name: 'AMD Ryzen 7 5700X', price: 9450, power: 65, socket: 'AM4', img: 'cpu-amd.svg', specs: '8 ядер / 16 потоків • до 4.6 ГГц • AM4 • TDP 65W' },
            { id: 'r5-7600', name: 'AMD Ryzen 5 7600', price: 8900, power: 65, socket: 'AM5', img: 'cpu-amd.svg', specs: '6 ядер / 12 потоків • 3.8–5.1 ГГц • AM5 • TDP 65W' },
            { id: 'r7-9700x', name: 'AMD Ryzen 7 9700X', price: 14300, power: 65, socket: 'AM5', img: 'cpu-amd.svg', specs: '8 ядер / 16 потоків • 3.8–5.5 ГГц • AM5 • TDP 65W' },
            { id: 'r7-7800x3d', name: 'AMD Ryzen 7 7800X3D', price: 17600, power: 120, socket: 'AM5', img: 'cpu-amd.svg', specs: '8 ядер / 16 потоків • 96 MB 3D V-Cache • AM5 • TDP 120W' },
            { id: 'i5-12400f', name: 'Intel Core i5-12400F', price: 4700, power: 65, socket: 'LGA1700', img: 'cpu-intel.svg', specs: '6 ядер / 12 потоків • 2.5–4.4 ГГц • LGA1700 • TDP 65W' },
            { id: 'i5-14600kf', name: 'Intel Core i5-14600KF', price: 11200, power: 125, socket: 'LGA1700', img: 'cpu-intel.svg', specs: '14 ядер (6P+8E) / 20 потоків • до 5.3 ГГц • LGA1700 • TDP 125W' }
        ]},
        mb: { label: 'Материнська плата', choose: 'Оберіть материнську плату:', items: [
            { id: 'b550m-k', name: 'ASUS B550M-K', price: 3400, socket: 'AM4', ram: 'DDR4', img: 'motherboard.svg', specs: 'AMD B550 • Micro-ATX • 4x DDR4 • AM4' },
            { id: 'b550-gen3', name: 'MSI B550 GAMING GEN3', price: 4650, socket: 'AM4', ram: 'DDR4', img: 'motherboard.svg', specs: 'AMD B550 • ATX • 4x DDR4 • AM4' },
            { id: 'a620m', name: 'ASRock A620M-HDV/M.2+', price: 3600, socket: 'AM5', ram: 'DDR5', img: 'motherboard.svg', specs: 'AMD A620 • Micro-ATX • 2x DDR5 • AM5' },
            { id: 'b650-gp', name: 'MSI B650 GAMING PLUS WIFI', price: 7300, socket: 'AM5', ram: 'DDR5', img: 'motherboard.svg', specs: 'AMD B650 • ATX • 4x DDR5 • Wi-Fi 6E • AM5' },
            { id: 'b650-tuf', name: 'ASUS TUF GAMING B650-PLUS WIFI', price: 8600, socket: 'AM5', ram: 'DDR5', img: 'motherboard.svg', specs: 'AMD B650 • ATX • 4x DDR5 • 3x M.2 • AM5' },
            { id: 'b760m', name: 'Gigabyte B760M DS3H DDR4', price: 4300, socket: 'LGA1700', ram: 'DDR4', img: 'motherboard.svg', specs: 'Intel B760 • Micro-ATX • 4x DDR4 • LGA1700' }
        ]},
        ram: { label: "Оперативна пам'ять", choose: "Оберіть оперативну пам'ять:", items: [
            { id: 'ddr4-16', name: 'Kingston FURY Beast DDR4 16GB', price: 1500, power: 8, type: 'DDR4', img: 'ram-ddr4.svg', specs: '2×8GB • 3200 MHz • CL16' },
            { id: 'ddr4-32', name: 'DDR4 32GB 3200 MHz', price: 2800, power: 10, type: 'DDR4', img: 'ram-ddr4.svg', specs: '2×16GB • 3200 MHz • CL16 • 1.35V' },
            { id: 'ddr5-32', name: 'Kingston FURY Beast DDR5 32GB', price: 4200, power: 10, type: 'DDR5', img: 'ram-ddr5.svg', specs: '2×16GB • 6000 MHz • CL36' },
            { id: 'ddr5-32-cl30', name: 'G.Skill Flare X5 DDR5 32GB', price: 4900, power: 10, type: 'DDR5', img: 'ram-ddr5.svg', specs: '2×16GB • 6000 MHz • CL30' },
            { id: 'ddr5-64', name: 'Corsair Vengeance RGB DDR5 64GB', price: 9800, power: 12, type: 'DDR5', img: 'ram-ddr5.svg', specs: '2×32GB • 6000 MHz • CL30 • RGB' }
        ]},
        gpu: { label: 'Відеокарта', choose: 'Оберіть відеокарту:', items: [
            { id: 'rx7600', name: 'AMD Radeon RX 7600 8GB', price: 11400, power: 165, img: 'gpu-amd.svg', specs: '8GB GDDR6 • 2048 потокових процесорів • TBP 165W' },
            { id: 'rx9060xt', name: 'AMD Radeon RX 9060 XT 16GB', price: 17800, power: 160, img: 'gpu-amd.svg', specs: '16GB GDDR6 • RDNA 4 • FSR 4 • TBP 160W' },
            { id: 'rtx4060', name: 'NVIDIA RTX 4060 8GB', price: 18900, power: 115, img: 'gpu-nvidia.svg', specs: '8GB GDDR6 • 3072 CUDA ядер • PCIe 4.0 • TDP 115W' },
            { id: 'rtx5060ti', name: 'NVIDIA RTX 5060 Ti 16GB', price: 21500, power: 180, img: 'gpu-nvidia.svg', specs: '16GB GDDR7 • 4608 CUDA ядер • DLSS 4 • TDP 180W' },
            { id: 'rtx4060ti', name: 'NVIDIA RTX 4060 Ti 8GB', price: 22400, power: 160, img: 'gpu-nvidia.svg', specs: '8GB GDDR6 • 4352 CUDA ядер • TDP 160W' },
            { id: 'rtx5070', name: 'NVIDIA RTX 5070 12GB', price: 28900, power: 250, img: 'gpu-nvidia.svg', specs: '12GB GDDR7 • 6144 CUDA ядер • DLSS 4 • TDP 250W' },
            { id: 'rtx5080', name: 'NVIDIA RTX 5080 16GB', price: 52000, power: 360, img: 'gpu-nvidia.svg', specs: '16GB GDDR7 • 10752 CUDA ядер • DLSS 4 • TDP 360W' }
        ]},
        ssd: { label: 'Накопичувач', choose: 'Оберіть накопичувач:', items: [
            { id: 'a400', name: 'Kingston A400 480GB', price: 1200, power: 3, img: 'ssd-sata.svg', specs: 'SATA III • до 500 МБ/с' },
            { id: 'nv3-1tb', name: 'Kingston NV3 1TB', price: 2600, power: 6, img: 'ssd-m2.svg', specs: 'M.2 NVMe PCIe 4.0 • до 6000 МБ/с' },
            { id: '990evo', name: 'Samsung 990 EVO Plus 1TB', price: 3700, power: 6, img: 'ssd-m2.svg', specs: 'M.2 NVMe PCIe 4.0 • до 7150 МБ/с' },
            { id: 'sn850x', name: 'WD Black SN850X 2TB', price: 6900, power: 7, img: 'ssd-m2.svg', specs: 'M.2 NVMe PCIe 4.0 • до 7300 МБ/с' },
            { id: 't705', name: 'Crucial T705 1TB', price: 7600, power: 10, img: 'ssd-m2.svg', specs: 'M.2 NVMe PCIe 5.0 • до 14500 МБ/с' }
        ]},
        cooler: { label: 'Охолодження', choose: 'Оберіть охолодження процесора:', items: [
            { id: 'se224', name: 'ID-Cooling SE-224-XTS', price: 850, power: 3, capacity: 180, img: 'cooler-air.svg', specs: 'Баштовий • 4 теплові трубки • до 180 W' },
            { id: 'ak400', name: 'DeepCool AK400', price: 1300, power: 3, capacity: 220, img: 'cooler-air.svg', specs: 'Баштовий • 4 теплові трубки • до 220 W' },
            { id: 'pa120', name: 'Thermalright Peerless Assassin 120 SE', price: 1700, power: 5, capacity: 245, img: 'cooler-air.svg', specs: 'Двобаштовий • 6 трубок • до 245 W' },
            { id: 'le520', name: 'DeepCool LE520', price: 2900, power: 10, capacity: 220, img: 'cooler-aio.svg', specs: 'СВО 240 мм • ARGB • до 220 W' },
            { id: 'lf3-240', name: 'Arctic Liquid Freezer III 240', price: 3900, power: 10, capacity: 300, img: 'cooler-aio.svg', specs: 'СВО 240 мм • до 300 W' }
        ]},
        psu: { label: 'Блок живлення', choose: 'Оберіть блок живлення:', items: [
            { id: 'a650bn', name: 'MSI MAG A650BN 650W', price: 2200, watts: 650, img: 'psu.svg', specs: '650 Вт • 80 PLUS Bronze' },
            { id: 'dc650', name: 'DeepCool 650W 80+ Bronze', price: 2450, watts: 650, img: 'psu.svg', specs: '650 Вт • 80 PLUS Bronze • OVP, UVP, SCP, OPP' },
            { id: 'rm750e', name: 'Corsair RM750e 750W', price: 4600, watts: 750, img: 'psu.svg', specs: '750 Вт • 80 PLUS Gold • модульний • ATX 3.0' },
            { id: 'pp12m', name: 'be quiet! Pure Power 12 M 850W', price: 5300, watts: 850, img: 'psu.svg', specs: '850 Вт • 80 PLUS Gold • модульний • ATX 3.1' },
            { id: 'gx1000', name: 'Seasonic Focus GX-1000', price: 7900, watts: 1000, img: 'psu.svg', specs: '1000 Вт • 80 PLUS Gold • гарантія 10 років' }
        ]},
        case: { label: 'Корпус', choose: 'Оберіть корпус:', items: [
            { id: 'i3neo', name: 'Zalman i3 Neo', price: 2000, power: 8, img: 'case.svg', specs: 'Mid Tower • ATX • 4 RGB-вентилятори' },
            { id: 'cc560', name: 'DeepCool CC560', price: 2400, power: 8, img: 'case.svg', specs: 'Mid Tower • ATX • 4 вентилятори' },
            { id: 'h5flow', name: 'NZXT H5 Flow', price: 4100, power: 4, img: 'case.svg', specs: 'Mid Tower • ATX • 2 вентилятори' },
            { id: 'lancool216', name: 'Lian Li Lancool 216', price: 4300, power: 6, img: 'case.svg', specs: 'Mid Tower • E-ATX • 3 вентилятори' }
        ]}
    };
    const ORDER = ['cpu', 'mb', 'ram', 'gpu', 'ssd', 'cooler', 'psu', 'case'];
    const DEFAULT = { cpu: 'r5-5600', mb: 'b550m-k', ram: 'ddr4-32', gpu: 'rtx4060', ssd: 'nv3-1tb', cooler: 'ak400', psu: 'dc650', case: 'i3neo' };

    const money = n => Number(n).toLocaleString('uk-UA') + ' ₴';
    const find = (slot, id) => PARTS[slot].items.find(p => p.id === id);

    let selected = { ...DEFAULT };
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved) ORDER.forEach(s => { if (saved[s] && find(s, saved[s])) selected[s] = saved[s]; });
    } catch (e) { /* збережена конфігурація недоступна — використовуємо стандартну */ }

    let openSlot = null;
    let notice = '';

    const part = slot => find(slot, selected[slot]);

    // ---------- Сумісність ----------
    // Повертає текст причини, якщо варіант несумісний з рештою збірки, або порожній рядок
    function incompatibility(slot, item) {
        if (slot === 'mb' && item.socket !== part('cpu').socket) return `Інший сокет (${item.socket})`;
        if (slot === 'ram' && item.type !== part('mb').ram) return `Плата підтримує лише ${part('mb').ram}`;
        return '';
    }

    // Після зміни процесора чи плати автоматично підбираємо сумісні деталі
    function fixCompatibility() {
        const changes = [];
        if (part('mb').socket !== part('cpu').socket) {
            const mb = PARTS.mb.items.filter(m => m.socket === part('cpu').socket).sort((a, b) => a.price - b.price)[0];
            selected.mb = mb.id;
            changes.push(`плату на ${mb.name}`);
        }
        if (part('ram').type !== part('mb').ram) {
            const same = PARTS.ram.items.filter(r => r.type === part('mb').ram);
            const old = part('ram');
            const ram = same.find(r => r.name.includes(old.name.match(/\d+GB/)[0])) || same[0];
            selected.ram = ram.id;
            changes.push(`пам'ять на ${ram.name}`);
        }
        return changes.length ? 'Для сумісності замінено ' + changes.join(' та ') + '.' : '';
    }

    function totals() {
        const price = ORDER.reduce((sum, s) => sum + part(s).price, 0);
        const power = BASE_POWER.mb + ORDER.reduce((sum, s) => sum + (part(s).power || 0), 0);
        const needed = power * 1.3 + 100; // запас 30% + 100 Вт на пікові навантаження
        const recommended = PSU_STEPS.find(w => w >= needed) || PSU_STEPS[PSU_STEPS.length - 1];
        return { price, power, recommended };
    }

    function problems(t) {
        const list = [];
        if (part('psu').watts < t.recommended) list.push(`Блок живлення ${part('psu').watts} Вт заслабкий — потрібно від ${t.recommended} Вт.`);
        if (part('cooler').capacity < part('cpu').power) list.push(`Кулер розрахований на ${part('cooler').capacity} W, а процесор виділяє ${part('cpu').power} W.`);
        return list;
    }

    // ---------- Відображення ----------
    const listEl = document.getElementById('cfg-list');
    if (!listEl) return;
    const $ = id => document.getElementById(id);

    function rowHtml(slot) {
        const group = PARTS[slot];
        const p = part(slot);
        const isOpen = openSlot === slot;
        const options = group.items.map(item => {
            const reason = incompatibility(slot, item);
            const active = item.id === p.id;
            return `<button type="button" data-slot="${slot}" data-id="${item.id}" ${reason ? 'disabled' : ''}
                class="cfg-option w-full flex items-center justify-between gap-3 p-2.5 rounded-lg text-left border transition-colors ${active ? 'bg-[#2F6BFF]/15 border-[#2F6BFF]/60' : 'bg-white/5 border-white/5'} ${reason ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#2F6BFF]/20 hover:border-[#2F6BFF]/50 cursor-pointer'}">
                <span class="flex items-center gap-3 min-w-0">
                    <img src="${IMG + item.img}" alt="" class="w-9 h-9 object-contain shrink-0">
                    <span class="min-w-0">
                        <span class="block text-sm ${active ? 'font-semibold' : ''} text-[#F5F7FA]">${item.name}${active ? ' <span class="text-xs text-[#22D3EE] ml-1">(Обрано)</span>' : ''}</span>
                        <span class="block text-[11px] ${reason ? 'text-[#F87171]' : 'text-[#F5F7FA]/50'}">${reason || item.specs}</span>
                    </span>
                </span>
                <span class="text-xs font-bold text-[#F5F7FA] whitespace-nowrap">${money(item.price)}</span>
            </button>`;
        }).join('');

        return `<div class="bg-white/5 border ${isOpen ? 'border-[#2F6BFF]' : 'border-white/5'} hover:border-[#2F6BFF] rounded-xl transition-all duration-300">
            <button type="button" data-toggle="${slot}" aria-expanded="${isOpen}" class="group relative w-full p-3 md:p-4 flex items-center gap-3 md:gap-4 text-left cursor-pointer select-none">
                <span class="hidden md:block opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 absolute -top-3.5 left-4 z-20 bg-[#1E293B] border border-[#2F6BFF]/60 rounded-lg px-3 py-1 text-[11px] text-[#22D3EE] shadow-xl backdrop-blur-md whitespace-nowrap">${p.specs}</span>
                <span class="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg bg-white/5 flex items-center justify-center p-1.5"><img src="${IMG + p.img}" alt="${p.name}" class="w-full h-full object-contain"></span>
                <span class="flex-1 min-w-0">
                    <span class="text-xs text-[#F5F7FA]/40 group-hover:text-[#2F6BFF] transition-colors block mb-0.5">${group.label}</span>
                    <span class="font-bold text-[#F5F7FA] block leading-snug md:truncate">${p.name}</span>
                </span>
                <span class="font-semibold text-[#F5F7FA] text-sm whitespace-nowrap">${money(p.price)}</span>
                <span class="text-[#F5F7FA]/60 group-hover:text-[#2F6BFF] p-1.5 rounded-lg transition-all duration-300">
                    <svg class="w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </span>
            </button>
            <div class="${isOpen ? '' : 'hidden'} px-4 pb-4 pt-2 space-y-2 border-t border-white/10 bg-[#131B2E]/90 rounded-b-xl">
                <div class="text-xs text-[#F5F7FA]/40 mb-1">${group.choose}</div>
                ${options}
            </div>
        </div>`;
    }

    function render() {
        listEl.innerHTML = ORDER.map(rowHtml).join('');
        const t = totals();
        const issues = problems(t);
        const psuWatts = part('psu').watts;
        const load = Math.round(t.power / psuWatts * 100);

        $('cfg-total').textContent = money(t.price);
        $('cfg-power').textContent = t.power + ' Вт';
        $('cfg-psu-rec').textContent = t.recommended + ' Вт';

        const bar = $('cfg-load-bar');
        bar.style.width = Math.min(load, 100) + '%';
        bar.style.background = load > 85 || issues.length ? '#F87171' : load > 70 ? '#F59E0B' : 'linear-gradient(90deg,#22C55E,#22D3EE)';
        $('cfg-load-text').textContent = `${load}% від ${psuWatts} Вт`;

        const hours = Number($('cfg-hours').value);
        const kwh = t.power * hours * 30 / 1000;
        $('cfg-hours-text').textContent = hours + ' год/день';
        $('cfg-kwh').textContent = kwh.toFixed(1).replace('.', ',') + ' кВт·год';
        $('cfg-energy-cost').textContent = '≈ ' + money(Math.round(kwh * TARIFF)) + ' / міс';

        const status = $('cfg-status');
        if (issues.length) {
            status.className = 'rounded-lg px-3 py-2.5 text-xs mb-5 bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171]';
            status.innerHTML = issues.map(i => '⚠ ' + i).join('<br>');
        } else {
            status.className = 'rounded-lg px-3 py-2.5 text-xs mb-5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]';
            status.textContent = '✓ Усі комплектуючі сумісні';
        }
        const noticeEl = $('cfg-notice');
        noticeEl.textContent = notice;
        noticeEl.classList.toggle('hidden', !notice);

        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); } catch (e) { /* немає доступу до localStorage */ }
    }

    listEl.addEventListener('click', e => {
        const toggle = e.target.closest('[data-toggle]');
        if (toggle) {
            openSlot = openSlot === toggle.dataset.toggle ? null : toggle.dataset.toggle;
            notice = '';
            render();
            return;
        }
        const option = e.target.closest('.cfg-option');
        if (option && !option.disabled) {
            selected[option.dataset.slot] = option.dataset.id;
            notice = (option.dataset.slot === 'cpu' || option.dataset.slot === 'mb') ? fixCompatibility() : '';
            openSlot = null;
            render();
        }
    });

    $('cfg-hours').addEventListener('input', render);

    $('cfg-reset').addEventListener('click', () => {
        selected = { ...DEFAULT };
        openSlot = null;
        notice = '';
        render();
    });

    // ---------- Покупка збірки ----------
    function buildItem() {
        const t = totals();
        return {
            id: 'config:' + ORDER.map(s => selected[s]).join('|'),
            name: 'Власна збірка NexPC',
            price: t.price,
            img: 'images/hero-main-pc.jpg',
            cover: true,
            cat: 'Конфігуратор',
            details: ORDER.map(s => part(s).name).join(' · ') + ` · ~${t.power} Вт`
        };
    }

    function addToCart(openAfter, button) {
        const t = totals();
        const issues = problems(t);
        if (issues.length && !confirm('У збірці є проблеми:\n\n' + issues.join('\n') + '\n\nВсе одно додати її до кошика?')) return;
        if (!window.NexCart) { alert('Кошик недоступний: перевірте, що підключено cart.js'); return; }
        window.NexCart.add(buildItem());
        if (openAfter) window.NexCart.open();
        button.classList.add('nx-added');
        setTimeout(() => button.classList.remove('nx-added'), 900);
    }

    $('cfg-buy').addEventListener('click', e => addToCart(true, e.currentTarget));
    $('cfg-add').addEventListener('click', e => addToCart(false, e.currentTarget));

    // Закриваємо список при кліку поза конфігуратором
    document.addEventListener('click', e => {
        if (!e.target.isConnected) return; // елемент щойно перемальовано всередині конфігуратора
        if (openSlot && !e.target.closest('#cfg-list')) { openSlot = null; render(); }
    });

    render();
})();
