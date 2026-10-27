/**
 * Yanns Cart (badge)
 * - localStorage ("yanns_cart_v1") guarda o que foi adicionado, para o badge
 *   aparecer instantaneamente entre reloads (feedback otimista).
 * - FONTE DA VERDADE = carrinho do LeBillet. A cada carga de página fazemos
 *   reconcileBadge(): buscamos o cart/resume real (via proxy) e corrigimos o
 *   badge — se o carrinho real estiver vazio, o badge zera mesmo que o
 *   localStorage tenha resíduo.
 * - Clicar no ícone abre o checkout do LeBillet (que mostra o cart resume).
 */
document.addEventListener('DOMContentLoaded', () => {
    const CART_VERSION = 1;
    const CART_KEY = 'yanns_cart_v' + CART_VERSION;
    const LEGACY_KEYS = ['yanns_cart_items'];
    const PLACEHOLDER_VARIANT = 'lb_session';

    LEGACY_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });

    const getEventId = () => String(window.LEBILLET_EVENT_ID || '1816');

    const loadCart = () => {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(it =>
                it && typeof it.variantId === 'string' && it.variantId
                && Number.isFinite(Number(it.qty)) && Number(it.qty) > 0
            );
        } catch (_) {
            return [];
        }
    };

    const saveCart = (items) => {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    };

    const totalQty = () => loadCart().reduce((s, it) => s + (Number(it.qty) || 0), 0);

    const updateBadge = () => {
        const qty = totalQty();
        document.querySelectorAll('.cart-badge').forEach(b => {
            b.textContent = String(qty);
            b.classList.toggle('hidden', qty === 0);
        });
    };

    const clearCart = () => {
        try { localStorage.removeItem(CART_KEY); } catch (_) {}
        updateBadge();
    };

    /**
     * Define a contagem autoritativa (vinda do carrinho real do LeBillet).
     * Se n <= 0, limpa. Caso contrário, garante que o badge reflita n —
     * substituindo por um placeholder quando não temos os itens detalhados.
     */
    const setAuthoritativeCount = (n) => {
        if (!Number.isFinite(n)) return;
        if (n <= 0) { clearCart(); return; }
        const items = loadCart();
        const current = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
        if (current !== n) {
            saveCart([{ id: '', variantId: PLACEHOLDER_VARIANT, eventId: getEventId(), qty: n }]);
        }
        updateBadge();
    };

    /**
     * Conta os itens do HTML do cart/resume do LeBillet.
     * Replica a lógica do checkout.js (tbody tr, excluindo linhas td.pt-1),
     * mas somando a quantidade do prefixo "Nx" de cada linha.
     */
    const parseCartCount = (html) => {
        if (typeof html !== 'string' || !html) return 0;
        // Marcadores de carrinho vazio (PT/FR/EN)
        if (/Não adicionou nenhum item|n['’]avez ajouté aucun|aucun article|no items|empty cart/i.test(html)) {
            return 0;
        }
        let doc;
        try {
            doc = new DOMParser().parseFromString(html, 'text/html');
        } catch (_) {
            return null; // não conseguimos parsear → não mexe no badge
        }
        const table = doc.querySelector('table.table-cart-resume');
        if (!table) return 0;
        let total = 0;
        table.querySelectorAll('tbody tr').forEach(tr => {
            if (tr.querySelector('td.pt-1')) return; // linhas de total/taxas
            const cell = tr.querySelector('td');
            if (!cell) return;
            const m = cell.textContent.trim().match(/^(\d+)\s*x/i);
            total += m ? parseInt(m[1], 10) : 1;
        });
        return total;
    };

    /**
     * Reconcilia o badge com o carrinho REAL do LeBillet.
     * Fonte única da verdade: busca o cart/resume e conta os itens.
     * Usado na carga da página e sempre que o carrinho muda no iframe.
     */
    const reconcileBadge = () => {
        const eventId = getEventId();
        const url = '/checkout-proxy.php?event_id=' + encodeURIComponent(eventId)
            + '&relay=1&path=' + encodeURIComponent(eventId + '/cart/resume');
        return fetch(url, {
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then(r => r.ok ? r.text() : '')
            .then(html => {
                if (!html) return;
                const n = parseCartCount(html);
                if (n === null) return; // parse falhou → mantém o que tem
                setAuthoritativeCount(n);
            })
            .catch(() => { /* offline / erro de rede → mantém badge otimista */ });
    };

    // Debounce para evitar múltiplos fetches em rajada (cliques seguidos no iframe)
    let _reconcileTimer = null;
    const reconcileBadgeDebounced = () => {
        if (_reconcileTimer) clearTimeout(_reconcileTimer);
        _reconcileTimer = setTimeout(reconcileBadge, 200);
    };

    // ---- Public API ----
    window.yannsCart = {
        add: (item) => {
            if (!item || !item.variantId) return;
            const items = loadCart().filter(i => i.variantId !== PLACEHOLDER_VARIANT);
            const idx = items.findIndex(i => i.variantId === item.variantId);
            const addQty = Number(item.qty) || 1;
            // Stock máximo do variante (0 = desconhecido/sem limite).
            const stock = Number(item.stock) || 0;
            const cap = (q) => (stock > 0 ? Math.min(q, stock) : q);
            if (idx !== -1) {
                // Não deixa o total ultrapassar o stock (cap autoritativo).
                items[idx].qty = cap((Number(items[idx].qty) || 0) + addQty);
                if (stock > 0) items[idx].stock = stock;
            } else {
                items.push({
                    id:        String(item.id || ''),
                    variantId: String(item.variantId),
                    eventId:   String(item.eventId || getEventId()),
                    qty:       cap(addQty),
                    stock:     stock,
                });
            }
            saveCart(items);
            updateBadge();
        },
        clear: clearCart,
        count: totalQty,
        items: loadCart,
        reconcile: reconcileBadge,
    };

    // ---- Cart icon (header) → abre checkout LeBillet ou redireciona ----
    document.body.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-cart-open]');
        if (!trigger) return;
        e.preventDefault();
        const items = loadCart();
        if (!items.length) {
            window.location.href = '/collections';
            return;
        }
        if (typeof window.openCustomModal === 'function') {
            const first = items[0];
            const isPlaceholder = first.variantId === PLACEHOLDER_VARIANT;
            // Placeholder = não sabemos o produto específico; abre o carrinho
            // sem filtrar por produto (mostra o resume real completo).
            window.openCustomModal(
                'Panier',
                first.eventId || getEventId(),
                isPlaceholder ? '' : first.variantId,
                isPlaceholder ? 0 : first.qty
            );
        } else {
            window.location.href = '/collections';
        }
    });

    // ---- Sync vindo do iframe LeBillet (postMessage) ----
    // O número reportado pelo iframe NÃO é confiável (conta seletores do painel
    // de produtos, não só o carrinho). Por isso tratamos a mensagem apenas como
    // GATILHO: re-buscamos o cart/resume real para obter a contagem autoritativa.
    window.onYannsCartCount = function (_count) {
        reconcileBadgeDebounced();
    };

    // Badge instantâneo (otimista) + reconciliação com o carrinho real
    updateBadge();
    reconcileBadge();

    // Revalida quando a aba volta ao foco (carrinho pode ter mudado/expirado)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) reconcileBadge();
    });
});
