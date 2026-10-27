document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('collections-grid');
    if (!grid) return;

    const messages = {
        loading: grid.dataset.msgLoading || 'Loading…',
        error:   grid.dataset.msgError   || 'Error loading products.',
        empty:   grid.dataset.msgEmpty   || 'No products available.',
        noImage: grid.dataset.msgNoImage || 'Image coming soon',
    };

    const formatPrice = (price) => {
        const n = Number(price) || 0;
        return n.toFixed(2).replace('.', ',') + ' €';
    };

    const renderProducts = (products) => {
        grid.innerHTML = '';
        if (!products.length) {
            grid.innerHTML = '<div class="collections-loading" style="grid-column: 1 / -1; text-align: center; padding: 40px;">' + messages.empty + '</div>';
            return;
        }
        products.forEach(product => {
            const card = document.createElement('a');
            card.href = '/produto?id=' + encodeURIComponent(product.id);
            card.className = 'store-card';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';
            const imageHtml = product.image
                ? `<img src="${product.image}" alt="${product.name}">`
                : `<div class="store-card-no-image">${messages.noImage}</div>`;
            card.innerHTML = `
                <div class="store-card-image">
                    ${imageHtml}
                </div>
                <div class="store-card-content">
                    <div class="store-card-title">
                        <p>${product.name}</p>
                    </div>
                    <p class="store-card-price">${formatPrice(product.price)}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    const loadAll = async () => {
        grid.innerHTML = '<div class="collections-loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; font-family: \'Inter\', sans-serif;">' + messages.loading + '</div>';
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to load products: ' + res.status);
            const products = await res.json();
            renderProducts(products);
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<div class="collections-loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #c33;">' + messages.error + '</div>';
        }
    };

    loadAll();
});
