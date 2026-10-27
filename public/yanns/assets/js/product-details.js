document.addEventListener('DOMContentLoaded', () => {
    const sizeButtons = document.querySelectorAll('.size-button');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const qtyValueDisplay = document.getElementById('qty-value');
    const btnAddCart = document.getElementById('btn-add-cart');

    if (!sizeButtons.length || !qtyValueDisplay || !btnAddCart) return;

    let selectedSize = null;

    // Helper to get current quantity from DOM
    const getCurrentQuantity = () => parseInt(qtyValueDisplay.textContent) || 1;

    // Update the Add to Cart button state
    const updateCartButtonState = () => {
        // Button is now always enabled, validation happens on click
    };

    // Size Selection Logic
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active from all
            sizeButtons.forEach(btn => btn.classList.remove('active'));

            // Add active to clicked
            button.classList.add('active');
            selectedSize = button.textContent.trim();

            updateCartButtonState();
        });
    });

    // Helper to sync header badge on quantity change, but ONLY if the cart isn't empty 
    // (i.e. user already added it to cart so they see live adjustments).
    const updateHeaderBadgePreviewIfActive = (qty) => {
        const badges = document.querySelectorAll('.cart-badge');
        let isCartActive = false;

        badges.forEach(badge => {
            if (!badge.classList.contains('hidden') && parseInt(badge.textContent) > 0) {
                isCartActive = true;
            }
        });

        if (isCartActive) {
            badges.forEach(badge => {
                if (qty > 0) {
                    badge.textContent = qty;
                    badge.classList.remove('hidden');
                } else {
                    badge.textContent = '0';
                    badge.classList.add('hidden');
                }
            });
        }
    };

    // Quantity Logic
    qtyMinus.addEventListener('click', () => {
        let qty = getCurrentQuantity();
        if (qty > 1) {
            qty--;
            qtyValueDisplay.textContent = qty;
            updateCartButtonState();
            updateHeaderBadgePreviewIfActive(qty);
        }
    });

    qtyPlus.addEventListener('click', () => {
        let qty = getCurrentQuantity();
        qty++;
        qtyValueDisplay.textContent = qty;
        updateCartButtonState();
        updateHeaderBadgePreviewIfActive(qty);
    });

    // Initial check just in case
    updateCartButtonState();

    // ----------------------------------------------------
    // Image Gallery & Zoom Pan Logic
    // ----------------------------------------------------
    const thumbnails = document.querySelectorAll('.product-details-thumbnails .thumbnail');
    const mainImage = document.querySelector('.product-details-main-image img');
    const mainImageContainer = document.querySelector('.product-details-main-image');

    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Remove active styling
                thumbnails.forEach(t => t.classList.remove('active'));

                // Add active styling to clicked
                thumb.classList.add('active');

                // Swap main image source
                const imgEl = thumb.querySelector('img');
                if (imgEl) {
                    mainImage.src = imgEl.src;
                }
            });
        });
    }

    if (mainImageContainer && mainImage) {
        // Handle Mouse Move for 3X Panning
        mainImageContainer.addEventListener('mousemove', (e) => {
            const rect = mainImageContainer.getBoundingClientRect();

            // Mouse position relative to the container
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert to percentage
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            // Set transform origin dynamically
            mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        });

        // Optional: Reset origin when leaving
        mainImageContainer.addEventListener('mouseleave', () => {
            mainImage.style.transformOrigin = 'center center';
        });
    }
});
