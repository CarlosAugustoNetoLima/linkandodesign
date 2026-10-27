document.addEventListener('DOMContentLoaded', () => {
    // Check if cards exist
    const youtubeCards = document.querySelectorAll('.card-youtube');
    if (!youtubeCards.length) return;

    // Create modal DOM structure
    const modalHTML = `
        <div class="modal-youtube-overlay" id="youtubeModal">
            <div class="modal-youtube-container">
                <button class="modal-youtube-close" id="youtubeModalClose">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                </button>
                <div id="youtubeIframeContainer" class="modal-youtube-iframe-wrapper"></div>
            </div>
        </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('youtubeModal');
    const closeBtn = document.getElementById('youtubeModalClose');
    const iframeContainer = document.getElementById('youtubeIframeContainer');

    function openModal(videoId) {
        if (!videoId) return;
        // Build the iframe HTML
        iframeContainer.innerHTML = `<iframe class="modal-youtube-iframe" src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        iframeContainer.innerHTML = ''; // Destroy iframe to stop video
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Attach click listeners to cards
    youtubeCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            const videoId = card.getAttribute('data-video-id');
            openModal(videoId);
        });
    });

    // Close listeners
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
