document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.getElementById('heroVideo');
    if (!heroVideo) return;

    const videoBtn = document.querySelector('.hero-control-players .video-control');
    const soundBtn = document.querySelector('.hero-control-players .sound-control');

    // Toggle functions
    window.toggleVideo = function () {
        if (!heroVideo) return;
        if (heroVideo.paused) {
            heroVideo.play();
        } else {
            heroVideo.pause();
        }
    };

    window.toggleSound = function () {
        if (!heroVideo) return;
        heroVideo.muted = !heroVideo.muted;
    };

    // UI Sync Functions
    const updatePlayState = () => {
        if (!videoBtn) return;
        if (heroVideo.paused) {
            videoBtn.dataset.state = 'play';
            videoBtn.classList.remove('state-pause');
            videoBtn.classList.add('state-play');
            videoBtn.setAttribute('aria-label', 'Play Video');
            const iconPlay = videoBtn.querySelector('.icon-play');
            const iconPause = videoBtn.querySelector('.icon-pause');
            if (iconPlay) iconPlay.style.display = '';
            if (iconPause) iconPause.style.display = 'none';
        } else {
            videoBtn.dataset.state = 'pause';
            videoBtn.classList.remove('state-play');
            videoBtn.classList.add('state-pause');
            videoBtn.setAttribute('aria-label', 'Pause Video');
            const iconPlay = videoBtn.querySelector('.icon-play');
            const iconPause = videoBtn.querySelector('.icon-pause');
            if (iconPlay) iconPlay.style.display = 'none';
            if (iconPause) iconPause.style.display = '';
        }
    };

    const updateSoundState = () => {
        if (!soundBtn) return;
        if (heroVideo.muted) {
            soundBtn.dataset.state = 'muted';
            soundBtn.classList.remove('state-unmuted');
            soundBtn.classList.add('state-muted');
            soundBtn.setAttribute('aria-label', 'Unmute');
            const iconMuted = soundBtn.querySelector('.icon-muted');
            const iconUnmuted = soundBtn.querySelector('.icon-unmuted');
            if (iconMuted) iconMuted.style.display = '';
            if (iconUnmuted) iconUnmuted.style.display = 'none';
        } else {
            soundBtn.dataset.state = 'unmuted';
            soundBtn.classList.remove('state-muted');
            soundBtn.classList.add('state-unmuted');
            soundBtn.setAttribute('aria-label', 'Mute');
            const iconMuted = soundBtn.querySelector('.icon-muted');
            const iconUnmuted = soundBtn.querySelector('.icon-unmuted');
            if (iconMuted) iconMuted.style.display = 'none';
            if (iconUnmuted) iconUnmuted.style.display = '';
        }
    };

    // Listeners for native events
    heroVideo.addEventListener('play', updatePlayState);
    heroVideo.addEventListener('pause', updatePlayState);
    heroVideo.addEventListener('volumechange', updateSoundState);

    // Initial sync
    updatePlayState();
    updateSoundState();
});
